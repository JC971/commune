import { NextResponse } from "next/server";
import pool from "../../../../services/db"; // Import the configured pool
import { Intervention } from "../../../../modules/services-techniques/components/InterventionList"; // Reuse the type
// Import blockchain interaction functions
import {
	recordInterventionStatusUpdate,
	recordInterventionValidatedCost,
} from "../../../../services/blockchain/smartContractInteractions"; // Adjust the import path as necessary

interface RequestContext {
	params: {
		id: string;
	};
}

// GET /api/services-techniques/[id] - Fetch details of a specific intervention
export async function GET(request: Request, { params }: RequestContext) {
	const { id } = params;
	const interventionId = parseInt(id, 10);

	if (isNaN(interventionId)) {
		return NextResponse.json(
			{ message: "ID d'intervention invalide." },
			{ status: 400 }
		);
	}

	try {
		// Fetch intervention details with joins
		const interventionQuery = `
      SELECT 
        i.*, 
        it.name as intervention_type_name,
        -- ua.name as assigned_agent_name, -- Join with users table for agent name
        d.reference_code as originating_doleance_ref -- Join with doleances table
      FROM interventions i
      LEFT JOIN intervention_types it ON i.intervention_type_id = it.id
      -- LEFT JOIN users ua ON i.assigned_agent_id = ua.id -- Uncomment if users table exists
      LEFT JOIN doleances d ON i.originating_doleance_id = d.id
      WHERE i.id = $1;
    `;
		const interventionResult = await pool.query(interventionQuery, [
			interventionId,
		]);

		if (interventionResult.rows.length === 0) {
			return NextResponse.json(
				{ message: "Intervention non trouvée." },
				{ status: 404 }
			);
		}

		const interventionData = interventionResult.rows[0];

		// Fetch related data (status history, documents) in parallel
		const [historyResult, documentsResult] = await Promise.all([
			pool.query(
				"SELECT * FROM intervention_status_history WHERE intervention_id = $1 ORDER BY change_date DESC",
				[interventionId]
			),
			pool.query(
				"SELECT * FROM intervention_documents WHERE intervention_id = $1 ORDER BY uploaded_at DESC",
				[interventionId]
			),
		]);

		// Combine data
		const detailedIntervention = {
			...interventionData,
			status_history: historyResult.rows,
			documents: documentsResult.rows,
		};

		return NextResponse.json(detailedIntervention);
	} catch (error) {
		console.error(`API Error fetching intervention ${interventionId}:`, error);
		return NextResponse.json(
			{
				message:
					"Erreur lors de la récupération des détails de l'intervention.",
			},
			{ status: 500 }
		);
	}
}

