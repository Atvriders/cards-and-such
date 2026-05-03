import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleOrNothingState, DoubleOrNothingAction, DoubleOrNothingSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DoubleOrNothingDice({ state, dispatch, onGameOver }: GameProps<DoubleOrNothingState, DoubleOrNothingSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isDone = state.phase === "banked" || state.phase === "bust";
  if (isDone) {
    return (
      <div className="dice-wrap">
        <h2>{state.phase === "bust" ? "Bust! Score: 0" : `Banked! Score: ${state.banked}`}</h2>
        <div className="dice-row">{state.dice.map((d, i) => <span key={i} className="die">{d}</span>)}</div>
      </div>
    );
  }

  return (
    <div className="dice-wrap">
      <div className="dice-header"><span>Round {state.round}</span><span>Score: {state.score}</span></div>
      {state.round > 0 && (
        <div>
          <div className="dice-row">{state.dice.map((d, i) => <span key={i} className={`die${state.lastDoubles ? " die-double" : ""}`}>{d}</span>)}</div>
          <p className="dice-msg">{state.lastDoubles ? `DOUBLES! Score doubled to ${state.score}` : `No doubles. Score -3 = ${state.score}`}</p>
        </div>
      )}
      <div className="dice-actions">
        <button data-testid="hint-target-double-or-nothing-dice-roll" className="dice-btn" onClick={() => dispatch({ type: "roll" } as DoubleOrNothingAction)}>Roll 2d6</button>
        {state.round > 0 && <button data-testid="hint-target-double-or-nothing-dice-bank" className="dice-btn bank" onClick={() => dispatch({ type: "bank" } as DoubleOrNothingAction)}>Bank {state.score} pts</button>}
      </div>
      <p style={{ color: "#888", fontSize: "0.85rem" }}>Roll doubles to double your score. Non-doubles cost 3 pts. Bank anytime!</p>
    </div>
  );
}
