import { NextResponse } from "next/server";
import pool from "../../../services/db"; // Import the configured pool
import { DoleanceInternal } from "../../../modules/doleances/components/DoleanceListInternal"; // Reuse the type
import crypto from "crypto";
// Import blockchain interaction function
import { recordDoleanceCreationHash } from "../../../services/blockchain/smartContractInteractions";
// TODO: Import a library for handling file uploads to object storage (e.g., AWS S3, GCS, or local storage)
// import { uploadFile } from '@/services/storage';

// Helper function to generate unique reference code
const generateReferenceCode = (): string => {
	const timestamp = Date.now();
	const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 random hex chars
	return `DOL-${new Date().getFullYear()}-${randomPart}${timestamp
		.toString()
		.slice(-4)}`;
};

// GET /api/doleances - Fetch doleances for internal use
export async function GET(request: Request) {
	// TODO: Add authentication and authorization checks (RBAC - only internal users)
	const { searchParams } = new URL(request.url);
	const limit = parseInt(searchParams.get("limit") || "10", 10);
	const offset = parseInt(searchParams.get("offset") || "0", 10);
	const status = searchParams.get("status");
	const priority = searchParams.get("priority");
	const categoryId = searchParams.get("categoryId");
	const assignedAgentId = searchParams.get("assignedAgentId");
	// TODO: Add search term filter

	try {
		let query = `
      SELECT 
        d.id, 
        d.reference_code, 
        LEFT(d.description, 100) as description, -- Truncate description for list view
        d.status, 
        d.priority, 
        d.submission_date, 
        d.address,
        dc.name as category_name,
        ua.name as assigned_agent_name -- Assuming users table 'ua' for assigned agent
      FROM doleances d
      LEFT JOIN doleance_categories dc ON d.doleance_category_id = dc.id
      LEFT JOIN users ua ON d.assigned_agent_id = ua.id -- Adjust 'users' table name/alias if needed
    `;
		const queryParams: (string | number)[] = [];
		const whereClauses: string[] = [];

		if (status) {
			queryParams.push(status);
			whereClauses.push(`d.status = $${queryParams.length}`);
		}
		if (priority) {
			queryParams.push(priority);
			whereClauses.push(`d.priority = $${queryParams.length}`);
		}
		if (categoryId) {
			queryParams.push(parseInt(categoryId, 10));
			whereClauses.push(`d.doleance_category_id = $${queryParams.length}`);
		}
		if (assignedAgentId) {
			queryParams.push(parseInt(assignedAgentId, 10));
			whereClauses.push(`d.assigned_agent_id = $${queryParams.length}`);
		}
		// TODO: Add WHERE clauses for other filters

		if (whereClauses.length > 0) {
			query += ` WHERE ${whereClauses.join(" AND ")} `;
		}

		query += ` ORDER BY d.submission_date DESC, d.id DESC LIMIT $${
			queryParams.length + 1
		} OFFSET $${queryParams.length + 2}`;
		queryParams.push(limit, offset);

		// Fetch total count for pagination
		let countQuery = `SELECT COUNT(*) FROM doleances d`;
		if (whereClauses.length > 0) {
			countQuery += ` WHERE ${whereClauses.join(" AND ")} `;
		}
		const countParams = queryParams.slice(0, whereClauses.length); // Params for count query

		const [dataResult, countResult] = await Promise.all([
			pool.query(query, queryParams),
			pool.query(countQuery, countParams),
		]);

		const doleances: DoleanceInternal[] = dataResult.rows;
		const totalCount = parseInt(countResult.rows[0].count, 10);

		return NextResponse.json({
			doleances,
			totalCount,
			page: Math.floor(offset / limit) + 1,
			limit,
		});
	} catch (error) {
		console.error("API Error fetching doleances (internal):", error);
		return NextResponse.json(
			{ message: "Erreur lors de la récupération des doléances." },
			{ status: 500 }
		);
	}
}

