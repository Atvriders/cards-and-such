import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardArenaMiniState, CardArenaMiniAction, CardArenaMiniSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";

export function CardArenaMiniGame({ state, dispatch, onGameOver }: GameProps<CardArenaMiniState, CardArenaMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cam-wrap"><div className="cam-done"><h2>Done!</h2><div className="cam-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cam-wrap">
      <div className="cam-info">Card {state.drawn.length} / {TOTAL_CARDS}</div>
      <div className="cam-score">{state.score} pts</div>
      {state.drawn.length > 0 && (
        <div className="cam-row">
          {state.drawn.map((c, i) => <div key={i} className={`cam-card ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button className="cam-btn" onClick={() => dispatch({ type:"draw" } as CardArenaMiniAction)}>Draw Card</button>
      )}
    </div>
  );
}
