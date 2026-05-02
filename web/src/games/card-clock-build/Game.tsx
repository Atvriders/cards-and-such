import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardClockBuildState, CardClockBuildAction, CardClockBuildSettings } from "./state.js";
import { isTerminal, cardName, isRed } from "./state.js";
import "./Game.css";
export function CardClockBuildGame({ state, dispatch, onGameOver }: GameProps<CardClockBuildState, CardClockBuildSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Card-Clock Build — Cards left: {state.deck.length - state.pos}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, width:"100%" }}>
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(slot => {
          const c = state.clock[slot] ?? null;
          return <button key={slot} className="dm-cell" data-testid={`hint-target-card-clock-build-slot-${slot}`} disabled={c !== null || state.current === null} onClick={() => dispatch({ type:"place", slot } as CardClockBuildAction)}>
            <div style={{ fontSize:"0.75rem", color:"#888" }}>{slot}</div>
            <div style={{ fontWeight:900, color: c !== null && isRed(c) ? "#c0392b" : "#2c3e50" }}>{c !== null ? cardName(c) : "—"}</div>
          </button>;
        })}
      </div>
      {state.current === null ? <button className="dm-btn" data-testid="hint-target-card-clock-build-draw" onClick={() => dispatch({ type:"draw" } as CardClockBuildAction)}>Draw next card</button>
        : <>
          <div className="dm-result">Card: <span style={{ fontWeight:900, color: isRed(state.current) ? "#c0392b" : "#2c3e50" }}>{cardName(state.current)}</span> — pick a slot, or Skip</div>
          <button className="dm-btn danger" data-testid="hint-target-card-clock-build-skip" onClick={() => dispatch({ type:"skip" } as CardClockBuildAction)}>Skip</button>
        </>}
    </div>
  );
}
