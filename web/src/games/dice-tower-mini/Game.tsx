import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceTowerMiniState, DiceTowerMiniAction, DiceTowerMiniSettings } from "./state.js";
import { isTerminal, FLOORS, targetFor } from "./state.js";
import "./Game.css";

export function DiceTowerMiniGame({ state, dispatch, onGameOver }: GameProps<DiceTowerMiniState, DiceTowerMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="tw-wrap">
        <div className="tw-done">
          <h2>{state.floor >= FLOORS && state.lastSuccess ? "Pinnacle Reached" : "Tower Falls"}</h2>
          <div className="tw-final">{state.score} pts</div>
          <div className="tw-log">{state.log}</div>
        </div>
      </div>
    );
  }

  const target = targetFor(state.floor);

  const floors: JSX.Element[] = [];
  for (let f = FLOORS; f >= 1; f--) {
    floors.push(<div key={f} className={`tw-floor${f === state.floor ? " on" : ""}${f < state.floor ? " done" : ""}`}>{f}</div>);
  }

  return (
    <div className="tw-wrap">
      <div className="tw-banner">Floor {state.floor} of {FLOORS} · Score {state.score}</div>
      <div className="tw-target">Roll ≥ {target} (sum)</div>
      <div className="tw-tower">{floors}</div>
      {state.rolls && (
        <div className="tw-row">
          <div className="tw-die">{state.rolls[0]}</div>
          <div className="tw-die">{state.rolls[1]}</div>
          <div className={`tw-tag ${state.lastSuccess ? "ok" : "bad"}`}>{state.lastSuccess ? "OK" : "MISS"}</div>
        </div>
      )}
      <div className="tw-log">{state.log || "Roll two dice. Need at least the target to climb."}</div>
      {state.phase === "roll" && (
        <button className="tw-btn" onClick={() => dispatch({ type: "climb" } as DiceTowerMiniAction)}>Climb (Attempt {state.attempts + 1} / 3)</button>
      )}
      {state.phase === "result" && (
        <button className="tw-btn alt" onClick={() => dispatch({ type: "next" } as DiceTowerMiniAction)}>Continue</button>
      )}
    </div>
  );
}