// PUT /api/services-techniques/[id] - Update a specific intervention
export async function PUT(request: Request, { params }: RequestContext) {
	// TODO: Add authentication and authorization checks (RBAC)
	const { id } = params;
	const interventionId = parseInt(id, 10);

	if (isNaN(interventionId)) {
		return NextResponse.json(
			{ message: "ID d'intervention invalide." },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const {
			title,
			description,
			intervention_type_id,
			status,
			priority,
			address,
			latitude,
			longitude,
			planned_start_date,
			planned_end_date,
			actual_start_date,
			actual_end_date,
			assigned_agent_id,
			estimated_cost,
			final_cost,
			cost_validated,
		} = body;

		// Fetch current intervention data to compare
		const currentInterventionResult = await pool.query(
			"SELECT status, cost_validated, blockchain_tx_hash FROM interventions WHERE id = $1",
			[interventionId]
		);
		if (currentInterventionResult.rows.length === 0) {
			return NextResponse.json(
				{ message: "Intervention non trouvée pour la mise à jour." },
				{ status: 404 }
			);
		}
		const currentData = currentInterventionResult.rows[0];
		const currentStatus = currentData.status;
		const currentCostValidated = currentData.cost_validated;

		const statusChanged = status && status !== currentStatus;
		const costValidationChanged =
			cost_validated === true && currentCostValidated !== true;
		const criticalStatuses = [
			"planned",
			"assigned",
			"in_progress",
			"completed",
			"validated",
			"cancelled",
		]; // Statuses to record on blockchain

		// Use a transaction for DB update and potential blockchain calls
		const client = await pool.connect();
		let blockchainTxHash = currentData.blockchain_tx_hash; // Keep existing hash unless updated
		let updatedIntervention;

		try {
			await client.query("BEGIN");

			// Build the update query
			const query = `
        UPDATE interventions 
        SET 
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          intervention_type_id = COALESCE($3, intervention_type_id),
          status = COALESCE($4, status),
          priority = COALESCE($5, priority),
          address = COALESCE($6, address),
          latitude = COALESCE($7, latitude),
          longitude = COALESCE($8, longitude),
          planned_start_date = COALESCE($9, planned_start_date),
          planned_end_date = COALESCE($10, planned_end_date),
          actual_start_date = COALESCE($11, actual_start_date),
          actual_end_date = COALESCE($12, actual_end_date),
          assigned_agent_id = COALESCE($13, assigned_agent_id),
          estimated_cost = COALESCE($14, estimated_cost),
          final_cost = COALESCE($15, final_cost),
          cost_validated = COALESCE($16, cost_validated),
          blockchain_tx_hash = COALESCE($17, blockchain_tx_hash), -- Include blockchain hash update
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $18
        RETURNING *; -- Return the updated record
      `;
			const queryParams = [
				title,
				description,
				intervention_type_id,
				status,
				priority,
				address,
				latitude,
				longitude,
				planned_start_date,
				planned_end_date,
				actual_start_date,
				actual_end_date,
				assigned_agent_id,
				estimated_cost,
				final_cost,
				cost_validated,
				blockchainTxHash, // Initially pass the current hash
				interventionId,
			];

			const result = await client.query(query, queryParams);
			updatedIntervention = result.rows[0];

			// If status changed, add to history and potentially record on blockchain
			if (statusChanged) {
				const userId = null; // Placeholder for user ID from auth
				const notes = `Statut changé de ${currentStatus} à ${status}`;
				await client.query(
					"INSERT INTO intervention_status_history (intervention_id, status, changed_by_user_id, notes) VALUES ($1, $2, $3, $4)",
					[interventionId, status, userId, notes]
				);

				// Trigger blockchain transaction if status is critical
				if (criticalStatuses.includes(status)) {
					console.log(
						`Attempting to record status change to '${status}' on blockchain for intervention ${interventionId}`
					);
					const statusTxHash = await recordInterventionStatusUpdate(
						interventionId,
						status
					);
					if (statusTxHash) {
						blockchainTxHash = statusTxHash; // Update hash if successful
						// Update the record again with the new hash
						await client.query(
							"UPDATE interventions SET blockchain_tx_hash = $1 WHERE id = $2",
							[blockchainTxHash, interventionId]
						);
						updatedIntervention.blockchain_tx_hash = blockchainTxHash; // Reflect in returned data
					}
				}
			}

			// If cost validation changed to true, record on blockchain
			if (costValidationChanged && final_cost !== null) {
				console.log(
					`Attempting to record validated cost ${final_cost} on blockchain for intervention ${interventionId}`
				);
				const costTxHash = await recordInterventionValidatedCost(
					interventionId,
					parseFloat(final_cost)
				);
				if (costTxHash) {
					blockchainTxHash = costTxHash; // Update hash if successful (might overwrite status hash, consider storing multiple hashes or linking events)
					// Update the record again with the new hash
					await client.query(
						"UPDATE interventions SET blockchain_tx_hash = $1 WHERE id = $2",
						[blockchainTxHash, interventionId]
					);
					updatedIntervention.blockchain_tx_hash = blockchainTxHash; // Reflect in returned data
				}
			}

			await client.query("COMMIT");
			return NextResponse.json(updatedIntervention);
		} catch (error) {
			await client.query("ROLLBACK");
			console.error(
				`API Error updating intervention ${interventionId} (transaction rolled back):`,
				error
			);
			// Check if the error is from blockchain interaction or DB
			return NextResponse.json(
				{ message: "Erreur lors de la mise à jour de l'intervention." },
				{ status: 500 }
			);
		} finally {
			client.release();
		}
	} catch (error) {
		// Catch errors before connecting to the pool
		console.error(
			`API Error processing PUT request for intervention ${interventionId}:`,
			error
		);
		return NextResponse.json(
			{ message: "Erreur lors du traitement de la requête de mise à jour." },
			{ status: 500 }
		);
	}
}

// DELETE /api/services-techniques/[id] - Delete a specific intervention
export async function DELETE(request: Request, { params }: RequestContext) {
	// TODO: Add authentication and authorization checks (RBAC)
	const { id } = params;
	const interventionId = parseInt(id, 10);

	if (isNaN(interventionId)) {
		return NextResponse.json(
			{ message: "ID d'intervention invalide." },
			{ status: 400 }
		);
	}

	try {
		const query = "DELETE FROM interventions WHERE id = $1 RETURNING id;";
		const result = await pool.query(query, [interventionId]);

		if (result.rows.length === 0) {
			return NextResponse.json(
				{ message: "Intervention non trouvée pour la suppression." },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: `Intervention ${interventionId} supprimée avec succès.` },
			{ status: 200 }
		);
	} catch (error) {
		console.error(`API Error deleting intervention ${interventionId}:`, error);
		return NextResponse.json(
			{ message: "Erreur lors de la suppression de l'intervention." },
			{ status: 500 }
		);
	}
}
