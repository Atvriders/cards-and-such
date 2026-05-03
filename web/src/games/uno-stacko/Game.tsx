import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UnoStackoState, UnoStackoAction, UnoStackoSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function UnoStackoGame({ state, dispatch, onGameOver }: GameProps<UnoStackoState, UnoStackoSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="uno-stacko-wrap us-shed"><div className="uno-stacko-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="uno-stacko-final">{state.score} pts</div></div></div>;
  return (
    <div className="uno-stacko-wrap us-shed">
      <div className="uno-stacko-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="uno-stacko-score">{state.score} pts</div>
      <div className="uno-stacko-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button data-testid="hint-target-uno-stacko-primary" className="uno-stacko-btn" onClick={() => dispatch({ type: "play" } as UnoStackoAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="uno-stacko-result">{state.result}</div>
        <button data-testid="hint-target-uno-stacko-next" className="uno-stacko-btn alt" onClick={() => dispatch({ type: "next" } as UnoStackoAction)}>Next</button>
      </>}
    </div>
  );
}
