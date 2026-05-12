import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BalloonBurstState, BalloonBurstAction, BalloonBurstSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function BalloonBurst({ state, dispatch, onGameOver }: GameProps<BalloonBurstState, BalloonBurstSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "inflating") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BalloonBurstAction), 80);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="bb-wrap"><div className="bb-done bounce-in">
      <h2>All Balloons!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#e74c3c" }}>{state.score} pts</p>
    </div></div>
  );

  const sz = Math.max(30, state.size);
  const color = state.size >= 70 ? "#c0392b" : state.size >= 40 ? "#f39c12" : "#3498db";

  return (
    <div className="bb-wrap fade-in">
      <div className="bb-header">
        <span>Balloon {state.balloons + 1} / {state.maxBalloons}</span>
        <span className="bb-score pulse">{state.score} pts</span>
      </div>
      <div className="bb-stage">
        {state.phase === "inflating" && (
          <div className="bb-balloon" style={{ width: `${sz}px`, height: `${sz}px`, background: color }}
            onClick={() => dispatch({ type: "pop" } as BalloonBurstAction)} />
        )}
        {state.phase === "popped" && <div className="bb-result pop">Pop! +{state.lastPoints}</div>}
        {state.phase === "burst" && <div className="bb-result burst">Burst! 0 pts</div>}
      </div>
      <p className="bb-hint">{state.phase === "inflating" ? "Click the balloon to pop it!" : "Press Next"}</p>
      {(state.phase === "popped" || state.phase === "burst") && (
        <button data-testid="hint-target-balloon-burst-action" className="bb-btn" onClick={() => dispatch({ type: "next" } as BalloonBurstAction)}>Next Balloon</button>
      )}
      {state.phase === "inflating" && (
        <button className="bb-btn pop" onClick={() => dispatch({ type: "pop" } as BalloonBurstAction)}>POP!</button>
      )}
    </div>
  );
}
