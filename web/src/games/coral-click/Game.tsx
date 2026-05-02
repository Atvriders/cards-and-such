import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoralClickState, CoralClickAction, CoralClickSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function CoralClickGame({ state, dispatch, onGameOver }: GameProps<CoralClickState, CoralClickSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CoralClickAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="crl-wrap"><div className="crl-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="crl-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="crl-wrap">
      <div className="crl-header">
        <span className="crl-info">Caught: {state.popped}</span>
        <span className="crl-timer">{state.ticksRemaining}s</span>
        <span className="crl-score">{state.score} pts</span>
      </div>
      <div className="crl-board" style={{ background: "linear-gradient(180deg,#fbcfe8,#831843)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="crl-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as CoralClickAction)}
              aria-label="coral-click"
              data-tooltip="Tap to score in Coral Click">🪸</button>
          );
        })}
      </div>
    </div>
  );
}
