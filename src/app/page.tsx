import { sql } from "@/lib/db";

interface Game {
  id: number;
  name: string;
  slug: string | null;
  release_date: string | null;
  year: number | null;
  genres: Array<{
    id?: number;
    name?: string;
    slug?: string;
  }>;
  platforms: Array<{
    id?: number;
    name?: string;
    slug?: string;
  }>;
  background_image: string | null;
  rating: string | number | null;
  metacritic: number | null;
  status: string | null;
}

export default async function Home() {
  const result = await sql`
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
      status
    FROM games
    ORDER BY release_date DESC NULLS LAST
    LIMIT 100
  `;

  const games = result as Game[];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-violet-950/40 to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-violet-400">
            2000 to the future
          </p>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl">
            The AAA Games Archive
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Explore major video game releases, upcoming titles, platforms,
            ratings, and release dates.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {games.length} games loaded
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Updated automatically
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Powered by RAWG
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              Archive
            </p>

            <h2 className="mt-2 text-3xl font-bold">Latest games</h2>
          </div>

          <p className="text-sm text-slate-500">
            {games.length} results
          </p>
        </div>

        {games.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-2xl font-bold">No games found</h2>

            <p className="mt-3 text-slate-400">
              Run the RAWG synchronization to import games.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map((game) => {
              const genreNames = Array.isArray(game.genres)
                ? game.genres
                    .map((genre) => genre.name)
                    .filter(Boolean)
                    .slice(0, 2)
                : [];

              const platformNames = Array.isArray(game.platforms)
                ? game.platforms
                    .map((platform) => platform.name)
                    .filter(Boolean)
                    .slice(0, 3)
                : [];

              return (
                <article
                  key={game.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition hover:-translate-y-1 hover:border-violet-500/70"
                >
                  <div
                    className="aspect-video bg-slate-800 bg-cover bg-center"
                    style={
                      game.background_image
                        ? {
                            backgroundImage: `url("${game.background_image}")`,
                          }
                        : undefined
                    }
                  >
                    {!game.background_image && (
                      <div className="flex h-full items-center justify-center text-4xl">
                        🎮
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-violet-400">
                        {game.year ?? "TBA"}
                      </span>

                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs capitalize text-slate-300">
                        {game.status ?? "unknown"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold leading-tight">
                      {game.name}
                    </h3>

                    {genreNames.length > 0 && (
                      <p className="mt-3 text-sm text-slate-400">
                        {genreNames.join(" • ")}
                      </p>
                    )}

                    {platformNames.length > 0 && (
                      <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                        {platformNames.join(", ")}
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4 text-sm">
                      <span className="text-slate-400">
                        Rating:{" "}
                        <strong className="text-white">
                          {game.rating ?? "N/A"}
                        </strong>
                      </span>

                      {game.metacritic !== null && (
                        <span className="rounded-md bg-emerald-500/15 px-2 py-1 font-bold text-emerald-400">
                          {game.metacritic}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-slate-500">
        AAA Games Archive
      </footer>
    </main>
  );
}