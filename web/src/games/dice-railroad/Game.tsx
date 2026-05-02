import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRailroadState, DiceRailroadAction, DiceRailroadSettings } from "./state.js";
import { isTerminal, TARGET, MAX_TURNS } from "./state.js";
import "./Game.css";

export function DiceRailroadGame({ state, dispatch, onGameOver }: GameProps<DiceRailroadState, DiceRailroadSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="rr-wrap">
        <div className="rr-done">
          <h2>{state.track >= TARGET ? "Line Complete" : "End of the Line"}</h2>
          <div className="rr-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const pct = (state.track / TARGET) * 100;
  return (
    <div className="rr-wrap">
      <div className="rr-banner">Turn {state.turn} / {MAX_TURNS} · Track {state.track} / {TARGET} · Score {state.score}</div>
      <div className="rr-track">
        <div className="rr-track-fill" style={{ width: pct + "%" }} />
        <div className="rr-train" style={{ left: `calc(${pct}% - 16px)` }}>{">>"}</div>
      </div>
      <div className="rr-ties">{"|".repeat(Math.min(state.track, 30))}</div>
      {state.rolls && (
        <div className="rr-row">
          <div className={`rr-die${state.lastDouble ? " hot" : ""}`}>{state.rolls[0]}</div>
          <div className={`rr-die${state.lastDouble ? " hot" : ""}`}>{state.rolls[1]}</div>
        </div>
      )}
      <div className="rr-log">{state.log || "Roll 2 dice. Doubles double the track and add bonus."}</div>
      {state.phase === "lay" && (
        <button data-testid="hint-target-dice-railroad-roll" className="rr-btn" onClick={() => dispatch({ type: "lay" } as DiceRailroadAction)}>Lay Track</button>
      )}
      {state.phase === "result" && (
        <button className="rr-btn alt" onClick={() => dispatch({ type: "next" } as DiceRailroadAction)}>Continue</button>
      )}
    </div>
  );
}
