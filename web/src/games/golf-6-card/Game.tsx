import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Golf6CardState, Golf6CardAction, Golf6CardSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function Golf6CardGame({ state, dispatch, onGameOver }: GameProps<Golf6CardState, Golf6CardSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="golf-6-card-wrap"><div className="golf-6-card-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="golf-6-card-final">{state.score} pts</div></div></div>;
  return (
    <div className="golf-6-card-wrap">
      <div className="golf-6-card-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="golf-6-card-score">{state.score} pts</div>
      <div className="golf-6-card-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="golf-6-card-btn" onClick={() => dispatch({ type: "play" } as Golf6CardAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="golf-6-card-result">{state.result}</div>
        <button className="golf-6-card-btn alt" onClick={() => dispatch({ type: "next" } as Golf6CardAction)}>Next</button>
      </>}
    </div>
  );
}
