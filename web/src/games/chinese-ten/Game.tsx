import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChineseTenState, ChineseTenAction, ChineseTenSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function ChineseTenGame({ state, dispatch, onGameOver }: GameProps<ChineseTenState, ChineseTenSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="chinese-ten-wrap"><div className="chinese-ten-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="chinese-ten-final">{state.score} pts</div></div></div>;
  return (
    <div className="chinese-ten-wrap">
      <div className="chinese-ten-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="chinese-ten-score">{state.score} pts</div>
      <div className="chinese-ten-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="chinese-ten-btn" onClick={() => dispatch({ type: "play" } as ChineseTenAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="chinese-ten-result">{state.result}</div>
        <button className="chinese-ten-btn alt" onClick={() => dispatch({ type: "next" } as ChineseTenAction)}>Next</button>
      </>}
    </div>
  );
}
