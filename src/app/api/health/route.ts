import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
	try {
		const result = await sql`
			SELECT COUNT(*)::int AS count
			FROM games
		`;

		return NextResponse.json({
			status: "ok",
			database: "connected",
			games: result[0].count,
		});
	} catch (error) {
		console.error("Database health check failed:", error);

		return NextResponse.json(
			{
				status: "error",
				database: "disconnected",
				message:
					error instanceof Error
						? error.message
						: "Unknown database error",
			},
			{ status: 500 }
		);
	}
}
