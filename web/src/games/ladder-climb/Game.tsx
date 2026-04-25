import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LadderClimbState, LadderClimbAction, LadderClimbSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LadderClimb({ state, dispatch, onGameOver }: GameProps<LadderClimbState, LadderClimbSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "climbing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as LadderClimbAction), 60);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="lc-wrap"><div className="lc-done"><h2>Summit!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#8e44ad" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="lc-wrap">
      <div className="lc-header"><span>Rung {state.rung} / {state.maxRungs}</span><span className="lc-score">{state.score} pts</span></div>
      <div className="lc-bar">
        <div className="lc-grip-zone" />
        <div className="lc-marker" style={{ left: `${state.gripPos}%` }} />
      </div>
      <p className="lc-hint">Grip zone: center 40–60%</p>
      {state.phase === "result" && <div className={`lc-feedback ${state.lastSuccess ? "ok" : "fall"}`}>{state.lastSuccess ? `Grabbed! +${20 * (state.rung - 1)}` : "Slipped! -1 rung"}</div>}
      {state.phase === "climbing" && <button className="lc-btn" onClick={() => dispatch({ type: "grab" } as LadderClimbAction)}>GRAB</button>}
      {state.phase === "result" && <button className="lc-btn next" onClick={() => dispatch({ type: "next" } as LadderClimbAction)}>Next</button>}
    </div>
  );
}
