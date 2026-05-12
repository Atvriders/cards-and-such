import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GeneralaServidaState, GeneralaServidaAction, GeneralaServidaSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function GeneralaServidaGame({ state, dispatch, onGameOver }: GameProps<GeneralaServidaState, GeneralaServidaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="gs-wrap"><div className="gs-done"><h2>Done!</h2><div className="gs-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="gs-wrap">
      <div className="gs-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="gs-score pulse">{state.score} pts</div>
      {state.dice.length > 0 && <div className="gs-row">{state.dice.map((d, i) => <div key={i} className="gs-die">{d}</div>)}</div>}
      {state.message && <div className="gs-result">{state.message}</div>}
      {state.phase === "roll" && <button data-testid="hint-target-generala-servida-primary" className="gs-btn" onClick={() => dispatch({ type:"roll" } as GeneralaServidaAction)}>Roll</button>}
      {state.phase === "result" && <button className="gs-btn alt" onClick={() => dispatch({ type:"next" } as GeneralaServidaAction)}>Next</button>}
    </div>
  );
}
