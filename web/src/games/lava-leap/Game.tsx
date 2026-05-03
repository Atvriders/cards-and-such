import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LavaLeapState, LavaLeapAction, LavaLeapSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LavaLeap({ state, dispatch, onGameOver }: GameProps<LavaLeapState, LavaLeapSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "charging") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as LavaLeapAction), 60);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="ll-wrap"><div className="ll-done"><h2>All Leaps!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#e67e22" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="ll-wrap">
      <div className="ll-header"><span>Leap {state.leaps + 1} / {state.maxLeaps}</span><span className="ll-score">{state.score} pts</span></div>
      <div className="ll-bar">
        <div className="ll-gap" style={{ left: `${state.gapSize}%`, width: `${Math.min(25, 100 - state.gapSize)}%` }} />
        <div className="ll-power" style={{ width: `${state.power}%` }} />
      </div>
      <p className="ll-hint">Jump when power fills to the orange zone (gap: {state.gapSize}–{state.gapSize + 25})</p>
      {state.phase === "result" && <div className={`ll-feedback ${state.lastPoints >= 100 ? "great" : state.lastPoints > 0 ? "ok" : "lava"}`}>{state.lastPoints >= 100 ? `Perfect! +100` : state.lastPoints > 0 ? `Cleared! +${state.lastPoints}` : "Into the lava!"}</div>}
      {state.phase === "charging" && <button data-testid="hint-target-lava-leap-action" className="ll-btn" onClick={() => dispatch({ type: "jump" } as LavaLeapAction)}>JUMP!</button>}
      {state.phase === "result" && <button className="ll-btn next" onClick={() => dispatch({ type: "next" } as LavaLeapAction)}>Next Leap</button>}
    </div>
  );
}
