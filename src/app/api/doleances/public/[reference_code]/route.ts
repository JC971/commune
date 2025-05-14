import { NextResponse } from "next/server";
import pool from "../../../../../services/db"; // Import the configured pool

interface RequestContext {
	params: {
		reference_code: string;
	};
}

// GET /api/doleances/public/[reference_code] - Fetch public status of a specific doleance
export async function GET(request: Request, { params }: RequestContext) {
	const { reference_code } = params;

	if (!reference_code) {
		return NextResponse.json(
			{ message: "Le numéro de suivi est requis." },
			{ status: 400 }
		);
	}

	try {
		// Fetch the latest public status and submission date for the given reference code
		const query = `
      SELECT 
        d.reference_code,
        d.submission_date,
        dsh.status,
        dsh.change_date as last_update_date,
        dsh.notes as public_notes
      FROM doleances d
      JOIN (
          SELECT 
              doleance_id, 
              status, 
              change_date, 
              notes,
              ROW_NUMBER() OVER(PARTITION BY doleance_id ORDER BY change_date DESC) as rn
          FROM doleance_status_history
          WHERE is_public = TRUE
      ) dsh ON d.id = dsh.doleance_id AND dsh.rn = 1
      WHERE d.reference_code = $1;
    `;

		const result = await pool.query(query, [reference_code]);

		if (result.rows.length === 0) {
			// Check if the reference code exists at all but has no public status yet
			const checkExistence = await pool.query(
				"SELECT submission_date FROM doleances WHERE reference_code = $1",
				[reference_code]
			);
			if (checkExistence.rows.length > 0) {
				// Found, but no public status update yet, return 'received' status implicitly
				return NextResponse.json({
					reference_code: reference_code,
					status: "Reçu",
					submission_date: checkExistence.rows[0].submission_date,
					last_update_date: checkExistence.rows[0].submission_date, // Use submission date as last update
					public_notes:
						"Votre signalement a bien été reçu et est en attente de traitement.",
				});
			} else {
				// Truly not found
				return NextResponse.json(
					{ message: "Numéro de suivi non trouvé." },
					{ status: 404 }
				);
			}
		}

		const publicStatusInfo = result.rows[0];

		return NextResponse.json(publicStatusInfo);
	} catch (error) {
		console.error(
			`API Error fetching public status for doleance ${reference_code}:`,
			error
		);
		return NextResponse.json(
			{
				message:
					"Erreur lors de la récupération du statut public de la doléance.",
			},
			{ status: 500 }
		);
	}
}
