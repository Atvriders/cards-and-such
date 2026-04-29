import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpaceAlertCoopState, SpaceAlertCoopAction, SpaceAlertCoopSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, TARGET_SCORE } from "./state.js";
import "./Game.css";
export function SpaceAlertCoopGame({ state, dispatch, onGameOver }: GameProps<SpaceAlertCoopState, SpaceAlertCoopSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const theme = "Real-Time Crew";
  if (state.phase === "done") {
    const won = state.teamScore >= TARGET_SCORE;
    return <div className="coop-wrap"><div className="coop-done"><h2>{won ? "Mission Success!" : "Mission Over"}</h2><div className="coop-final">{state.teamScore} pts (target {TARGET_SCORE})</div>{won && <p style={{ color: "#27ae60", fontWeight: 700 }}>+50 bonus!</p>}</div></div>;
  }
  return (
    <div className="coop-wrap">
      <div className="coop-info">🛸 {theme} — Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="coop-target">Team Score: {state.teamScore} / {TARGET_SCORE}</div>
      {state.phase === "rolled" && (
        <div className="coop-row">
          <div className="coop-die">You: {state.playerRoll}</div>
          <div className="coop-die">Ally: {state.cpuRoll}</div>
        </div>
      )}
      {state.phase === "ready" && (
        <button className="coop-btn" onClick={() => dispatch({ type: "play" } as SpaceAlertCoopAction)}>Play Round</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="coop-result">+{state.lastPts} together</div>
          <button className="coop-btn alt" onClick={() => dispatch({ type: "next" } as SpaceAlertCoopAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next Round"}</button>
        </>
      )}
    </div>
  );
}
