import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CupFlipState } from "./state.js";
import { isTerminal } from "./state.js";
import type { cupFlipSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./CupFlip.css";

type CFSettings = SettingsOf<typeof cupFlipSettings>;

const W = 320;
// Cup slot positions (x fraction of W)
const SLOT_X = [0.2, 0.5, 0.8];

export function CupFlip({
  state,
  dispatch,
  onGameOver,
}: GameProps<CupFlipState, CFSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    if (state.phase !== "sliding") return;
    const tick = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [terminal, state.phase, dispatch, onGameOver]);

  // For each cup index (0,1,2), determine its visual X position
  // cupPositions[i] = slot it's currently in
  // During a swap, interpolate between old and new positions
  const getCupX = (cupIndex: number): number => {
    const targetSlot = state.cupPositions[cupIndex] ?? cupIndex;
    const targetX = SLOT_X[targetSlot] ?? 0.5;
    if (state.phase === "sliding" && (cupIndex === state.swapA || cupIndex === state.swapB)) {
      // The swap is in progress — show the intermediate position
      const otherCup = cupIndex === state.swapA ? state.swapB : state.swapA;
      const fromSlot = state.cupPositions[cupIndex] ?? cupIndex;
      // After swap completes, cupIndex will be at otherCup's slot — but during animation
      const toSlot = state.cupPositions[otherCup] ?? otherCup;
      const fromX = SLOT_X[fromSlot] ?? 0.5;
      const toX = SLOT_X[toSlot] ?? 0.5;
      return fromX + (toX - fromX) * state.shuffleT;
    }
    return targetX;
  };

  const isRevealed = state.revealed;
  const waitingForChoice = state.phase === "flipped" && !state.revealed;

  return (
    <div className="cup-flip">
      <div className="cf-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
      </div>

      <div className="cf-arena" style={{ width: W }}>
        <div className="cf-table" />
        {isRevealed && (
          <div
            className="cf-ball"
            style={{ left: getCupX(state.ballUnder) * W }}
          >
            ⚾
          </div>
        )}
        {[0, 1, 2].map((cupIndex) => {
          const cx = getCupX(cupIndex) * W;
          let cls = "cf-cup";
          if (isRevealed) {
            if (cupIndex === state.chosenCup) cls += state.correct ? " correct" : " wrong";
            else if (cupIndex === state.ballUnder) cls += " correct";
          }
          return (
            <div
              key={cupIndex}
              className={cls}
              style={{ left: cx }}
              onClick={() => waitingForChoice && dispatch({ type: "choose", cup: cupIndex })}
            >
              🥤
            </div>
          );
        })}
      </div>

      {state.phase === "sliding" && (
        <div className="cf-status">Watch the cups shuffle...</div>
      )}

      {waitingForChoice && (
        <div className="cf-status">Where is the ball? Click a cup!</div>
      )}

      {isRevealed && state.phase === "flipped" && (
        <>
          <div className={`cf-result ${state.correct ? "correct" : "wrong"}`}>
            {state.correct ? `Correct! +${state.lastPts} pts` : "Wrong cup!"}
          </div>
          {state.round < state.maxRounds && (
            <button data-testid="hint-target-cup-flip-action" className="cf-btn" onClick={() => dispatch({ type: "next" })}>
              Next Round
            </button>
          )}
        </>
      )}

      {terminal && (
        <div className="cf-result correct">Final Score: {terminal.score}</div>
      )}
    </div>
  );
}
