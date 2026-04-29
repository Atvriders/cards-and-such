import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HoneymoonBridgeState, HoneymoonBridgeAction, HoneymoonBridgeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function HoneymoonBridgeGame({ state, dispatch, onGameOver }: GameProps<HoneymoonBridgeState, HoneymoonBridgeSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="honeymoon-bridge-wrap"><div className="honeymoon-bridge-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="honeymoon-bridge-final">{state.score} pts</div></div></div>;
  return (
    <div className="honeymoon-bridge-wrap">
      <div className="honeymoon-bridge-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="honeymoon-bridge-score">{state.score} pts</div>
      <div className="honeymoon-bridge-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="honeymoon-bridge-btn" onClick={() => dispatch({ type: "play" } as HoneymoonBridgeAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="honeymoon-bridge-result">{state.result}</div>
        <button className="honeymoon-bridge-btn alt" onClick={() => dispatch({ type: "next" } as HoneymoonBridgeAction)}>Next Round</button>
      </>}
    </div>
  );
}
