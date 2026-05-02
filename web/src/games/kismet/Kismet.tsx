import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KismetState, KismetAction, KismetSettings, Category } from "./state.js";
import { ALL_CATEGORIES, UPPER_CATEGORIES, computeCategoryScore, totalScore, upperSectionSum, isTerminal, isFlush } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Kismet.css";

const CATEGORY_LABELS: Record<Category, string> = {
  ones: "Ones",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  twoPair: "Two Pair (25)",
  threeOfAKind: "Three of a Kind (sum)",
  flush: "Flush — same color (35)",
  fullHouse: "Full House (sum+15)",
  fourOfAKind: "Four of a Kind (sum+25)",
  kismet: "Kismet — 5-of-a-kind (sum+50)",
};

const LOWER_CATEGORIES: Category[] = [
  "twoPair", "threeOfAKind", "flush", "fullHouse", "fourOfAKind", "kismet",
];

export function Kismet({
  state,
  dispatch,
  onGameOver,
}: GameProps<KismetState, KismetSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.rollsUsed < 3;
  const hasRolled = state.rollsUsed > 0;

  function handleToggle(index: number) {
    if (state.rollsUsed > 0 && state.rollsUsed < 3) {
      dispatch({ type: "toggleKeep", index } as KismetAction);
    }
  }

  function handleScore(cat: Category) {
    if (!hasRolled || cat in state.scores) return;
    dispatch({ type: "score", category: cat } as KismetAction);
  }

  const upperSum = upperSectionSum(state.scores);
  const bonusEarned = upperSum >= 63;
  const flushNow = hasRolled && isFlush(state.dice);

  function renderRow(cat: Category) {
    const used = cat in state.scores;
    const potential = hasRolled && !used ? computeCategoryScore(state.dice, cat) : null;
    return (
      <tr key={cat} className={used ? "used" : hasRolled && !used ? "clickable" : ""}>
        <td>{CATEGORY_LABELS[cat]}</td>
        <td
          data-testid={`hint-target-kismet-cat-${cat}`}
          className={used ? undefined : potential !== null ? "score-cell potential" : "score-cell"}
          onClick={used ? undefined : () => handleScore(cat)}
        >
          {used ? state.scores[cat] : potential !== null ? potential : "—"}
        </td>
      </tr>
    );
  }

  return (
    <div className="kismet">
      <div className="kismet-info">
        <span>Round {Math.min(state.round, 12)} / 12</span>
        <span>Roll {state.rollsUsed} / 3</span>
        {flushNow && <span className="kismet-flush-tag">FLUSH!</span>}
      </div>

      <div className="kismet-dice">
        {state.dice.map((die, i) => (
          <Die key={i} value={die.value} kept={die.kept} onClick={() => handleToggle(i)} />
        ))}
      </div>

      <div className="kismet-controls">
        <button
          data-testid="hint-target-kismet-roll"
          onClick={() => dispatch({ type: "roll" } as KismetAction)}
          disabled={!canRoll || !!terminal}
        >
          {state.rollsUsed === 0 ? "Roll Dice" : "Re-roll"}
        </button>
      </div>

      {terminal && (
        <div className="kismet-game-over">Game Over! Final Score: {terminal.score}</div>
      )}

      <table className="kismet-scorecard">
        <thead><tr><th>Upper Section</th><th>Score</th></tr></thead>
        <tbody>
          {UPPER_CATEGORIES.map(renderRow)}
          <tr className="bonus">
            <td>Upper Bonus (need 63)</td>
            <td>{bonusEarned ? "+35" : `${upperSum}/63`}</td>
          </tr>
        </tbody>
        <thead><tr><th>Lower Section</th><th>Score</th></tr></thead>
        <tbody>
          {LOWER_CATEGORIES.map(renderRow)}
          <tr className="total">
            <td>Total</td>
            <td>{totalScore(state.scores)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
