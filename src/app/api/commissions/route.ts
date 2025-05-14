import { NextResponse } from "next/server";
import pool from "../../../services/db"; // Import the configured pool
import { Commission } from "../../../modules/commissions/components/CommissionList"; // Reuse the type

// GET /api/commissions - Fetch commissions
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const limit = parseInt(searchParams.get("limit") || "10", 10);
	const offset = parseInt(searchParams.get("offset") || "0", 10);
	const status = searchParams.get("status"); // Optional filter by status

	try {
		let query = `
      SELECT 
        id, 
        name, 
        description, 
        creation_date, 
        status
      FROM commissions 
    `;
		const queryParams: (string | number)[] = [];
		const whereClauses: string[] = [];

		if (status) {
			queryParams.push(status);
			whereClauses.push(`status = $${queryParams.length}`);
		}

		if (whereClauses.length > 0) {
			query += ` WHERE ${whereClauses.join(" AND ")} `;
		}

		query += ` ORDER BY name ASC LIMIT $${queryParams.length + 1} OFFSET $${
			queryParams.length + 2
		}`;
		queryParams.push(limit, offset);

		// Fetch total count for pagination
		let countQuery = `SELECT COUNT(*) FROM commissions`;
		if (whereClauses.length > 0) {
			countQuery += ` WHERE ${whereClauses.join(" AND ")} `;
		}
		const countParams = queryParams.slice(0, whereClauses.length); // Params for count query

		const [dataResult, countResult] = await Promise.all([
			pool.query(query, queryParams),
			pool.query(countQuery, countParams),
		]);

		const commissions: Commission[] = dataResult.rows;
		const totalCount = parseInt(countResult.rows[0].count, 10);

		return NextResponse.json({
			commissions,
			totalCount,
			page: Math.floor(offset / limit) + 1,
			limit,
		});
	} catch (error) {
		console.error("API Error fetching commissions:", error);
		return NextResponse.json(
			{ message: "Erreur lors de la récupération des commissions." },
			{ status: 500 }
		);
	}
}

// POST /api/commissions - Create a new commission
export async function POST(request: Request) {
	// TODO: Add authentication and authorization checks (RBAC)
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
      INSERT INTO commissions (name, description, creation_date, status) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, description, creation_date, status;
    `;
		const queryParams = [
			name,
			description || null,
			creation_date || null,
			status || "active",
		];

		const result = await pool.query(query, queryParams);
		const newCommission: Commission = result.rows[0];

		return NextResponse.json(newCommission, { status: 201 });
	} catch (error) {
		console.error("API Error creating commission:", error);
		// Check for unique constraint violation or other DB errors if needed
		return NextResponse.json(
			{ message: "Erreur lors de la création de la commission." },
			{ status: 500 }
		);
	}
}
