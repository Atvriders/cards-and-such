import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Golf18State, Golf18Action, Golf18Settings, Club } from "./state.js";
import { isTerminal, CLUB_DISTANCE } from "./state.js";
import "./Game.css";

const CLUBS: Club[] = ["driver", "iron", "wedge", "putter"];

export function Golf18({ state, dispatch, onGameOver }: GameProps<Golf18State, Golf18Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const totalPar = state.holes.reduce((s, h) => s + h.par, 0);
  const vspar = state.totalStrokes - state.holes.filter((h) => h.completed).reduce((s, h) => s + h.par, 0);
  const vsLabel = vspar > 0 ? `+${vspar}` : vspar < 0 ? `${vspar}` : "E";

  return (
    <div className="g18-game">
      <div className="g18-title">Golf — 18 Holes</div>

      <div className="g18-meta">
        Hole {state.currentHole + 1}/18 | Par {state.holes[state.currentHole]?.par} | Score: {vsLabel}
      </div>

      <div className="g18-meta">{state.lastResult}</div>

      <div className="g18-info">
        <span>Dist: {state.distanceToPin.toFixed(0)} yds</span>
        <span>Terrain: {state.terrain}</span>
        <span>Stroke {state.strokesThisHole + 1}</span>
      </div>

      {state.phase === "select-club" && (
        <div className="g18-clubs">
          <div className="g18-clubs-label">Select Club:</div>
          {CLUBS.map((c) => (
            <button key={c} className={`g18-club-btn ${state.club === c ? "active" : ""}`}
              onClick={() => dispatch({ type: "select-club", club: c })}>
              {c.charAt(0).toUpperCase() + c.slice(1)}<br />
              <span className="g18-club-range">~{CLUB_DISTANCE[c]} yds</span>
            </button>
          ))}
        </div>
      )}

      {state.phase === "aim" && (
        <div className="g18-aim">
          <div className="g18-club-sel">Club: {state.club} (~{CLUB_DISTANCE[state.club]} yds max)</div>
          <label>
            Angle (center=ideal): {Math.round((state.angle - 0.5) * 200)}%
            <input type="range" min={0} max={1} step={0.01} value={state.angle}
              onChange={(e) => dispatch({ type: "set-angle", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Power: {Math.round(state.power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <div className="g18-club-btns">
            <button className="g18-btn-sec" onClick={() => dispatch({ type: "next" })}>← Change Club</button>
            <button className="g18-btn" onClick={() => dispatch({ type: "swing" })}>Swing!</button>
          </div>
        </div>
      )}

      {state.phase === "result" && (
        <button className="g18-btn" onClick={() => dispatch({ type: "next" })}>Next Shot</button>
      )}
      {state.phase === "hole-done" && (
        <button className="g18-btn" onClick={() => dispatch({ type: "next" })}>
          {state.currentHole < 17 ? "Next Hole →" : "Finish!"}
        </button>
      )}

      {/* Mini scorecard */}
      <div className="g18-scorecard">
        {state.holes.map((h, i) => {
          const diff = h.strokes - h.par;
          const cls = h.completed ? (diff < 0 ? "under" : diff > 0 ? "over" : "par") : i === state.currentHole ? "current" : "pending";
          return (
            <div key={i} className={`g18-cell ${cls}`} title={`Hole ${i + 1} — Par ${h.par}`}>
              {h.completed ? h.strokes : i + 1}
            </div>
          );
        })}
      </div>

      {state.phase === "done" && (
        <div className="g18-game-over">
          Round complete!<br />
          Strokes: {state.totalStrokes} | Par: {totalPar}<br />
          {vsLabel} — {terminal?.score ?? 0} pts
        </div>
      )}
    </div>
  );
}
