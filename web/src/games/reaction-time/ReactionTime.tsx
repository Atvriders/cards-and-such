import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ReactionTimeState } from "./state.js";
import { isTerminal, averageReactionTime } from "./state.js";
import type { reactionTimeSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./ReactionTime.css";

type ReactionTimeSettings = SettingsOf<typeof reactionTimeSettings>;

const FALSE_START_PENALTY = 1000;

export function ReactionTime({
  state,
  dispatch,
  onGameOver,
}: GameProps<ReactionTimeState, ReactionTimeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      return;
    }
  }, [terminal, onGameOver]);

  // Drive ticks during "waiting" phase
  useEffect(() => {
    if (state.phase !== "waiting") return;

    const tick = () => {
      dispatch({ type: "tick", now: performance.now() });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [state.phase, dispatch]);

  const handleArenaClick = () => {
    if (state.phase === "waiting" || state.phase === "signal") {
      dispatch({ type: "click", now: performance.now() });
    }
  };

  const avg = averageReactionTime(state.reactionTimes);

  const arenaContent = () => {
    switch (state.phase) {
      case "idle": return "Press Start Round";
      case "waiting": return "Wait...";
      case "signal": return "CLICK NOW!";
      case "clicked": return state.reactionTimes[state.reactionTimes.length - 1]! >= FALSE_START_PENALTY
        ? "False start! +1000ms penalty"
        : `${Math.round(state.reactionTimes[state.reactionTimes.length - 1]!)}ms — Press Start Round`;
      case "done": return `Done! Avg: ${Math.round(avg)}ms`;
      default: return "";
    }
  };

  return (
    <div className="reaction-time">
      <div className="rt-info">
        <span>Round: <strong>{state.currentRound}/{state.totalRounds}</strong></span>
        <span>Difficulty: <strong>{state.settings.difficulty}</strong></span>
      </div>

      <div
        className={`rt-arena ${state.phase}`}
        onClick={handleArenaClick}
      >
        {arenaContent()}
      </div>

      {(state.phase === "idle" || state.phase === "clicked") && !terminal && (
        <button
          className="rt-start-btn"
          onClick={() => dispatch({ type: "start-round" })}
        >
          Start Round {state.currentRound + 1}
        </button>
      )}

      {state.reactionTimes.length > 0 && (
        <div className="rt-history">
          {state.reactionTimes.map((t, i) => (
            <div
              key={i}
              className={`rt-history-item${t >= FALSE_START_PENALTY ? " false-start" : ""}`}
            >
              <span>Round {i + 1}</span>
              <span>{t >= FALSE_START_PENALTY ? `${t}ms (false start)` : `${Math.round(t)}ms`}</span>
            </div>
          ))}
          {state.reactionTimes.length > 1 && (
            <div className="rt-average">Average: {Math.round(avg)}ms</div>
          )}
        </div>
      )}

      {terminal && (
        <div className="rt-average">Final Score: {terminal.score}</div>
      )}
    </div>
  );
}
