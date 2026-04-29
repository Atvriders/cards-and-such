import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BarbuState, BarbuAction, BarbuSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function BarbuGame({ state, dispatch, onGameOver }: GameProps<BarbuState, BarbuSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="barbu-wrap"><div className="barbu-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="barbu-final">{state.score} pts</div></div></div>;
  return (
    <div className="barbu-wrap">
      <div className="barbu-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="barbu-score">{state.score} pts</div>
      <div className="barbu-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="barbu-btn" onClick={() => dispatch({ type: "play" } as BarbuAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="barbu-result">{state.result}</div>
        <button className="barbu-btn alt" onClick={() => dispatch({ type: "next" } as BarbuAction)}>Next Round</button>
      </>}
    </div>
  );
}
