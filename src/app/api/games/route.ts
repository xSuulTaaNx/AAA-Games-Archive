import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const games = await sql`
      SELECT
        id,
        name,
        slug,
        release_date,
        year,
        genres,
        platforms,
        background_image,
        rating,
        metacritic,
        status,
        aaa_classification,
        source,
        source_url
      FROM games
      ORDER BY release_date DESC NULLS LAST
      LIMIT 100
    `;

    return NextResponse.json({
      success: true,
      count: games.length,
      games,
    });
  } catch (error) {
    console.error("Failed to retrieve games:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown database error",
      },
      { status: 500 }
    );
  }
}