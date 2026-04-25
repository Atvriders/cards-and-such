import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SamuraiDiceState, SamuraiDiceAction, SamuraiDiceSettings, SamuraiCategory } from "./state.js";
import { isTerminal, computeSamuraiScore, totalSamuraiScore, ALL_SAMURAI_CATEGORIES } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./SamuraiDice.css";

const CATEGORY_LABELS: Record<SamuraiCategory, string> = {
  honor: "Honor (top face × 3)",
  bushido: "Bushido (5 of a kind = 100)",
  katana: "Katana (straight = 70)",
  wakizashi: "Wakizashi (4-seq = 40)",
  dojo: "Dojo (4 of a kind × face × 20)",
  clan: "Clan (3 of a kind × face × 10)",
  seppuku: "Seppuku (full house = 35)",
  ronin: "Ronin (sum all)",
};

export function SamuraiDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<SamuraiDiceState, SamuraiDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const maxRounds = parseInt(state.settings.rounds, 10);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.rollsUsed < 3 && state.round <= maxRounds && !terminal;
  const canScore = state.rollsUsed > 0 && !terminal;

  return (
    <div className="samurai-dice">
      <h2>SAMURAI DICE</h2>

      <div className="samurai-header">
        <div>Round <span>{Math.min(state.round, maxRounds)}</span> / <span>{maxRounds}</span></div>
        <div>Rolls: <span>{state.rollsUsed}</span> / 3</div>
        <div>Honor: <span>{totalSamuraiScore(state.scores)}</span></div>
      </div>

      <div className="samurai-dice-row">
        {state.dice.map((die, i) => (
          <Die
            key={i}
            value={die.value}
            kept={die.kept}
            onClick={state.rollsUsed > 0 && state.rollsUsed < 3 ? () => dispatch({ type: "toggleKeep", index: i } as SamuraiDiceAction) : undefined}
          />
        ))}
      </div>

      <div className="samurai-controls">
        <button onClick={() => dispatch({ type: "roll" } as SamuraiDiceAction)} disabled={!canRoll}>
          {state.rollsUsed === 0 ? "Cast Dice" : `Re-roll (${3 - state.rollsUsed} left)`}
        </button>
      </div>

      {terminal && (
        <div className="samurai-message">Honor earned: {terminal.score} points!</div>
      )}

      <div className="samurai-scorecard">
        {ALL_SAMURAI_CATEGORIES.map((cat) => {
          const already = cat in state.scores;
          const preview = canScore && !already ? computeSamuraiScore(state.dice, cat) : null;
          return (
            <div key={cat} className={`samurai-score-row${already ? " scored" : ""}`}>
              <span>{CATEGORY_LABELS[cat]}</span>
              {already ? (
                <span>{state.scores[cat]}</span>
              ) : canScore ? (
                <button onClick={() => dispatch({ type: "score", category: cat } as SamuraiDiceAction)}>
                  Score {preview ?? 0}
                </button>
              ) : (
                <span>—</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="samurai-total">Total Honor: {totalSamuraiScore(state.scores)}</div>
    </div>
  );
}
