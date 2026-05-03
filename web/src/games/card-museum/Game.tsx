import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardMuseumState, CardMuseumAction, CardMuseumSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";

export function CardMuseumGame({ state, dispatch, onGameOver }: GameProps<CardMuseumState, CardMuseumSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cmu-wrap"><div className="cmu-done"><h2>Done!</h2><div className="cmu-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cmu-wrap">
      <div className="cmu-info">Card {state.drawn.length} / {TOTAL_CARDS}</div>
      <div className="cmu-score">{state.score} pts</div>
      {state.drawn.length > 0 && (
        <div className="cmu-row">
          {state.drawn.map((c, i) => <div key={i} className={`cmu-card ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-card-museum-primary" className="cmu-btn" onClick={() => dispatch({ type:"draw" } as CardMuseumAction)}>Draw Card</button>
      )}
    </div>
  );
}
