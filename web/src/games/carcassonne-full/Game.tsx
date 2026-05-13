import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  CarcassonneFullState,
  CarcassonneFullAction,
  CarcassonneFullSettings,
  Side,
  EdgeKind,
} from "./state.js";
import {
  isTerminal,
  allLegalPlacements,
  edgeAfterRot,
  sideToSegLeader,
  canPlace,
  BOARD_SIZE,
  NUM_PLAYERS,
  MEEPLES_PER_PLAYER,
  N as SIDE_N,
  E as SIDE_E,
  S as SIDE_S,
  W as SIDE_W,
} from "./state.js";
import "./Game.css";

const CELL = 42;
const SEAT_COLORS = ["#1f77b4", "#d62728", "#2ca02c"];
const SEAT_LABELS = ["You", "CPU 1", "CPU 2"];

/** Pixel offsets of the four edge midpoints inside a tile cell. */
const EDGE_POS: Record<Side, { x: number; y: number }> = {
  [SIDE_N]: { x: CELL / 2, y: 4 },
  [SIDE_E]: { x: CELL - 4, y: CELL / 2 },
  [SIDE_S]: { x: CELL / 2, y: CELL - 4 },
  [SIDE_W]: { x: 4, y: CELL / 2 },
};

function edgeColor(k: EdgeKind): string {
  if (k === "city") return "#a6651d";
  if (k === "road") return "#888";
  return "#7caa55";
}

interface TileViewProps {
  proto: { id: string; edges: readonly [EdgeKind, EdgeKind, EdgeKind, EdgeKind]; cloister: boolean; shield: boolean };
  rot: 0 | 1 | 2 | 3;
  ghost?: boolean;
  highlight?: boolean;
  meeples?: Array<{ side: Side | "cloister"; owner: number }>;
}

function TileView({ proto, rot, ghost, highlight, meeples }: TileViewProps): JSX.Element {
  // Compute edge kinds in render orientation
  const kinds: EdgeKind[] = [SIDE_N, SIDE_E, SIDE_S, SIDE_W].map((s) => edgeAfterRot(proto as never, rot, s as Side));
  // Determine background tint based on dominant edge kind
  const cityCount = kinds.filter((k) => k === "city").length;
  const roadCount = kinds.filter((k) => k === "road").length;
  const bg = cityCount > 0 && cityCount >= roadCount ? "#f4e3c4" : "#dfe9c8";
  return (
    <div
      className={`cf-tile ${ghost ? "cf-ghost" : ""} ${highlight ? "cf-hl" : ""}`}
      style={{ width: CELL, height: CELL, background: bg }}
    >
      {([SIDE_N, SIDE_E, SIDE_S, SIDE_W] as Side[]).map((s) => {
        const w = s === SIDE_N || s === SIDE_S ? CELL : 6;
        const h = s === SIDE_N || s === SIDE_S ? 6 : CELL;
        const left = s === SIDE_E ? CELL - 6 : s === SIDE_W ? 0 : 0;
        const top = s === SIDE_S ? CELL - 6 : s === SIDE_N ? 0 : 0;
        return (
          <div
            key={s}
            className="cf-edge"
            style={{
              width: w,
              height: h,
              left,
              top,
              background: edgeColor(kinds[s]!),
            }}
            title={kinds[s]}
          />
        );
      })}
      {proto.cloister && <div className="cf-cloister" title="Cloister" />}
      {proto.shield && <div className="cf-shield" title="Shield" />}
      {(meeples ?? []).map((m, i) => {
        const isCloister = m.side === "cloister";
        const pos = isCloister
          ? { x: CELL / 2, y: CELL / 2 }
          : EDGE_POS[m.side as Side];
        return (
          <div
            key={i}
            className="cf-meeple"
            style={{ left: pos.x - 5, top: pos.y - 5, background: SEAT_COLORS[m.owner % SEAT_COLORS.length] }}
            title={`${SEAT_LABELS[m.owner]} meeple`}
          />
        );
      })}
    </div>
  );
}

