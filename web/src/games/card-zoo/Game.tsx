import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardZooState, CardZooAction, CardZooSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";

export function CardZooGame({ state, dispatch, onGameOver }: GameProps<CardZooState, CardZooSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="czo-wrap"><div className="czo-done bounce-in"><h2>Done!</h2><div className="czo-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="czo-wrap fade-in">
      <div className="czo-info">Card {state.drawn.length} / {TOTAL_CARDS}</div>
      <div className="czo-score pulse">{state.score} pts</div>
      {state.drawn.length > 0 && (
        <div className="czo-row">
          {state.drawn.map((c, i) => <div key={i} className={`czo-card ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-card-zoo-action" className="czo-btn" onClick={() => dispatch({ type:"draw" } as CardZooAction)}>Draw Card</button>
      )}
    </div>
  );
}
