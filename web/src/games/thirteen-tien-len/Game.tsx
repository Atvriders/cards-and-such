import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThirteenTienLenState, ThirteenTienLenAction, ThirteenTienLenSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function ThirteenTienLenGame({ state, dispatch, onGameOver }: GameProps<ThirteenTienLenState, ThirteenTienLenSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="thirteen-tien-len-wrap ttl-shed"><div className="thirteen-tien-len-done"><h2>Done!</h2><div>W: {state.wins} L: {state.losses}</div><div className="thirteen-tien-len-final">{state.score} pts</div></div></div>;
  return (
    <div className="thirteen-tien-len-wrap ttl-shed">
      <div className="thirteen-tien-len-info">Round {state.round} / {TOTAL_ROUNDS} — W{state.wins} L{state.losses}</div>
      <div className="thirteen-tien-len-score">{state.score} pts</div>
      <div className="thirteen-tien-len-info">You: {state.you} cards · CPU: {state.cpu} cards</div>
      {state.phase === "ready" && <button data-testid="hint-target-thirteen-tien-len-primary" className="thirteen-tien-len-btn" onClick={() => dispatch({ type: "play" } as ThirteenTienLenAction)}>Play Round</button>}
      {state.phase === "scored" && <>
        <div className="thirteen-tien-len-result">{state.result}</div>
        <button data-testid="hint-target-thirteen-tien-len-next" className="thirteen-tien-len-btn alt" onClick={() => dispatch({ type: "next" } as ThirteenTienLenAction)}>Next</button>
      </>}
    </div>
  );
}
