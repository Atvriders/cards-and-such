import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FireflyFlashState, FireflyFlashAction, FireflyFlashSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function FireflyFlashGame({ state, dispatch, onGameOver }: GameProps<FireflyFlashState, FireflyFlashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as FireflyFlashAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="frf-wrap"><div className="frf-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="frf-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="frf-wrap">
      <div className="frf-header">
        <span className="frf-info">Caught: {state.popped}</span>
        <span className="frf-timer">{state.ticksRemaining}s</span>
        <span className="frf-score">{state.score} pts</span>
      </div>
      <div className="frf-board" style={{ background: "linear-gradient(180deg,#1e1b4b,#020617)" }}>
        {state.bugs.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="frf-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as FireflyFlashAction)}
              aria-label="firefly-flash">✨</button>
          );
        })}
      </div>
    </div>
  );
}
