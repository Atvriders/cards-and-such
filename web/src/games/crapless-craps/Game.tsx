import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CraplessCrapsState, CraplessCrapsAction, CraplessCrapsSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function CraplessCrapsGame({ state, dispatch, onGameOver }: GameProps<CraplessCrapsState, CraplessCrapsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="ccrp-wrap ccrp-theme"><div className="ccrp-done"><h2>Done!</h2><div className="ccrp-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ccrp-wrap ccrp-theme">
      <div className="ccrp-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="ccrp-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="ccrp-row">{state.dice.map((d, i) => <div key={i} className="ccrp-die">{d}</div>)}</div>}
      {state.message && <div className="ccrp-result">{state.message}</div>}
      {state.phase === "roll" && <button className="ccrp-btn" data-testid="hint-target-crapless-craps-roll" onClick={() => dispatch({ type:"roll" } as CraplessCrapsAction)}>Roll</button>}
      {state.phase === "result" && <button className="ccrp-btn alt" data-testid="hint-target-crapless-craps-next" onClick={() => dispatch({ type:"next" } as CraplessCrapsAction)}>Next</button>}
    </div>
  );
}
