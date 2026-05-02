import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RollAndAddState, RollAndAddAction, RollAndAddSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./RollAndAdd.css";

export function RollAndAdd({
  state,
  dispatch,
  onGameOver,
}: GameProps<RollAndAddState, RollAndAddSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = !state.bust && !state.bankedThisRound && !state.over;
  const canBank = !state.bust && !state.bankedThisRound && state.running > 0 && !state.over;

  return (
    <div className="roll-add-game">
      <div className="roll-add-header">
        <span>Target: <strong>{state.target}</strong></span>
        <span>Round {state.round}/{state.maxRounds}</span>
        <span>Banked: {state.banked}</span>
      </div>

      <div className={`roll-add-total ${state.bust ? "bust" : state.running >= state.target * 0.9 ? "close" : ""}`}>
        <div className="roll-add-total-label">Running Total</div>
        <div className="roll-add-total-value">{state.running}</div>
      </div>

      <div className="roll-add-bar-container">
        <div
          className="roll-add-bar"
          style={{ width: `${Math.min(100, (state.running / state.target) * 100)}%`, background: state.bust ? "#cc2200" : "#44aa66" }}
        />
        <div className="roll-add-target-line" />
      </div>

      <div className="roll-add-dice-row">
        {state.dice.map((d, i) => (
          <Die key={i} value={d as 1|2|3|4|5|6} kept={false} />
        ))}
      </div>

      <div className="roll-add-num-dice">
        <button data-testid="hint-target-roll-and-add-removeDie" className="rna-btn-sm" onClick={() => dispatch({ type: "removeDie" } as RollAndAddAction)} disabled={state.numDice <= 1}>-</button>
        <span>{state.numDice} {state.numDice === 1 ? "die" : "dice"}</span>
        <button data-testid="hint-target-roll-and-add-addDie" className="rna-btn-sm" onClick={() => dispatch({ type: "addDie" } as RollAndAddAction)} disabled={state.numDice >= 4}>+</button>
      </div>

      <div className="roll-add-message">{state.lastMessage}</div>

      <div className="roll-add-controls">
        <button data-testid="hint-target-roll-and-add-roll"
          className="rna-btn roll"
          onClick={() => dispatch({ type: "roll" } as RollAndAddAction)}
          disabled={!canRoll}
        >
          Roll {state.numDice} {state.numDice === 1 ? "Die" : "Dice"}
        </button>
        <button data-testid="hint-target-roll-and-add-bank"
          className="rna-btn bank"
          onClick={() => dispatch({ type: "bank" } as RollAndAddAction)}
          disabled={!canBank}
        >
          Bank Score
        </button>
      </div>

      {state.bust && !state.over && (
        <button data-testid="hint-target-roll-and-add-bank" className="rna-btn" onClick={() => dispatch({ type: "bank" } as RollAndAddAction)}>
          Next Round (Bust — 0 pts)
        </button>
      )}

      {terminal && (
        <div className="roll-add-over">Game Over! Total Score: {state.banked}</div>
      )}
    </div>
  );
}
