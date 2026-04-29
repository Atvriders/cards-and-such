import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KonigrufenState, KonigrufenAction, KonigrufenSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function KonigrufenGame({ state, dispatch, onGameOver }: GameProps<KonigrufenState, KonigrufenSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="konigrufen-wrap"><div className="konigrufen-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="konigrufen-final">{state.score} pts</div></div></div>;
  return (
    <div className="konigrufen-wrap">
      <div className="konigrufen-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="konigrufen-score">{state.score} pts</div>
      <div className="konigrufen-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="konigrufen-btn" onClick={() => dispatch({ type: "play" } as KonigrufenAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="konigrufen-result">{state.result}</div>
        <button className="konigrufen-btn alt" onClick={() => dispatch({ type: "next" } as KonigrufenAction)}>Next Round</button>
      </>}
    </div>
  );
}
