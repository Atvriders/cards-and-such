import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClamClapState, ClamClapAction, ClamClapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function ClamClapGame({ state, dispatch, onGameOver }: GameProps<ClamClapState, ClamClapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ClamClapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="clc-wrap"><div className="clc-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="clc-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="clc-wrap">
      <div className="clc-header">
        <span className="clc-info">Caught: {state.popped}</span>
        <span className="clc-timer">{state.ticksRemaining}s</span>
        <span className="clc-score">{state.score} pts</span>
      </div>
      <div className="clc-board" style={{ background: "linear-gradient(180deg,#fce7f3,#075985)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="clc-target" data-testid="hint-target-clam-clap-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as ClamClapAction)}
              aria-label="clam-clap"
              data-tooltip="Tap to score in Clam Clap">🦪</button>
          );
        })}
      </div>
    </div>
  );
}
