import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TractorState, TractorAction, TractorSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function TractorGame({ state, dispatch, onGameOver }: GameProps<TractorState, TractorSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="tractor-wrap tr-shed"><div className="tractor-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="tractor-final">{state.score} pts</div></div></div>;
  return (
    <div className="tractor-wrap tr-shed">
      <div className="tractor-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="tractor-score">{state.score} pts</div>
      <div className="tractor-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="tractor-btn" onClick={() => dispatch({ type: "play" } as TractorAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="tractor-result">{state.result}</div>
        <button className="tractor-btn alt" onClick={() => dispatch({ type: "next" } as TractorAction)}>Next</button>
      </>}
    </div>
  );
}
