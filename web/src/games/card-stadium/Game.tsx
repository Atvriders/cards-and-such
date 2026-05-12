import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardStadiumState, CardStadiumAction, CardStadiumSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";

export function CardStadiumGame({ state, dispatch, onGameOver }: GameProps<CardStadiumState, CardStadiumSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cst-wrap"><div className="cst-done bounce-in"><h2>Done!</h2><div className="cst-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cst-wrap fade-in">
      <div className="cst-info">Card {state.drawn.length} / {TOTAL_CARDS}</div>
      <div className="cst-score pulse">{state.score} pts</div>
      {state.drawn.length > 0 && (
        <div className="cst-row">
          {state.drawn.map((c, i) => <div key={i} className={`cst-card ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-card-stadium-action" className="cst-btn" onClick={() => dispatch({ type:"draw" } as CardStadiumAction)}>Draw Card</button>
      )}
    </div>
  );
}
