import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardFlipState, CardFlipAction, CardFlipSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const SYMBOLS = ["🍎","🍌","🍇","🍑","🍓","🍊","🍐","🥝"];
export function CardFlipGame({ state, dispatch, onGameOver }: GameProps<CardFlipState, CardFlipSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  // auto-hide after 1s if there are 2 unmatched revealed cards
  useEffect(() => {
    const revealedUnmatched = state.cards.filter(c => c.revealed && !c.matched).length;
    if (revealedUnmatched >= 2 && state.firstPick === null) {
      const id = setTimeout(() => dispatch({ type:"hide" } as CardFlipAction), 800);
      return () => clearTimeout(id);
    }
    return;
  }, [state.cards, state.firstPick, dispatch]);
  if (state.phase === "done") {
    return <div className="cf-wrap"><div className="cf-done bounce-in"><h2>All Matched!</h2><div>Attempts: {state.attempts}</div><div className="cf-final">{t?.score} pts</div></div></div>;
  }
  return (
    <div className="cf-wrap fade-in">
      <div className="cf-header">Matches: {state.matches}/8 — Attempts: {state.attempts} <span className="cf-score pulse">{state.score}</span></div>
      <div className="cf-grid">
        {state.cards.map((c, i) => (
          <button data-testid={`hint-target-card-flip-card-${i}`} key={c.id} title="Flip card" className={`cf-card${c.revealed ? " revealed" : ""}${c.matched ? " matched" : ""}`} onClick={() => dispatch({ type:"flip", index: i } as CardFlipAction)}>
            {(c.revealed || c.matched) ? SYMBOLS[c.value - 1] : "?"}
          </button>
        ))}
      </div>
    </div>
  );
}
