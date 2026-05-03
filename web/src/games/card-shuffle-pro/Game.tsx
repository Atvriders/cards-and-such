import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardShuffleProState, CardShuffleProSettings, Card } from "./state.js";
import { isTerminal, colorOf, ROUNDS } from "./state.js";
import "./Game.css";

const RANK_LABEL: Record<number, string> = {
  1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
  8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K",
};
const SUIT_GLYPH: Record<string, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };

function CardView({ c, hidden }: { c: Card; hidden?: boolean }): JSX.Element {
  if (hidden) {
    return <div className="csp-card csp-card--back" aria-label="Hidden card">?</div>;
  }
  const color = colorOf(c);
  return (
    <div className={`csp-card csp-card--${color}`} aria-label={`${RANK_LABEL[c.rank]} of ${c.suit}`}>
      <span className="csp-rank">{RANK_LABEL[c.rank]}</span>
      <span className="csp-suit">{SUIT_GLYPH[c.suit]}</span>
    </div>
  );
}

export function CardShuffleProGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CardShuffleProState, CardShuffleProSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const reds = state.hand.filter((c) => colorOf(c) === "red").length;
  const blacks = state.hand.length - reds;

  return (
    <div className="csp-root">
      <div className="csp-info">
        <span>Round <strong>{state.round}/{ROUNDS}</strong></span>
        <span>Score <strong>{state.score}</strong></span>
        <span>Hand reds <strong>{reds}</strong></span>
        <span>Hand blacks <strong>{blacks}</strong></span>
      </div>

      {terminal ? (
        <div className="csp-ended">
          Done! Final score: {terminal.score}/{ROUNDS}
        </div>
      ) : (
        <>
          <div className="csp-hand">
            {state.hand.map((c, i) => (
              <CardView key={i} c={c} />
            ))}
            <div className="csp-arrow">{"➜"}</div>
            <CardView c={state.next} hidden={!state.revealed} />
          </div>

          {!state.revealed ? (
            <div className="csp-prompt">
              <p>Predict the color of the next card from the shuffled deck:</p>
              <div className="csp-buttons">
                <button data-testid="hint-target-card-shuffle-pro-red"
                  type="button"
                  className="csp-btn csp-btn--red"
                  onClick={() => dispatch({ type: "guess", color: "red" })}
                >
                  Red
                </button>
                <button data-testid="hint-target-card-shuffle-pro-black"
                  type="button"
                  className="csp-btn csp-btn--black"
                  onClick={() => dispatch({ type: "guess", color: "black" })}
                >
                  Black
                </button>
              </div>
            </div>
          ) : (
            <div className="csp-result">
              <p>
                You guessed <strong>{state.guess}</strong>. Card was{" "}
                <strong>{colorOf(state.next)}</strong>.{" "}
                {colorOf(state.next) === state.guess ? "Correct!" : "Wrong."}
              </p>
              <button data-testid="hint-target-card-shuffle-pro-next"
                type="button"
                className="csp-btn csp-btn--primary"
                onClick={() => dispatch({ type: "next" })}
              >
                {state.round >= ROUNDS ? "Finish" : "Next Shuffle"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
