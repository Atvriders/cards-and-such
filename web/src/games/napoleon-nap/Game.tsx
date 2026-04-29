import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapoleonNapState, NapoleonNapAction, NapoleonNapSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function NapoleonNapGame({ state, dispatch, onGameOver }: GameProps<NapoleonNapState, NapoleonNapSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="napoleon-nap-wrap"><div className="napoleon-nap-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="napoleon-nap-final">{state.score} pts</div></div></div>;
  return (
    <div className="napoleon-nap-wrap">
      <div className="napoleon-nap-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="napoleon-nap-score">{state.score} pts</div>
      <div className="napoleon-nap-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="napoleon-nap-btn" onClick={() => dispatch({ type: "play" } as NapoleonNapAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="napoleon-nap-result">{state.result}</div>
        <button className="napoleon-nap-btn alt" onClick={() => dispatch({ type: "next" } as NapoleonNapAction)}>Next Round</button>
      </>}
    </div>
  );
}
