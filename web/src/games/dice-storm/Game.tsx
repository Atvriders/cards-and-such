import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStormState, DiceStormAction, DiceStormSettings } from "./state.js";
import { isTerminal, MAX_ROLLS, TARGET } from "./state.js";
import "./Game.css";

export function DiceStormGame({ state, dispatch, onGameOver }: GameProps<DiceStormState, DiceStormSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="st-wrap">
        <div className="st-done">
          <h2>Storm Passes</h2>
          <div className="st-final">{state.score} pts</div>
          <div className="st-log">{state.log}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="st-wrap">
      <div className="st-flash" />
      <div className="st-banner">Roll {state.rollsTaken} / {MAX_ROLLS} · Target {TARGET}</div>
      <div className="st-pool">{state.pool}</div>
      {state.rolls.length > 0 && (
        <div className="st-row">
          {state.rolls.map((r, i) => <div key={i} className={`st-die${state.rolls[0] === 1 && state.rolls[1] === 1 ? " bust" : ""}`}>{r}</div>)}
        </div>
      )}
      <div className="st-log">{state.log || "Risk a roll or bank your pool. Snake-eyes wipes you."}</div>
      <div className="st-actions">
        <button className="st-btn roll" onClick={() => dispatch({ type: "roll" } as DiceStormAction)}>Roll</button>
        <button className="st-btn bank" disabled={state.pool === 0} onClick={() => dispatch({ type: "bank" } as DiceStormAction)}>Bank</button>
      </div>
    </div>
  );
}
