import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JustOneState, JustOneAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function JustOneGame({ state, dispatch }: GameProps<JustOneState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  const isLastRound = state.round >= state.totalRounds;

  return (
    <div className="just-one">
      <div className="just-one-header">
        Round {state.round} / {state.totalRounds} — Total Score: {state.totalScore}
      </div>

      <div className="just-one-clue-area">
        <h3>Clues from bots (duplicates are canceled):</h3>
        <div className="just-one-clues">
          {state.rawClues.map((clue, i) => {
            const canceled = state.canceledIndices.includes(i);
            return (
              <div key={i} className={`just-one-clue-card${canceled ? " just-one-clue-card--canceled" : ""}`}>
                {canceled ? clue : clue}
              </div>
            );
          })}
        </div>
        {state.canceledIndices.length > 0 && (
          <div className="just-one-canceled-note">
            ⚠ {state.canceledIndices.length} clue(s) canceled — bots gave the same word!
          </div>
        )}
        {state.visibleClues.length === 0 && (
          <div className="just-one-canceled-note">
            All clues were canceled! You must guess without any help.
          </div>
        )}
      </div>

      {!state.submitted ? (
        <div className="just-one-input-area">
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>What is the secret word?</p>
          <input
            className="just-one-input"
            value={state.guess}
            onChange={e => dispatch({ type: "typeGuess", text: e.target.value } satisfies JustOneAction)}
            onKeyDown={e => { if (e.key === "Enter") dispatch({ type: "submitGuess" } satisfies JustOneAction); }}
            placeholder="Your guess"
            autoFocus
          />
          <button
            className="just-one-btn"
            disabled={state.guess.trim() === ""}
            onClick={() => dispatch({ type: "submitGuess" } satisfies JustOneAction)}
          >
            Submit Guess
          </button>
        </div>
      ) : (
        <>
          <div className={`just-one-result${state.won ? " just-one-result--won" : " just-one-result--lost"}`}>
            {state.won
              ? `Correct! "${state.targetWord}" +100 pts`
              : `Wrong! The word was: ${state.targetWord}`}
          </div>
          {!terminal && (
            <button
              className="just-one-btn"
              onClick={() => dispatch({ type: "nextRound" } satisfies JustOneAction)}
            >
              Next Round
            </button>
          )}
          {terminal && (
            <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              Game over! Final score: {state.totalScore} / {state.totalRounds * 100}
            </div>
          )}
        </>
      )}
    </div>
  );
}
