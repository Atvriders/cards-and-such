import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ArrowHitState, ArrowHitAction, ArrowHitSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ArrowHit({ state, dispatch, onGameOver }: GameProps<ArrowHitState, ArrowHitSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "aiming") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ArrowHitAction), 50);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="ah-wrap"><div className="ah-done">
      <h2>Arrows Used!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#c0392b" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="ah-wrap">
      <div className="ah-header">
        <span>Arrow {state.arrows + 1} / {state.maxArrows}</span>
        <span className="ah-score">{state.score} pts</span>
      </div>
      <div className="ah-track">
        <div className="ah-zone bull" style={{ left: "45%", width: "10%" }} />
        <div className="ah-zone hit" style={{ left: "30%", width: "40%" }} />
        <div className="ah-indicator" style={{ left: `${state.targetPos}%` }} />
      </div>
      <div className="ah-labels"><span>Miss</span><span>Hit</span><span>Bull!</span><span>Hit</span><span>Miss</span></div>
      {state.phase === "shot" && (
        <div className={`ah-feedback ${state.lastHit}`}>{state.lastHit === "bull" ? `Bullseye! +${state.lastPoints}` : state.lastHit === "hit" ? `Hit! +${state.lastPoints}` : "Miss!"}</div>
      )}
      <button className="ah-btn" onClick={() => {
        if (state.phase === "aiming") dispatch({ type: "shoot" } as ArrowHitAction);
        else dispatch({ type: "tick" } as ArrowHitAction); // restart via re-render
      }}>
        {state.phase === "aiming" ? "SHOOT" : "Next Arrow"}
      </button>
    </div>
  );
}
