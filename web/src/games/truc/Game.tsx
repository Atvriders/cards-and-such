import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TrucState, TrucAction, TrucSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function TrucGame({ state, dispatch, onGameOver }: GameProps<TrucState, TrucSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="truc-wrap"><div className="truc-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="truc-final">{state.score} pts</div></div></div>;
  return (
    <div className="truc-wrap">
      <div className="truc-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="truc-score">{state.score} pts</div>
      <div className="truc-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button data-testid="hint-target-truc-primary" className="truc-btn" onClick={() => dispatch({ type: "play" } as TrucAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="truc-result">{state.result}</div>
        <button data-testid="hint-target-truc-next" className="truc-btn alt" onClick={() => dispatch({ type: "next" } as TrucAction)}>Next Round</button>
      </>}
    </div>
  );
}
