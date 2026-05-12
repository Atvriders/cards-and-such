import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Dice421State, Dice421Action, Dice421Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function Dice421Game({ state, dispatch, onGameOver }: GameProps<Dice421State, Dice421Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="f4-wrap"><div className="f4-done bounce-in"><h2>Done!</h2><div className="f4-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="f4-wrap fade-in">
      <div className="f4-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="f4-score pulse">{state.score} pts</div>
      {state.dice.length > 0 && <div className="f4-row">{state.dice.map((d, i) => <div key={i} className="f4-die">{d}</div>)}</div>}
      {state.message && <div className="f4-result">{state.message}</div>}
      {state.phase === "roll" && <button className="f4-btn" data-testid="hint-target-dice-421-roll" onClick={() => dispatch({ type:"roll" } as Dice421Action)}>Roll</button>}
      {state.phase === "result" && <button className="f4-btn alt" data-testid="hint-target-dice-421-next" onClick={() => dispatch({ type:"next" } as Dice421Action)}>Next</button>}
    </div>
  );
}
