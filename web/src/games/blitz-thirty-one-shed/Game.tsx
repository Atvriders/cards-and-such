import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlitzThirtyOneShedState, BlitzThirtyOneShedAction, BlitzThirtyOneShedSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function BlitzThirtyOneShedGame({ state, dispatch, onGameOver }: GameProps<BlitzThirtyOneShedState, BlitzThirtyOneShedSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><h3>Blitz / Thirty-One</h3><div className="dm-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <h3>Blitz / Thirty-One</h3>
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="dm-btn" onClick={() => dispatch({ type: "play" } as BlitzThirtyOneShedAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.result}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as BlitzThirtyOneShedAction)}>Next</button>
      </>}
    </div>
  );
}
