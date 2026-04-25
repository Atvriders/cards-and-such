import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CowboyDiceState, CowboyDiceAction, CowboyDiceSettings, CowboyCategory } from "./state.js";
import { isTerminal, computeCowboyScore, totalCowboyScore, upperSection, ALL_COWBOY_CATEGORIES, UPPER_COWBOY } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./CowboyDice.css";

const CATEGORY_LABELS: Record<CowboyCategory, string> = {
  bullets: "Bullets (sum of 1s)",
  horseshoes: "Horseshoes (sum of 2s)",
  cactus: "Cactus (sum of 3s)",
  spurs: "Spurs (sum of 4s)",
  lasso: "Lasso (sum of 5s)",
  sheriff: "Sheriff Stars (sum of 6s)",
  posse: "Posse (3 of a kind = sum)",
  outlaw: "Outlaw (4 of a kind = sum)",
  showdown: "Showdown (full house = 25)",
  rodeo: "Rodeo (5 of a kind = 80)",
  roundup: "Roundup (straight = 50)",
  frontier: "Frontier (chance = sum)",
};

export function CowboyDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<CowboyDiceState, CowboyDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const threshold = parseInt(state.settings.bonusThreshold, 10);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const canRoll = state.rollsUsed < 3 && state.round <= ALL_COWBOY_CATEGORIES.length && !terminal;
  const canScore = state.rollsUsed > 0 && !terminal;
  const upperTotal = upperSection(state.scores);
  const upperFilled = UPPER_COWBOY.filter((c) => c in state.scores).length;

  return (
    <div className="cowboy-dice">
      <h2>COWBOY DICE</h2>

      <div className="cowboy-header">
        <div>Round <span>{Math.min(state.round, ALL_COWBOY_CATEGORIES.length)}</span> / <span>{ALL_COWBOY_CATEGORIES.length}</span></div>
        <div>Rolls: <span>{state.rollsUsed}</span> / 3</div>
        <div>Total: <span>{totalCowboyScore(state.scores, threshold)}</span></div>
      </div>

      <div className="cowboy-dice-row">
        {state.dice.map((die, i) => (
          <Die
            key={i}
            value={die.value}
            kept={die.kept}
            onClick={state.rollsUsed > 0 && state.rollsUsed < 3 ? () => dispatch({ type: "toggleKeep", index: i } as CowboyDiceAction) : undefined}
          />
        ))}
      </div>

      <div className="cowboy-controls">
        <button onClick={() => dispatch({ type: "roll" } as CowboyDiceAction)} disabled={!canRoll}>
          {state.rollsUsed === 0 ? "Draw Dice" : `Re-roll (${3 - state.rollsUsed} left)`}
        </button>
      </div>

      {upperFilled < UPPER_COWBOY.length && (
        <div className="cowboy-bonus">
          Upper section: {upperTotal} / {threshold} (bonus +35 at {threshold})
        </div>
      )}

      {terminal && (
        <div className="cowboy-message">Ride complete! Final score: {terminal.score}</div>
      )}

      <div className="cowboy-scorecard">
        {ALL_COWBOY_CATEGORIES.map((cat) => {
          const already = cat in state.scores;
          const preview = canScore && !already ? computeCowboyScore(state.dice, cat) : null;
          const isUpper = (UPPER_COWBOY as CowboyCategory[]).includes(cat);
          return (
            <div key={cat} className={`cowboy-score-row${already ? " scored" : ""}${isUpper ? " upper-section" : ""}`}>
              <span>{CATEGORY_LABELS[cat]}</span>
              {already ? (
                <span>{state.scores[cat]}</span>
              ) : canScore ? (
                <button onClick={() => dispatch({ type: "score", category: cat } as CowboyDiceAction)}>
                  Score {preview ?? 0}
                </button>
              ) : (
                <span>—</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="cowboy-total">Total: {totalCowboyScore(state.scores, threshold)}</div>
    </div>
  );
}
