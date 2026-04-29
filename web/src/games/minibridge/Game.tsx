import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MinibridgeState, MinibridgeAction, MinibridgeSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function MinibridgeGame({ state, dispatch, onGameOver }: GameProps<MinibridgeState, MinibridgeSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="minibridge-wrap"><div className="minibridge-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="minibridge-final">{state.score} pts</div></div></div>;
  return (
    <div className="minibridge-wrap">
      <div className="minibridge-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="minibridge-score">{state.score} pts</div>
      <div className="minibridge-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="minibridge-btn" onClick={() => dispatch({ type: "play" } as MinibridgeAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="minibridge-result">{state.result}</div>
        <button className="minibridge-btn alt" onClick={() => dispatch({ type: "next" } as MinibridgeAction)}>Next Round</button>
      </>}
    </div>
  );
}
