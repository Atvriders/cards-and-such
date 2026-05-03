import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardFlagPoleState, CardFlagPoleAction, CardFlagPoleSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";

export function CardFlagPoleGame({ state, dispatch, onGameOver }: GameProps<CardFlagPoleState, CardFlagPoleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cfp-wrap"><div className="cfp-done"><h2>Done!</h2><div className="cfp-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cfp-wrap">
      <div className="cfp-info">Card {state.drawn.length} / {TOTAL_CARDS}</div>
      <div className="cfp-score">{state.score} pts</div>
      {state.drawn.length > 0 && (
        <div className="cfp-row">
          {state.drawn.map((c, i) => <div key={i} className={`cfp-card ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-card-flag-pole-primary" className="cfp-btn" onClick={() => dispatch({ type:"draw" } as CardFlagPoleAction)}>Draw Card</button>
      )}
    </div>
  );
}
