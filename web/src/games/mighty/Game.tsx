import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MightyState, MightyAction, MightySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function MightyGame({ state, dispatch, onGameOver }: GameProps<MightyState, MightySettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="mighty-wrap"><div className="mighty-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="mighty-final">{state.score} pts</div></div></div>;
  return (
    <div className="mighty-wrap">
      <div className="mighty-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="mighty-score">{state.score} pts</div>
      <div className="mighty-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="mighty-btn" onClick={() => dispatch({ type: "play" } as MightyAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="mighty-result">{state.result}</div>
        <button className="mighty-btn alt" onClick={() => dispatch({ type: "next" } as MightyAction)}>Next Round</button>
      </>}
    </div>
  );
}
