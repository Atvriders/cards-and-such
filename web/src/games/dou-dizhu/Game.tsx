import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DouDizhuState, DouDizhuAction, DouDizhuSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function DouDizhuGame({ state, dispatch, onGameOver }: GameProps<DouDizhuState, DouDizhuSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dou-dizhu-wrap ddz-shed"><div className="dou-dizhu-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="dou-dizhu-final">{state.score} pts</div></div></div>;
  return (
    <div className="dou-dizhu-wrap ddz-shed">
      <div className="dou-dizhu-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="dou-dizhu-score pulse">{state.score} pts</div>
      <div className="dou-dizhu-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button data-testid="hint-target-dou-dizhu-primary" className="dou-dizhu-btn" onClick={() => dispatch({ type: "play" } as DouDizhuAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="dou-dizhu-result">{state.result}</div>
        <button data-testid="hint-target-dou-dizhu-next" className="dou-dizhu-btn alt" onClick={() => dispatch({ type: "next" } as DouDizhuAction)}>Next</button>
      </>}
    </div>
  );
}
