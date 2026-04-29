import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TarocchiState, TarocchiAction, TarocchiSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function TarocchiGame({ state, dispatch, onGameOver }: GameProps<TarocchiState, TarocchiSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="tarocchi-wrap"><div className="tarocchi-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="tarocchi-final">{state.score} pts</div></div></div>;
  return (
    <div className="tarocchi-wrap">
      <div className="tarocchi-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="tarocchi-score">{state.score} pts</div>
      <div className="tarocchi-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="tarocchi-btn" onClick={() => dispatch({ type: "play" } as TarocchiAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="tarocchi-result">{state.result}</div>
        <button className="tarocchi-btn alt" onClick={() => dispatch({ type: "next" } as TarocchiAction)}>Next Round</button>
      </>}
    </div>
  );
}
