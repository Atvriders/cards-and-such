import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CosmicDiceState, CosmicDiceAction, CosmicDiceSettings, CosmicCategory } from "./state.js";
import { isTerminal, computeCosmicScore, totalCosmicScore, ALL_COSMIC_CATEGORIES } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./CosmicDice.css";

const CATEGORY_LABELS: Record<CosmicCategory, string> = {
  nebula: "Nebula (3 of a kind × face × 30)",
  supernova: "Supernova (4 of a kind × face × 60)",
  blackhole: "Black Hole (5 of a kind = 500)",
  galaxy: "Galaxy (all different = 150)",
  comet: "Comet (straight = 200)",
  asteroid: "Asteroid (sum of dice)",
  cosmos: "Cosmos (full house = 100)",
};

export function CosmicDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<CosmicDiceState, CosmicDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const maxRounds = parseInt(state.settings.rounds, 10);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function handleRoll() {
    dispatch({ type: "roll" } as CosmicDiceAction);
  }

  function handleToggle(i: number) {
    dispatch({ type: "toggleKeep", index: i } as CosmicDiceAction);
  }

  function handleScore(cat: CosmicCategory) {
    dispatch({ type: "score", category: cat } as CosmicDiceAction);
  }

  const canRoll = state.rollsUsed < 3 && state.round <= maxRounds && !terminal;
  const canScore = state.rollsUsed > 0 && !terminal;

  return (
    <div className="cosmic-dice">
      <h2>COSMIC DICE</h2>

      <div className="cosmic-header">
        <div>Round <span>{Math.min(state.round, maxRounds)}</span> / <span>{maxRounds}</span></div>
        <div>Rolls: <span>{state.rollsUsed}</span> / 3</div>
        <div>Total: <span>{totalCosmicScore(state.scores)}</span></div>
      </div>

      <div className="cosmic-dice-row">
        {state.dice.map((die, i) => (
          <Die
            key={i}
            value={die.value}
            kept={die.kept}
            onClick={state.rollsUsed > 0 && state.rollsUsed < 3 ? () => handleToggle(i) : undefined}
          />
        ))}
      </div>

      <div className="cosmic-controls">
        <button onClick={handleRoll} disabled={!canRoll}>
          {state.rollsUsed === 0 ? "Launch Dice" : `Re-roll (${3 - state.rollsUsed} left)`}
        </button>
      </div>

      {terminal && (
        <div className="cosmic-message">
          Mission complete! Final score: {terminal.score}
        </div>
      )}

      <div className="cosmic-scorecard">
        {ALL_COSMIC_CATEGORIES.map((cat) => {
          const already = cat in state.scores;
          const preview = canScore && !already ? computeCosmicScore(state.dice, cat) : null;
          return (
            <div key={cat} className={`cosmic-score-row${already ? " scored" : ""}`}>
              <span>{CATEGORY_LABELS[cat]}</span>
              {already ? (
                <span>{state.scores[cat]}</span>
              ) : canScore ? (
                <button onClick={() => handleScore(cat)}>
                  Score {preview ?? 0}
                </button>
              ) : (
                <span>—</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="cosmic-total">Total: {totalCosmicScore(state.scores)}</div>
    </div>
  );
}
