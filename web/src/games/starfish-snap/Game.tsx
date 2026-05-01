import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StarfishSnapState, StarfishSnapAction, StarfishSnapSettings } from "./state.js";
import { isTerminal, LANES } from "./state.js";
import "./Game.css";

export function StarfishSnapGame({ state, dispatch, onGameOver }: GameProps<StarfishSnapState, StarfishSnapSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as StarfishSnapAction), 750);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="sfs-wrap"><div className="sfs-done"><h2>Time's Up!</h2><div>Caught: {state.popped} / Missed: {state.missed}</div><div className="sfs-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="sfs-wrap">
      <div className="sfs-header">
        <span className="sfs-info">Caught: {state.popped}</span>
        <span className="sfs-timer">{state.ticksRemaining}s</span>
        <span className="sfs-score">{state.score} pts</span>
      </div>
      <div className="sfs-board" style={{ background: "linear-gradient(180deg,#fef3c7,#1e40af)" }}>
        {state.critters.map(p => {
          const x = (p.lane + 0.5) / LANES * 100;
          const y = 20 + ((p.ticksLeft * 23) % 70);
          return (
            <button key={p.id}
              className="sfs-target"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              onClick={() => dispatch({ type:"pop", id:p.id } as StarfishSnapAction)}
              aria-label="starfish-snap">⭐</button>
          );
        })}
      </div>
    </div>
  );
}
