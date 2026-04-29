import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Phase10State, Phase10Action, Phase10Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function Phase10Game({ state, dispatch, onGameOver }: GameProps<Phase10State, Phase10Settings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="phase-10-wrap"><div className="phase-10-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="phase-10-final">{state.score} pts</div></div></div>;
  return (
    <div className="phase-10-wrap">
      <div className="phase-10-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="phase-10-score">{state.score} pts</div>
      <div className="phase-10-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="phase-10-btn" onClick={() => dispatch({ type: "play" } as Phase10Action)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="phase-10-result">{state.result}</div>
        <button className="phase-10-btn alt" onClick={() => dispatch({ type: "next" } as Phase10Action)}>Next</button>
      </>}
    </div>
  );
}
