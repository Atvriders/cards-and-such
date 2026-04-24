import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AimTrainerState } from "./state.js";
import { isTerminal, calcScore } from "./state.js";
import type { aimTrainerSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./AimTrainer.css";

type AimTrainerSettings = SettingsOf<typeof aimTrainerSettings>;

const ARENA_W = 480;
const ARENA_H = 320;

export function AimTrainer({
  state,
  dispatch,
  onGameOver,
}: GameProps<AimTrainerState, AimTrainerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const startedRef = useRef(false);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Spawn first target when component mounts
  useEffect(() => {
    if (!startedRef.current && !terminal) {
      startedRef.current = true;
      dispatch({ type: "spawn", now: performance.now() });
    }
  }, [dispatch, terminal]);

  // Auto-spawn after a hit or miss
  useEffect(() => {
    if (state.target === null && !state.ended && !terminal) {
      dispatch({ type: "spawn", now: performance.now() });
    }
  }, [state.target, state.ended, terminal, dispatch]);

  const total = state.hit + state.missed;
  const acc = total === 0 ? 100 : Math.round((state.hit / total) * 100);
  const avgReaction =
    state.reactionTimes.length > 0
      ? Math.round(state.reactionTimes.reduce((a, b) => a + b, 0) / state.reactionTimes.length)
      : 0;

  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (terminal || state.ended) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (state.target) {
      const tx = state.target.x * ARENA_W;
      const ty = state.target.y * ARENA_H;
      const dist = Math.hypot(px - tx, py - ty);
      if (dist <= state.target.radius) {
        dispatch({ type: "hit", targetId: state.target.id, now: performance.now() });
      } else {
        dispatch({ type: "miss", now: performance.now() });
      }
    }
  };

  return (
    <div className="aim-trainer">
      <div className="at-info">
        <span>Targets: <strong>{total}/{state.totalTargets}</strong></span>
        <span>Hits: <strong>{state.hit}</strong></span>
        <span>Accuracy: <strong>{acc}%</strong></span>
        {avgReaction > 0 && <span>Avg: <strong>{avgReaction}ms</strong></span>}
        <span>Score: <strong>{calcScore(state)}</strong></span>
      </div>

      {terminal ? (
        <div className="at-ended">
          Done! Hits: {state.hit}/{state.totalTargets} · Avg: {avgReaction}ms · Score: {terminal.score}
        </div>
      ) : (
        <div
          className="at-arena"
          onClick={handleArenaClick}
          style={{ width: ARENA_W, height: ARENA_H }}
        >
          {state.target && (
            <div
              className="at-target"
              style={{
                left: state.target.x * ARENA_W - state.target.radius,
                top: state.target.y * ARENA_H - state.target.radius,
                width: state.target.radius * 2,
                height: state.target.radius * 2,
                borderRadius: "50%",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
