import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRelayMiniState, DiceRelayMiniAction, DiceRelayMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, STAGES } from "./state.js";
import "./Game.css";
export function DiceRelayMiniGame({ state, dispatch, onGameOver }: GameProps<DiceRelayMiniState, DiceRelayMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div>Stage reached: {state.stage + 1} / {STAGES}</div><div className="dm-final">{state.score} pts</div></div></div>;
  const target = state.stage + 5;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — Stage {state.stage + 1} (target sum ≥ {target})</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && <div className="dm-dice">[ {state.dice[0]}, {state.dice[1]} ] = {state.dice[0] + state.dice[1]}</div>}
      {state.phase === "rolling" && <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as DiceRelayMiniAction)}>Roll</button>}
      {state.phase === "scored" && (
        <>
          <div className="dm-result">{state.lastPts > 0 ? `+${state.lastPts} (advanced)` : "no advance"}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceRelayMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}
