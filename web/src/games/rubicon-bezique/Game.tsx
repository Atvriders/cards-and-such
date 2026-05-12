import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RubiconBeziqueState, RubiconBeziqueAction, RubiconBeziqueSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function RubiconBeziqueGame({ state, dispatch, onGameOver }: GameProps<RubiconBeziqueState, RubiconBeziqueSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="rubicon-bezique-wrap"><div className="rubicon-bezique-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="rubicon-bezique-final">{state.score} pts</div></div></div>;
  return (
    <div className="rubicon-bezique-wrap fade-in">
      <div className="rubicon-bezique-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="rubicon-bezique-score pulse">{state.score} pts</div>
      <div className="rubicon-bezique-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button data-testid="hint-target-rubicon-bezique-primary" className="rubicon-bezique-btn" onClick={() => dispatch({ type: "play" } as RubiconBeziqueAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="rubicon-bezique-result">{state.result}</div>
        <button data-testid="hint-target-rubicon-bezique-next" className="rubicon-bezique-btn alt" onClick={() => dispatch({ type: "next" } as RubiconBeziqueAction)}>Next Round</button>
      </>}
    </div>
  );
}
