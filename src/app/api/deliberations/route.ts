import { NextResponse } from "next/server";
import pool from "../../../services/db"; // Import the configured pool
import { Deliberation } from "../../../modules/deliberations/components/DeliberationList"; // Reuse the type

// GET /api/deliberations - Fetch deliberations with optional search/filtering
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const searchTerm = searchParams.get("search") || "";
	const limit = parseInt(searchParams.get("limit") || "10", 10);
	const offset = parseInt(searchParams.get("offset") || "0", 10);
	// TODO: Add more filters based on DeliberationSearch component (date, theme, status)

	try {
		let query = `
      SELECT 
        id, 
        title, 
        session_date, 
        reference_code, 
        summary, 
        status, 
        published_at 
      FROM deliberations 
    `;
		const queryParams: (string | number)[] = [];
		let whereClause = "";

		// Basic search implementation using the tsvector
		if (searchTerm) {
			whereClause = ` WHERE search_vector @@ plainto_tsquery('french', $${
				queryParams.length + 1
			}) `;
			queryParams.push(searchTerm);
		}

		// TODO: Add WHERE clauses for other filters

		query += whereClause;
		query += ` ORDER BY session_date DESC, id DESC LIMIT $${
			queryParams.length + 1
		} OFFSET $${queryParams.length + 2}`;
		queryParams.push(limit, offset);

		// Fetch total count for pagination (consider optimizing this)
		const countQuery = `SELECT COUNT(*) FROM deliberations ${whereClause}`;
		const countParams = queryParams.slice(0, whereClause ? 1 : 0); // Only include search term if present

		const [dataResult, countResult] = await Promise.all([
			pool.query(query, queryParams),
			pool.query(countQuery, countParams),
		]);

		const deliberations: Deliberation[] = dataResult.rows;
		const totalCount = parseInt(countResult.rows[0].count, 10);

		return NextResponse.json({
			deliberations,
			totalCount,
			page: Math.floor(offset / limit) + 1,
			limit,
		});
	} catch (error) {
		console.error("API Error fetching deliberations:", error);
		// Avoid sending detailed error messages to the client in production
		return NextResponse.json(
			{ message: "Erreur lors de la récupération des délibérations." },
			{ status: 500 }
		);
	}
}

// TODO: Implement POST for creating new deliberations (requires auth/RBAC)
// export async function POST(request: Request) { ... }

// TODO: Implement PUT/PATCH for updating deliberations (requires auth/RBAC)

// TODO: Implement DELETE for deleting deliberations (requires auth/RBAC)
