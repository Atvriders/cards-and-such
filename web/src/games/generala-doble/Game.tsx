import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GeneralaDobleState, GeneralaDobleAction, GeneralaDobleSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function GeneralaDobleGame({ state, dispatch, onGameOver }: GameProps<GeneralaDobleState, GeneralaDobleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gd-wrap"><div className="gd-done"><h2>Done!</h2><div className="gd-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="gd-wrap">
      <div className="gd-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="gd-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="gd-row">{state.dice.map((d, i) => <div key={i} className="gd-die">{d}</div>)}</div>}
      {state.message && <div className="gd-result">{state.message}</div>}
      {state.phase === "roll" && <button className="gd-btn" onClick={() => dispatch({ type:"roll" } as GeneralaDobleAction)}>Roll</button>}
      {state.phase === "result" && <button className="gd-btn alt" onClick={() => dispatch({ type:"next" } as GeneralaDobleAction)}>Next</button>}
    </div>
  );
}
