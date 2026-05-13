import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  MonopolyFullState,
  MonopolyFullAction,
  MonopolyFullSettings,
  Square,
} from "./state.js";
import {
  isTerminal,
  score,
  BOARD,
  canBuild,
  canSellHouse,
  canMortgage,
  canUnmortgage,
  mortgageValue,
  unmortgageCost,
  netWorth,
} from "./state.js";
import "./Game.css";

// ─── Board layout (11x11 outer ring) ───────────────────────────────────────
// Square 0 = bottom-right (GO). Indices 1..9 along bottom row right→left,
// 10 = bottom-left (JAIL), 11..19 left column bottom→top, 20 = top-left
// (FREE PARKING), 21..29 top row left→right, 30 = top-right (GO TO JAIL),
// 31..39 right column top→bottom.
function buildGridCells(): ReadonlyArray<{ idx: number; row: number; col: number; corner?: string }> {
  const cells: { idx: number; row: number; col: number; corner?: string }[] = [];
  // Bottom row (row 11): 0..10 going right→left, columns 11..1
  for (let i = 0; i <= 10; i++) {
    const col = 11 - i;
    const corner = i === 0 ? "br" : i === 10 ? "bl" : undefined;
    cells.push(corner ? { idx: i, row: 11, col, corner } : { idx: i, row: 11, col });
  }
  // Left column (col 1): 11..19 going bottom→top, rows 10..2
  for (let i = 11; i <= 19; i++) {
    const row = 11 - (i - 10);
    cells.push({ idx: i, row, col: 1 });
  }
  // Top row: 20..30, columns 1..11
  for (let i = 20; i <= 30; i++) {
    const col = (i - 20) + 1;
    const corner = i === 20 ? "tl" : i === 30 ? "tr" : undefined;
    cells.push(corner ? { idx: i, row: 1, col, corner } : { idx: i, row: 1, col });
  }
  // Right column (col 11): 31..39 going top→bottom, rows 2..10
  for (let i = 31; i <= 39; i++) {
    const row = (i - 30) + 1;
    cells.push({ idx: i, row, col: 11 });
  }
  return cells;
}

const GRID_CELLS = buildGridCells();

const COLOR_HEX: Record<string, string> = {
  brown: "#8b4513",
  lightblue: "#aae0fa",
  pink: "#d93a96",
  orange: "#f7941d",
  red: "#ed1b24",
  yellow: "#fef200",
  green: "#1fb25a",
  blue: "#0072bb",
};

