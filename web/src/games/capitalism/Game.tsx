import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CapitalismState, CapitalismAction, CapitalismSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function CapitalismGame({ state, dispatch, onGameOver }: GameProps<CapitalismState, CapitalismSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="capitalism-wrap"><div className="capitalism-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="capitalism-final">{state.score} pts</div></div></div>;
  return (
    <div className="capitalism-wrap">
      <div className="capitalism-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="capitalism-score">{state.score} pts</div>
      <div className="capitalism-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="capitalism-btn" onClick={() => dispatch({ type: "play" } as CapitalismAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="capitalism-result">{state.result}</div>
        <button className="capitalism-btn alt" onClick={() => dispatch({ type: "next" } as CapitalismAction)}>Next</button>
      </>}
    </div>
  );
}
