import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BalutState, BalutAction, BalutSettings, BalutCategory } from "./state.js";
import { ALL_BALUT_CATEGORIES, computeBalutScore, totalBalutScore, isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Balut.css";

const LABELS: Record<BalutCategory, string> = {
  fours: "Fours", fives: "Fives", sixes: "Sixes",
  straight: "Straight (25)", fullHouse: "Full House", choice: "Choice", balut: "Balut (5-of-kind)",
};

export function Balut({ state, dispatch, onGameOver }: GameProps<BalutState, BalutSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.rollsUsed < 3;
  const hasRolled = state.rollsUsed > 0;

  function handleScore(cat: BalutCategory) {
    if (!hasRolled || cat in state.scores) return;
    dispatch({ type: "score", category: cat } as BalutAction);
  }

  const total = totalBalutScore(state.scores, state.balutBonus);

  return (
    <div className="balut">
      <div className="balut-info">
        <span>Round {Math.min(state.round, 7)} / 7</span>
        <span>Roll {state.rollsUsed} / 3</span>
      </div>

      <div className="balut-dice">
        {state.dice.map((die, i) => (
          <Die key={i} value={die.value} kept={die.kept}
            onClick={() => {
              if (state.rollsUsed > 0 && state.rollsUsed < 3)
                dispatch({ type: "toggleKeep", index: i } as BalutAction);
            }}
          />
        ))}
      </div>

      <div className="balut-controls">
        <button data-testid="hint-target-balut-roll" onClick={() => dispatch({ type: "roll" } as BalutAction)} disabled={!canRoll || !!terminal}>
          {state.rollsUsed === 0 ? "Roll Dice" : "Re-roll"}
        </button>
      </div>

      {terminal && <div className="balut-game-over">Game Over! Final Score: {terminal.score}</div>}

      <table className="balut-scorecard">
        <thead><tr><th>Category</th><th>Score</th></tr></thead>
        <tbody>
          {ALL_BALUT_CATEGORIES.map((cat) => {
            const used = cat in state.scores;
            const potential = hasRolled && !used ? computeBalutScore(state.dice, cat) : null;
            return (
              <tr key={cat} className={used ? "used" : hasRolled ? "clickable" : ""}>
                <td>{LABELS[cat]}</td>
                <td
                  data-testid={`hint-target-balut-cat-${cat}`}
                  className={used ? undefined : potential !== null ? "score-cell potential" : "score-cell"}
                  onClick={used ? undefined : () => handleScore(cat)}
                >
                  {used ? state.scores[cat] : potential !== null ? potential : "—"}
                </td>
              </tr>
            );
          })}
          {state.balutBonus && (
            <tr className="bonus"><td>Balut Bonus</td><td>+20</td></tr>
          )}
          <tr className="total"><td>Total</td><td>{total}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
