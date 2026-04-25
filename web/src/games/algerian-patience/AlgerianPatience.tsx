import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlgerianPatienceState, AlgerianPatienceAction, AlgerianPatienceSettings } from "./state.js";
import "./AlgerianPatience.css";

const RANK_NAMES: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
function rl(r: number): string { return RANK_NAMES[r] ?? String(r); }
function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

type Sel = { kind: "tableau"; col: number } | { kind: "waste" } | null;

export function AlgerianPatience({
  state,
  dispatch,
  onGameOver,
}: GameProps<AlgerianPatienceState, AlgerianPatienceSettings>): JSX.Element {
  const [sel, setSel] = useState<Sel>(null);

  const handleFoundClick = useCallback((fi: number) => {
    if (!sel) return;
    if (sel.kind === "tableau") {
      dispatch({ type: "move-to-foundation", fromType: "tableau", fromIdx: sel.col, foundIdx: fi } as AlgerianPatienceAction);
    } else {
      dispatch({ type: "move-to-foundation", fromType: "waste", fromIdx: 0, foundIdx: fi } as AlgerianPatienceAction);
    }
    setSel(null);
  }, [sel, dispatch]);

  const handleTabClick = useCallback((ci: number) => {
    if (!sel) { setSel({ kind: "tableau", col: ci }); return; }
    if (sel.kind === "tableau") {
      if (sel.col === ci) { setSel(null); return; }
      dispatch({ type: "move-tableau", fromCol: sel.col, toCol: ci } as AlgerianPatienceAction);
      setSel(null);
    } else if (sel.kind === "waste") {
      dispatch({ type: "move-waste-to-tableau", toCol: ci } as AlgerianPatienceAction);
      setSel(null);
    }
  }, [sel, dispatch]);

  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1]! : null;

  return (
    <div className="algerian-patience">
      <div className="ap-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Foundation: {state.foundations.reduce((s, f) => s + f.cards.length, 0)}/104</span>
        <span>Recycles: {state.recyclesLeft}</span>
      </div>

      <div className="ap-top">
        <div>
          <div className="ap-label">Foundations — green=A→K, orange=K→A</div>
          <div className="ap-foundations">
            {state.foundations.map((f, fi) => {
              const top = f.cards.length > 0 ? f.cards[f.cards.length - 1]! : null;
              return (
                <div
                  key={fi}
                  className={`ap-card ${top && isRed(top.suit) ? "red" : "black"} ${f.direction === "up" ? "up-foundation" : "down-foundation"}`}
                  style={{ opacity: top ? 1 : 0.5, borderColor: sel ? (f.direction === "up" ? "#2a5" : "#a52") : undefined }}
                  onClick={() => handleFoundClick(fi)}
                >
                  {top ? `${rl(top.rank)}${top.suit}` : (f.direction === "up" ? `${f.suit}A` : `${f.suit}K`)}
                </div>
              );
            })}
          </div>
        </div>

        <div className="ap-stock-waste">
          <button
            className="ap-btn"
            disabled={state.stock.length === 0}
            onClick={() => dispatch({ type: "draw" } as AlgerianPatienceAction)}
          >
            Draw ({state.stock.length})
          </button>
          <button
            className="ap-btn"
            disabled={state.stock.length > 0 || state.recyclesLeft <= 0}
            onClick={() => dispatch({ type: "recycle" } as AlgerianPatienceAction)}
          >
            Recycle ({state.recyclesLeft})
          </button>
          {wasteTop && (
            <div
              className={`ap-card ${isRed(wasteTop.suit) ? "red" : "black"}${sel?.kind === "waste" ? " selected" : ""}`}
              onClick={() => { if (sel?.kind === "waste") setSel(null); else setSel({ kind: "waste" }); }}
            >
              {rl(wasteTop.rank)}{wasteTop.suit}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="ap-label">Tableau (same suit, adjacent rank)</div>
        <div className="ap-tableau">
          {state.tableau.map((col, ci) => {
            const top = col.length > 0 ? col[col.length - 1]! : null;
            const isSel = sel?.kind === "tableau" && sel.col === ci;
            return (
              <div key={ci} className="ap-col">
                {col.slice(0, -1).map((c, ri) => (
                  <div key={ri} className={`ap-card ${isRed(c.suit) ? "red" : "black"}`} style={{ marginBottom: -60 }}>
                    {rl(c.rank)}{c.suit}
                  </div>
                ))}
                {top ? (
                  <div
                    className={`ap-card ${isRed(top.suit) ? "red" : "black"}${isSel ? " selected" : ""}`}
                    onClick={() => handleTabClick(ci)}
                  >
                    {rl(top.rank)}{top.suit}
                  </div>
                ) : (
                  <div className="ap-empty" onClick={() => handleTabClick(ci)}>empty</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
