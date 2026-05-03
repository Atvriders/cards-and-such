import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GemGrabState, GemGrabAction, GemGrabSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function GemGrab({ state, dispatch, onGameOver }: GameProps<GemGrabState, GemGrabSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") {
      if (tickRef.current) clearInterval(tickRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
      return;
    }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as GemGrabAction), 600);
    spawnRef.current = setInterval(() => dispatch({ type: "spawn" } as GemGrabAction), 2000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") {
    return <div className="banana-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p><p>Caught: {state.caught} | Missed: {state.missed}</p></div>;
  }
  const hearts = Array.from({ length: 3 }, (_, i) => i < state.lives ? "❤️" : "🖤");
  return (
    <div className="banana-wrap">
      <div className="banana-header"><span>{hearts.join("")}</span><span>{state.timeLeft}s</span><span>{state.score} pts</span></div>
      <div className="banana-arena" style={{ background: "linear-gradient(180deg,#6c5ce7,#a29bfe)" }}>
        {state.items.map(item => (
          <button data-testid="hint-target-gem-grab-action" key={item.id} className="banana-btn"
            style={{ left: `${item.x}%`, top: `${Math.min(item.y, 90)}%` }}
            onClick={() => dispatch({ type: "catch", id: item.id } as GemGrabAction)}>
            {item.points >= 20 ? "💎💎" : "💎"}
          </button>
        ))}
      </div>
      <p style={{ fontSize: "0.85rem", color: "#555" }}>Catch them before they fall!</p>
    </div>
  );
}
