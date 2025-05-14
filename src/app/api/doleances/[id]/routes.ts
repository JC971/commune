import { NextResponse } from "next/server";
import pool from "../../../../services/db"; // Import the configured pool
import { recordDoleanceStatusUpdate } from "../../../../services/blockchain/smartContractInteractions"; // Adjust the path as necessary

interface RequestContext {
	params: {
		id: string;
	};
}

// GET /api/doleances/[id] - Fetch details of a specific doleance (internal use)
export async function GET(request: Request, { params }: RequestContext) {
	// TODO: Add authentication and authorization checks (RBAC - internal users)
	const { id } = params;
	const doleanceId = parseInt(id, 10);

	if (isNaN(doleanceId)) {
		return NextResponse.json(
			{ message: "ID de doléance invalide." },
			{ status: 400 }
		);
	}

	try {
		// Fetch doleance details with joins
		const doleanceQuery = `
      SELECT 
        d.*, 
        dc.name as category_name,
        ua.name as assigned_agent_name, -- Assuming users table 'ua' for assigned agent
        i.reference_code as linked_intervention_ref
      FROM doleances d
      LEFT JOIN doleance_categories dc ON d.doleance_category_id = dc.id
      LEFT JOIN users ua ON d.assigned_agent_id = ua.id -- Adjust 'users' table name/alias if needed
      LEFT JOIN interventions i ON d.linked_intervention_id = i.id
      WHERE d.id = $1;
    `;
		const doleanceResult = await pool.query(doleanceQuery, [doleanceId]);

		if (doleanceResult.rows.length === 0) {
			return NextResponse.json(
				{ message: "Doléance non trouvée." },
				{ status: 404 }
			);
		}

		const doleanceData = doleanceResult.rows[0];

		// Fetch related data (status history, attachments) in parallel
		const [historyResult, attachmentsResult] = await Promise.all([
			pool.query(
				"SELECT * FROM doleance_status_history WHERE doleance_id = $1 ORDER BY change_date DESC",
				[doleanceId]
			),
			pool.query(
				"SELECT * FROM doleance_attachments WHERE doleance_id = $1 ORDER BY uploaded_at DESC",
				[doleanceId]
			),
		]);

		// Combine data
		const detailedDoleance = {
			...doleanceData,
			status_history: historyResult.rows,
			attachments: attachmentsResult.rows,
		};

		return NextResponse.json(detailedDoleance);
	} catch (error) {
		console.error(`API Error fetching doleance ${doleanceId}:`, error);
		return NextResponse.json(
			{ message: "Erreur lors de la récupération des détails de la doléance." },
			{ status: 500 }
		);
	}
}

