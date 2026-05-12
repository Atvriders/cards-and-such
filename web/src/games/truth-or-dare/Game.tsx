import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TODState, TODAction, TODSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TruthOrDare({ state, dispatch, onGameOver }: GameProps<TODState, TODSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="tod-wrap">
        <div className="tod-done bounce-in">
          <h2>All Done!</h2>
          <p>Completed <strong>{state.completed}</strong> rounds of Truth or Dare!</p>
        </div>
      </div>
    );
  }

  if (state.phase === "pick") {
    return (
      <div className="tod-wrap">
        <div className="tod-header">
          <span>Round {state.currentIndex + 1} / {state.cards.length}</span>
        </div>
        <div className="tod-pick-label">Choose your fate:</div>
        <div className="tod-pick-buttons">
          <button data-testid="hint-target-truth-or-dare-primary" className="tod-btn-truth" onClick={() => dispatch({ type: "pick", choice: "truth" } as TODAction)}>
            Truth
          </button>
          <button className="tod-btn-dare" onClick={() => dispatch({ type: "pick", choice: "dare" } as TODAction)}>
            Dare
          </button>
        </div>
      </div>
    );
  }

  const card = state.cards[state.currentIndex]!;
  const isTruth = card.kind === "truth";

  return (
    <div className="tod-wrap fade-in">
      <div className="tod-header">
        <span>Round {state.currentIndex + 1} / {state.cards.length}</span>
      </div>
      <div className={`tod-card ${isTruth ? "tod-card-truth" : "tod-card-dare"}`}>
        <span className="tod-card-type">{isTruth ? "Truth" : "Dare"}</span>
        {card.text}
      </div>
      <button data-testid="hint-target-truth-or-dare-next" className="tod-next-btn" onClick={() => dispatch({ type: "next" } as TODAction)}>
        {state.currentIndex + 1 >= state.cards.length ? "Finish" : "Done — Next Player"}
      </button>
    </div>
  );
}
