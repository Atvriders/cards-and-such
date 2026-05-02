import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlueberryBurstState, BlueberryBurstAction, BlueberryBurstSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function BlueberryBurstGame({ state, dispatch, onGameOver }: GameProps<BlueberryBurstState, BlueberryBurstSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BlueberryBurstAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="blueberryburst-wrap"><div className="blueberryburst-done"><h2>Time's Up!</h2><div>Popped: {state.popped} / Missed: {state.missed}</div><div className="blueberryburst-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="blueberryburst-wrap">
      <div className="blueberryburst-header">
        <span className="blueberryburst-info">Popped: {state.popped}</span>
        <span className="blueberryburst-timer">{state.ticksRemaining}s</span>
        <span className="blueberryburst-score">{state.score} pts</span>
      </div>
      <div className="blueberryburst-board">
        {state.targets.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="blueberryburst-target" data-testid="hint-target-blueberry-burst-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", background: "transparent", border: "none" }}
              onClick={() => dispatch({ type: "pop", id: p.id } as BlueberryBurstAction)}
              aria-label="target"
              data-tooltip="Tap to score in Blueberry Burst">🫐</button>
          );
        })}
      </div>
    </div>
  );
}
