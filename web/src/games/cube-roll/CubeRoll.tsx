import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CubeRollState, CubeRollSettings, CubeRollAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./CubeRoll.css";

const FACE_EMOJI = ["", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣"];

export function CubeRoll({
  state,
  dispatch,
  onGameOver,
}: GameProps<CubeRollState, CubeRollSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const move = useCallback((dir: CubeRollAction["dir"]) => {
    if (!state.won) dispatch({ type: "move", dir });
  }, [state.won, dispatch]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp") { e.preventDefault(); move("up"); }
      else if (e.key === "ArrowDown") { e.preventDefault(); move("down"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); move("left"); }
      else if (e.key === "ArrowRight") { e.preventDefault(); move("right"); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const topFace = state.faces[0]!;

  return (
    <div className="cube-roll">
      <div className="cube-roll-info">
        <span>Moves: {state.moves}</span>
        <span className="cube-roll-target">Target top face: {FACE_EMOJI[state.targetFace]}</span>
        <span className="cube-roll-die">Current top: {FACE_EMOJI[topFace]}</span>
      </div>

      <div className={`cube-roll-status${state.won ? " win" : ""}`}>
        {state.won
          ? "Solved! Correct face up at goal!"
          : "Roll the cube to the orange goal with the target face on top"}
      </div>

      <div
        className="cube-roll-grid"
        style={{ gridTemplateColumns: `repeat(${state.cols}, 56px)` }}
      >
        {Array.from({ length: state.rows }, (_, r) =>
          Array.from({ length: state.cols }, (_, c) => {
            const isCube = c === state.col && r === state.row;
            const isGoal = c === state.goalCol && r === state.goalRow;
            return (
              <div
                key={`${r}-${c}`}
                className={`cube-roll-cell ${isCube ? "cube" : ""} ${isGoal ? "goal" : ""} ${!isCube && !isGoal ? "empty" : ""}`}
              >
                {isCube ? FACE_EMOJI[topFace] : isGoal ? FACE_EMOJI[state.targetFace] : ""}
              </div>
            );
          })
        )}
      </div>

      <div className="cube-roll-controls">
        <div className="cube-roll-btn empty-btn" />
        <button className="cube-roll-btn" onClick={() => move("up")} disabled={state.won} aria-label="up">▲</button>
        <div className="cube-roll-btn empty-btn" />
        <button className="cube-roll-btn" onClick={() => move("left")} disabled={state.won} aria-label="left">◀</button>
        <div className="cube-roll-btn empty-btn" />
        <button className="cube-roll-btn" onClick={() => move("right")} disabled={state.won} aria-label="right">▶</button>
        <div className="cube-roll-btn empty-btn" />
        <button className="cube-roll-btn" onClick={() => move("down")} disabled={state.won} aria-label="down">▼</button>
        <div className="cube-roll-btn empty-btn" />
      </div>
    </div>
  );
}
