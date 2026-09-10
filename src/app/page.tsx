import GameArchive, {
  type Game,
} from "@/components/GameArchive";
import { sql } from "@/lib/db";

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
            Explore major video game releases, upcoming titles,
            platforms, ratings, and release dates.
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

      <GameArchive games={games} />

      <footer className="border-t border-white/10 px-6 py-10 text-center text-sm text-slate-500">
        AAA Games Archive
      </footer>
    </main>
  );
}