export function CarcassonneFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CarcassonneFullState, CarcassonneFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Auto-step CPU turns
  useEffect(() => {
    if (state.phase === "done") return;
    if (state.turn !== 0 && state.phase === "place") {
      const t = window.setTimeout(() => {
        dispatch({ type: "cpuStep" } satisfies CarcassonneFullAction);
      }, 350);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [state.turn, state.phase, dispatch]);

  // Rotation state for the human placing the current tile
  const [rot, setRot] = useState<0 | 1 | 2 | 3>(0);
  useEffect(() => {
    setRot(0);
  }, [state.placed.length]);

  // Compute legal placements for the human at the chosen rotation
  const legalAtRot = useMemo(() => {
    if (state.turn !== 0 || state.phase !== "place" || !state.current) return new Set<string>();
    const out = new Set<string>();
    for (const p of allLegalPlacements(state, state.current)) {
      if (p.rot === rot) out.add(`${p.x},${p.y}`);
    }
    return out;
  }, [state, rot]);

  // Compute bounding rectangle of placed tiles, plus 1 padding for placement
  const { minX, maxX, minY, maxY } = useMemo(() => {
    let nx = BOARD_SIZE - 1, xx = 0, ny = BOARD_SIZE - 1, yy = 0;
    for (const p of state.placed) {
      if (p.x < nx) nx = p.x;
      if (p.x > xx) xx = p.x;
      if (p.y < ny) ny = p.y;
      if (p.y > yy) yy = p.y;
    }
    return {
      minX: Math.max(0, nx - 1),
      maxX: Math.min(BOARD_SIZE - 1, xx + 1),
      minY: Math.max(0, ny - 1),
      maxY: Math.min(BOARD_SIZE - 1, yy + 1),
    };
  }, [state.placed]);

  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;

  // Meeple location lookup: tile idx → list of meeples on tile
  const meeplesPerTile = useMemo(() => {
    const m = new Map<number, Array<{ side: Side | "cloister"; owner: number }>>();
    for (const meep of state.meeples) {
      const parts = meep.seg.split(":");
      const tIdx = parseInt(parts[0]!, 10);
      const rest = parts[1]!;
      const side: Side | "cloister" = rest === "c"
        ? "cloister"
        : (parseInt(rest.slice(1), 10) as Side);
      const arr = m.get(tIdx) ?? [];
      arr.push({ side, owner: meep.owner });
      m.set(tIdx, arr);
    }
    return m;
  }, [state.meeples]);

  function handleCellClick(x: number, y: number): void {
    if (state.turn !== 0) return;
    if (state.phase !== "place") return;
    if (!state.current) return;
    if (!canPlace(state, state.current, x, y, rot)) return;
    dispatch({ type: "place", x, y, rot } satisfies CarcassonneFullAction);
  }

  function pickMeeple(side: Side | "cloister" | null): void {
    if (state.turn !== 0 || state.phase !== "meeple") return;
    dispatch({ type: "meeple", side } satisfies CarcassonneFullAction);
  }

  // Build meeple side options for the just-placed tile
  const meepleOptions = useMemo(() => {
    if (state.phase !== "meeple" || state.turn !== 0) return [];
    const pt = state.placed[state.placed.length - 1];
    if (!pt) return [];
    const leader = sideToSegLeader(pt.proto, pt.rot);
    const seen = new Set<number>();
    const opts: Array<{ label: string; side: Side | "cloister"; kind: EdgeKind | "cloister" }> = [];
    for (const s of [SIDE_N, SIDE_E, SIDE_S, SIDE_W] as Side[]) {
      const ls = leader[s];
      if (seen.has(ls)) continue;
      seen.add(ls);
      const kind = edgeAfterRot(pt.proto, pt.rot, ls as Side);
      const label = kind === "city" ? "Knight (city)"
        : kind === "road" ? "Thief (road)"
        : "Farmer (field)";
      opts.push({ label, side: ls as Side, kind });
    }
    if (pt.proto.cloister) {
      opts.push({ label: "Monk (cloister)", side: "cloister", kind: "cloister" });
    }
    return opts;
  }, [state]);

  const totalTilesRemaining = state.bag.length + (state.current ? 1 : 0);
  const isHumanPlace = state.turn === 0 && state.phase === "place";
  const isHumanMeeple = state.turn === 0 && state.phase === "meeple";

  return (
    <div className="cf-wrap fade-in">
      <h3 className="cf-title">Carcassonne (Full Base Game)</h3>
      <div className="cf-scoreboard">
        {Array.from({ length: NUM_PLAYERS }).map((_, i) => (
          <div
            key={i}
            className={"cf-seat" + (state.turn === i && state.phase !== "done" ? " cf-active" : "")}
            style={{ borderColor: SEAT_COLORS[i] }}
          >
            <div className="cf-seat-name" style={{ color: SEAT_COLORS[i] }}>{SEAT_LABELS[i]}</div>
            <div className="cf-seat-score pulse">{state.scores[i] ?? 0}</div>
            <div className="cf-seat-meeples">
              <span title={`${state.supply[i] ?? 0} meeples in supply`}>
                Meeples: {state.supply[i] ?? 0}/{MEEPLES_PER_PLAYER}
              </span>
            </div>
          </div>
        ))}
        <div className="cf-bag">
          <div className="cf-bag-label">Tiles left</div>
          <div className="cf-bag-count">{totalTilesRemaining}</div>
        </div>
      </div>

      {state.current && state.phase !== "done" && (
        <div className="cf-current">
          <div className="cf-current-label">
            {isHumanPlace
              ? "Your tile — click a highlighted cell to place"
              : isHumanMeeple
                ? "Place a meeple, or skip"
                : `${SEAT_LABELS[state.turn]} is thinking…`}
          </div>
          <TileView proto={state.current} rot={rot} />
          {isHumanPlace && (
            <div className="cf-rotate-row">
              <button
                type="button"
                onClick={() => setRot(((rot + 3) % 4) as 0 | 1 | 2 | 3)}
                title="Rotate tile counter-clockwise"
                aria-label="Rotate counter-clockwise"
                data-testid="cf-rotate-left"
              >Rotate left</button>
              <button
                type="button"
                onClick={() => setRot(((rot + 1) % 4) as 0 | 1 | 2 | 3)}
                title="Rotate tile clockwise"
                aria-label="Rotate clockwise"
                data-testid="cf-rotate-right"
              >Rotate right</button>
            </div>
          )}
        </div>
      )}

      {isHumanMeeple && (
        <div className="cf-meeple-picker">
          <div className="cf-meeple-label">Place a meeple on the just-placed tile:</div>
          <div className="cf-meeple-buttons">
            {meepleOptions.map((opt) => (
              <button
                key={String(opt.side)}
                type="button"
                onClick={() => pickMeeple(opt.side)}
                title={`Place meeple on ${opt.label}`}
                data-testid={`cf-meeple-${opt.side}`}
                disabled={(state.supply[0] ?? 0) <= 0}
              >{opt.label}</button>
            ))}
            <button
              type="button"
              onClick={() => pickMeeple(null)}
              title="Skip — do not place a meeple"
              data-testid="cf-meeple-skip"
            >Skip</button>
          </div>
        </div>
      )}

      <div
        className="cf-board"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
          gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
        }}
      >
        {Array.from({ length: rows }).map((_, ry) =>
          Array.from({ length: cols }).map((__, rx) => {
            const x = minX + rx;
            const y = minY + ry;
            const tIdx = state.board[y]?.[x] ?? -1;
            const legal = legalAtRot.has(`${x},${y}`) && isHumanPlace;
            const placed = tIdx >= 0 ? state.placed[tIdx] : undefined;
            return (
              <div
                key={`${x}-${y}`}
                className={`cf-cell ${legal ? "cf-legal" : ""}`}
                style={{ gridColumnStart: rx + 1, gridRowStart: ry + 1 }}
                onClick={() => legal && handleCellClick(x, y)}
                data-testid={`cf-cell-${x}-${y}`}
                role={legal ? "button" : undefined}
                title={legal ? "Place tile here" : undefined}
              >
                {placed && (
                  <TileView
                    proto={placed.proto}
                    rot={placed.rot}
                    meeples={meeplesPerTile.get(tIdx) ?? []}
                    highlight={tIdx === state.placed.length - 1 && state.phase === "meeple"}
                  />
                )}
                {!placed && legal && state.current && (
                  <TileView proto={state.current} rot={rot} ghost />
                )}
              </div>
            );
          })
        )}
      </div>

      {state.log && <div className="cf-log">{state.log}</div>}

      {state.phase === "done" && (
        <div className="cf-done bounce-in">
          <h3>Game over</h3>
          <ul className="cf-final-scores">
            {Array.from({ length: NUM_PLAYERS }).map((_, i) => (
              <li key={i} style={{ color: SEAT_COLORS[i] }}>
                {SEAT_LABELS[i]}: <b>{state.scores[i] ?? 0}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
