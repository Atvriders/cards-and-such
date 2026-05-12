import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceLadderRollState, DiceLadderRollAction, DiceLadderRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceLadderRollGame({ state, dispatch, onGameOver }: GameProps<DiceLadderRollState, DiceLadderRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="dm-wrap"><div className="dm-done bounce-in"><h2>Done!</h2><p>Total: {state.score} pts</p></div></div>;
  return (
    <div className="dm-wrap fade-in">
      <div className="dm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dm-score pulse">{state.score} pts</span></div>
      <div className="dm-target">Streak: {state.streak} | Last: {state.lastRoll || "—"}</div>
      <p>Roll higher than the last to keep the streak!</p>
      {state.phase === "waiting" && <button className="dm-btn" data-testid="hint-target-dice-ladder-roll-roll" onClick={() => dispatch({ type:"roll" } as DiceLadderRollAction)}>Roll!</button>}
      {state.phase === "result" && state.currentDie !== null && <>
        <div className="dm-dice"><div className="dm-die">{state.currentDie}</div></div>
        <div className="dm-result">
          {state.streakBroken ? `Streak broken! +0 pts` : `Beat ${state.lastRoll === state.currentDie ? 0 : state.lastRoll}! Streak ${state.streak} → +${state.lastPts} pts`}
        </div>
        <button className="dm-btn" data-testid="hint-target-dice-ladder-roll-next" onClick={() => dispatch({ type:"next" } as DiceLadderRollAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}
