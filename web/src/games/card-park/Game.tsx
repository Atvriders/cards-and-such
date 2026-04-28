import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardParkState, CardParkAction, CardParkSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";

export function CardParkGame({ state, dispatch, onGameOver }: GameProps<CardParkState, CardParkSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cpk-wrap"><div className="cpk-done"><h2>Done!</h2><div className="cpk-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cpk-wrap">
      <div className="cpk-info">Card {state.drawn.length} / {TOTAL_CARDS}</div>
      <div className="cpk-score">{state.score} pts</div>
      {state.drawn.length > 0 && (
        <div className="cpk-row">
          {state.drawn.map((c, i) => <div key={i} className={`cpk-card ${isRed(c)?"red":"black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button className="cpk-btn" onClick={() => dispatch({ type:"draw" } as CardParkAction)}>Draw Card</button>
      )}
    </div>
  );
}