// POST /api/doleances - Create a new doleance (public submission)
export async function POST(request: Request) {
	let newDoleanceId: number | null = null;
	let blockchainTxHash: string | null = null;
	const client = await pool.connect();

	try {
		const formData = await request.formData();
		const description = formData.get("description") as string;
		const doleance_category_id = formData.get("doleance_category_id") as string;
		const address = formData.get("address") as string;
		const latitude = formData.get("latitude") as string;
		const longitude = formData.get("longitude") as string;
		const is_anonymous = formData.get("is_anonymous") === "true";
		const submitter_name = formData.get("submitter_name") as string;
		const submitter_email = formData.get("submitter_email") as string;
		const attachments = formData.getAll("attachments") as File[];

		if (!description) {
			return NextResponse.json(
				{ message: "La description est requise." },
				{ status: 400 }
			);
		}

		const reference_code = generateReferenceCode();
		const initial_description_hash = `0x${crypto
			.createHash("sha256")
			.update(description)
			.digest("hex")}` as `0x${string}`;
		const clientIp =
			request.headers.get("x-forwarded-for") ??
			request.headers.get("remote-addr");

		// Start transaction
		await client.query("BEGIN");

		const insertQuery = `
      INSERT INTO doleances (
        description, doleance_category_id, address, latitude, longitude, 
        is_anonymous, submitter_name, submitter_email, submitter_ip_address, 
        reference_code, initial_description_hash, status, priority, submission_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'received', 'medium', CURRENT_TIMESTAMP) 
      RETURNING id;
    `;
		const insertParams = [
			description,
			doleance_category_id ? parseInt(doleance_category_id) : null,
			address || null,
			latitude ? parseFloat(latitude) : null,
			longitude ? parseFloat(longitude) : null,
			is_anonymous,
			is_anonymous ? null : submitter_name || null,
			is_anonymous ? null : submitter_email || null,
			clientIp,
			reference_code,
			initial_description_hash, // Store the hash in DB
		];

		const result = await client.query(insertQuery, insertParams);
		newDoleanceId = result.rows[0].id;

		// Handle file uploads
		const uploadedFiles = [];
		for (const file of attachments) {
			if (file.size > 0) {
				// TODO: Implement actual file upload logic
				// const filePath = await uploadFile(file, `doleances/${newDoleanceId}`);
				const filePath = `/uploads/placeholder/${file.name}`; // Placeholder
				await client.query(
					"INSERT INTO doleance_attachments (doleance_id, file_name, file_path, file_type) VALUES ($1, $2, $3, $4)",
					[newDoleanceId, file.name, filePath, file.type]
				);
				uploadedFiles.push({ name: file.name, path: filePath });
			}
		}

		// Add initial status history
		await client.query(
			"INSERT INTO doleance_status_history (doleance_id, status, notes, is_public) VALUES ($1, $2, $3, $4)",
			[newDoleanceId, "received", "Signalement reçu.", true]
		);

		// Commit DB changes before attempting blockchain interaction
		await client.query("COMMIT");

		// Record creation hash on blockchain (after DB commit)
		console.log(
			`Attempting to record creation hash on blockchain for doleance ${newDoleanceId}`
		);
		blockchainTxHash = await recordDoleanceCreationHash(
			newDoleanceId,
			initial_description_hash
		);

		if (blockchainTxHash) {
			// Update the doleance record with the blockchain tx hash (non-critical, do outside transaction)
			await pool.query(
				"UPDATE doleances SET blockchain_tx_hash = $1 WHERE id = $2",
				[blockchainTxHash, newDoleanceId]
			);
		}

		// TODO: Send confirmation email to submitter if email provided

		return NextResponse.json(
			{
				message: "Signalement soumis avec succès.",
				referenceCode: reference_code,
				doleanceId: newDoleanceId,
				blockchainTxHash: blockchainTxHash, // Include hash in response
				uploadedFiles,
			},
			{ status: 201 }
		);
	} catch (error) {
		// If error occurred after commit, DB changes are saved, but blockchain might have failed.
		// If error occurred before commit, rollback is needed.
		if (newDoleanceId !== null) {
			// Error likely occurred during blockchain call or after commit
			console.error(
				`API Error creating doleance ${newDoleanceId} (DB committed, blockchain might have failed):`,
				error
			);
		} else {
			// Error occurred before commit
			await client.query("ROLLBACK");
			console.error(
				"API Error creating doleance (transaction rolled back):",
				error
			);
		}
		return NextResponse.json(
			{ message: "Erreur lors de la soumission du signalement." },
			{ status: 500 }
		);
	} finally {
		client.release();
	}
}
