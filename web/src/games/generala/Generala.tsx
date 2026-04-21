import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GeneralaState, GeneralaAction, GeneralaSettings, GeneralaCategory } from "./state.js";
import { ALL_GENERALA_CATEGORIES, computeGeneralaScore, totalGeneralaScore, isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./Generala.css";

const LABELS: Record<GeneralaCategory, string> = {
  ones: "Ones", twos: "Twos", threes: "Threes", fours: "Fours", fives: "Fives", sixes: "Sixes",
  straight: "Straight (25)", fullHouse: "Full House (35)", fourOfAKind: "Four of a Kind (45)",
  generala: "GENERALA (60)",
};

export function Generala({ state, dispatch, onGameOver }: GameProps<GeneralaState, GeneralaSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.rollsUsed < 3 && !state.instantWin;
  const hasRolled = state.rollsUsed > 0;

  function handleScore(cat: GeneralaCategory) {
    if (!hasRolled || cat in state.scores || state.instantWin) return;
    dispatch({ type: "score", category: cat } as GeneralaAction);
  }

  return (
    <div className="generala">
      <div className="generala-info">
        <span>Round {Math.min(state.round, 10)} / 10</span>
        <span>Roll {state.rollsUsed} / 3</span>
      </div>

      {state.instantWin && (
        <div className="generala-instant-win">GENERALA on first roll! Instant win!</div>
      )}

      <div className="generala-dice">
        {state.dice.map((die, i) => (
          <Die key={i} value={die.value} kept={die.kept}
            onClick={() => {
              if (state.rollsUsed > 0 && state.rollsUsed < 3)
                dispatch({ type: "toggleKeep", index: i } as GeneralaAction);
            }}
          />
        ))}
      </div>

      <div className="generala-controls">
        <button onClick={() => dispatch({ type: "roll" } as GeneralaAction)} disabled={!canRoll || !!terminal}>
          {state.rollsUsed === 0 ? "Roll Dice" : "Re-roll"}
        </button>
      </div>

      {terminal && <div className="generala-game-over">Game Over! Final Score: {terminal.score}</div>}

      <table className="generala-scorecard">
        <thead><tr><th>Category</th><th>Score</th></tr></thead>
        <tbody>
          {ALL_GENERALA_CATEGORIES.map((cat) => {
            const used = cat in state.scores;
            const potential = hasRolled && !used && !state.instantWin
              ? computeGeneralaScore(state.dice, cat, state.rollsUsed)
              : null;
            return (
              <tr key={cat} className={used ? "used" : hasRolled && !state.instantWin ? "clickable" : ""}>
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
          <tr className="total"><td>Total</td><td>{totalGeneralaScore(state.scores)}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
