import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TycoonState, TycoonAction, TycoonSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function TycoonGame({ state, dispatch, onGameOver }: GameProps<TycoonState, TycoonSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="tycoon-wrap"><div className="tycoon-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="tycoon-final">{state.score} pts</div></div></div>;
  return (
    <div className="tycoon-wrap">
      <div className="tycoon-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="tycoon-score">{state.score} pts</div>
      <div className="tycoon-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="tycoon-btn" onClick={() => dispatch({ type: "play" } as TycoonAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="tycoon-result">{state.result}</div>
        <button className="tycoon-btn alt" onClick={() => dispatch({ type: "next" } as TycoonAction)}>Next</button>
      </>}
    </div>
  );
}
