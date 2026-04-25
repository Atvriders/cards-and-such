import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceStackState, DiceStackAction } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, calcCategory } from "./state.js";
import "./Game.css";

const DIE_FACE = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const CATEGORY_LABELS: Record<string, string> = {
  ones: "Ones", twos: "Twos", threes: "Threes", fours: "Fours", fives: "Fives", sixes: "Sixes",
  threeOfKind: "Three of a Kind", fourOfKind: "Four of a Kind", fullHouse: "Full House (25)",
  smallStraight: "Small Straight (30)", largeStraight: "Large Straight (40)", stack: "Stack/Yahtzee (50)", chance: "Chance",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS);

export function DiceStackGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceStackState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: DiceStackAction) => dispatch(a);
  const canRoll = state.rollsLeft > 0 && state.phase === "roll";
  const canScore = state.phase === "keep" || state.phase === "roll";

  return (
    <div className="ds-wrap">
      <div className="ds-header">
        <span className="ds-title">🎲 Dice Stack</span>
        <span>Round {Math.min(state.round, TOTAL_ROUNDS)}/{TOTAL_ROUNDS}</span>
        <span className="ds-score">{state.totalScore} pts</span>
      </div>

      <div className="ds-dice-row">
        {state.dice.map((d_, i) => (
          <div
            key={i}
            className={`ds-die${state.kept[i] ? " kept" : ""}`}
            onClick={() => state.phase === "keep" && dispatch({ type: "toggleKeep", idx: i })}>
            {DIE_FACE[d_]}
          </div>
        ))}
      </div>

      {state.phase !== "done" && (
        <div>
          <div className="ds-rolls-left">
            {state.phase === "roll" ? `Rolls left: ${state.rollsLeft} — click dice to keep after rolling` : `Click dice to keep, then score a category`}
          </div>
          <button className="ds-roll-btn" disabled={!canRoll} onClick={() => d({ type: "roll" })}>
            Roll Dice ({state.rollsLeft} left)
          </button>
        </div>
      )}

      <div className="ds-scorecard">
        <div className="ds-sc-header">
          <div>Category</div>
          <div style={{ textAlign: "right" }}>Potential</div>
          <div style={{ textAlign: "right" }}>Score</div>
        </div>
        {CATEGORIES.map(cat => {
          const scored = state.scores[cat] !== null;
          const potential = canScore ? calcCategory(cat, state.dice) : 0;
          return (
            <div key={cat} className={`ds-sc-row${scored ? " scored" : ""}`}>
              <div className="ds-sc-name">{CATEGORY_LABELS[cat]}</div>
              <div className="ds-sc-pot">{canScore && !scored ? potential : ""}</div>
              <div className="ds-sc-val">
                {scored
                  ? state.scores[cat]
                  : <button
                    className="ds-sc-btn"
                    disabled={!canScore}
                    onClick={() => d({ type: "scoreCategory", category: cat })}>
                    Use
                  </button>}
              </div>
            </div>
          );
        })}
      </div>

      {state.phase === "done" && (
        <div className="ds-done">
          <div className="ds-final">Total: {state.totalScore} pts</div>
          <div>{state.totalScore >= 250 ? "🏆 Dice Master!" : state.totalScore >= 150 ? "👍 Great rolls!" : "🎲 Keep rolling!"}</div>
        </div>
      )}
    </div>
  );
}
