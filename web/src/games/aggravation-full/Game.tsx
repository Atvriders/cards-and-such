import { useEffect, useMemo, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  AggravationFullState, AggravationFullAction, AggravationFullSettings,
} from "./state.js";
import {
  isTerminal, legalMoves, NUM_MARBLES, NUM_PLAYERS, LABELS, COLORS,
  RING_SIZE, START_RING, HOME_ENTRY, SHORTCUT_ENTRY, SHORTCUT_EXIT,
  HOME_BASE, HOME, CENTER_BASE, CENTER_LEN, HOME_COL_LEN,
  isBase, isRing, isCenter, isHomeCol, isHomed,
} from "./state.js";
import "./Game.css";

function describePos(player: number, pos: number): string {
  if (isBase(pos)) return "Base";
  if (isHomed(pos)) return "HOME";
  if (isHomeCol(pos)) return `Home Col ${pos - HOME_BASE + 1}/4`;
  if (isCenter(pos)) return `Center ${pos - CENTER_BASE + 1}/${CENTER_LEN}`;
  if (isRing(pos)) {
    const dist = ((pos - START_RING[player]! + RING_SIZE) % RING_SIZE);
    return `Ring @${pos} (+${dist})`;
  }
  return `?`;
}

export function AggravationFullGame({
  state, dispatch, onGameOver,
}: GameProps<AggravationFullState, AggravationFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  const isMyTurn = state.turn === 0 && state.phase !== "done";
  const canRoll = isMyTurn && state.phase === "rolling";
  const isMoving = isMyTurn && state.phase === "moving" && state.die !== null;

  // Compute the legal moves for player 0 right now.
  const myMoves = useMemo(() => {
    if (!isMoving || state.die === null) return [];
    return legalMoves(state.marbles, 0, state.die);
  }, [state.marbles, state.die, isMoving]);

  // Group moves by marbleIdx.
  const movesByMarble = useMemo(() => {
    const m = new Map<number, Array<{ useShortcut: boolean; captured: boolean }>>();
    for (const o of myMoves) {
      if (!m.has(o.marbleIdx)) m.set(o.marbleIdx, []);
      m.get(o.marbleIdx)!.push({ useShortcut: o.useShortcut, captured: o.captured });
    }
    return m;
  }, [myMoves]);

  let status = "";
  if (terminal) {
    status = state.winner === 0 ? "You won the race!" : `${LABELS[state.winner ?? 0]} won the race.`;
  } else if (canRoll) {
    status = "Your turn — roll the die.";
  } else if (isMoving) {
    if (myMoves.length === 0) status = `You rolled ${state.die}. No legal move — pass.`;
    else status = `You rolled ${state.die}. Pick a marble.`;
  } else if (!isMyTurn) {
    status = `${LABELS[state.turn]} is playing…`;
  }

  return (
    <div className="agf-wrap fade-in">
      <div className={`agf-status pulse ${state.winner === 0 ? "win" : state.winner !== null ? "loss" : ""}`}>
        {status}
      </div>

      <div className="agf-controls">
        <div className="agf-die" data-testid="agf-die">
          {state.die !== null ? state.die : "—"}
        </div>
        {canRoll && (
          <button
            className="agf-btn agf-roll"
            data-testid="agf-roll"
            onClick={() => dispatch({ type: "roll" } as AggravationFullAction)}
            title="Roll the six-sided die to begin your turn."
          >
            Roll die
          </button>
        )}
        {isMoving && myMoves.length === 0 && (
          <button
            className="agf-btn agf-end"
            data-testid="agf-end"
            onClick={() => dispatch({ type: "endTurn" } as AggravationFullAction)}
            title="No legal move — end your turn."
          >
            Pass turn
          </button>
        )}
      </div>

      {state.consecutiveSixes > 0 && state.phase === "rolling" && state.turn === 0 && (
        <div className="agf-bonus">Bonus roll! (Rolled {state.consecutiveSixes} six{state.consecutiveSixes === 1 ? "" : "es"} — max 3.)</div>
      )}

      <div className="agf-players">
        {state.marbles.map((row, p) => {
          const active = state.turn === p && !terminal;
          return (
            <div key={p} className={`agf-player color-${COLORS[p]} ${active ? "active" : ""}`}>
              <div className="agf-player-head">
                <span className={`agf-swatch color-${COLORS[p]}`} aria-hidden="true" />
                <span className="agf-player-name">{LABELS[p]}</span>
                <span className="agf-player-stats" title={`Marbles in BASE / Ring or center / Home column / HOME`}>
                  {countByPhase(row).base}b · {countByPhase(row).ring}r · {countByPhase(row).homeCol}h · {countByPhase(row).homed}H
                </span>
              </div>
              <div className="agf-marble-row">
                {row.map((m, i) => {
                  const opts = p === 0 ? (movesByMarble.get(i) ?? []) : [];
                  return (
                    <div key={i} className={`agf-marble-cell ${isHomed(m.pos) ? "homed" : ""}`}>
                      <span className={`agf-marble color-${COLORS[p]}`} title={`${LABELS[p]} marble ${i + 1} — ${describePos(p, m.pos)}`}>
                        {i + 1}
                      </span>
                      <span className="agf-marble-pos">{shortPos(p, m.pos)}</span>
                      {p === 0 && isMoving && opts.length > 0 && (
                        <div className="agf-actions">
                          {opts.map((o, k) => (
                            <button
                              key={k}
                              className={`agf-btn agf-move ${o.captured ? "cap" : ""} ${o.useShortcut ? "sc" : ""}`}
                              data-testid={k === 0 && i === firstActionableMarble(movesByMarble) ? "agf-action" : undefined}
                              title={`Move marble ${i + 1} ${state.die} space(s)${o.useShortcut ? " into the center shortcut" : ""}${o.captured ? " — captures opponent!" : ""}.`}
                              onClick={() => dispatch({ type: "move", marbleIdx: i, useShortcut: o.useShortcut } as AggravationFullAction)}
                            >
                              {o.useShortcut ? "Shortcut" : "Move"} +{state.die}{o.captured ? " ★cap" : ""}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="agf-board">
        <div className="agf-board-title">Board</div>
        <div className="agf-board-grid">
          {/* A compact summary: 4 quadrants and the central cross. */}
          {[0, 1, 2, 3].map(qi => (
            <div key={qi} className={`agf-quad color-${COLORS[qi]}`}>
              <div className="agf-quad-label">{LABELS[qi]}'s side</div>
              <div className="agf-quad-meta">
                <span>Start @ {START_RING[qi]}</span>
                <span>Home Entry @ {HOME_ENTRY[qi]}</span>
                <span>★ Shortcut @ {SHORTCUT_ENTRY[qi]} → exits @ {SHORTCUT_EXIT[qi]}</span>
              </div>
              <div className="agf-quad-ring">
                {ringSquaresOfQuadrant(qi).map(sq => (
                  <span
                    key={sq}
                    className={`agf-ringsq ${sq === START_RING[qi] ? "start" : ""} ${sq === HOME_ENTRY[qi] ? "homeentry" : ""} ${sq === SHORTCUT_ENTRY[qi] ? "shortcut" : ""}`}
                    title={squareTitle(sq, qi)}
                  >
                    {marblesAtRing(state.marbles, sq).map(({ player, idx }) => (
                      <span key={`${player}-${idx}`} className={`agf-dot color-${COLORS[player]}`} aria-label={`${LABELS[player]} marble ${idx + 1}`}>{idx + 1}</span>
                    ))}
                    <span className="agf-sqnum">{sq}</span>
                  </span>
                ))}
              </div>
              <div className="agf-quad-home">
                <span className="agf-quad-home-label">Home Col</span>
                {Array.from({ length: HOME_COL_LEN }, (_, hi) => (
                  <span key={hi} className="agf-homesq">
                    {state.marbles[qi]!.map((m, mi) => m.pos === HOME_BASE + hi ? (
                      <span key={mi} className={`agf-dot color-${COLORS[qi]}`} aria-label={`${LABELS[qi]} marble ${mi + 1} in home column`}>{mi + 1}</span>
                    ) : null)}
                  </span>
                ))}
                <span className="agf-homesq agf-final">
                  {state.marbles[qi]!.map((m, mi) => m.pos === HOME ? (
                    <span key={mi} className={`agf-dot homed color-${COLORS[qi]}`} aria-label={`${LABELS[qi]} marble ${mi + 1} at HOME`}>{mi + 1}</span>
                  ) : null)}
                  <span className="agf-sqnum">H</span>
                </span>
              </div>
            </div>
          ))}
          <div className="agf-center">
            <div className="agf-center-label">Center Cross</div>
            <div className="agf-center-cells">
              {Array.from({ length: CENTER_LEN }, (_, ci) => (
                <span key={ci} className="agf-centersq" title={`Center cell ${ci + 1}/${CENTER_LEN}`}>
                  {marblesAtCenter(state.marbles, ci).map(({ player, idx }) => (
                    <span key={`${player}-${idx}`} className={`agf-dot color-${COLORS[player]}`} aria-label={`${LABELS[player]} marble ${idx + 1} on center cross`}>{idx + 1}</span>
                  ))}
                  <span className="agf-sqnum">{ci + 1}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="agf-log">
        {state.log.slice(-6).map((entry, i) => (
          <div key={`${state.log.length}-${i}`} className="agf-log-entry">{entry}</div>
        ))}
      </div>

      {terminal !== null && (
        <div className="agf-end bounce-in">
          <div className="agf-end-title">
            {terminal.score > 0 ? "Victory!" : "Defeat"}
          </div>
          <div className="agf-end-sub">Final score: {terminal.score}</div>
        </div>
      )}
    </div>
  );
}

function shortPos(player: number, pos: number): string {
  if (isBase(pos)) return "B";
  if (isHomed(pos)) return "H!";
  if (isHomeCol(pos)) return `h${pos - HOME_BASE + 1}`;
  if (isCenter(pos)) return `c${pos - CENTER_BASE + 1}`;
  if (isRing(pos)) {
    const dist = ((pos - START_RING[player]! + RING_SIZE) % RING_SIZE);
    return `r${pos}/+${dist}`;
  }
  return "?";
}

function countByPhase(row: readonly { pos: number }[]): { base: number; ring: number; homeCol: number; homed: number } {
  let base = 0, ring = 0, homeCol = 0, homed = 0;
  for (const m of row) {
    if (isBase(m.pos)) base++;
    else if (isHomed(m.pos)) homed++;
    else if (isHomeCol(m.pos)) homeCol++;
    else ring++; // includes center
  }
  return { base, ring, homeCol, homed };
}

function ringSquaresOfQuadrant(q: number): number[] {
  // Quadrant q owns ring squares [q*16 .. q*16+15].
  const out: number[] = [];
  for (let i = 0; i < 16; i++) out.push(q * 16 + i);
  return out;
}

function squareTitle(sq: number, q: number): string {
  if (sq === START_RING[q]) return `Start square @${sq}`;
  if (sq === HOME_ENTRY[q]) return `Home entry @${sq}`;
  if (sq === SHORTCUT_ENTRY[q]) return `Shortcut entry @${sq}`;
  return `Ring @${sq}`;
}

function marblesAtRing(
  marbles: readonly (readonly { pos: number }[])[],
  sq: number,
): { player: number; idx: number }[] {
  const out: { player: number; idx: number }[] = [];
  for (let p = 0; p < NUM_PLAYERS; p++) {
    for (let i = 0; i < NUM_MARBLES; i++) {
      if (marbles[p]![i]!.pos === sq) out.push({ player: p, idx: i });
    }
  }
  return out;
}

function marblesAtCenter(
  marbles: readonly (readonly { pos: number }[])[],
  ci: number,
): { player: number; idx: number }[] {
  const out: { player: number; idx: number }[] = [];
  for (let p = 0; p < NUM_PLAYERS; p++) {
    for (let i = 0; i < NUM_MARBLES; i++) {
      if (marbles[p]![i]!.pos === CENTER_BASE + ci) out.push({ player: p, idx: i });
    }
  }
  return out;
}

function firstActionableMarble(map: Map<number, unknown[]>): number {
  let best = -1;
  for (const k of map.keys()) {
    if (best === -1 || k < best) best = k;
  }
  return best;
}
