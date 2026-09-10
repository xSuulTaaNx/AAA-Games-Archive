"use client";

import { useMemo, useState } from "react";

export interface Game {
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

interface GameArchiveProps {
  games: Game[];
}

export default function GameArchive({ games }: GameArchiveProps) {
  const [query, setQuery] = useState("");

  const filteredGames = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return games;

    return games.filter((game) => {
      const searchableText = [
        game.name,
        game.year,
        game.status,
        ...game.genres.map((genre) => genre.name),
        ...game.platforms.map((platform) => platform.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [games, query]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Archive
          </p>
          <h2 className="mt-2 text-3xl font-bold">Latest games</h2>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <label
            htmlFor="game-search"
            className="text-xs font-semibold uppercase tracking-widest text-slate-500"
          >
            Search archive
          </label>
          <input
            id="game-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, platform, genre..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400 sm:w-72"
          />
        </div>
      </div>

      {filteredGames.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <h2 className="text-2xl font-bold">
            {games.length === 0 ? "No games found" : "No matching games"}
          </h2>
          <p className="mt-3 text-slate-400">
            {games.length === 0
              ? "Run the RAWG synchronization to import games."
              : "Try a different title, platform, genre, or year."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm text-slate-500">
            {filteredGames.length} {filteredGames.length === 1 ? "result" : "results"}
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGames.map((game) => {
              const genreNames = Array.isArray(game.genres)
                ? game.genres.map((genre) => genre.name).filter(Boolean).slice(0, 2)
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
                        ? { backgroundImage: `url("${game.background_image}")` }
                        : undefined
                    }
                  >
                    {!game.background_image && (
                      <div
                        className="flex h-full items-center justify-center text-4xl"
                        aria-hidden="true"
                      >
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

                    <h3 className="text-xl font-bold leading-tight">{game.name}</h3>

                    {genreNames.length > 0 && (
                      <p className="mt-3 text-sm text-slate-400">{genreNames.join(" • ")}</p>
                    )}
                    {platformNames.length > 0 && (
                      <p className="mt-2 line-clamp-1 text-xs text-slate-500">
                        {platformNames.join(", ")}
                      </p>
                    )}

                    <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4 text-sm">
                      <span className="text-slate-400">
                        Rating: <strong className="text-white">{game.rating ?? "N/A"}</strong>
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
        </>
      )}
    </section>
  );
}