// PUT /api/doleances/[id] - Update a specific doleance (internal use)
export async function PUT(request: Request, { params }: RequestContext) {
	// TODO: Add authentication and authorization checks (RBAC - internal users)
	const { id } = params;
	const doleanceId = parseInt(id, 10);

	if (isNaN(doleanceId)) {
		return NextResponse.json(
			{ message: "ID de doléance invalide." },
			{ status: 400 }
		);
	}

	const client = await pool.connect();
	let updatedDoleance;
	let blockchainTxHash: string | null = null;

	try {
		const body = await request.json();
		const {
			status,
			priority,
			assigned_agent_id,
			resolution_details,
			linked_intervention_id,
			doleance_category_id,
		} = body;

		await client.query("BEGIN");

		// Fetch current data to compare
		const currentDoleanceResult = await client.query(
			"SELECT status, blockchain_tx_hash, closure_date FROM doleances WHERE id = $1 FOR UPDATE",
			[doleanceId]
		);
		if (currentDoleanceResult.rows.length === 0) {
			await client.query("ROLLBACK");
			return NextResponse.json(
				{ message: "Doléance non trouvée pour la mise à jour." },
				{ status: 404 }
			);
		}
		const currentData = currentDoleanceResult.rows[0];
		const currentStatus = currentData.status;
		blockchainTxHash = currentData.blockchain_tx_hash; // Keep current hash

		const statusChanged = status && status !== currentStatus;

		// Determine closure date
		const closure_date =
			(status === "closed" || status === "rejected") &&
			!currentData.closure_date
				? "CURRENT_TIMESTAMP"
				: status !== "closed" && status !== "rejected"
				? null
				: undefined; // Set to null if reopening, undefined otherwise

		// Build the update query
		const updateFields: string[] = [];
		const queryParams: (string | number | null)[] = [];
		let paramIndex = 1;

		const addUpdateField = (fieldName: string, value: string | number | null | undefined) => {
			if (value !== undefined) {
				updateFields.push(`${fieldName} = $${paramIndex++}`);
				queryParams.push(value);
			}
		};

		addUpdateField("status", status);
		addUpdateField("priority", priority);
		addUpdateField("assigned_agent_id", assigned_agent_id);
		addUpdateField("resolution_details", resolution_details);
		addUpdateField("linked_intervention_id", linked_intervention_id);
		addUpdateField("doleance_category_id", doleance_category_id);
		addUpdateField("blockchain_tx_hash", blockchainTxHash); // Include current hash initially
		if (closure_date === "CURRENT_TIMESTAMP") {
			updateFields.push(`closure_date = CURRENT_TIMESTAMP`);
		} else if (closure_date === null) {
			updateFields.push(`closure_date = NULL`);
		}
		updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

		if (updateFields.length <= 2) {
			// Only updated_at and maybe blockchain_tx_hash added
			await client.query("ROLLBACK");
			return NextResponse.json(
				{ message: "Aucun champ pertinent à mettre à jour fourni." },
				{ status: 400 }
			);
		}

		queryParams.push(doleanceId); // Add the ID for the WHERE clause
		const updateQuery = `
      UPDATE doleances 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

		const updateResult = await client.query(updateQuery, queryParams);
		updatedDoleance = updateResult.rows[0];

		// If status changed, add to history and potentially record on blockchain
		if (statusChanged) {
			const userId = null; // Placeholder for user ID from auth
			const notes = `Statut changé de ${currentStatus} à ${status}`;
			const is_public = [
				"resolved",
				"closed",
				"rejected",
				"resolution_planned",
			].includes(status);

			await client.query(
				"INSERT INTO doleance_status_history (doleance_id, status, changed_by_user_id, notes, is_public) VALUES ($1, $2, $3, $4, $5)",
				[doleanceId, status, userId, notes, is_public]
			);

			// Trigger blockchain transaction if status change is public
			if (is_public) {
				console.log(
					`Attempting to record public status change to '${status}' on blockchain for doleance ${doleanceId}`
				);
				const statusTxHash = await recordDoleanceStatusUpdate(
					doleanceId,
					status
				);
				if (statusTxHash) {
					blockchainTxHash = statusTxHash; // Update hash if successful
					// Update the record again with the new hash
					await client.query(
						"UPDATE doleances SET blockchain_tx_hash = $1 WHERE id = $2",
						[blockchainTxHash, doleanceId]
					);
					updatedDoleance.blockchain_tx_hash = blockchainTxHash; // Reflect in returned data
				}
			}
		}

		await client.query("COMMIT");
		return NextResponse.json(updatedDoleance);
	} catch (error) {
		await client.query("ROLLBACK");
		console.error(
			`API Error updating doleance ${doleanceId} (transaction rolled back):`,
			error
		);
		return NextResponse.json(
			{ message: "Erreur lors de la mise à jour de la doléance." },
			{ status: 500 }
		);
	} finally {
		client.release();
	}
}

// DELETE /api/doleances/[id] - Delete a specific doleance (internal use)
export async function DELETE(request: Request, { params }: RequestContext) {
	// TODO: Add authentication and authorization checks (RBAC - likely admin only)
	const { id } = params;
	const doleanceId = parseInt(id, 10);

	if (isNaN(doleanceId)) {
		return NextResponse.json(
			{ message: "ID de doléance invalide." },
			{ status: 400 }
		);
	}

	try {
		const query = "DELETE FROM doleances WHERE id = $1 RETURNING id;";
		const result = await pool.query(query, [doleanceId]);

		if (result.rows.length === 0) {
			return NextResponse.json(
				{ message: "Doléance non trouvée pour la suppression." },
				{ status: 404 }
			);
		}

		// TODO: Delete associated attachments from storage

		return NextResponse.json(
			{ message: `Doléance ${doleanceId} supprimée avec succès.` },
			{ status: 200 }
		);
	} catch (error) {
		console.error(`API Error deleting doleance ${doleanceId}:`, error);
		return NextResponse.json(
			{ message: "Erreur lors de la suppression de la doléance." },
			{ status: 500 }
		);
	}
}
