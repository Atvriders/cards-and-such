import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MLTState, MLTAction, MLTSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function MostLikelyTo({ state, dispatch, onGameOver }: GameProps<MLTState, MLTSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="mlt-wrap">
        <div className="mlt-done">
          <h2>That's a Wrap!</h2>
          <p>Played <strong>{state.prompts.length}</strong> rounds. Total votes cast: <strong>{state.votes}</strong>.</p>
        </div>
      </div>
    );
  }

  const prompt = state.prompts[state.currentIndex]!;

  return (
    <div className="mlt-wrap">
      <div className="mlt-header">
        <span>Prompt {state.currentIndex + 1} / {state.prompts.length}</span>
        <span>Votes: {state.votes}</span>
      </div>
      <div className="mlt-card">
        <span className="mlt-prefix">Most Likely To…</span>
        <span className="mlt-prompt">{prompt}</span>
      </div>
      <p className="mlt-hint">Everyone points at the person most likely to — count fingers and record the winner!</p>
      <button className="mlt-next-btn" onClick={() => dispatch({ type: "next" } as MLTAction)}>
        {state.currentIndex + 1 >= state.prompts.length ? "Finish" : "Next Prompt"}
      </button>
    </div>
  );
}
