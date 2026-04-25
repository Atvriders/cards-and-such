import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColoradoState, ColoradoAction, ColoradoSettings } from "./state.js";
import "./Colorado.css";

const RANK_NAMES: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
function rl(r: number): string { return RANK_NAMES[r] ?? String(r); }
function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

export function Colorado({
  state,
  dispatch,
  onGameOver,
}: GameProps<ColoradoState, ColoradoSettings>): JSX.Element {
  const [sel, setSel] = useState<number | null>(null);

  const handlePileClick = useCallback((pi: number) => {
    const pile = state.piles[pi]!;
    if (pile.length === 0) { setSel(null); return; }
    if (sel === null) { setSel(pi); return; }
    if (sel === pi) { setSel(null); return; }
    setSel(pi); // reselect
  }, [sel, state.piles]);

  const handleFoundClick = useCallback((fi: number) => {
    if (sel === null) return;
    dispatch({ type: "move-to-foundation", pileIdx: sel, foundIdx: fi } as ColoradoAction);
    setSel(null);
  }, [sel, dispatch]);

  if (state.won) onGameOver(state.score);

  return (
    <div className="colorado">
      <div className="colorado-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Deals left: {state.dealsLeft}</span>
        <span>Foundation: {state.foundations.reduce((s, f) => s + f.cards.length, 0)}/104</span>
      </div>

      <div>
        <div className="colorado-label">Foundations — select a pile then click a foundation</div>
        <div className="colorado-foundations">
          {state.foundations.map((f, fi) => {
            const top = f.cards.length > 0 ? f.cards[f.cards.length - 1]! : null;
            return (
              <div
                key={fi}
                className={`colorado-card ${top && isRed(top.suit) ? "red" : "black"}`}
                style={{ opacity: top ? 1 : 0.5, borderColor: sel !== null ? "#4af" : undefined }}
                onClick={() => handleFoundClick(fi)}
              >
                {top ? `${rl(top.rank)}${top.suit}` : `${f.suit}A`}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="colorado-label">
          Piles (20) — {state.stock.length} cards in stock
          <button
            className="colorado-btn"
            style={{ marginLeft: 12 }}
            disabled={state.dealsLeft <= 0 || state.stock.length === 0}
            onClick={() => dispatch({ type: "deal-row" } as ColoradoAction)}
          >
            Deal row ({state.dealsLeft} left)
          </button>
        </div>
        <div className="colorado-grid">
          {state.piles.map((pile, pi) => {
            const top = pile.length > 0 ? pile[pile.length - 1]! : null;
            const isSel = sel === pi;
            return (
              <div key={pi} className="colorado-pile">
                {top ? (
                  <div
                    className={`colorado-card ${isRed(top.suit) ? "red" : "black"}${isSel ? " selected" : ""}`}
                    onClick={() => handlePileClick(pi)}
                  >
                    {rl(top.rank)}{top.suit}
                    <span className="colorado-card-count">{pile.length}</span>
                  </div>
                ) : (
                  <div className="colorado-empty">—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
