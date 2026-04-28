import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PasseDixState, PasseDixAction, PasseDixSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function PasseDixGame({ state, dispatch, onGameOver }: GameProps<PasseDixState, PasseDixSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="pd-wrap"><div className="pd-done"><h2>Done!</h2><div className="pd-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="pd-wrap">
      <div className="pd-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="pd-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="pd-row">{state.dice.map((d, i) => <div key={i} className="pd-die">{d}</div>)}</div>}
      {state.message && <div className="pd-result">{state.message}</div>}
      {state.phase === "roll" && <button className="pd-btn" onClick={() => dispatch({ type:"roll" } as PasseDixAction)}>Roll</button>}
      {state.phase === "result" && <button className="pd-btn alt" onClick={() => dispatch({ type:"next" } as PasseDixAction)}>Next</button>}
    </div>
  );
}
