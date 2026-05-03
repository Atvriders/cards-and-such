import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardDominoState, CardDominoAction, CardDominoSettings } from "./state.js";
import { isTerminal, TOTAL_PLAYS } from "./state.js";
import "./Game.css";
function rankLabel(r: number): string { return r === 1 ? "A" : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : String(r); }
export function CardDominoGame({ state, dispatch, onGameOver }: GameProps<CardDominoState, CardDominoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cd-wrap"><div className="cd-done"><h2>Done!</h2><div>Chain: {state.chain.length}</div><div className="cd-final">{t?.score} pts</div></div></div>;
  }
  return (
    <div className="cd-wrap">
      <div className="cd-header">Play {state.played} / {TOTAL_PLAYS} <span className="cd-score">{state.score}</span></div>
      <div className="cd-chain">
        {state.chain.map(c => <div key={c.id} className="cd-card mini">{rankLabel(c.rank)}</div>)}
      </div>
      <div className="cd-hand">
        {state.hand.map(c => (
          <button key={c.id} className="cd-card" onClick={() => dispatch({ type:"play", cardId:c.id } as CardDominoAction)}>{rankLabel(c.rank)}</button>
        ))}
      </div>
      <button data-testid="hint-target-card-domino-skip" className="cd-btn skip" onClick={() => dispatch({ type:"skip" } as CardDominoAction)}>Skip turn (-2)</button>
    </div>
  );
}
