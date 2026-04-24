import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniGolfState, MiniGolfAction, MiniGolfSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MiniGolf({ state, dispatch, onGameOver }: GameProps<MiniGolfState, MiniGolfSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const totalStrokes = state.holes.reduce((s, h) => s + h.strokes, 0);
  const holesPlayed = state.holes.filter((h) => h.completed).length;
  const vspar = totalStrokes - holesPlayed * 3;
  const vsparlabel = vspar > 0 ? `+${vspar}` : vspar < 0 ? `${vspar}` : "E";

  return (
    <div className="mg-game">
      <div className="mg-title">Mini Golf</div>

      <div className="mg-meta">
        Hole {state.currentHole + 1}/9 | Par 3 | Score: {vsparlabel} | Dist: {state.distanceToPin.toFixed(1)}
      </div>

      {/* Scorecard */}
      <div className="mg-scorecard">
        {state.holes.map((hole, i) => {
          const diff = hole.strokes - 3;
          const cls = hole.completed ? (diff < 0 ? "under" : diff > 0 ? "over" : "par") : i === state.currentHole ? "current" : "pending";
          return (
            <div key={i} className={`mg-hole-cell ${cls}`}>
              <div className="mg-hole-num">{i + 1}</div>
              <div className="mg-hole-score">{hole.completed ? hole.strokes : "—"}</div>
            </div>
          );
        })}
      </div>

      {state.phase === "aim" && (
        <div className="mg-aim">
          <div className="mg-dist-bar-wrap">
            <div className="mg-dist-bar" style={{ width: `${Math.min(100, (state.distanceToPin / 100) * 100)}%` }} />
          </div>
          <label>
            Angle (center=straight): {Math.round((state.angle - 0.5) * 200)}%
            <input type="range" min={0} max={1} step={0.01} value={state.angle}
              onChange={(e) => dispatch({ type: "set-angle", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Power: {Math.round(state.power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <div className="mg-hint">Stroke {state.strokesThisHole + 1} | Ideal power: ~{Math.round((Math.min(0.95, (state.distanceToPin / 80) * 0.7)) * 100)}%</div>
          <button className="mg-btn" onClick={() => dispatch({ type: "putt" })}>Putt!</button>
        </div>
      )}

      {state.lastResult && (
        <div className="mg-result">{state.lastResult}</div>
      )}

      {state.phase === "result" && (
        <button className="mg-btn" onClick={() => dispatch({ type: "next" })}>Next Putt</button>
      )}
      {state.phase === "hole-done" && state.currentHole < 8 && (
        <button className="mg-btn" onClick={() => dispatch({ type: "next" })}>Next Hole →</button>
      )}
      {state.phase === "hole-done" && state.currentHole === 8 && (
        <button className="mg-btn" onClick={() => dispatch({ type: "next" })}>Finish!</button>
      )}

      {state.phase === "done" && (
        <div className="mg-game-over">
          Course complete!<br />
          Total strokes: {totalStrokes} (Par 27)<br />
          {vsparlabel} — {terminal?.score ?? 0} pts
        </div>
      )}
    </div>
  );
}
