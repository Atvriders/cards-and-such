import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCastleState, DiceCastleAction, DiceCastleSettings } from "./state.js";
import { isTerminal, TURNS } from "./state.js";
import "./Game.css";

export function DiceCastleGame({ state, dispatch, onGameOver }: GameProps<DiceCastleState, DiceCastleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="dc-wrap">
        <div className="dc-done">
          <h2>Castle Complete</h2>
          <div className="dc-final">{state.score} pts</div>
          <div className="dc-log">Walls {state.built.walls}, Tower {state.built.tower ? "x" : "-"}, Keep {state.built.keep ? "x" : "-"}, Throne {state.built.throne ? "x" : "-"}</div>
        </div>
      </div>
    );
  }

  const can = (w: number, s: number, g: number) => state.res.wood >= w && state.res.stone >= s && state.res.gold >= g;

  return (
    <div className="dc-wrap">
      <div className="dc-banner">Turn {state.turn} / {TURNS} · Score {state.score}</div>
      <div className="dc-stats">
        <div className="dc-stat"><div className="dc-stat-label">Wood</div><div className="dc-stat-val">{state.res.wood}</div></div>
        <div className="dc-stat"><div className="dc-stat-label">Stone</div><div className="dc-stat-val">{state.res.stone}</div></div>
        <div className="dc-stat"><div className="dc-stat-label">Gold</div><div className="dc-stat-val">{state.res.gold}</div></div>
      </div>
      <div className="dc-castle">
        <div className="dc-row-art">
          {state.built.throne && <div className="dc-piece throne">^</div>}
          {state.built.keep && <div className="dc-piece keep">||</div>}
          {state.built.tower && <div className="dc-piece tower">|</div>}
          <div className="dc-piece walls">{"=".repeat(Math.max(1, state.built.walls + 1))}</div>
        </div>
      </div>
      {state.rolls && (
        <div className="dc-row">
          {state.rolls.map((r, i) => <div key={i} className="dc-die">{r}</div>)}
        </div>
      )}
      <div className="dc-log">{state.log || "Roll three dice — 1-2 wood, 3-5 stone, 6 gold."}</div>
      {state.phase === "roll" && (
        <button data-testid="hint-target-dice-castle-roll" className="dc-btn" onClick={() => dispatch({ type: "roll" } as DiceCastleAction)}>Gather</button>
      )}
      {state.phase === "build" && (
        <div className="dc-actions">
          <button className="dc-btn b" disabled={!can(1, 2, 0)} onClick={() => dispatch({ type: "build", what: "wall" } as DiceCastleAction)}>Wall (1W 2S, +6)</button>
          <button className="dc-btn b" disabled={!can(0, 4, 1) || state.built.tower} onClick={() => dispatch({ type: "build", what: "tower" } as DiceCastleAction)}>Tower (4S 1G, +18)</button>
          <button className="dc-btn b" disabled={!can(3, 4, 2) || state.built.keep} onClick={() => dispatch({ type: "build", what: "keep" } as DiceCastleAction)}>Keep (3W 4S 2G, +32)</button>
          <button className="dc-btn b" disabled={!can(0, 0, 6) || state.built.throne} onClick={() => dispatch({ type: "build", what: "throne" } as DiceCastleAction)}>Throne (6G, +50)</button>
          <button className="dc-btn alt" onClick={() => dispatch({ type: "skip" } as DiceCastleAction)}>Skip</button>
        </div>
      )}
    </div>
  );
}
