import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SwitchState, SwitchAction, SwitchSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function SwitchGame({ state, dispatch, onGameOver }: GameProps<SwitchState, SwitchSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="switch-wrap sw-shed"><div className="switch-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="switch-final">{state.score} pts</div></div></div>;
  return (
    <div className="switch-wrap sw-shed">
      <div className="switch-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="switch-score">{state.score} pts</div>
      <div className="switch-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button data-testid="hint-target-switch-primary" className="switch-btn" onClick={() => dispatch({ type: "play" } as SwitchAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="switch-result">{state.result}</div>
        <button data-testid="hint-target-switch-next" className="switch-btn alt" onClick={() => dispatch({ type: "next" } as SwitchAction)}>Next</button>
      </>}
    </div>
  );
}
