import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { YachtState, YachtAction, YachtSettings, YachtCategory } from "./state.js";
import { ALL_YACHT_CATEGORIES, computeYachtScore, totalYachtScore, isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Yacht.css";

const LABELS: Record<YachtCategory, string> = {
  ones: "Ones", twos: "Twos", threes: "Threes", fours: "Fours", fives: "Fives", sixes: "Sixes",
  littleStraight: "Little Straight (30)", bigStraight: "Big Straight (30)",
  fourOfAKind: "Four of a Kind", fullHouse: "Full House", choice: "Choice", yacht: "YACHT (50)",
};

export function Yacht({ state, dispatch, onGameOver }: GameProps<YachtState, YachtSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.rollsUsed < 3;
  const hasRolled = state.rollsUsed > 0;

  function handleScore(cat: YachtCategory) {
    if (!hasRolled || cat in state.scores) return;
    dispatch({ type: "score", category: cat } as YachtAction);
  }

  return (
    <div className="yacht">
      <div className="yacht-info">
        <span>Round {Math.min(state.round, 12)} / 12</span>
        <span>Roll {state.rollsUsed} / 3</span>
      </div>

      <div className="yacht-dice">
        {state.dice.map((die, i) => (
          <Die key={i} value={die.value} kept={die.kept}
            onClick={() => {
              if (state.rollsUsed > 0 && state.rollsUsed < 3)
                dispatch({ type: "toggleKeep", index: i } as YachtAction);
            }}
          />
        ))}
      </div>

      <div className="yacht-controls">
        <button onClick={() => dispatch({ type: "roll" } as YachtAction)} disabled={!canRoll || !!terminal}>
          {state.rollsUsed === 0 ? "Roll Dice" : "Re-roll"}
        </button>
      </div>

      {terminal && <div className="yacht-game-over">Game Over! Final Score: {terminal.score}</div>}

      <table className="yacht-scorecard">
        <thead><tr><th>Category</th><th>Score</th></tr></thead>
        <tbody>
          {ALL_YACHT_CATEGORIES.map((cat) => {
            const used = cat in state.scores;
            const potential = hasRolled && !used ? computeYachtScore(state.dice, cat) : null;
            return (
              <tr key={cat} className={used ? "used" : hasRolled ? "clickable" : ""}>
                <td>{LABELS[cat]}</td>
                <td
                  className={used ? undefined : potential !== null ? "score-cell potential" : "score-cell"}
                  onClick={used ? undefined : () => handleScore(cat)}
                >
                  {used ? state.scores[cat] : potential !== null ? potential : "—"}
                </td>
              </tr>
            );
          })}
          <tr className="total">
            <td>Total</td>
            <td>{totalYachtScore(state.scores)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
