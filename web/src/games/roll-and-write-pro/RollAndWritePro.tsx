import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RollAndWriteProState, RollAndWriteProSettings, Category } from "./state.js";
import { reducer, isTerminal, scoreCategory } from "./state.js";
import "./RollAndWritePro.css";

const FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const CATEGORY_LABELS: Record<Category, string> = {
  ones: "Ones", twos: "Twos", threes: "Threes", fours: "Fours", fives: "Fives", sixes: "Sixes",
  threeOfAKind: "3 of a Kind", fourOfAKind: "4 of a Kind", fullHouse: "Full House (25)",
  smallStraight: "Sm. Straight (30)", largeStraight: "Lg. Straight (40)", yahtzee: "Yahtzee (50)", chance: "Chance",
};

const ALL_CATEGORIES: Category[] = [
  "ones", "twos", "threes", "fours", "fives", "sixes",
  "threeOfAKind", "fourOfAKind", "fullHouse", "smallStraight", "largeStraight", "yahtzee", "chance",
];

export function RollAndWritePro({ state, dispatch, onGameOver }: GameProps<RollAndWriteProState, RollAndWriteProSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="raw-pro">
      <div className="raw-pro-info">
        <span>Round: {state.round}/{state.totalRounds}</span>
        <span>Rolls: {state.rollsLeft} left</span>
        <span>Total: {state.totalScore}</span>
      </div>

      <div className="raw-pro-dice-row">
        {state.dice.map((d, i) => (
          <div
            key={i}
            className={`raw-pro-die ${state.kept[i] ? "kept" : ""}`}
            onClick={() => dispatch({ type: "toggleKeep", index: i })}
          >
            {FACES[d]}
          </div>
        ))}
      </div>

      <div className="raw-pro-buttons">
        <button data-testid="hint-target-roll-and-write-pro-roll" disabled={state.rollsLeft <= 0} onClick={() => dispatch({ type: "roll" })}>
          Roll ({state.rollsLeft})
        </button>
      </div>

      <div className="raw-pro-scorecard">
        <div className="raw-pro-scorecard-header">Category</div>
        <div className="raw-pro-scorecard-header">If scored now</div>
        <div className="raw-pro-scorecard-header">Locked</div>
        {ALL_CATEGORIES.map(cat => {
          const locked = state.scores[cat];
          const potential = scoreCategory(cat, state.dice);
          return (
            <div key={cat} className="raw-pro-cat-row">
              <div className="raw-pro-cat-name">{CATEGORY_LABELS[cat]}</div>
              <div className="raw-pro-cat-potential">{locked === null ? potential : "—"}</div>
              <div className="raw-pro-cat-score">
                {locked !== null ? locked : (
                  !state.gameOver && (
                    <button data-testid={`hint-target-roll-and-write-pro-cat-${cat}`} className="raw-pro-cat-btn" onClick={() => dispatch({ type: "scoreCategory", category: cat })}>
                      Score
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {state.gameOver && (
        <>
          <div className="raw-pro-final">Final: {state.totalScore} pts — Rating: {terminal?.score}/100</div>
          <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
        </>
      )}
    </div>
  );
}
