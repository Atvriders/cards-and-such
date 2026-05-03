import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HexColorGuessState, HexColorGuessSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./HexColorGuess.css";

export function HexColorGuess({
  state,
  dispatch,
  onGameOver,
}: GameProps<HexColorGuessState, HexColorGuessSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const round = state.rounds[state.currentRound];
  const answered = round?.chosen !== null;

  return (
    <div className="hcg-game">
      <div className="hcg-title">Hex Color Guess</div>
      <div className="hcg-score">Score: {state.score} / {state.totalRounds * 100}</div>
      <div className="hcg-round-label">Round {Math.min(state.currentRound + 1, state.totalRounds)} of {state.totalRounds}</div>

      {!state.gameOver && round && (
        <>
          <div
            className="hcg-color-swatch"
            style={{ backgroundColor: round.color }}
          />
          <div className="hcg-question">Which hex code is this color?</div>
          <div className="hcg-options">
            {round.options.map((opt) => {
              let cls = "hcg-option";
              if (answered) {
                if (opt === round.color) cls += " correct";
                else if (opt === round.chosen) cls += " wrong";
              }
              return (
                <button data-testid="hint-target-hex-color-guess-action"
                  key={opt}
                  className={cls}
                  onClick={() => !answered && dispatch({ type: "choose", hex: opt })}
                  disabled={answered}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}

      {state.gameOver && (
        <div className="hcg-game-over">
          {state.score === state.totalRounds * 100 ? "Perfect!" : "Finished!"}<br />
          Score: {state.score} / {state.totalRounds * 100}<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
            {state.rounds.filter(r => r.correct).length} / {state.totalRounds} correct
          </span>
        </div>
      )}
    </div>
  );
}
