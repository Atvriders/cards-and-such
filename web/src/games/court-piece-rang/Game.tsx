import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CourtPieceRangState, CourtPieceRangAction, CourtPieceRangSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function CourtPieceRangGame({ state, dispatch, onGameOver }: GameProps<CourtPieceRangState, CourtPieceRangSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="court-piece-rang-wrap"><div className="court-piece-rang-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="court-piece-rang-final">{state.score} pts</div></div></div>;
  return (
    <div className="court-piece-rang-wrap">
      <div className="court-piece-rang-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="court-piece-rang-score">{state.score} pts</div>
      <div className="court-piece-rang-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="court-piece-rang-btn" onClick={() => dispatch({ type: "play" } as CourtPieceRangAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="court-piece-rang-result">{state.result}</div>
        <button className="court-piece-rang-btn alt" onClick={() => dispatch({ type: "next" } as CourtPieceRangAction)}>Next Round</button>
      </>}
    </div>
  );
}
