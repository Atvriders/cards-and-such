import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OddDiceState, OddDiceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./OddDice.css";

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function OddDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<OddDiceState, OddDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const hasRolled = state.dice.length > 0;
  const canRoll = state.rollsLeft > 0 && !state.done;
  const canEnd = hasRolled && !state.done;

  return (
    <div className="od-game">
      <div className="od-title">Odd Dice</div>

      <div className="od-status">
        <span>Round {state.round} / {state.totalRounds}</span>
        <span className="od-total">Total: {state.totalScore}</span>
      </div>

      <div className="od-dice">
        {state.dice.length > 0
          ? state.dice.map((d, i) => (
              <div key={i} className={`od-die ${d % 2 !== 0 ? "odd" : "even"}`}>
                {DIE_FACES[d]}
              </div>
            ))
          : Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="od-die empty">?</div>
            ))
        }
      </div>

      {hasRolled && (
        <div className="od-round-score">
          Odd sum this roll: <strong>{state.roundScore}</strong>
          <span className="od-rolls-hint"> ({state.rollsLeft} roll{state.rollsLeft !== 1 ? "s" : ""} left)</span>
        </div>
      )}

      {!state.done && (
        <div className="od-buttons">
          <button className="od-roll-btn" disabled={!canRoll} onClick={() => dispatch({ type: "roll" })}>
            {state.dice.length === 0 ? "Roll Dice" : `Re-Roll All (${state.rollsLeft} left)`}
          </button>
          <button className="od-keep-btn" disabled={!canEnd} onClick={() => dispatch({ type: "endRound" })}>
            Keep Score
          </button>
        </div>
      )}

      {state.done && (
        <div className="od-game-over">
          Final Score: {terminal?.score}
        </div>
      )}
    </div>
  );
}
