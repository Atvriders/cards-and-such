import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WhackVirusState, WhackVirusAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type Settings = { slots: "9" | "16"; speed: "normal" | "fast" };

const VIRUS_EMOJI = "🦠";

export function WhackAVirus({ state, dispatch }: GameProps<WhackVirusState, Settings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (!s.over) {
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as WhackVirusAction);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; lastTimeRef.current = null; }
    };
  }, [state.over, tick]);

  const terminal = isTerminal(state);
  const { slotCount, viruses, score, lives, elapsed, duration } = state;
  const cols = slotCount === 9 ? 3 : 4;

  const slotMap = new Map(viruses.map((v) => [v.slot, v]));

  return (
    <div className="wav-game">
      <div className="wav-header">
        <span>Score: {score}</span>
        <span>Lives: {"❤ ".repeat(Math.max(0, lives)).trim()}</span>
        <span>Time: {Math.max(0, Math.ceil(duration - elapsed))}s</span>
      </div>

      <div className="wav-progress">
        <div className="wav-progress-bar" style={{ width: `${Math.min(100, (elapsed / duration) * 100)}%` }} />
      </div>

      <div className="wav-grid" style={{ gridTemplateColumns: `repeat(${cols}, 88px)` }}>
        {Array.from({ length: slotCount }, (_, i) => {
          const virus = slotMap.get(i);
          const timeLeft = virus ? virus.spawnTime + virus.duration - elapsed : 0;
          const pct = virus ? Math.max(0, (timeLeft / virus.duration) * 100) : 0;
          const warnClass = pct < 30 ? " wav-timer-fill--crit" : pct < 60 ? " wav-timer-fill--warn" : "";

          return (
            <div data-testid="hint-target-whack-a-virus-action"
              key={i}
              className={`wav-slot${!virus ? " wav-slot--empty" : ""}`}
              onClick={() => virus && !virus.whacked && dispatch({ type: "whack", id: virus.id } as WhackVirusAction)}
            >
              {virus && (
                <>
                  <span className={`wav-virus wav-virus--${virus.type}${virus.whacked ? " wav-virus--whacked" : ""}`}>
                    {VIRUS_EMOJI}
                  </span>
                  <div className="wav-timer-ring">
                    <div className={`wav-timer-fill${warnClass}`} style={{ width: `${pct}%` }} />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {terminal && (
        <div className="wav-overlay">
          <h2>{state.elapsed >= state.duration ? "Time's Up!" : "Game Over!"}</h2>
          <p>Score: {terminal.score}</p>
        </div>
      )}

      <div className="wav-hint">Click viruses before their timer runs out! Missing costs a life.</div>
    </div>
  );
}
