import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CentipedeRollState, CentipedeRollAction, CentipedeRollSettings } from "./state.js";
import { isTerminal, targetScore, TOTAL_ROLLS } from "./state.js";
import "./Game.css";

export function CentipedeRollGame({ state, dispatch, onGameOver }: GameProps<CentipedeRollState, CentipedeRollSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap centipede-roll-theme"><div className="dm-done"><h2>Done!</h2><div>Sum: {state.sum}</div><div className="dm-final">{targetScore(state.sum)} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap centipede-roll-theme">
      <div className="dm-info">Roll {state.rolls.length} / {TOTAL_ROLLS}</div>
      <div className="dm-score">Sum: {state.sum} (target 100)</div>
      <div className="dm-row">
        {state.rolls.slice(-12).map((d, i) => <div key={i} className="dm-die" style={{ fontSize:"1.6rem", padding:"6px 10px", minWidth:"40px" }}>{d}</div>)}
      </div>
      <div className="dm-row">
        <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as CentipedeRollAction)}>Roll</button>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"stop" } as CentipedeRollAction)}>Stop</button>
      </div>
    </div>
  );
}
