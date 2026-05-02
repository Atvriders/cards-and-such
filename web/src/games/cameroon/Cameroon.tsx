import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CameroonState, CameroonAction, CameroonSettings, Category } from "./state.js";
import { ALL_CATEGORIES, computeCategoryScore, totalScore, isTerminal, isCameroon } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Cameroon.css";

const CATEGORY_LABELS: Record<Category, string> = {
  ones: "Ones",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  littleStraight: "Little Straight (15)",
  bigStraight: "Big Straight (20)",
  fullHouse: "Full House (30)",
  poker: "Poker — 4-of-a-kind (40)",
};

export function Cameroon({
  state,
  dispatch,
  onGameOver,
}: GameProps<CameroonState, CameroonSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.rollsUsed < 3;
  const hasRolled = state.rollsUsed > 0;

  function handleToggle(index: number) {
    if (state.rollsUsed > 0 && state.rollsUsed < 3) {
      dispatch({ type: "toggleKeep", index } as CameroonAction);
    }
  }

  function handleScore(cat: Category) {
    if (!hasRolled || cat in state.scores) return;
    dispatch({ type: "score", category: cat } as CameroonAction);
  }

  const hasCameroon = hasRolled && isCameroon(state.dice);

  function renderRow(cat: Category) {
    const used = cat in state.scores;
    const potential = hasRolled && !used ? computeCategoryScore(state.dice, cat) : null;

    return (
      <tr key={cat} className={used ? "used" : hasRolled && !used ? "clickable" : ""}>
        <td>{CATEGORY_LABELS[cat]}</td>
        <td
          data-testid={`hint-target-cameroon-cat-${cat}`}
          className={used ? undefined : potential !== null ? "score-cell potential" : "score-cell"}
          onClick={used ? undefined : () => handleScore(cat)}
        >
          {used ? state.scores[cat] : potential !== null ? potential : "—"}
        </td>
      </tr>
    );
  }

  return (
    <div className="cameroon">
      <div className="cameroon-info">
        <span>Round {Math.min(state.round, 10)} / 10</span>
        <span>Roll {state.rollsUsed} / 3</span>
        {state.settings.cameroonBonus && (
          <span>Cameroon Bonuses: {state.cameroonCount}</span>
        )}
      </div>

      {hasCameroon && (
        <div className="cameroon-alert">CAMEROON! 5 of a kind! +50 bonus</div>
      )}

      <div className="cameroon-dice">
        {state.dice.map((die, i) => (
          <Die key={i} value={die.value} kept={die.kept} onClick={() => handleToggle(i)} />
        ))}
      </div>

      <div className="cameroon-controls">
        <button
          data-testid="hint-target-cameroon-roll"
          onClick={() => dispatch({ type: "roll" } as CameroonAction)}
          disabled={!canRoll || !!terminal}
        >
          {state.rollsUsed === 0 ? "Roll Dice" : "Re-roll"}
        </button>
      </div>

      {terminal && (
        <div className="cameroon-game-over">
          Game Over! Final Score: {terminal.score}
        </div>
      )}

      <table className="cameroon-scorecard">
        <thead>
          <tr><th>Category</th><th>Score</th></tr>
        </thead>
        <tbody>
          {ALL_CATEGORIES.map(renderRow)}
          <tr className="total">
            <td>Total</td>
            <td>{totalScore(state.scores)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
