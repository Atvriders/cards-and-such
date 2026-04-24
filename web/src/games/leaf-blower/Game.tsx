import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LeafBlowerState, LeafBlowerSettings, LeafBlowerAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LEAF_SIZES = [0, 1.2, 1.6, 2.0]; // rem per size index

export function LeafBlower({
  state,
  dispatch,
  onGameOver,
}: GameProps<LeafBlowerState, LeafBlowerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      return;
    }

    function tick(ts: number) {
      if (lastTimeRef.current === 0) lastTimeRef.current = ts;
      const deltaMs = ts - lastTimeRef.current;
      lastTimeRef.current = ts;
      if (deltaMs > 0) {
        dispatch({ type: "tick", deltaMs } as LeafBlowerAction);
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [terminal, dispatch, onGameOver]);

  const secsLeft = Math.ceil(state.timeLeft / 1000);
  const activeLeaves = state.leaves.filter(l => !l.caught && !l.fallen);

  return (
    <div className="lb-game">
      <div className="lb-hud">
        <span>Score: <strong>{state.score}</strong></span>
        <span className={`lb-time ${secsLeft <= 10 ? "urgent" : ""}`}>{secsLeft}s</span>
        <span>Combo: <strong className="lb-combo">x{state.combo}</strong></span>
      </div>

      <div className="lb-field">
        {activeLeaves.map(leaf => (
          <button
            key={leaf.id}
            className="lb-leaf"
            style={{
              left: `${leaf.x}%`,
              top: `${leaf.y}%`,
              fontSize: `${LEAF_SIZES[leaf.size] ?? 1.4}rem`,
            }}
            onClick={() => dispatch({ type: "catch", id: leaf.id } as LeafBlowerAction)}
          >
            {leaf.emoji}
          </button>
        ))}
        {activeLeaves.length === 0 && !state.gameOver && (
          <div className="lb-waiting">Leaves incoming...</div>
        )}
      </div>

      <div className="lb-footer">
        <span>Caught: {state.totalCaught}</span>
        <span>Missed: {state.missed}</span>
        <span>Best combo: {state.maxCombo}</span>
      </div>

      {state.gameOver && (
        <div className="lb-overlay">
          <div className="lb-game-over">
            <div className="lb-go-title">Time's Up!</div>
            <div>Score: {terminal?.score}</div>
            <div>Caught: {state.totalCaught} | Missed: {state.missed}</div>
            <div>Max combo: {state.maxCombo}</div>
            <button
              className="lb-restart-btn"
              onClick={() => dispatch({ type: "restart" } as LeafBlowerAction)}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
