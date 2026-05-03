import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { GAMES } from "../games/registry.js";
import {
  REPLAYS_KEY,
  loadReplays,
  type SavedReplay,
} from "../platform/replays.js";
import "./ReplaysPage.css";

/**
 * Dedicated /replays route: lists every saved replay (cap 5) with full
 * details — title, seed, action count, save date, plus Play (loads the
 * same seed via `?seed=`) and Delete (drops one entry from the
 * `cards-replays` localStorage array). Newest first.
 */

function formatSavedAt(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dy = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${yr}-${mo}-${dy} ${hh}:${mm}`;
}

function writeReplays(next: SavedReplay[]): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(REPLAYS_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

export default function ReplaysPage(): JSX.Element {
  // Hold the on-disk order (oldest-first) in state so deletes round-trip
  // through localStorage cleanly. We reverse only at render time.
  const [replays, setReplays] = useState<SavedReplay[]>(() => loadReplays());

  const ordered = useMemo(() => replays.slice().reverse(), [replays]);

  const handleDelete = useCallback((id: string) => {
    setReplays((prev) => {
      const next = prev.filter((r) => r.id !== id);
      writeReplays(next);
      return next;
    });
  }, []);

  return (
    <div className="replays-page" data-testid="replays-page">
      <PageHead title="Replays" />
      <header className="replays-header">
        <h1 className="replays-title">Saved replays</h1>
        <p className="replays-tag" data-testid="replays-count">
          {ordered.length === 0
            ? "No replays saved yet — finish a game and tap “Save replay” on the win banner."
            : `${ordered.length} saved replay${ordered.length === 1 ? "" : "s"} (max 5)`}
        </p>
      </header>

      {ordered.length === 0 ? (
        <p className="replays-empty" data-testid="replays-empty">
          Once you save a replay, it shows up here with its seed and an
          option to replay or delete it.
        </p>
      ) : (
        <ul className="replays-list">
          {ordered.map((r, idx) => {
            const plug = GAMES.find((g) => g.id === r.gameId);
            const title = plug?.title ?? r.gameId;
            return (
              <li
                key={r.id}
                className="replays-row"
                data-testid={`replay-row-${idx}`}
              >
                <div className="replays-row-main">
                  <span className="replays-row-title">{title}</span>
                  <dl className="replays-row-meta">
                    <div className="replays-row-meta-item">
                      <dt>Seed</dt>
                      <dd>
                        <code>{r.seed}</code>
                      </dd>
                    </div>
                    <div className="replays-row-meta-item">
                      <dt>Actions</dt>
                      <dd>{r.actions.length}</dd>
                    </div>
                    <div className="replays-row-meta-item">
                      <dt>Saved</dt>
                      <dd>{formatSavedAt(r.savedAt)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="replays-row-actions">
                  <Link
                    to={`/play/${r.gameId}?seed=${r.seed}`}
                    className="replays-play-btn"
                    data-testid={`replay-play-btn-${idx}`}
                  >
                    Play
                  </Link>
                  <button
                    type="button"
                    className="replays-delete-btn"
                    data-testid={`replay-delete-btn-${idx}`}
                    onClick={() => handleDelete(r.id)}
                    aria-label={`Delete replay ${idx + 1}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="replays-section-hint">
        Back to the <Link to="/" className="replays-link">lobby</Link>.
      </p>
    </div>
  );
}
