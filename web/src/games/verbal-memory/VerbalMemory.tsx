import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { VerbalMemoryState } from "./state.js";
import { isTerminal } from "./state.js";
import type { verbalMemorySettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./VerbalMemory.css";

type VerbalMemorySettings = SettingsOf<typeof verbalMemorySettings>;

export function VerbalMemory({
  state,
  dispatch,
  onGameOver,
}: GameProps<VerbalMemoryState, VerbalMemorySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const currentWord = state.queue[state.currentIndex] ?? "";

  return (
    <div className="verbal-memory">
      <div className="vm-info">
        <span>Score: <strong>{state.score}</strong></span>
        <span>
          Lives:{" "}
          <strong>
            {"❤️".repeat(state.lives)}{"🖤".repeat(parseInt(state.settings.lives, 10) - state.lives)}
          </strong>
        </span>
      </div>

      {state.lastResult && (
        <div className={`vm-result ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct!" : "Wrong!"}
        </div>
      )}

      {terminal ? (
        <div className="vm-ended">
          Game over! Score: {state.score}
        </div>
      ) : (
        <>
          <div className="vm-word">{currentWord}</div>
          <div className="vm-buttons">
            <button className="vm-btn vm-seen" onClick={() => dispatch({ type: "seen" })}>
              SEEN
            </button>
            <button className="vm-btn vm-new" onClick={() => dispatch({ type: "new" })}>
              NEW
            </button>
          </div>
        </>
      )}
    </div>
  );
}
