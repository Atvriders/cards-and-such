import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FishingCastState, FishingCastAction, FishingCastSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FishingCast({ state, dispatch, onGameOver }: GameProps<FishingCastState, FishingCastSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "casting") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as FishingCastAction), 60);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "gameover") return (
    <div className="fc-wrap"><div className="fc-done"><h2>All Casts!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#2980b9" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="fc-wrap">
      <div className="fc-header"><span>Cast {state.casts + 1} / {state.maxCasts}</span><span className="fc-score">{state.score} pts</span></div>
      <div className="fc-bar">
        <div className="fc-zone" style={{ left: `${state.targetMin}%`, width: `${state.targetMax - state.targetMin}%` }} />
        <div className="fc-power" style={{ width: `${state.power}%` }} />
        <div className="fc-marker" style={{ left: `${state.power}%` }} />
      </div>
      <div className="fc-labels"><span>0</span><span>Target zone ({state.targetMin}–{state.targetMax})</span><span>100</span></div>
      {state.phase === "result" && <div className={`fc-feedback ${state.lastPoints >= 100 ? "great" : state.lastPoints > 0 ? "ok" : "miss"}`}>{state.lastPoints >= 100 ? `In the zone! +${state.lastPoints}` : state.lastPoints > 0 ? `Close! +${state.lastPoints}` : "Too far!"}</div>}
      {state.phase === "casting" && <button data-testid="hint-target-fishing-cast-action" className="fc-btn" onClick={() => dispatch({ type: "release" } as FishingCastAction)}>Cast!</button>}
      {state.phase === "result" && <button className="fc-btn next" onClick={() => dispatch({ type: "next" } as FishingCastAction)}>Next Cast</button>}
    </div>
  );
}
