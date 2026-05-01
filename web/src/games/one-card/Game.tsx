import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OneCardState, OneCardAction, OneCardSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function OneCardGame({ state, dispatch, onGameOver }: GameProps<OneCardState, OneCardSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="one-card-wrap oc-shed"><div className="one-card-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="one-card-final">{state.score} pts</div></div></div>;
  return (
    <div className="one-card-wrap oc-shed">
      <div className="one-card-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="one-card-score">{state.score} pts</div>
      <div className="one-card-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button className="one-card-btn" onClick={() => dispatch({ type: "play" } as OneCardAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="one-card-result">{state.result}</div>
        <button className="one-card-btn alt" onClick={() => dispatch({ type: "next" } as OneCardAction)}>Next</button>
      </>}
    </div>
  );
}
