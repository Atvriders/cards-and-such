import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCarromState, DiceCarromAction, DiceCarromSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCarromGame({ state, dispatch, onGameOver }: GameProps<DiceCarromState, DiceCarromSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ds-carrom-wrap"><div className="ds-carrom-done"><h2>Done!</h2><div className="ds-carrom-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ds-carrom-wrap">
      <div className="ds-carrom-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ds-carrom-score">{state.score} pts</div>
      {state.dice && (
        <div className="ds-carrom-row">{state.dice.map((d, i) => <div key={i} className="ds-carrom-die">{d}</div>)}</div>
      )}
      {state.phase === "rolling" && (
        <button className="ds-carrom-btn" onClick={() => dispatch({ type:"roll" } as DiceCarromAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="ds-carrom-result">+{state.lastPts}</div>
          <button className="ds-carrom-btn alt" onClick={() => dispatch({ type:"next" } as DiceCarromAction)}>Next</button>
        </>
      )}
    </div>
  );
}
