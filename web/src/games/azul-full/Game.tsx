import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  AzulFullState,
  AzulFullAction,
  AzulFullSettings,
  Color,
  Source,
} from "./state.js";
import {
  isTerminal,
  COLOR_NAMES,
  WALL_PATTERN,
  WALL_SIZE,
  FLOOR_PENALTIES,
  legalRowsFor,
  countSource,
  NUM_COLORS,
} from "./state.js";
import "./Game.css";

const PLAYER_LABELS = ["You", "CPU 1", "CPU 2"];
const COLOR_CLASS: Record<number, string> = {
  0: "azf-c-blue",
  1: "azf-c-yellow",
  2: "azf-c-red",
  3: "azf-c-black",
  4: "azf-c-white",
};

interface PendingPick {
  source: Source;
  color: Color;
  count: number;
}

export function AzulFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<AzulFullState, AzulFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  const [pending, setPending] = useState<PendingPick | null>(null);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Clear pending when turn changes or phase changes.
  useEffect(() => {
    setPending(null);
  }, [state.active, state.phase, state.round]);

  // Drive CPU turns + tiling phase automatically.
  useEffect(() => {
    if (state.phase === "done") return;
    if (state.phase === "tiling") {
      const id = window.setTimeout(() => {
        dispatch({ type: "advanceTiling" } as AzulFullAction);
      }, 800);
      return () => window.clearTimeout(id);
    }
    if (state.active !== 0) {
      const id = window.setTimeout(() => {
        dispatch({ type: "cpuStep" } as AzulFullAction);
      }, 650);
      return () => window.clearTimeout(id);
    }
    return;
  }, [state.active, state.phase, state.round, dispatch]);

  const isHumanTurn = state.active === 0 && state.phase === "drafting";
  const me = state.players[0];

  const legalRows = useMemo(() => {
    if (!pending || !me) return [] as number[];
    return legalRowsFor(me, pending.color);
  }, [pending, me]);

  function selectSource(source: Source, color: Color): void {
    if (!isHumanTurn) return;
    const count = countSource(state, source, color);
    if (count <= 0) return;
    setPending({ source, color, count });
  }

  function placeOnRow(rowIdx: number): void {
    if (!pending) return;
    dispatch({
      type: "pick",
      player: 0,
      source: pending.source,
      color: pending.color,
      targetRow: rowIdx,
    } as AzulFullAction);
    setPending(null);
  }

  function renderTileGroup(counts: number[], onClick?: (c: Color) => void): JSX.Element[] {
    const out: JSX.Element[] = [];
    for (let c = 0; c < NUM_COLORS; c++) {
      const n = counts[c] ?? 0;
      for (let k = 0; k < n; k++) {
        const interactive = !!onClick && isHumanTurn;
        out.push(
          <button
            key={`${c}-${k}`}
            type="button"
            className={`azf-tile ${COLOR_CLASS[c] ?? ""} ${interactive ? "azf-tile-pick" : "azf-tile-static"}`}
            disabled={!interactive}
            title={`${COLOR_NAMES[c] ?? "?"} tile${interactive ? " — pick this color" : ""}`}
            aria-label={`${COLOR_NAMES[c] ?? "?"} tile`}
            onClick={() => {
              if (onClick) onClick(c as Color);
            }}
          />,
        );
      }
    }
    return out;
  }

  function renderBoard(playerIdx: number): JSX.Element {
    const board = state.players[playerIdx];
    if (!board) return <div />;
    const isYou = playerIdx === 0;
    const isActive = playerIdx === state.active;
    const showLegal = pending && isYou;

    return (
      <div
        className={`azf-board ${isYou ? "azf-board-you" : ""} ${isActive && state.phase === "drafting" ? "azf-board-active" : ""}`}
      >
        <div className="azf-board-head">
          <span className="azf-board-name">
            {PLAYER_LABELS[playerIdx] ?? `P${playerIdx + 1}`}
            {isActive && state.phase === "drafting" ? " (active)" : ""}
          </span>
          <span className="azf-board-score pulse">{board.score} pts</span>
        </div>
        <div className="azf-board-grid">
          <div className="azf-rows">
            {board.rows.map((row, r) => {
              const canPlaceHere = showLegal && legalRows.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  className={`azf-row ${canPlaceHere ? "azf-row-legal" : ""}`}
                  disabled={!canPlaceHere}
                  title={`Pattern row ${r + 1} (capacity ${r + 1})${canPlaceHere ? " — click to place selected tiles here" : ""}`}
                  aria-label={`Pattern row ${r + 1}`}
                  data-testid={isYou ? `azul-full-row-${r}` : undefined}
                  onClick={() => canPlaceHere && placeOnRow(r)}
                >
                  <span className="azf-row-cells">
                    {Array.from({ length: WALL_SIZE - (r + 1) }).map((_, i) => (
                      <span key={`pad-${i}`} className="azf-cell azf-cell-pad" />
                    ))}
                    {row.map((v, i) => (
                      <span
                        key={i}
                        className={`azf-cell ${v === -1 ? "azf-cell-empty" : ""} ${v !== -1 ? COLOR_CLASS[v] ?? "" : ""}`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="azf-wall">
            {WALL_PATTERN.map((wrow, r) => (
              <div key={r} className="azf-wall-row">
                {wrow.map((color, c) => {
                  const filled = board.wall[r]?.[c];
                  return (
                    <span
                      key={c}
                      className={`azf-cell azf-wall-cell ${COLOR_CLASS[color] ?? ""} ${filled ? "azf-wall-filled" : "azf-wall-faded"}`}
                      title={`${COLOR_NAMES[color] ?? "?"} wall slot (${filled ? "filled" : "empty"})`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="azf-floor" title="Floor line — penalties: -1,-1,-2,-2,-2,-3,-3">
          <span className="azf-floor-label">Floor:</span>
          {Array.from({ length: FLOOR_PENALTIES.length }).map((_, i) => {
            const t = board.floor[i];
            const filled = t !== undefined;
            const isMarker = t === -2;
            return (
              <span
                key={i}
                className={`azf-cell azf-floor-cell ${filled ? (isMarker ? "azf-marker" : COLOR_CLASS[t as number] ?? "") : "azf-cell-empty"}`}
                title={`Slot ${i + 1}: penalty ${FLOOR_PENALTIES[i] ?? 0}${isMarker ? " (first-player marker)" : ""}`}
              >
                <span className="azf-floor-pen">{FLOOR_PENALTIES[i]}</span>
              </span>
            );
          })}
          {isYou && pending && (
            <button
              type="button"
              className="azf-btn azf-btn-warn"
              title="Dump the picked tiles straight to the floor"
              data-testid="azul-full-dump-floor"
              onClick={() => placeOnRow(-1)}
            >
              Dump to Floor
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="azf-wrap fade-in">
      <header className="azf-header">
        <div className="azf-title">Azul (Full)</div>
        <div className="azf-meta">
          Round {state.round} · Phase: <strong>{state.phase}</strong>{" "}
          {state.phase === "drafting" && (
            <>
              · Turn:{" "}
              <strong>{PLAYER_LABELS[state.active] ?? `P${state.active + 1}`}</strong>
            </>
          )}
        </div>
      </header>

      <section className="azf-factories">
        <div className="azf-factories-row">
          {state.factories.map((fac, i) => {
            const total = fac.reduce((a, b) => a + b, 0);
            return (
              <div
                key={i}
                className={`azf-factory ${total === 0 ? "azf-factory-empty" : ""}`}
                data-testid={`azul-full-factory-${i}`}
                title={`Factory ${i + 1}${total === 0 ? " (empty)" : ""}`}
              >
                <div className="azf-factory-label">F{i + 1}</div>
                <div className="azf-factory-tiles">
                  {renderTileGroup(fac, (c) => selectSource({ kind: "factory", index: i }, c))}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="azf-center"
          data-testid="azul-full-center"
          title={`Center pool${state.firstPlayerMarkerInCenter ? " (contains the −1 first-player marker)" : ""}`}
        >
          <div className="azf-center-label">
            Center
            {state.firstPlayerMarkerInCenter && (
              <span className="azf-marker-chip" title="First-player marker is here">
                1st
              </span>
            )}
          </div>
          <div className="azf-center-tiles">
            {renderTileGroup(state.center, (c) => selectSource({ kind: "center" }, c))}
          </div>
        </div>
      </section>

      <section className="azf-pending">
        {pending ? (
          <div className="azf-pending-info">
            Selected: <strong>{pending.count}× {COLOR_NAMES[pending.color]}</strong>{" "}
            from{" "}
            <strong>
              {pending.source.kind === "factory"
                ? `factory ${pending.source.index + 1}`
                : "center"}
            </strong>
            . Click a highlighted pattern row, or dump to the floor.
            <button
              type="button"
              className="azf-btn"
              title="Cancel current selection"
              onClick={() => setPending(null)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="azf-pending-empty">
            {isHumanTurn
              ? "Click a tile in a factory or the center to pick all tiles of that color."
              : state.phase === "tiling"
                ? "Wall-tiling in progress…"
                : `Waiting for ${PLAYER_LABELS[state.active] ?? "CPU"}…`}
          </div>
        )}
      </section>

      <section className="azf-boards">
        {state.players.map((_, p) => (
          <div key={p}>{renderBoard(p)}</div>
        ))}
      </section>

      <section className="azf-controls">
        {state.phase === "tiling" && (
          <button
            type="button"
            data-testid="azul-full-advance-tiling"
            className="azf-btn azf-btn-primary"
            title="Run the wall-tiling phase: score completed rows, apply floor penalties, and begin the next round"
            onClick={() => dispatch({ type: "advanceTiling" } as AzulFullAction)}
          >
            Run Wall-Tiling
          </button>
        )}
        {state.phase === "drafting" && state.active !== 0 && (
          <button
            type="button"
            data-testid="azul-full-cpu-step"
            className="azf-btn"
            title="Advance the CPU's pick"
            onClick={() => dispatch({ type: "cpuStep" } as AzulFullAction)}
          >
            CPU Pick
          </button>
        )}
      </section>

      {state.lastEvent && (
        <div className="azf-event" aria-live="polite">
          {state.lastEvent}
        </div>
      )}

      {terminal && (
        <div className="azf-final bounce-in">
          <div className="azf-final-title">Game Over</div>
          <ul className="azf-final-list">
            {state.players.map((p, i) => (
              <li key={i} className={i === 0 ? "azf-final-you" : ""}>
                {PLAYER_LABELS[i] ?? `P${i + 1}`}: <strong>{p.score}</strong> pts
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
