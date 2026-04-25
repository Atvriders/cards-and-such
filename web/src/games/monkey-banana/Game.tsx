import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MonkeyBananaState, MonkeyBananaAction, MonkeyBananaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MonkeyBanana({ state, dispatch, onGameOver }: GameProps<MonkeyBananaState, MonkeyBananaSettings>): JSX.Element {
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
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MonkeyBananaAction), 600);
    spawnRef.current = setInterval(() => dispatch({ type: "spawn" } as MonkeyBananaAction), 2000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") {
    return <div className="banana-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p><p>Caught: {state.caught} | Missed: {state.missed}</p></div>;
  }

  const hearts = Array.from({ length: 3 }, (_, i) => i < state.lives ? "❤️" : "🖤");

  return (
    <div className="banana-wrap">
      <div className="banana-header"><span>{hearts.join("")}</span><span>{state.timeLeft}s</span><span>{state.score} pts</span></div>
      <div className="banana-arena">
        {state.bananas.map(b => (
          <button key={b.id} className="banana-btn"
            style={{ left: `${b.x}%`, top: `${Math.min(b.y, 90)}%` }}
            onClick={() => dispatch({ type: "catch", id: b.id } as MonkeyBananaAction)}>
            {b.points >= 20 ? "🍌🍌" : "🍌"}
          </button>
        ))}
      </div>
      <p style={{ color: "#555", fontSize: "0.85rem" }}>Catch bananas before they fall! Double banana = 20 pts.</p>
    </div>
  );
}
