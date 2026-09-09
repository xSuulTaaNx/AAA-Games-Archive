import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const rawgApiUrl = "https://api.rawg.io/api/games";

type RawgGame = {
  id: number;
  name: string;
  slug: string;
  description_raw?: string | null;
  released?: string | null;
  genres?: Array<{ name: string }>;
  platforms?: Array<{ platform: { name: string } }>;
  developers?: Array<{ name: string }>;
  publishers?: Array<{ name: string }>;
  background_image?: string | null;
  website?: string | null;
  rating?: number | null;
  metacritic?: number | null;
};

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawgApiKey = process.env.RAWG_API_KEY;

  if (!rawgApiKey) {
    return NextResponse.json(
      { error: "RAWG_API_KEY environment variable is missing" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${rawgApiUrl}?key=${encodeURIComponent(rawgApiKey)}&page_size=40&ordering=-rating`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`RAWG API request failed with status ${response.status}`);
    }

    const data = (await response.json()) as { results?: RawgGame[] };
    const games = data.results ?? [];

    for (const game of games) {
      const releaseDate = game.released ?? null;
      const year = releaseDate ? Number.parseInt(releaseDate.slice(0, 4), 10) : null;

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
        ) VALUES (
          ${game.id},
          ${game.name},
          ${game.slug},
          ${game.description_raw ?? null},
          ${releaseDate},
          ${Number.isNaN(year) ? null : year},
          ${JSON.stringify((game.genres ?? []).map((genre) => genre.name))},
          ${JSON.stringify((game.platforms ?? []).map(({ platform }) => platform.name))},
          ${JSON.stringify((game.developers ?? []).map((developer) => developer.name))},
          ${JSON.stringify((game.publishers ?? []).map((publisher) => publisher.name))},
          ${game.background_image ?? null},
          ${game.website ?? null},
          ${game.rating ?? null},
          ${game.metacritic ?? null},
          ${"active"},
          ${"AAA"},
          ${"RAWG"},
          ${`https://rawg.io/games/${game.slug}`},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          release_date = EXCLUDED.release_date,
          year = EXCLUDED.year,
          genres = EXCLUDED.genres,
          platforms = EXCLUDED.platforms,
          developers = EXCLUDED.developers,
          publishers = EXCLUDED.publishers,
          background_image = EXCLUDED.background_image,
          website = EXCLUDED.website,
          rating = EXCLUDED.rating,
          metacritic = EXCLUDED.metacritic,
          last_updated = NOW()
      `;
    }

    return NextResponse.json({ status: "ok", synced: games.length });
  } catch (error) {
    console.error("Game sync failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown sync error",
      },
      { status: 500 }
    );
  }
}
