import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WhaleWaveState, WhaleWaveAction, WhaleWaveSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function WhaleWaveGame({ state, dispatch, onGameOver }: GameProps<WhaleWaveState, WhaleWaveSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as WhaleWaveAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="ww-wrap"><div className="ww-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="ww-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="ww-wrap">
      <div className="ww-header">
        <span className="ww-info">Caught: {state.popped}</span>
        <span className="ww-timer">{state.ticksRemaining}s</span>
        <span className="ww-score">{state.score} pts</span>
      </div>
      <div className="ww-board">
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="ww-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background:"transparent", border:"none" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as WhaleWaveAction)}
              aria-label="whale-wave">🐳</button>
          );
        })}
      </div>
    </div>
  );
}
