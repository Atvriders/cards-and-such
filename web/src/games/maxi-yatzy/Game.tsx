import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MaxiYatzyState, MaxiYatzyAction, MaxiYatzySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function MaxiYatzyGame({ state, dispatch, onGameOver }: GameProps<MaxiYatzyState, MaxiYatzySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="mx-wrap"><div className="mx-done"><h2>Done!</h2><div className="mx-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="mx-wrap">
      <div className="mx-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="mx-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="mx-row">{state.dice.map((d, i) => <div key={i} className="mx-die">{d}</div>)}</div>}
      {state.message && <div className="mx-result">{state.message}</div>}
      {state.phase === "roll" && <button data-testid="hint-target-maxi-yatzy-primary" className="mx-btn" onClick={() => dispatch({ type:"roll" } as MaxiYatzyAction)}>Roll</button>}
      {state.phase === "result" && <button className="mx-btn alt" onClick={() => dispatch({ type:"next" } as MaxiYatzyAction)}>Next</button>}
    </div>
  );
}
