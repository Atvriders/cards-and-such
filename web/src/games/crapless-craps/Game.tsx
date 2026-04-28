import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CraplessCrapsState, CraplessCrapsAction, CraplessCrapsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CraplessCrapsGame({ state, dispatch, onGameOver }: GameProps<CraplessCrapsState, CraplessCrapsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cc-wrap"><div className="cc-done"><h2>Done!</h2><div className="cc-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cc-wrap">
      <div className="cc-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cc-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="cc-row">{state.dice.map((d, i) => <div key={i} className="cc-die">{d}</div>)}</div>}
      {state.message && <div className="cc-result">{state.message}</div>}
      {state.phase === "roll" && <button className="cc-btn" onClick={() => dispatch({ type:"roll" } as CraplessCrapsAction)}>Roll</button>}
      {state.phase === "result" && <button className="cc-btn alt" onClick={() => dispatch({ type:"next" } as CraplessCrapsAction)}>Next</button>}
    </div>
  );
}
