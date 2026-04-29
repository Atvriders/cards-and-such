import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RubberBridgeState, RubberBridgeAction, RubberBridgeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function RubberBridgeGame({ state, dispatch, onGameOver }: GameProps<RubberBridgeState, RubberBridgeSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="rubber-bridge-wrap"><div className="rubber-bridge-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="rubber-bridge-final">{state.score} pts</div></div></div>;
  return (
    <div className="rubber-bridge-wrap">
      <div className="rubber-bridge-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="rubber-bridge-score">{state.score} pts</div>
      <div className="rubber-bridge-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="rubber-bridge-btn" onClick={() => dispatch({ type: "play" } as RubberBridgeAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="rubber-bridge-result">{state.result}</div>
        <button className="rubber-bridge-btn alt" onClick={() => dispatch({ type: "next" } as RubberBridgeAction)}>Next Round</button>
      </>}
    </div>
  );
}
