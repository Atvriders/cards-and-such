import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PitchCardState, PitchCardAction, PitchCardSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function PitchCardGame({ state, dispatch, onGameOver }: GameProps<PitchCardState, PitchCardSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="pitch-card-wrap"><div className="pitch-card-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="pitch-card-final">{state.score} pts</div></div></div>;
  return (
    <div className="pitch-card-wrap">
      <div className="pitch-card-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="pitch-card-score">{state.score} pts</div>
      <div className="pitch-card-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="pitch-card-btn" onClick={() => dispatch({ type: "play" } as PitchCardAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="pitch-card-result">{state.result}</div>
        <button className="pitch-card-btn alt" onClick={() => dispatch({ type: "next" } as PitchCardAction)}>Next Round</button>
      </>}
    </div>
  );
}
