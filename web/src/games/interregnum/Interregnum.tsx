import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { InterregnumState, InterregnumAction, InterregnumSettings } from "./state.js";
import "./Interregnum.css";

const RANK_NAMES: Record<number, string> = { 1: "A", 11: "J", 12: "Q", 13: "K" };
function rl(r: number): string { return RANK_NAMES[r] ?? String(r); }
function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

type Sel = { kind: "discard"; idx: number } | { kind: "waste" } | null;

export function Interregnum({
  state,
  dispatch,
  onGameOver,
}: GameProps<InterregnumState, InterregnumSettings>): JSX.Element {
  const [sel, setSel] = useState<Sel>(null);

  const handleFoundClick = useCallback((fi: number) => {
    if (!sel) return;
    if (sel.kind === "discard") {
      dispatch({ type: "move-to-foundation", fromType: "discard", fromIdx: sel.idx, foundIdx: fi } as InterregnumAction);
    } else {
      dispatch({ type: "move-to-foundation", fromType: "waste", fromIdx: 0, foundIdx: fi } as InterregnumAction);
    }
    setSel(null);
  }, [sel, dispatch]);

  const handleDiscardClick = useCallback((di: number) => {
    if (!sel) {
      if (state.discards[di]!.length > 0) setSel({ kind: "discard", idx: di });
      return;
    }
    if (sel.kind === "discard") {
      if (sel.idx === di) { setSel(null); return; }
      dispatch({ type: "move-discard-to-discard", fromIdx: sel.idx, toIdx: di } as InterregnumAction);
      setSel(null);
    } else if (sel.kind === "waste") {
      dispatch({ type: "move-waste-to-discard", discardIdx: di } as InterregnumAction);
      setSel(null);
    }
  }, [sel, dispatch, state.discards]);

  const handleWasteClick = useCallback(() => {
    if (sel?.kind === "waste") { setSel(null); return; }
    if (state.waste.length > 0) setSel({ kind: "waste" });
  }, [sel, state.waste]);

  if (state.won) onGameOver(state.score);

  const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1]! : null;

  return (
    <div className="interregnum">
      <div className="int-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Foundation: {state.foundations.reduce((s, f) => s + f.cards.length, 0)}/104</span>
        <span>Stock: {state.stock.length}</span>
      </div>

      <div>
        <div className="int-label">Foundations (build up by suit, wrapping)</div>
        <div className="int-row">
          {state.foundations.map((f, fi) => {
            const top = f.cards.length > 0 ? f.cards[f.cards.length - 1]! : null;
            return (
              <div
                key={fi}
                className={`int-card ${top && isRed(top.suit) ? "red" : "black"}`}
                style={{ opacity: top ? 1 : 0.5, borderColor: sel ? "#4af" : undefined }}
                onClick={() => handleFoundClick(fi)}
              >
                {top ? `${rl(top.rank)}${top.suit}` : `${f.suit}${rl(f.baseRank)}`}
              </div>
            );
          })}
        </div>
      </div>

      <div className="int-row">
        <div>
          <div className="int-label">Stock / Waste</div>
          <div className="int-row">
            <button
              className="int-btn"
              disabled={state.stock.length === 0}
              onClick={() => dispatch({ type: "draw" } as InterregnumAction)}
            >
              Draw ({state.stock.length})
            </button>
            {wasteTop ? (
              <div
                className={`int-card ${isRed(wasteTop.suit) ? "red" : "black"}${sel?.kind === "waste" ? " selected" : ""}`}
                onClick={handleWasteClick}
              >
                {rl(wasteTop.rank)}{wasteTop.suit}
              </div>
            ) : (
              <div className="int-empty">waste</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="int-label">Discard piles (8)</div>
        <div className="int-row">
          {state.discards.map((pile, di) => {
            const top = pile.length > 0 ? pile[pile.length - 1]! : null;
            const isSel = sel?.kind === "discard" && sel.idx === di;
            return (
              <div key={di} className="int-discard">
                {top ? (
                  <div
                    className={`int-card ${isRed(top.suit) ? "red" : "black"}${isSel ? " selected" : ""}`}
                    onClick={() => handleDiscardClick(di)}
                  >
                    {rl(top.rank)}{top.suit}
                    <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>({pile.length})</span>
                  </div>
                ) : (
                  <div className="int-empty" onClick={() => handleDiscardClick(di)}>pile {di + 1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
