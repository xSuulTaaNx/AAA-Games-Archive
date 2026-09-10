import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface RawgNamedItem {
  id: number;
  name: string;
  slug?: string;
}

interface RawgGame {
  id: number;
  name: string;
  slug: string;
  released: string | null;
  background_image: string | null;
  rating: number | null;
  metacritic: number | null;
  genres?: RawgNamedItem[];
  platforms?: Array<{
    platform: RawgNamedItem;
  }>;
}

interface RawgResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
}

function getGameStatus(releaseDate: string | null) {
  if (!releaseDate) {
    return "announced";
  }

  const releaseTime = new Date(releaseDate).getTime();
  const currentTime = new Date().getTime();

  return releaseTime > currentTime ? "upcoming" : "released";
}

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const rawgApiKey = process.env.RAWG_API_KEY;

    if (!cronSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "CRON_SECRET is missing",
        },
        { status: 500 }
      );
    }

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (!rawgApiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "RAWG_API_KEY is missing",
        },
        { status: 500 }
      );
    }

    const parameters = new URLSearchParams({
      key: rawgApiKey,
      page: "1",
      page_size: "40",
      dates: "2000-01-01,2030-12-31",
      ordering: "-added",
    });

    const rawgUrl = `https://api.rawg.io/api/games?${parameters.toString()}`;

    const response = await fetch(rawgUrl, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const responseText = await response.text();

      console.error("RAWG request failed:", {
        status: response.status,
        response: responseText,
      });

      return NextResponse.json(
        {
          success: false,
          message: "RAWG request failed",
          status: response.status,
        },
        { status: 502 }
      );
    }

    const data = (await response.json()) as RawgResponse;

    let processed = 0;
    let failed = 0;

    const failures: Array<{
      id: number;
      name: string;
      message: string;
    }> = [];

    for (const game of data.results) {
      try {
        const genres = (game.genres ?? []).map((genre) => ({
          id: genre.id,
          name: genre.name,
          slug: genre.slug ?? null,
        }));

        const platforms = (game.platforms ?? []).map((item) => ({
          id: item.platform.id,
          name: item.platform.name,
          slug: item.platform.slug ?? null,
        }));

        const year = game.released
          ? new Date(game.released).getUTCFullYear()
          : null;

        const status = getGameStatus(game.released);

        const sourceUrl = game.slug
          ? `https://rawg.io/games/${game.slug}`
          : null;

        await sql`
          INSERT INTO games (
            id,
            name,
            slug,
            description,
            release_date,
            year,
            genres,
            platforms,
            developers,
            publishers,
            background_image,
            website,
            rating,
            metacritic,
            status,
            aaa_classification,
            source,
            source_url,
            last_updated
          )
          VALUES (
            ${game.id},
            ${game.name},
            ${game.slug},
            NULL,
            ${game.released},
            ${year},
            ${JSON.stringify(genres)}::jsonb,
            ${JSON.stringify(platforms)}::jsonb,
            '[]'::jsonb,
            '[]'::jsonb,
            ${game.background_image},
            NULL,
            ${game.rating},
            ${game.metacritic},
            ${status},
            'unknown',
            'rawg',
            ${sourceUrl},
            NOW()
          )
          ON CONFLICT (id)
          DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            release_date = EXCLUDED.release_date,
            year = EXCLUDED.year,
            genres = EXCLUDED.genres,
            platforms = EXCLUDED.platforms,
            background_image = EXCLUDED.background_image,
            rating = EXCLUDED.rating,
            metacritic = EXCLUDED.metacritic,
            status = EXCLUDED.status,
            source_url = EXCLUDED.source_url,
            last_updated = NOW()
        `;

        processed += 1;
      } catch (error) {
        failed += 1;

        failures.push({
          id: game.id,
          name: game.name,
          message:
            error instanceof Error
              ? error.message
              : "Unknown database error",
        });

        console.error(`Failed to import ${game.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      receivedFromRawg: data.results.length,
      processed,
      failed,
      failures,
    });
  } catch (error) {
    console.error("Game synchronization failed:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown synchronization error",
      },
      { status: 500 }
    );
  }
}