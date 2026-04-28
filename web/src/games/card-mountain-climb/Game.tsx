import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardMountainClimbState, CardMountainClimbAction, CardMountainClimbSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";

export function CardMountainClimbGame({ state, dispatch, onGameOver }: GameProps<CardMountainClimbState, CardMountainClimbSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cmc-wrap"><div className="cmc-done"><h2>Done!</h2><div className="cmc-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cmc-wrap">
      <div className="cmc-info">Card {state.drawn.length} / {TOTAL_CARDS}</div>
      <div className="cmc-score">{state.score} pts</div>
      {state.drawn.length > 0 && (
        <div className="cmc-row">
          {state.drawn.map((c, i) => <div key={i} className={`cmc-card ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button className="cmc-btn" onClick={() => dispatch({ type:"draw" } as CardMountainClimbAction)}>Draw Card</button>
      )}
    </div>
  );
}
