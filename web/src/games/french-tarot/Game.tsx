import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrenchTarotState, FrenchTarotAction, FrenchTarotSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function FrenchTarotGame({ state, dispatch, onGameOver }: GameProps<FrenchTarotState, FrenchTarotSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="french-tarot-wrap"><div className="french-tarot-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="french-tarot-final">{state.score} pts</div></div></div>;
  return (
    <div className="french-tarot-wrap">
      <div className="french-tarot-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="french-tarot-score">{state.score} pts</div>
      <div className="french-tarot-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="french-tarot-btn" onClick={() => dispatch({ type: "play" } as FrenchTarotAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="french-tarot-result">{state.result}</div>
        <button className="french-tarot-btn alt" onClick={() => dispatch({ type: "next" } as FrenchTarotAction)}>Next Round</button>
      </>}
    </div>
  );
}
