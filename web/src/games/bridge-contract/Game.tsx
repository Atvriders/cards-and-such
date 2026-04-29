import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BridgeContractState, BridgeContractAction, BridgeContractSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, HAND_SIZE } from "./state.js";
import "./Game.css";
export function BridgeContractGame({ state, dispatch, onGameOver }: GameProps<BridgeContractState, BridgeContractSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="bridge-contract-wrap"><div className="bridge-contract-done"><h2>Match Complete</h2><div>Wins: {state.wins} · Losses: {state.losses}</div><div className="bridge-contract-final">{state.score} pts</div></div></div>;
  return (
    <div className="bridge-contract-wrap">
      <div className="bridge-contract-info">Round {state.round} / {TOTAL_ROUNDS} — Hand {HAND_SIZE} cards · W{state.wins} L{state.losses}</div>
      <div className="bridge-contract-score">{state.score} pts</div>
      <div className="bridge-contract-info">Tricks: you {state.tricksWon} · cpu {state.tricksLost}</div>
      {state.phase === "ready" && <button className="bridge-contract-btn" onClick={() => dispatch({ type: "play" } as BridgeContractAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="bridge-contract-result">{state.result}</div>
        <button className="bridge-contract-btn alt" onClick={() => dispatch({ type: "next" } as BridgeContractAction)}>Next Round</button>
      </>}
    </div>
  );
}
