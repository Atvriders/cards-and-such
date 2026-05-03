import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HappyFamiliesState, HappyFamiliesAction, HappyFamiliesSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function HappyFamiliesGame({ state, dispatch, onGameOver }: GameProps<HappyFamiliesState, HappyFamiliesSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="happy-families-wrap hf-shed"><div className="happy-families-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="happy-families-final">{state.score} pts</div></div></div>;
  return (
    <div className="happy-families-wrap hf-shed">
      <div className="happy-families-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="happy-families-score">{state.score} pts</div>
      <div className="happy-families-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button data-testid="hint-target-happy-families-primary" className="happy-families-btn" onClick={() => dispatch({ type: "play" } as HappyFamiliesAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="happy-families-result">{state.result}</div>
        <button className="happy-families-btn alt" onClick={() => dispatch({ type: "next" } as HappyFamiliesAction)}>Next</button>
      </>}
    </div>
  );
}
