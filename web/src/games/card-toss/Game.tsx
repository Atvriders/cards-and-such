import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardTossState, CardTossAction, CardTossSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";
export function CardTossGame({ state, dispatch, onGameOver }: GameProps<CardTossState, CardTossSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Card {Math.min(state.idx + 1, TOTAL_CARDS)} / {TOTAL_CARDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.current !== null && <div className={`cm-card ${isRed(state.current) ? "red" : "black"}`}>{cardName(state.current)}</div>}
      {state.lastResult && <div className="cm-result">{state.lastResult}</div>}
      <div className="cm-row">
        <button data-testid="hint-target-card-toss-primary" className="cm-btn" onClick={() => dispatch({ type:"toss", pile:"red" } as CardTossAction)}>Red Pile</button>
        <button className="cm-btn" onClick={() => dispatch({ type:"toss", pile:"black" } as CardTossAction)}>Black Pile</button>
        <button className="cm-btn alt" onClick={() => dispatch({ type:"toss", pile:"special" } as CardTossAction)}>Face Pile (J/Q/K/A)</button>
      </div>
    </div>
  );
}
