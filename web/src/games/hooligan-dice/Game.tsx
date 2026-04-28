import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HooliganDiceState, HooliganDiceAction, HooliganDiceSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function HooliganDiceGame({ state, dispatch, onGameOver }: GameProps<HooliganDiceState, HooliganDiceSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="hd-wrap"><div className="hd-done"><h2>Done!</h2><div className="hd-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="hd-wrap">
      <div className="hd-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="hd-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="hd-row">{state.dice.map((d, i) => <div key={i} className="hd-die">{d}</div>)}</div>}
      {state.message && <div className="hd-result">{state.message}</div>}
      {state.phase === "roll" && <button className="hd-btn" onClick={() => dispatch({ type:"roll" } as HooliganDiceAction)}>Roll</button>}
      {state.phase === "result" && <button className="hd-btn alt" onClick={() => dispatch({ type:"next" } as HooliganDiceAction)}>Next</button>}
    </div>
  );
}
