import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardStackStressState, CardStackStressAction, CardStackStressSettings } from "./state.js";
import { isTerminal, cardName, isRed, STACK_TARGET, ATTEMPTS } from "./state.js";
import "./Game.css";

export function CardStackStressGame({ state, dispatch, onGameOver }: GameProps<CardStackStressState, CardStackStressSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cs-wrap"><div className="cs-done"><h2>Done!</h2><div>Best stack: {state.bestStack} / {STACK_TARGET}</div><div className="cs-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cs-wrap">
      <div className="cs-info">Attempt {state.attempt} / {ATTEMPTS}</div>
      <div className="cs-info">Stack: {state.stack.length} / {STACK_TARGET} — Best: {state.bestStack}</div>
      <div className="cs-row">
        {state.stack.map((c, i) => <div key={i} className={`cs-card sm ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
      </div>
      {state.current !== null && state.phase === "playing" && (
        <div className={`cs-card big ${isRed(state.current) ? "red" : "black"}`}>{cardName(state.current)}</div>
      )}
      {state.phase === "playing" && state.current === null && (
        <button data-testid="hint-target-card-stack-stress-draw" className="cs-btn alt" onClick={() => dispatch({ type: "draw" } as CardStackStressAction)}>Draw</button>
      )}
      {state.phase === "playing" && state.current !== null && (
        <div className="cs-row">
          <button data-testid="hint-target-card-stack-stress-stack" className="cs-btn" onClick={() => dispatch({ type: "stack" } as CardStackStressAction)}>Stack</button>
          <button className="cs-btn alt" onClick={() => dispatch({ type: "pass" } as CardStackStressAction)}>Pass</button>
        </div>
      )}
      {state.phase === "lost" && (
        <>
          <div className="cs-feedback no">Wrong! Stack reset.</div>
          <button className="cs-btn alt" data-testid="hint-target-card-stack-stress-next" onClick={() => dispatch({ type: "next" } as CardStackStressAction)}>Try Again</button>
        </>
      )}
      {state.phase === "won" && (
        <>
          <div className="cs-feedback ok">Stack complete! Bonus +100</div>
          <button className="cs-btn alt" onClick={() => dispatch({ type: "next" } as CardStackStressAction)}>Finish</button>
        </>
      )}
    </div>
  );
}
