import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SnowballThrowState, SnowballThrowAction, SnowballThrowSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SnowballThrow({ state, dispatch, onGameOver }: GameProps<SnowballThrowState, SnowballThrowSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "throwing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SnowballThrowAction), 60);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="st-wrap"><div className="st-done"><h2>Game Over!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#3498db" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="st-wrap">
      <div className="st-header"><span>Throw {state.throws + 1} / {state.maxThrows}</span><span className="st-score">{state.score} pts</span></div>
      <div className="st-field" onClick={e => {
        if (state.phase !== "throwing") return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        dispatch({ type: "throw", x, y } as SnowballThrowAction);
      }}>
        {state.phase === "throwing" && <div className="st-target" style={{ left: `${state.targetX}%`, top: `${state.targetY}%` }}>❄</div>}
        {state.phase === "result" && state.lastHit && <div className="st-hit" style={{ left: `${state.targetX}%`, top: `${state.targetY}%` }}>💥</div>}
      </div>
      {state.phase === "result" && (
        <div className={`st-feedback ${state.lastHit ? "hit" : state.lastPoints > 0 ? "close" : "miss"}`}>
          {state.lastHit ? `Hit! +${state.lastPoints}` : state.lastPoints > 0 ? `Near miss! +${state.lastPoints}` : "Missed!"}
        </div>
      )}
      {state.phase === "result" && <button className="st-btn" onClick={() => dispatch({ type: "next" } as SnowballThrowAction)}>Next Throw</button>}
      {state.phase === "throwing" && <p className="st-hint">Click the moving snowflake target!</p>}
    </div>
  );
}
