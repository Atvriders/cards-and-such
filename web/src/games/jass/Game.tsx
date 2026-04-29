import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JassState, JassAction, JassSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function JassGame({ state, dispatch, onGameOver }: GameProps<JassState, JassSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="jass-wrap"><div className="jass-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="jass-final">{state.score} pts</div></div></div>;
  return (
    <div className="jass-wrap">
      <div className="jass-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="jass-score">{state.score} pts</div>
      <div className="jass-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="jass-btn" onClick={() => dispatch({ type: "play" } as JassAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="jass-result">{state.result}</div>
        <button className="jass-btn alt" onClick={() => dispatch({ type: "next" } as JassAction)}>Next Round</button>
      </>}
    </div>
  );
}
