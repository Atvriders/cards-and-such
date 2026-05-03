import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FoxInTheForestState, FoxInTheForestAction, FoxInTheForestSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function FoxInTheForestGame({ state, dispatch, onGameOver }: GameProps<FoxInTheForestState, FoxInTheForestSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="fox-in-the-forest-wrap"><div className="fox-in-the-forest-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="fox-in-the-forest-final">{state.score} pts</div></div></div>;
  return (
    <div className="fox-in-the-forest-wrap">
      <div className="fox-in-the-forest-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="fox-in-the-forest-score">{state.score} pts</div>
      <div className="fox-in-the-forest-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button data-testid="hint-target-fox-in-the-forest-primary" className="fox-in-the-forest-btn" onClick={() => dispatch({ type: "play" } as FoxInTheForestAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="fox-in-the-forest-result">{state.result}</div>
        <button data-testid="hint-target-fox-in-the-forest-next" className="fox-in-the-forest-btn alt" onClick={() => dispatch({ type: "next" } as FoxInTheForestAction)}>Next Round</button>
      </>}
    </div>
  );
}
