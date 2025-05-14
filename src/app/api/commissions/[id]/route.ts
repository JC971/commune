import { NextResponse } from "next/server";
import pool from "../../../../services/db"; // Import the configured pool
import { Commission } from "../../../../modules/commissions/components/CommissionList"; // Reuse the type

interface RequestContext {
	params: {
		id: string;
	};
}

// GET /api/commissions/[id] - Fetch details of a specific commission
export async function GET(request: Request, { params }: RequestContext) {
	const { id } = params;
	const commissionId = parseInt(id, 10);

	if (isNaN(commissionId)) {
		return NextResponse.json(
			{ message: "ID de commission invalide." },
			{ status: 400 }
		);
	}

	try {
		// Fetch commission details
		const commissionQuery = "SELECT * FROM commissions WHERE id = $1";
		const commissionResult = await pool.query(commissionQuery, [commissionId]);

		if (commissionResult.rows.length === 0) {
			return NextResponse.json(
				{ message: "Commission non trouvée." },
				{ status: 404 }
			);
		}

		const commissionData = commissionResult.rows[0];

		// TODO: Fetch related data (members, meetings, documents, action items) in parallel
		// const [membersResult, meetingsResult, ...] = await Promise.all([
		//   pool.query('SELECT ... FROM commission_members WHERE commission_id = $1', [commissionId]),
		//   pool.query('SELECT ... FROM commission_meetings WHERE commission_id = $1', [commissionId]),
		//   ...
		// ]);

		// Combine data
		const detailedCommission = {
			...commissionData,
			// members: membersResult.rows,
			// meetings: meetingsResult.rows,
			// ...
		};

		return NextResponse.json(detailedCommission);
	} catch (error) {
		console.error(`API Error fetching commission ${commissionId}:`, error);
		return NextResponse.json(
			{
				message: "Erreur lors de la récupération des détails de la commission.",
			},
			{ status: 500 }
		);
	}
}

// PUT /api/commissions/[id] - Update a specific commission
export async function PUT(request: Request, { params }: RequestContext) {
	// TODO: Add authentication and authorization checks (RBAC)
	const { id } = params;
	const commissionId = parseInt(id, 10);

	if (isNaN(commissionId)) {
		return NextResponse.json(
			{ message: "ID de commission invalide." },
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const { name, description, creation_date, status } = body;

		if (!name) {
			return NextResponse.json(
				{ message: "Le nom de la commission est requis." },
				{ status: 400 }
			);
		}

		const query = `
      UPDATE commissions 
      SET name = $1, description = $2, creation_date = $3, status = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, name, description, creation_date, status;
    `;
		const queryParams = [
			name,
			description || null,
			creation_date || null,
			status || "active",
			commissionId,
		];

		const result = await pool.query(query, queryParams);

		if (result.rows.length === 0) {
			return NextResponse.json(
				{ message: "Commission non trouvée pour la mise à jour." },
				{ status: 404 }
			);
		}

		const updatedCommission: Commission = result.rows[0];
		return NextResponse.json(updatedCommission);
	} catch (error) {
		console.error(`API Error updating commission ${commissionId}:`, error);
		return NextResponse.json(
			{ message: "Erreur lors de la mise à jour de la commission." },
			{ status: 500 }
		);
	}
}

// DELETE /api/commissions/[id] - Delete a specific commission
export async function DELETE(request: Request, { params }: RequestContext) {
	// TODO: Add authentication and authorization checks (RBAC)
	const { id } = params;
	const commissionId = parseInt(id, 10);

	if (isNaN(commissionId)) {
		return NextResponse.json(
			{ message: "ID de commission invalide." },
			{ status: 400 }
		);
	}

	try {
		const query = "DELETE FROM commissions WHERE id = $1 RETURNING id;";
		const result = await pool.query(query, [commissionId]);

		if (result.rows.length === 0) {
			return NextResponse.json(
				{ message: "Commission non trouvée pour la suppression." },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: `Commission ${commissionId} supprimée avec succès.` },
			{ status: 200 }
		); // Or 204 No Content
	} catch (error) {
		console.error(`API Error deleting commission ${commissionId}:`, error);
		// Handle potential foreign key constraint errors if needed
		return NextResponse.json(
			{ message: "Erreur lors de la suppression de la commission." },
			{ status: 500 }
		);
	}
}
