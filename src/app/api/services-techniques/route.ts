import { NextResponse } from "next/server";
import pool from "../../../services/db"; // Import the configured pool
import { Intervention } from "../../../modules/services-techniques/components/InterventionList"; // Reuse the type

// GET /api/services-techniques - Fetch interventions with filtering/pagination
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const limit = parseInt(searchParams.get("limit") || "10", 10);
	const offset = parseInt(searchParams.get("offset") || "0", 10);
	const status = searchParams.get("status");
	const priority = searchParams.get("priority");
	const typeId = searchParams.get("typeId");
	// TODO: Add more filters (date range, assigned agent, search term)

	try {
		let query = `
      SELECT 
        i.id, 
        i.title, 
        i.reference_code, 
        i.status, 
        i.priority, 
        i.creation_date, 
        i.address,
        i.latitude,
        i.longitude,
        it.name as intervention_type_name
      FROM interventions i
      LEFT JOIN intervention_types it ON i.intervention_type_id = it.id
    `;
		const queryParams: (string | number)[] = [];	
		const whereClauses: string[] = [];

		if (status) {
			queryParams.push(status);
			whereClauses.push(`i.status = $${queryParams.length}`);
		}
		if (priority) {
			queryParams.push(priority);
			whereClauses.push(`i.priority = $${queryParams.length}`);
		}
		if (typeId) {
			queryParams.push(parseInt(typeId, 10));
			whereClauses.push(`i.intervention_type_id = $${queryParams.length}`);
		}
		// TODO: Add WHERE clauses for other filters

		if (whereClauses.length > 0) {
			query += ` WHERE ${whereClauses.join(" AND ")} `;
		}

		query += ` ORDER BY i.creation_date DESC, i.id DESC LIMIT $${
			queryParams.length + 1
		} OFFSET $${queryParams.length + 2}`;
		queryParams.push(limit, offset);

		// Fetch total count for pagination
		let countQuery = `SELECT COUNT(*) FROM interventions i`;
		if (whereClauses.length > 0) {
			countQuery += ` WHERE ${whereClauses.join(" AND ")} `;
		}
		const countParams = queryParams.slice(0, whereClauses.length); // Params for count query

		const [dataResult, countResult] = await Promise.all([
			pool.query(query, queryParams),
			pool.query(countQuery, countParams),
		]);

		const interventions: Intervention[] = dataResult.rows;
		const totalCount = parseInt(countResult.rows[0].count, 10);

		return NextResponse.json({
			interventions,
			totalCount,
			page: Math.floor(offset / limit) + 1,
			limit,
		});
	} catch (error) {
		console.error("API Error fetching interventions:", error);
		return NextResponse.json(
			{ message: "Erreur lors de la récupération des interventions." },
			{ status: 500 }
		);
	}
}

// POST /api/services-techniques - Create a new intervention
export async function POST(request: Request) {
	// TODO: Add authentication and authorization checks (RBAC)
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
			assigned_agent_id,
			estimated_cost,
			originating_doleance_id, // Optional: Link to a doléance
		} = body;

		if (!title || !description) {
			return NextResponse.json(
				{ message: "Le titre et la description sont requis." },
				{ status: 400 }
			);
		}

		// Generate a unique reference code (example)
		const timestamp = Date.now();
		const reference_code = `INT-${new Date().getFullYear()}-${timestamp
			.toString()
			.slice(-6)}`;

		const query = `
      INSERT INTO interventions (
        title, description, intervention_type_id, status, priority, 
        address, latitude, longitude, planned_start_date, planned_end_date, 
        assigned_agent_id, estimated_cost, reference_code, originating_doleance_id,
        creation_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP) 
      RETURNING *; -- Return the full new record
    `;
		const queryParams = [
			title,
			description,
			intervention_type_id || null,
			status || "created",
			priority || "medium",
			address || null,
			latitude || null,
			longitude || null,
			planned_start_date || null,
			planned_end_date || null,
			assigned_agent_id || null,
			estimated_cost || null,
			reference_code,
			originating_doleance_id || null,
		];

		const result = await pool.query(query, queryParams);
		const newIntervention = result.rows[0];

		// Optionally: Create initial status history entry
		await pool.query(
			"INSERT INTO intervention_status_history (intervention_id, status, notes) VALUES ($1, $2, $3)",
			[newIntervention.id, newIntervention.status, "Intervention créée"]
		);

		return NextResponse.json(newIntervention, { status: 201 });
	} catch (error) {
		console.error("API Error creating intervention:", error);
		return NextResponse.json(
			{ message: "Erreur lors de la création de l'intervention." },
			{ status: 500 }
		);
	}
}
