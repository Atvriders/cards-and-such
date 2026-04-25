import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BpmTapState, BpmTapSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./BpmTap.css";

export function BpmTap({
  state,
  dispatch,
  onGameOver,
}: GameProps<BpmTapState, BpmTapSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function handleTap() {
    const now = Date.now() - startTime.current;
    dispatch({ type: "tap", time: now });
  }

  const error = state.currentBpm > 0 ? Math.abs(state.currentBpm - state.targetBpm) : null;
  const isClose = error !== null && error <= 3;

  return (
    <div className="bpm-game">
      <div className="bpm-title">BPM Tap</div>

      <div className="bpm-target">
        Target: <span>{state.targetBpm}</span> BPM
      </div>

      {state.currentBpm > 0 && (
        <div className={`bpm-current ${isClose ? "match" : "off"}`}>
          Your BPM: {state.currentBpm}
          {error !== null && ` (${error > 0 ? "+" : ""}${state.currentBpm - state.targetBpm})`}
        </div>
      )}

      {!state.gameOver && (
        <>
          <button className="bpm-tap-btn" onClick={handleTap}>
            TAP
          </button>
          <div className="bpm-progress">
            Tap {state.taps.length}/8
          </div>
          {state.bestError !== Infinity && (
            <div className="bpm-error">
              Best error: ±{Math.round(state.bestError)} BPM
            </div>
          )}
        </>
      )}

      {state.gameOver && (
        <div className="bpm-game-over">
          Done! Best error: ±{Math.round(state.bestError)} BPM<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.75 }}>
            Score: {terminal?.score}
          </span>
        </div>
      )}
    </div>
  );
}
