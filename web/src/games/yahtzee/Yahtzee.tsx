import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { YahtzeeState, YahtzeeAction, YahtzeeSettings, Category } from "./state.js";
import { ALL_CATEGORIES, UPPER_CATEGORIES, computeCategoryScore, upperSectionSum, totalScore, isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Yahtzee.css";

const CATEGORY_LABELS: Record<Category, string> = {
  ones: "Ones",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  threeOfAKind: "Three of a Kind",
  fourOfAKind: "Four of a Kind",
  fullHouse: "Full House (25)",
  smallStraight: "Sm. Straight (30)",
  largeStraight: "Lg. Straight (40)",
  yahtzee: "YAHTZEE (50)",
  chance: "Chance",
};

const LOWER_CATEGORIES: Category[] = [
  "threeOfAKind", "fourOfAKind", "fullHouse", "smallStraight", "largeStraight", "yahtzee", "chance",
];

export function Yahtzee({
  state,
  dispatch,
  onGameOver,
}: GameProps<YahtzeeState, YahtzeeSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const canRoll = state.rollsUsed < 3;
  const hasRolled = state.rollsUsed > 0;
  const canScore = hasRolled;

  function handleToggle(index: number) {
    if (state.rollsUsed > 0 && state.rollsUsed < 3) {
      dispatch({ type: "toggleKeep", index } as YahtzeeAction);
    }
  }

  function handleScore(cat: Category) {
    if (!canScore) return;
    if (cat in state.scores) return;
    dispatch({ type: "score", category: cat } as YahtzeeAction);
  }

  const upperSum = upperSectionSum(state.scores);
  const bonusProgress = Math.min(upperSum, 63);
  const bonusEarned = upperSum >= 63;

  function renderCategoryRow(cat: Category) {
    const used = cat in state.scores;
    const potential = hasRolled && !used ? computeCategoryScore(state.dice, cat) : null;

    return (
      <tr key={cat} className={used ? "used" : canScore && !used ? "clickable" : ""}>
        <td>{CATEGORY_LABELS[cat]}</td>
        <td
          className={used ? undefined : potential !== null ? "score-cell potential" : "score-cell"}
          onClick={used ? undefined : () => handleScore(cat)}
        >
          {used
            ? state.scores[cat]
            : potential !== null
            ? potential
            : "—"}
        </td>
      </tr>
    );
  }

  return (
    <div className="yahtzee">
      <div className="yahtzee-info">
        <span>Round {Math.min(state.round, 13)} / 13</span>
        <span>Roll {state.rollsUsed} / 3</span>
      </div>

      <div className="yahtzee-dice">
        {state.dice.map((die, i) => (
          <Die
            key={i}
            value={die.value}
            kept={die.kept}
            onClick={() => handleToggle(i)}
          />
        ))}
      </div>

      <div className="yahtzee-controls">
        <button
          onClick={() => dispatch({ type: "roll" } as YahtzeeAction)}
          disabled={!canRoll || !!terminal}
        >
          {state.rollsUsed === 0 ? "Roll Dice" : "Re-roll"}
        </button>
      </div>

      {terminal && (
        <div className="yahtzee-game-over">
          Game Over! Final Score: {terminal.score}
        </div>
      )}

      <table className="yahtzee-scorecard">
        <thead>
          <tr>
            <th>Upper Section</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {UPPER_CATEGORIES.map(renderCategoryRow)}
          <tr className="bonus">
            <td>Upper Bonus (need 63)</td>
            <td>{bonusEarned ? "+35" : `${bonusProgress}/63`}</td>
          </tr>
        </tbody>
        <thead>
          <tr>
            <th>Lower Section</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {LOWER_CATEGORIES.map(renderCategoryRow)}
          <tr className="total">
            <td>Total Score</td>
            <td>{totalScore(state.scores)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
