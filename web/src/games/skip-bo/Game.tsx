import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkipBoState, SkipBoAction, SkipBoSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function SkipBoGame({ state, dispatch, onGameOver }: GameProps<SkipBoState, SkipBoSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="skip-bo-wrap sb-shed"><div className="skip-bo-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="skip-bo-final">{state.score} pts</div></div></div>;
  return (
    <div className="skip-bo-wrap sb-shed">
      <div className="skip-bo-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="skip-bo-score">{state.score} pts</div>
      <div className="skip-bo-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="skip-bo-btn" onClick={() => dispatch({ type: "play" } as SkipBoAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="skip-bo-result">{state.result}</div>
        <button className="skip-bo-btn alt" onClick={() => dispatch({ type: "next" } as SkipBoAction)}>Next</button>
      </>}
    </div>
  );
}
