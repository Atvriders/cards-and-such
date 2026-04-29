import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlaverjassenState, KlaverjassenAction, KlaverjassenSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function KlaverjassenGame({ state, dispatch, onGameOver }: GameProps<KlaverjassenState, KlaverjassenSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="klaverjassen-wrap"><div className="klaverjassen-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="klaverjassen-final">{state.score} pts</div></div></div>;
  return (
    <div className="klaverjassen-wrap">
      <div className="klaverjassen-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="klaverjassen-score">{state.score} pts</div>
      <div className="klaverjassen-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="klaverjassen-btn" onClick={() => dispatch({ type: "play" } as KlaverjassenAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="klaverjassen-result">{state.result}</div>
        <button className="klaverjassen-btn alt" onClick={() => dispatch({ type: "next" } as KlaverjassenAction)}>Next Round</button>
      </>}
    </div>
  );
}
