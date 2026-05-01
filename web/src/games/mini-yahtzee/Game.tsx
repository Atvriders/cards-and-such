import { useEffect, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniYahtzeeState, MiniYahtzeeAction, MiniYahtzeeSettings, Category } from "./state.js";
import {
  isTerminal,
  ALL_CATEGORIES,
  UPPER_CATEGORIES,
  CATEGORY_LABELS,
  computeCategoryScore,
  upperSubtotal,
  upperBonus,
  totalScore,
} from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Game.css";

const LOWER_CATEGORIES: Category[] = [
  "threeOfAKind", "fourOfAKind", "fullHouse",
  "smallStraight", "largeStraight", "yahtzee", "chance",
];

export function MiniYahtzeeGame({
  state, dispatch, onGameOver,
}: GameProps<MiniYahtzeeState, MiniYahtzeeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const canRoll = state.rollsUsed < 3 && state.phase === "playing";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "r" || e.key === "R") && canRoll) {
        e.preventDefault();
        dispatch({ type: "roll" } as MiniYahtzeeAction);
      } else if (["1", "2", "3", "4", "5"].includes(e.key) && state.rollsUsed > 0) {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        if (idx < state.dice.length) dispatch({ type: "toggle", idx } as MiniYahtzeeAction);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, canRoll, state.rollsUsed, state.dice.length]);
  const hasRolled = state.rollsUsed > 0;
  const upper = upperSubtotal(state.scores);
  const bonus = upperBonus(state.scores);

  function row(cat: Category) {
    const used = cat in state.scores;
    const preview = !used && hasRolled ? computeCategoryScore(state.dice, cat) : null;
    const clickable = !used && preview !== null;
    const score = () => dispatch({ type: "score", category: cat } as MiniYahtzeeAction);
    return (
      <tr key={cat} className={used ? "yahtz-used" : clickable ? "yahtz-clickable" : ""}>
        <td className="yahtz-label">{CATEGORY_LABELS[cat]}</td>
        <td
          className={`yahtz-cell ${used ? "yahtz-cell-used" : clickable ? "yahtz-cell-preview" : "yahtz-cell-blank"}`}
          {...(clickable
            ? {
                role: "button",
                tabIndex: 0,
                "aria-label": `Score ${CATEGORY_LABELS[cat]} for ${preview}`,
                onClick: score,
                onKeyDown: (e: ReactKeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); score(); }
                },
              }
            : {})}
        >
          {used ? state.scores[cat] : preview !== null ? preview : "-"}
        </td>
      </tr>
    );
  }

  return (
    <div className="yahtz-wrap yahtz-theme">
      <div className="yahtz-header">
        <span className="yahtz-info">Round {Math.min(state.round, 13)} / 13</span>
        <span className="yahtz-info">Roll {state.rollsUsed} / 3</span>
        <span className="yahtz-total">Total: {totalScore(state.scores)}</span>
      </div>

      <div className="yahtz-dice">
        {state.dice.map((d, i) => (
          <Die
            key={i}
            value={d.value}
            kept={d.kept}
            onClick={() => dispatch({ type: "toggle", idx: i } as MiniYahtzeeAction)}
          />
        ))}
      </div>

      <div className="yahtz-controls">
        <button
          className="yahtz-btn"
          onClick={() => dispatch({ type: "roll" } as MiniYahtzeeAction)}
          disabled={!canRoll}
        >
          {state.rollsUsed === 0 ? "Roll Dice" : `Re-roll (${3 - state.rollsUsed} left)`}
        </button>
      </div>

      {t && (
        <div className="yahtz-gameover">
          Game Over! Final Score: {t.score}
        </div>
      )}

      <table className="yahtz-card">
        <thead>
          <tr><th>Upper Section</th><th>Score</th></tr>
        </thead>
        <tbody>
          {UPPER_CATEGORIES.map(row)}
          <tr className="yahtz-bonus-row">
            <td>Upper Bonus (need 63)</td>
            <td>{bonus > 0 ? "+35" : `${upper}/63`}</td>
          </tr>
          <tr className="yahtz-section-head"><td>Lower Section</td><td>Score</td></tr>
          {LOWER_CATEGORIES.map(row)}
          <tr className="yahtz-total-row">
            <td>Total</td>
            <td>{totalScore(state.scores)}</td>
          </tr>
        </tbody>
      </table>
      <div className="yahtz-hint">
        {!hasRolled
          ? "Click Roll to start your turn."
          : state.rollsUsed < 3
          ? "Click a die to keep it, then Re-roll, or pick a scoring category."
          : "Pick a category to score this turn."}
      </div>
    </div>
  );
}
