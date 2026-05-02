import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Dice10000State, Dice10000Action, Dice10000Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Dice10000Game({ state, dispatch, onGameOver }: GameProps<Dice10000State, Dice10000Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dt-wrap"><div className="dt-done"><h2>Done!</h2><div className="dt-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dt-wrap">
      <div className="dt-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dt-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="dt-row">{state.dice.map((d, i) => <div key={i} className="dt-die">{d}</div>)}</div>}
      {state.message && <div className="dt-result">{state.message}</div>}
      {state.phase === "roll" && <button className="dt-btn" data-testid="hint-target-dice-10000-roll" onClick={() => dispatch({ type:"roll" } as Dice10000Action)}>Roll</button>}
      {state.phase === "result" && <button className="dt-btn alt" data-testid="hint-target-dice-10000-next" onClick={() => dispatch({ type:"next" } as Dice10000Action)}>Next</button>}
    </div>
  );
}
