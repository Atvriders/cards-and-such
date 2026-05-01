import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlackPeterState, BlackPeterAction, BlackPeterSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function BlackPeterGame({ state, dispatch, onGameOver }: GameProps<BlackPeterState, BlackPeterSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="black-peter-wrap bp-shed"><div className="black-peter-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="black-peter-final">{state.score} pts</div></div></div>;
  return (
    <div className="black-peter-wrap bp-shed">
      <div className="black-peter-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="black-peter-score">{state.score} pts</div>
      <div className="black-peter-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="black-peter-btn" onClick={() => dispatch({ type: "play" } as BlackPeterAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="black-peter-result">{state.result}</div>
        <button className="black-peter-btn alt" onClick={() => dispatch({ type: "next" } as BlackPeterAction)}>Next</button>
      </>}
    </div>
  );
}
