import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JubileeState, JubileeAction, JubileeSettings } from "./state.js";
import "./Jubilee.css";

const RANK_NAMES: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
function rl(r: number): string { return RANK_NAMES[r] ?? String(r); }
function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

type Sel = { kind: "tableau"; col: number } | { kind: "waste" } | null;

export function Jubilee({
  state,
  dispatch,
  onGameOver,
}: GameProps<JubileeState, JubileeSettings>): JSX.Element {
  const [sel, setSel] = useState<Sel>(null);

  const selectCard = useCallback((next: Sel) => {
    if (!sel) { setSel(next); return; }

    // Try moving to foundation if clicking a foundation
    // (handled by foundation click separately)
    // Try tableau-to-tableau
    if (sel.kind === "tableau" && next && next.kind === "tableau") {
      dispatch({ type: "move-tableau", fromCol: sel.col, toCol: next.col } as JubileeAction);
      setSel(null);
      return;
    }
    setSel(next);
  }, [sel, dispatch]);

  const handleFoundationClick = useCallback((fi: number) => {
    if (!sel) return;
    if (sel.kind === "tableau") {
      dispatch({ type: "move-to-foundation", fromType: "tableau", fromIdx: sel.col, foundIdx: fi } as JubileeAction);
    } else if (sel.kind === "waste") {
      dispatch({ type: "move-to-foundation", fromType: "waste", fromIdx: 0, foundIdx: fi } as JubileeAction);
    }
    setSel(null);
  }, [sel, dispatch]);

  if (state.won) onGameOver(state.score);

  return (
    <div className="jubilee">
      <div className="jubilee-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Foundation: {state.foundations.reduce((s, f) => s + f.cards.length, 0)}/104</span>
      </div>

      <div className="jubilee-top">
        <div>
          <div className="jubilee-section-label">Foundations (build by 5s)</div>
          <div className="jubilee-foundations">
            {state.foundations.map((f, fi) => {
              const top = f.cards.length > 0 ? f.cards[f.cards.length - 1]! : null;
              return (
                <div
                  key={fi}
                  className={`jubilee-card ${top ? (isRed(top.suit) ? "red" : "black") : ""}`}
                  style={{ borderColor: sel ? "#4af" : undefined, opacity: top ? 1 : 0.5 }}
                  onClick={() => handleFoundationClick(fi)}
                >
                  {top ? `${rl(top.rank)}${top.suit}` : `${f.suit}${f.baseRank}`}
                </div>
              );
            })}
          </div>
        </div>

        <div className="jubilee-stock-waste">
          <button
            className="jubilee-draw-btn"
            disabled={state.stock.length === 0}
            onClick={() => dispatch({ type: "draw" } as JubileeAction)}
          >
            Draw ({state.stock.length})
          </button>
          {state.waste.length > 0 && (() => {
            const wTop = state.waste[state.waste.length - 1]!;
            return (
              <div
                className={`jubilee-card ${isRed(wTop.suit) ? "red" : "black"}${sel?.kind === "waste" ? " selected" : ""}`}
                onClick={() => selectCard({ kind: "waste" })}
              >
                {rl(wTop.rank)}{wTop.suit}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="jubilee-section-label">Tableau</div>
      <div className="jubilee-tableau">
        {state.tableau.map((col, ci) => {
          const top = col.length > 0 ? col[col.length - 1]! : null;
          return (
            <div key={ci} className="jubilee-col">
              {top ? (
                <div
                  className={`jubilee-card ${isRed(top.suit) ? "red" : "black"}${sel?.kind === "tableau" && sel.col === ci ? " selected" : ""}`}
                  onClick={() => selectCard({ kind: "tableau", col: ci })}
                >
                  {rl(top.rank)}{top.suit}
                  <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>({col.length})</span>
                </div>
              ) : (
                <div
                  className="jubilee-empty"
                  onClick={() => selectCard({ kind: "tableau", col: ci })}
                >
                  empty
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
