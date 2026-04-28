import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardRestaurantState, CardRestaurantAction, CardRestaurantSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CardRestaurantGame({ state, dispatch, onGameOver }: GameProps<CardRestaurantState, CardRestaurantSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div><div className="cm-kept-row">{state.decisions.map((c,i) => <div key={i} className={`cm-card kept ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round + 1} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">Kept: {state.decisions.length}</div>
      {state.phase === "deal" && (
        <button className="cm-btn" onClick={() => dispatch({ type:"deal" } as CardRestaurantAction)}>Deal pair</button>
      )}
      {state.phase === "decide" && state.pair && (
        <>
          <div className="cm-row">
            {state.pair.map((c, i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
          </div>
          <div className="cm-row">
            <button className="cm-btn" onClick={() => dispatch({ type:"take" } as CardRestaurantAction)}>Take</button>
            <button className="cm-btn alt" onClick={() => dispatch({ type:"skip" } as CardRestaurantAction)}>Skip</button>
          </div>
        </>
      )}
      <div className="cm-kept-row">{state.decisions.map((c,i) => <div key={i} className={`cm-card kept ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
    </div>
  );
}
