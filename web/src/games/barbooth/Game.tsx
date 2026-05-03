import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BarboothState, BarboothAction, BarboothSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function BarboothGame({ state, dispatch, onGameOver }: GameProps<BarboothState, BarboothSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="bb-wrap"><div className="bb-done"><h2>Done!</h2><div className="bb-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="bb-wrap">
      <div className="bb-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="bb-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="bb-row">{state.dice.map((d, i) => <div key={i} className="bb-die">{d}</div>)}</div>}
      {state.message && <div className="bb-result">{state.message}</div>}
      {state.phase === "roll" && <button className="bb-btn" data-testid="hint-target-barbooth-roll" onClick={() => dispatch({ type:"roll" } as BarboothAction)}>Roll</button>}
      {state.phase === "result" && <button className="bb-btn alt" data-testid="hint-target-barbooth-next" onClick={() => dispatch({ type:"next" } as BarboothAction)}>Next</button>}
    </div>
  );
}
