import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SwordSliceState, SwordSliceAction, SwordSliceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SwordSlice({ state, dispatch, onGameOver }: GameProps<SwordSliceState, SwordSliceSettings>): JSX.Element {
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
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SwordSliceAction), 1000);
    spawnRef.current = setInterval(() => dispatch({ type: "spawn" } as SwordSliceAction), 1500);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") {
    return <div className="slice-wrap"><h2>Time Up!</h2><p>Score: <strong>{state.score}</strong></p><p>Sliced: {state.sliced} | Misses: {state.misses}</p></div>;
  }

  return (
    <div className="slice-wrap">
      <div className="slice-header"><span>{state.timeLeft}s</span><span>Score: {state.score}</span><span>Sliced: {state.sliced}</span></div>
      <div className="slice-arena" onClick={() => dispatch({ type: "miss" } as SwordSliceAction)}>
        {state.targets.map(t => (
          <button key={t.id} className="slice-target"
            style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.size}px`, height: `${t.size}px`, fontSize: `${t.size * 0.5}px` }}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: "slice", id: t.id } as SwordSliceAction); }}>
            {t.points === 20 ? "⭐" : "🎯"}
          </button>
        ))}
      </div>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>Click targets! Clicking empty area = -2 pts</p>
    </div>
  );
}
