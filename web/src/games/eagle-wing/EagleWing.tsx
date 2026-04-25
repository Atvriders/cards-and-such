import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EagleWingState, EagleWingAction, EagleWingSettings } from "./state.js";
import "./EagleWing.css";

const RANK_NAMES: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
function rl(r: number): string { return RANK_NAMES[r] ?? String(r); }
function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

type Sel = { kind: "tableau"; col: number } | { kind: "reserve" } | { kind: "waste" } | null;

export function EagleWing({
  state,
  dispatch,
  onGameOver,
}: GameProps<EagleWingState, EagleWingSettings>): JSX.Element {
  const [sel, setSel] = useState<Sel>(null);

  const handleFoundClick = useCallback((fi: number) => {
    if (!sel) return;
    if (sel.kind === "tableau") {
      dispatch({ type: "move-to-foundation", fromType: "tableau", fromIdx: sel.col, foundIdx: fi } as EagleWingAction);
    } else if (sel.kind === "reserve") {
      dispatch({ type: "move-to-foundation", fromType: "reserve", fromIdx: 0, foundIdx: fi } as EagleWingAction);
    } else {
      dispatch({ type: "move-to-foundation", fromType: "waste", fromIdx: 0, foundIdx: fi } as EagleWingAction);
    }
    setSel(null);
  }, [sel, dispatch]);

  const handleTabClick = useCallback((ci: number) => {
    if (!sel) { setSel({ kind: "tableau", col: ci }); return; }
    if (sel.kind === "tableau") {
      if (sel.col === ci) { setSel(null); return; }
      dispatch({ type: "move-tableau-to-tableau", fromCol: sel.col, toCol: ci } as EagleWingAction);
      setSel(null);
    } else if (sel.kind === "reserve") {
      dispatch({ type: "move-to-tableau", fromType: "reserve", fromIdx: 0, toCol: ci } as EagleWingAction);
      setSel(null);
    } else if (sel.kind === "waste") {
      dispatch({ type: "move-to-tableau", fromType: "waste", fromIdx: 0, toCol: ci } as EagleWingAction);
      setSel(null);
    }
  }, [sel, dispatch]);

  if (state.won) onGameOver(state.score);

  const reserveTop = state.reserve.length > 0 ? state.reserve[state.reserve.length - 1]! : null;
  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1]! : null;

  return (
    <div className="eagle-wing">
      <div className="ew-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Foundation: {state.foundations.reduce((s, f) => s + f.cards.length, 0)}/52</span>
      </div>

      <div className="ew-section">
        <div className="ew-label">Foundations — click to place selected card</div>
        <div className="ew-row">
          {state.foundations.map((f, fi) => {
            const top = f.cards.length > 0 ? f.cards[f.cards.length - 1]! : null;
            return (
              <div
                key={fi}
                className={`ew-card ${top && isRed(top.suit) ? "red" : "black"}`}
                style={{ opacity: top ? 1 : 0.5, borderColor: sel ? "#4af" : undefined }}
                onClick={() => handleFoundClick(fi)}
              >
                {top ? `${rl(top.rank)}${top.suit}` : `${f.suit}A`}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ew-section">
        <div className="ew-label">Stock / Reserve / Waste</div>
        <div className="ew-row">
          <button
            className="ew-btn"
            disabled={state.stock.length === 0}
            onClick={() => dispatch({ type: "draw" } as EagleWingAction)}
          >
            Draw ({state.stock.length})
          </button>
          <button
            className="ew-btn"
            disabled={state.stock.length > 0 || state.recyclesLeft <= 0}
            onClick={() => dispatch({ type: "recycle" } as EagleWingAction)}
          >
            Recycle ({state.recyclesLeft})
          </button>
          {reserveTop && (
            <div
              className={`ew-card ${isRed(reserveTop.suit) ? "red" : "black"}${sel?.kind === "reserve" ? " selected" : ""}`}
              onClick={() => { if (sel?.kind === "reserve") setSel(null); else setSel({ kind: "reserve" }); }}
            >
              {rl(reserveTop.rank)}{reserveTop.suit}
              <span style={{ fontSize: 10, marginLeft: 2, opacity: 0.6 }}>R</span>
            </div>
          )}
          {wasteTop && (
            <div
              className={`ew-card ${isRed(wasteTop.suit) ? "red" : "black"}${sel?.kind === "waste" ? " selected" : ""}`}
              onClick={() => { if (sel?.kind === "waste") setSel(null); else setSel({ kind: "waste" }); }}
            >
              {rl(wasteTop.rank)}{wasteTop.suit}
              <span style={{ fontSize: 10, marginLeft: 2, opacity: 0.6 }}>W</span>
            </div>
          )}
        </div>
      </div>

      <div className="ew-section">
        <div className="ew-label">Tableau (13 columns)</div>
        <div className="ew-row">
          {state.tableau.map((col, ci) => {
            const top = col.length > 0 ? col[col.length - 1]! : null;
            const isSel = sel?.kind === "tableau" && sel.col === ci;
            return (
              <div key={ci} className="ew-col">
                {top ? (
                  <div
                    className={`ew-card ${isRed(top.suit) ? "red" : "black"}${isSel ? " selected" : ""}`}
                    onClick={() => handleTabClick(ci)}
                  >
                    {rl(top.rank)}{top.suit}
                    {col.length > 1 && <span style={{ fontSize: 10, opacity: 0.6 }}>({col.length})</span>}
                  </div>
                ) : (
                  <div className="ew-empty" onClick={() => handleTabClick(ci)}>empty</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
