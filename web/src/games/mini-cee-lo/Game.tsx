import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniCeeLoState, MiniCeeLoAction, MiniCeeLoSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function MiniCeeLoGame({ state, dispatch, onGameOver }: GameProps<MiniCeeLoState, MiniCeeLoSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && <div className="dm-row">{state.dice.map((d, i) => <div key={i} className="dm-die">{d}</div>)}</div>}
      {state.phase === "ready" && <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as MiniCeeLoAction)}>Roll!</button>}
      {state.phase === "rolled" && <>
        <div className="dm-result">{state.result}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as MiniCeeLoAction)}>Next</button>
      </>}
    </div>
  );
}
