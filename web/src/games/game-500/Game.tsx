import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Game500State, Game500Action, Game500Settings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function Game500Game({ state, dispatch, onGameOver }: GameProps<Game500State, Game500Settings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="game-500-wrap"><div className="game-500-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="game-500-final">{state.score} pts</div></div></div>;
  return (
    <div className="game-500-wrap">
      <div className="game-500-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="game-500-score">{state.score} pts</div>
      <div className="game-500-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="game-500-btn" onClick={() => dispatch({ type: "play" } as Game500Action)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="game-500-result">{state.result}</div>
        <button className="game-500-btn alt" onClick={() => dispatch({ type: "next" } as Game500Action)}>Next Round</button>
      </>}
    </div>
  );
}
