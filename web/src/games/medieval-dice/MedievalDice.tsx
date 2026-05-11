import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MedievalDiceState, MedievalDiceAction, MedievalDiceSettings, MedievalCategory } from "./state.js";
import { isTerminal, computeMedievalScore, totalMedievalScore, ALL_MEDIEVAL_CATEGORIES } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./MedievalDice.css";

const CATEGORY_LABELS: Record<MedievalCategory, string> = {
  peasants: "Peasants (1s & 2s sum)",
  knights: "Knights (3s & 4s sum)",
  siege: "Siege (4-of-a-kind = 60)",
  catapult: "Catapult (3-of-a-kind × face × 15)",
  moat: "Moat (all even = 50)",
  tower: "Tower (all odd = 50)",
  castle: "Castle (2 pairs sum)",
  rampage: "Rampage (sum all)",
};

export function MedievalDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<MedievalDiceState, MedievalDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const maxRounds = parseInt(state.settings.rounds, 10);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function handleRoll() {
    dispatch({ type: "roll" } as MedievalDiceAction);
  }

  function handleToggle(i: number) {
    dispatch({ type: "toggleKeep", index: i } as MedievalDiceAction);
  }

  function handleScore(cat: MedievalCategory) {
    dispatch({ type: "score", category: cat } as MedievalDiceAction);
  }

  const canRoll = state.rollsUsed < 3 && state.round <= maxRounds && !terminal;
  const canScore = state.rollsUsed > 0 && !terminal;

  return (
    <div className="medieval-dice">
      <h2>MEDIEVAL DICE</h2>

      <div className="medieval-header">
        <div>Round <span>{Math.min(state.round, maxRounds)}</span> / <span>{maxRounds}</span></div>
        <div>Rolls: <span>{state.rollsUsed}</span> / 3</div>
        <div>Total: <span>{totalMedievalScore(state.scores)}</span></div>
      </div>

      <div className="medieval-dice-row">
        {state.dice.map((die, i) => (
          <Die
            key={i}
            value={die.value}
            kept={die.kept}
            {...(state.rollsUsed > 0 && state.rollsUsed < 3 ? { onClick: () => handleToggle(i) } : {})}
          />
        ))}
      </div>

      <div className="medieval-controls">
        <button data-testid="hint-target-medieval-dice-roll" onClick={handleRoll} disabled={!canRoll}>
          {state.rollsUsed === 0 ? "Roll Dice" : `Re-roll (${3 - state.rollsUsed} left)`}
        </button>
      </div>

      {terminal && (
        <div className="medieval-message">Siege complete! Final score: {terminal.score}</div>
      )}

      <div className="medieval-scorecard">
        {ALL_MEDIEVAL_CATEGORIES.map((cat) => {
          const already = cat in state.scores;
          const preview = canScore && !already ? computeMedievalScore(state.dice, cat) : null;
          return (
            <div key={cat} className={`medieval-score-row${already ? " scored" : ""}`}>
              <span>{CATEGORY_LABELS[cat]}</span>
              {already ? (
                <span>{state.scores[cat]}</span>
              ) : canScore ? (
                <button data-testid={`hint-target-medieval-dice-cat-${cat}`} onClick={() => handleScore(cat)}>
                  Score {preview ?? 0}
                </button>
              ) : (
                <span>—</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="medieval-total">Total: {totalMedievalScore(state.scores)}</div>
    </div>
  );
}
