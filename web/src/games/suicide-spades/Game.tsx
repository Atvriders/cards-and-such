import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SuicideSpadesState, SuicideSpadesAction, SuicideSpadesSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function SuicideSpadesGame({ state, dispatch, onGameOver }: GameProps<SuicideSpadesState, SuicideSpadesSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="suicide-spades-wrap"><div className="suicide-spades-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="suicide-spades-final">{state.score} pts</div></div></div>;
  return (
    <div className="suicide-spades-wrap">
      <div className="suicide-spades-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="suicide-spades-score">{state.score} pts</div>
      <div className="suicide-spades-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="suicide-spades-btn" onClick={() => dispatch({ type: "play" } as SuicideSpadesAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="suicide-spades-result">{state.result}</div>
        <button className="suicide-spades-btn alt" onClick={() => dispatch({ type: "next" } as SuicideSpadesAction)}>Next Round</button>
      </>}
    </div>
  );
}
