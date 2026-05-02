import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceSpaceshipState, DiceSpaceshipAction, DiceSpaceshipSettings } from "./state.js";
import { isTerminal, TRACK_LENGTH, STARTING_FUEL, STARTING_HULL } from "./state.js";
import "./Game.css";

export function DiceSpaceshipGame({ state, dispatch, onGameOver }: GameProps<DiceSpaceshipState, DiceSpaceshipSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    const won = state.pos >= TRACK_LENGTH;
    return (
      <div className="ss-wrap">
        <div className="ss-stars" />
        <div className="ss-done">
          <h2>{won ? "Mission Complete" : "Lost in Space"}</h2>
          <div className="ss-final">{state.score} pts</div>
          <div className="ss-log">{state.log}</div>
        </div>
      </div>
    );
  }

  const pct = (state.pos / TRACK_LENGTH) * 100;
  return (
    <div className="ss-wrap">
      <div className="ss-stars" />
      <div className="ss-banner">Sector {state.pos} / {TRACK_LENGTH}</div>
      <div className="ss-stats">
        <div className="ss-stat"><div className="ss-stat-label">Fuel</div><div className="ss-stat-val">{state.fuel} / {STARTING_FUEL}</div></div>
        <div className="ss-stat"><div className="ss-stat-label">Hull</div><div className="ss-stat-val">{state.hull} / {STARTING_HULL}</div></div>
        <div className="ss-stat"><div className="ss-stat-label">Score</div><div className="ss-stat-val">{state.score}</div></div>
      </div>
      <div className="ss-track">
        <div className="ss-track-fill" style={{ width: pct + "%" }} />
        <div className="ss-ship" style={{ left: `calc(${pct}% - 12px)` }}>{">>"}</div>
        <div className="ss-track-end">*</div>
      </div>

      {state.rolls && (
        <div className="ss-row">
          <div className="ss-die">{state.rolls[0]}</div>
          <div className="ss-die">{state.rolls[1]}</div>
          {state.hazardHit && <div className="ss-haz">!</div>}
        </div>
      )}
      <div className="ss-log">{state.log || "Choose your maneuver: thrust burns fuel, drift saves it, scan avoids hazards."}</div>

      {state.phase === "choose" && (
        <div className="ss-actions">
          <button className="ss-btn thrust" disabled={state.fuel <= 0} data-testid="hint-target-dice-spaceship-roll" onClick={() => dispatch({ type: "act", choice: "thrust" } as DiceSpaceshipAction)}>Thrust (sum)</button>
          <button className="ss-btn drift" onClick={() => dispatch({ type: "act", choice: "drift" } as DiceSpaceshipAction)}>Drift (min)</button>
          <button className="ss-btn scan" onClick={() => dispatch({ type: "act", choice: "scan" } as DiceSpaceshipAction)}>Scan (max, safe)</button>
        </div>
      )}
      {state.phase === "result" && (
        <button className="ss-btn next" data-testid="hint-target-dice-spaceship-next" onClick={() => dispatch({ type: "next" } as DiceSpaceshipAction)}>Continue</button>
      )}
    </div>
  );
}
