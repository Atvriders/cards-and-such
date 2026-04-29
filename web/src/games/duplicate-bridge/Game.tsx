import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DuplicateBridgeState, DuplicateBridgeAction, DuplicateBridgeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function DuplicateBridgeGame({ state, dispatch, onGameOver }: GameProps<DuplicateBridgeState, DuplicateBridgeSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="duplicate-bridge-wrap"><div className="duplicate-bridge-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="duplicate-bridge-final">{state.score} pts</div></div></div>;
  return (
    <div className="duplicate-bridge-wrap">
      <div className="duplicate-bridge-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="duplicate-bridge-score">{state.score} pts</div>
      <div className="duplicate-bridge-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="duplicate-bridge-btn" onClick={() => dispatch({ type: "play" } as DuplicateBridgeAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="duplicate-bridge-result">{state.result}</div>
        <button className="duplicate-bridge-btn alt" onClick={() => dispatch({ type: "next" } as DuplicateBridgeAction)}>Next Round</button>
      </>}
    </div>
  );
}
