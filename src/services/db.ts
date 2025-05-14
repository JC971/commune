import { Pool } from "pg";

const pool = new Pool({
	user: process.env.DB_USER || "postgres",
	host: process.env.DB_HOST || "localhost",
	database: process.env.DB_NAME || "plateforme_municipale",
	password: process.env.DB_PASSWORD || "password",
	port: parseInt(process.env.DB_PORT || "5432", 10),
});

export default pool;