function DiePip({ value }: { value: number }): JSX.Element {
  const PATTERNS: Record<number, ReadonlyArray<number>> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  const set = new Set(PATTERNS[value] ?? []);
  return (
    <div className="monopolyfull-die" aria-label={`die ${value}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={"monopolyfull-pip" + (set.has(i) ? " on" : "")} />
      ))}
    </div>
  );
}

function squareSubtitle(sq: Square): string {
  if (sq.type === "property") return `$${sq.price}`;
  if (sq.type === "railroad") return `$${sq.price}`;
  if (sq.type === "utility")  return `$${sq.price}`;
  if (sq.type === "tax")      return `Pay $${sq.tax ?? sq.rent}`;
  if (sq.type === "chance")   return "?";
  if (sq.type === "chest")    return "CC";
  return "";
}

function cornerLabel(sq: Square): string {
  if (sq.type === "go")       return "GO";
  if (sq.type === "jail")     return "JAIL";
  if (sq.type === "free")     return "FREE";
  if (sq.type === "gotojail") return "GO TO JAIL";
  return sq.short;
}

export function MonopolyFullGame(
  { state, dispatch, onGameOver }: GameProps<MonopolyFullState, MonopolyFullSettings>,
): JSX.Element {
  // Game-end wiring (single-fire).
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // Local input for auction bid.
  const [bidInput, setBidInput] = useState<string>("");
  useEffect(() => {
    if (state.phase === "auction" && state.auction) {
      // Default to a sensible starting bid.
      const face = BOARD[state.auction.squareIdx]!.price;
      setBidInput(String(Math.min(Math.floor(face * 0.5), state.pCash)));
    }
  }, [state.phase, state.auction, state.pCash]);

  // Selected square for the Manage panel.
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Keyboard shortcuts.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase === "rolling" && state.isPlayer && (e.key === "r" || e.key === "R" || e.key === " ")) {
        e.preventDefault(); dispatch({ type: "roll" } as MonopolyFullAction);
      } else if (state.phase === "deciding") {
        if (e.key === "b" || e.key === "B") { e.preventDefault(); dispatch({ type: "buy" } as MonopolyFullAction); }
        else if (e.key === "a" || e.key === "A") { e.preventDefault(); dispatch({ type: "auction-start" } as MonopolyFullAction); }
      } else if (state.phase === "manage" && (e.key === "Enter" || e.key === "e" || e.key === "E")) {
        e.preventDefault(); dispatch({ type: "end-turn" } as MonopolyFullAction);
      } else if (state.phase === "ai" && (e.key === "Enter" || e.key === "n" || e.key === "N")) {
        e.preventDefault(); dispatch({ type: "ai" } as MonopolyFullAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase, state.isPlayer]);

  // Sums.
  const recentLog = state.log.slice(-5);
  const pNet = useMemo(() => netWorth(state, "p"), [state]);
  const cNet = useMemo(() => netWorth(state, "c"), [state]);

  // Properties for management list.
  const ownedByPlayer: number[] = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < BOARD.length; i++) {
      if (state.owners[i] === "p") arr.push(i);
    }
    return arr;
  }, [state.owners]);

  const sq = (idx: number): Square => BOARD[idx]!;

  return (
    <div className="monopolyfull-wrap fade-in">
      {/* HUD */}
      <div className="monopolyfull-hud-top">
        <div className="monopolyfull-stat">
          <span className="monopolyfull-stat-label">Turn</span>
          <span className="monopolyfull-stat-value">{state.turn}</span>
        </div>
        <div className="monopolyfull-stat monopolyfull-stat-you">
          <span className="monopolyfull-stat-label">You</span>
          <span className="monopolyfull-stat-value monopolyfull-money pulse">${state.pCash}</span>
          <span className="monopolyfull-stat-sub">Net ${pNet}</span>
        </div>
        <div className="monopolyfull-stat monopolyfull-stat-cpu">
          <span className="monopolyfull-stat-label">CPU</span>
          <span className="monopolyfull-stat-value monopolyfull-money">${state.cCash}</span>
          <span className="monopolyfull-stat-sub">Net ${cNet}</span>
        </div>
        {state.pCards.jailFree > 0 && (
          <div className="monopolyfull-stat monopolyfull-stat-card" title="Get Out Of Jail Free">
            <span className="monopolyfull-stat-label">Jail-Free</span>
            <span className="monopolyfull-stat-value">×{state.pCards.jailFree}</span>
          </div>
        )}
      </div>

      {/* Board */}
      <div className="monopolyfull-board" role="grid" aria-label="Monopoly board">
        {GRID_CELLS.map(({ idx, row, col, corner }) => {
          const cell = BOARD[idx]!;
          const own = state.owners[idx]!;
          const isCorner = corner !== undefined;
          const stripeSide =
            row === 1   ? "bottom" :
            row === 11  ? "top" :
            col === 1   ? "right" :
            col === 11  ? "left" : "top";
          const stripeStyle: React.CSSProperties =
            cell.color ? { background: COLOR_HEX[cell.color] } :
            cell.type === "railroad" ? { background: "#222" } :
            { display: "none" };
          const houseCount = state.houses[idx] ?? 0;
          const isSelected = selectedIdx === idx;
          const cls = [
            "monopolyfull-sq",
            `monopolyfull-sq-${cell.type}`,
            isCorner ? `monopolyfull-corner monopolyfull-corner-${corner}` : "",
            own === "p" ? "monopolyfull-owned-p" : "",
            own === "c" ? "monopolyfull-owned-c" : "",
            state.mortgaged[idx] ? "monopolyfull-mortgaged" : "",
            state.pPos === idx ? "monopolyfull-here-p" : "",
            state.cPos === idx ? "monopolyfull-here-c" : "",
            isSelected ? "monopolyfull-selected" : "",
          ].filter(Boolean).join(" ");
          const clickable = own === "p" && (cell.type === "property" || cell.type === "railroad" || cell.type === "utility");
          return (
            <div
              key={idx}
              className={cls}
              style={{ gridRow: row, gridColumn: col }}
              role="gridcell"
              aria-label={`${cell.name}${own === "p" ? " (yours)" : own === "c" ? " (CPU)" : ""}${state.mortgaged[idx] ? " (mortgaged)" : ""}`}
              onClick={clickable ? () => setSelectedIdx((cur) => (cur === idx ? null : idx)) : undefined}
              title={clickable ? "Select to manage" : undefined}
            >
              {(cell.type === "property" || cell.type === "railroad" || cell.type === "utility") && (
                <span
                  className={`monopolyfull-stripe monopolyfull-stripe-${stripeSide}`}
                  style={stripeStyle}
                />
              )}
              <div className="monopolyfull-sq-body">
                {isCorner ? (
                  <>
                    <div className="monopolyfull-corner-label">{cornerLabel(cell)}</div>
                    {cell.type === "jail" && <div className="monopolyfull-corner-sub">Just Visiting</div>}
                  </>
                ) : cell.type === "chance" ? (
                  <>
                    <div className="monopolyfull-chance-mark">?</div>
                    <div className="monopolyfull-sq-name">Chance</div>
                  </>
                ) : cell.type === "chest" ? (
                  <>
                    <div className="monopolyfull-chance-mark" style={{ color: "#1a6dcc" }}>CC</div>
                    <div className="monopolyfull-sq-name">Community</div>
                  </>
                ) : cell.type === "tax" ? (
                  <>
                    <div className="monopolyfull-sq-name">{cell.name}</div>
                    <div className="monopolyfull-sq-sub">{squareSubtitle(cell)}</div>
                  </>
                ) : cell.type === "railroad" ? (
                  <>
                    <div className="monopolyfull-rr-icon" aria-hidden="true">◆</div>
                    <div className="monopolyfull-sq-name">{cell.name}</div>
                    <div className="monopolyfull-sq-sub">{squareSubtitle(cell)}</div>
                  </>
                ) : cell.type === "utility" ? (
                  <>
                    <div className="monopolyfull-rr-icon" aria-hidden="true">{cell.short === "Elec" ? "⚡" : "💧"}</div>
                    <div className="monopolyfull-sq-name">{cell.name}</div>
                    <div className="monopolyfull-sq-sub">{squareSubtitle(cell)}</div>
                  </>
                ) : (
                  <>
                    <div className="monopolyfull-sq-name">{cell.name}</div>
                    <div className="monopolyfull-sq-sub">{squareSubtitle(cell)}</div>
                  </>
                )}

                {/* Houses & hotels */}
                {houseCount > 0 && (
                  <div className={`monopolyfull-houses monopolyfull-houses-${stripeSide}`} aria-label={`${houseCount === 5 ? "hotel" : houseCount + " houses"}`}>
                    {houseCount === 5 ? (
                      <span className="monopolyfull-hotel" title="Hotel">H</span>
                    ) : (
                      Array.from({ length: houseCount }, (_, i) => (
                        <span key={i} className="monopolyfull-house" title="House" />
                      ))
                    )}
                  </div>
                )}

                {/* Tokens */}
                <div className="monopolyfull-tokens">
                  {state.pPos === idx && <span className="monopolyfull-tok monopolyfull-tok-p" title="You">P</span>}
                  {state.cPos === idx && <span className="monopolyfull-tok monopolyfull-tok-c" title="CPU">C</span>}
                </div>

                {/* Owner badge */}
                {own !== "none" && (
                  <span
                    className={`monopolyfull-deed monopolyfull-deed-${own}`}
                    title={`${own === "p" ? "You own" : "CPU owns"} this${state.mortgaged[idx] ? " (mortgaged)" : ""}`}
                  >
                    {own === "p" ? "P" : "C"}
                  </span>
                )}
                {state.mortgaged[idx] && <span className="monopolyfull-mortgage-mark" title="Mortgaged">M</span>}
              </div>
            </div>
          );
        })}

        {/* Center HUD */}
        <div className="monopolyfull-center" style={{ gridRow: "2 / span 9", gridColumn: "2 / span 9" }}>
          <div className="monopolyfull-title">MONOPOLY <span>full rulebook</span></div>
          <div className="monopolyfull-dice-row" aria-live="polite">
            {state.dice ? (
              <>
                <DiePip value={state.dice[0]} />
                <DiePip value={state.dice[1]} />
                <div className="monopolyfull-dice-sum">
                  = <strong>{state.dice[0] + state.dice[1]}</strong>
                  {state.dice[0] === state.dice[1] && <span className="monopolyfull-doubles">DOUBLES</span>}
                </div>
              </>
            ) : (
              <div className="monopolyfull-dice-placeholder">Roll the dice</div>
            )}
          </div>
          <div className="monopolyfull-log" aria-label="Recent events">
            {recentLog.map((line, i) => (
              <div key={state.log.length - recentLog.length + i} className="monopolyfull-log-line">{line}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="monopolyfull-message" aria-live="polite">{state.message}</div>

      {/* Actions */}
      <div className="monopolyfull-actions">
        {state.phase === "rolling" && state.isPlayer && (
          <button
            className="monopolyfull-btn monopolyfull-btn-primary"
            data-testid="monopolyfull-roll"
            aria-label="Roll Dice (R)"
            onClick={() => dispatch({ type: "roll" } as MonopolyFullAction)}
          >
            Roll Dice
          </button>
        )}

        {state.phase === "jail-choice" && (
          <>
            <button
              className="monopolyfull-btn monopolyfull-btn-buy"
              onClick={() => dispatch({ type: "jail-pay" } as MonopolyFullAction)}
              disabled={state.pCash < 50}
              title="Pay $50 bail and roll"
            >
              Pay $50 Bail
            </button>
            <button
              className="monopolyfull-btn monopolyfull-btn-buy"
              onClick={() => dispatch({ type: "jail-card" } as MonopolyFullAction)}
              disabled={state.pCards.jailFree <= 0}
              title="Use a Get Out Of Jail Free card"
            >
              Use Jail-Free Card
            </button>
            <button
              className="monopolyfull-btn monopolyfull-btn-primary"
              data-testid="monopolyfull-jail-roll"
              onClick={() => dispatch({ type: "jail-roll" } as MonopolyFullAction)}
              title="Try rolling doubles"
            >
              Roll for Doubles
            </button>
          </>
        )}

        {state.phase === "deciding" && (
          <>
            <button
              className="monopolyfull-btn monopolyfull-btn-buy"
              data-testid="monopolyfull-buy"
              onClick={() => dispatch({ type: "buy" } as MonopolyFullAction)}
              disabled={state.pCash < (sq(state.pPos).price)}
              title={`Buy ${sq(state.pPos).name} at face price`}
            >
              Buy {sq(state.pPos).name} (${sq(state.pPos).price})
            </button>
            <button
              className="monopolyfull-btn monopolyfull-btn-skip"
              onClick={() => dispatch({ type: "auction-start" } as MonopolyFullAction)}
              title="Decline and put up for auction"
            >
              Auction
            </button>
          </>
        )}

        {state.phase === "auction" && state.auction && (
          <div className="monopolyfull-auction">
            <span className="monopolyfull-auction-label">
              Auctioning <strong>{sq(state.auction.squareIdx).name}</strong> (face ${sq(state.auction.squareIdx).price}):
            </span>
            <input
              type="number"
              min={1}
              max={state.pCash}
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              className="monopolyfull-bid-input"
              aria-label="Your bid"
            />
            <button
              className="monopolyfull-btn monopolyfull-btn-buy"
              data-testid="monopolyfull-bid"
              onClick={() => dispatch({ type: "auction-bid", amount: Number(bidInput) || 0 } as MonopolyFullAction)}
              title="Submit your bid (CPU has placed a sealed bid)"
            >
              Bid ${Number(bidInput) || 0}
            </button>
            <button
              className="monopolyfull-btn monopolyfull-btn-skip"
              onClick={() => dispatch({ type: "auction-pass" } as MonopolyFullAction)}
              title="Pass — CPU may pick it up cheap"
            >
              Pass
            </button>
          </div>
        )}

        {state.phase === "manage" && state.isPlayer && (
          <>
            <button
              className="monopolyfull-btn monopolyfull-btn-primary"
              data-testid="monopolyfull-endturn"
              onClick={() => dispatch({ type: "end-turn" } as MonopolyFullAction)}
              title="End your turn (CPU rolls next)"
            >
              End Turn
            </button>
          </>
        )}

        {state.phase === "ai" && (
          <button
            className="monopolyfull-btn monopolyfull-btn-cpu"
            data-testid="monopolyfull-aiturn"
            onClick={() => dispatch({ type: "ai" } as MonopolyFullAction)}
            title="Run CPU's turn"
          >
            CPU's Turn →
          </button>
        )}

        {state.phase === "done" && (
          <div className="monopolyfull-done bounce-in">
            <div className="monopolyfull-done-msg">{state.message}</div>
            <div className="monopolyfull-done-score">Final Score: <strong>{score(state)}</strong></div>
          </div>
        )}
      </div>

      {/* Manage panel — visible during manage phase to build/mortgage. */}
      {state.phase === "manage" && state.isPlayer && (
        <div className="monopolyfull-manage">
          <div className="monopolyfull-manage-title">Manage Properties</div>
          {ownedByPlayer.length === 0 ? (
            <div className="monopolyfull-manage-empty">You don't own any properties yet.</div>
          ) : (
            <ul className="monopolyfull-manage-list">
              {ownedByPlayer.map((idx) => {
                const cell = sq(idx);
                const h = state.houses[idx] ?? 0;
                const m = state.mortgaged[idx];
                const buildOk = canBuild(state.owners, state.houses, state.mortgaged, state.pCash, "p", idx);
                const sellOk = canSellHouse(state.owners, state.houses, "p", idx);
                const mortOk = canMortgage(state.owners, state.houses, state.mortgaged, "p", idx);
                const unmOk = canUnmortgage(state.owners, state.mortgaged, state.pCash, "p", idx);
                return (
                  <li key={idx} className="monopolyfull-manage-row" data-color={cell.color ?? "none"}>
                    <span className="monopolyfull-manage-name">
                      <span className="monopolyfull-manage-swatch" style={cell.color ? { background: COLOR_HEX[cell.color] } : { background: "#888" }} />
                      {cell.name}
                      {h > 0 && <span className="monopolyfull-manage-houses">{h === 5 ? " 🏨" : ` ${"🏠".repeat(h)}`}</span>}
                      {m && <span className="monopolyfull-manage-mort"> (mortgaged)</span>}
                    </span>
                    <span className="monopolyfull-manage-controls">
                      {cell.type === "property" && (
                        <>
                          <button
                            className="monopolyfull-mini-btn"
                            disabled={!buildOk}
                            onClick={() => dispatch({ type: "build", squareIdx: idx } as MonopolyFullAction)}
                            title={buildOk ? `Build (cost $${cell.houseCost})` : "Cannot build: need full color set, even-build, and cash"}
                          >
                            +House ${cell.houseCost}
                          </button>
                          <button
                            className="monopolyfull-mini-btn"
                            disabled={!sellOk}
                            onClick={() => dispatch({ type: "sell-house", squareIdx: idx } as MonopolyFullAction)}
                            title={sellOk ? `Sell house (refund $${Math.floor(cell.houseCost / 2)})` : "Cannot sell house (must be highest in group)"}
                          >
                            −House
                          </button>
                        </>
                      )}
                      {!m && (
                        <button
                          className="monopolyfull-mini-btn"
                          disabled={!mortOk}
                          onClick={() => dispatch({ type: "mortgage", squareIdx: idx } as MonopolyFullAction)}
                          title={mortOk ? `Mortgage for $${mortgageValue(idx)}` : "Cannot mortgage (sell houses in this color first)"}
                        >
                          Mortgage +${mortgageValue(idx)}
                        </button>
                      )}
                      {m && (
                        <button
                          className="monopolyfull-mini-btn"
                          disabled={!unmOk}
                          onClick={() => dispatch({ type: "unmortgage", squareIdx: idx } as MonopolyFullAction)}
                          title={unmOk ? `Unmortgage for $${unmortgageCost(idx)} (incl. 10% interest)` : "Need more cash to unmortgage"}
                        >
                          Unmortgage −${unmortgageCost(idx)}
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Position summary */}
      <div className="monopolyfull-positions">
        <span className="monopolyfull-pos monopolyfull-pos-p">You at {BOARD[state.pPos]!.name}{state.pInJail ? " (in jail)" : ""}</span>
        <span className="monopolyfull-pos monopolyfull-pos-c">CPU at {BOARD[state.cPos]!.name}{state.cInJail ? " (in jail)" : ""}</span>
      </div>
    </div>
  );
}
