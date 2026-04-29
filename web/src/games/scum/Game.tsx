import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScumState, ScumAction, ScumSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function ScumGame({ state, dispatch, onGameOver }: GameProps<ScumState, ScumSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="scum-wrap"><div className="scum-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="scum-final">{state.score} pts</div></div></div>;
  return (
    <div className="scum-wrap">
      <div className="scum-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="scum-score">{state.score} pts</div>
      <div className="scum-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="scum-btn" onClick={() => dispatch({ type: "play" } as ScumAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="scum-result">{state.result}</div>
        <button className="scum-btn alt" onClick={() => dispatch({ type: "next" } as ScumAction)}>Next</button>
      </>}
    </div>
  );
}
