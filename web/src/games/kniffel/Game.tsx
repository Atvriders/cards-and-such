import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KniffelState, KniffelAction, KniffelSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function KniffelGame({ state, dispatch, onGameOver }: GameProps<KniffelState, KniffelSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="kn-wrap"><div className="kn-done"><h2>Done!</h2><div className="kn-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="kn-wrap">
      <div className="kn-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="kn-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="kn-row">{state.dice.map((d, i) => <div key={i} className="kn-die">{d}</div>)}</div>}
      {state.message && <div className="kn-result">{state.message}</div>}
      {state.phase === "roll" && <button data-testid="hint-target-kniffel-primary" className="kn-btn" onClick={() => dispatch({ type:"roll" } as KniffelAction)}>Roll</button>}
      {state.phase === "result" && <button className="kn-btn alt" onClick={() => dispatch({ type:"next" } as KniffelAction)}>Next</button>}
    </div>
  );
}
