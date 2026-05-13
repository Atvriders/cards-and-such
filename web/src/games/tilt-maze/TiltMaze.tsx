import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TiltMazeState, TiltMazeSettings, TiltMazeAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./TiltMaze.css";

const CELL = 60;
const WALL_THICK = 5;
const BALL_PAD = 6;

export function TiltMaze({
  state,
  dispatch,
  onGameOver,
}: GameProps<TiltMazeState, TiltMazeSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const tilt = useCallback((dir: TiltMazeAction["dir"]) => {
    if (!state.won) dispatch({ type: "tilt", dir });
  }, [state.won, dispatch]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowUp") { e.preventDefault(); tilt("up"); }
      else if (e.key === "ArrowDown") { e.preventDefault(); tilt("down"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); tilt("left"); }
      else if (e.key === "ArrowRight") { e.preventDefault(); tilt("right"); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tilt]);

  const boardW = state.cols * CELL;
  const boardH = state.rows * CELL;
  const ballX = state.ballCol * CELL + BALL_PAD;
  const ballY = state.ballRow * CELL + BALL_PAD;
  const ballSize = CELL - BALL_PAD * 2;
  const goalX = state.goalCol * CELL + BALL_PAD;
  const goalY = state.goalRow * CELL + BALL_PAD;
  const onGoal = state.ballCol === state.goalCol && state.ballRow === state.goalRow;

  return (
    <div className="tilt-maze fade-in">
      <div className="tilt-maze-info">
        <span>Tilts: {state.moves}</span>
        <span>Get the ball to the orange goal</span>
      </div>

      <div className={`tilt-maze-status${state.won ? " win" : ""}`}>
        {state.won ? "Ball reached the goal! Solved!" : "Tilt the maze to roll the ball"}
      </div>

      <div className="tilt-maze-board" style={{ width: boardW, height: boardH }}>
        {/* Goal */}
        <div
          className="tilt-maze-cell goal"
          style={{ left: goalX, top: goalY, width: ballSize, height: ballSize }}
        />
        {/* Horizontal walls (below row r) */}
        {state.hWalls.map((wk) => {
          const [r, c] = wk.split(",").map(Number);
          return (
            <div
              key={`h-${wk}`}
              className="tilt-maze-hwall"
              style={{
                left: (c ?? 0) * CELL,
                top: ((r ?? 0) + 1) * CELL - WALL_THICK / 2,
                width: CELL,
                height: WALL_THICK,
              }}
            />
          );
        })}
        {/* Vertical walls (right of col c) */}
        {state.vWalls.map((wk) => {
          const [r, c] = wk.split(",").map(Number);
          return (
            <div
              key={`v-${wk}`}
              className="tilt-maze-vwall"
              style={{
                left: ((c ?? 0) + 1) * CELL - WALL_THICK / 2,
                top: (r ?? 0) * CELL,
                width: WALL_THICK,
                height: CELL,
              }}
            />
          );
        })}
        {/* Ball */}
        <div
          className={`tilt-maze-ball${onGoal ? " on-goal" : ""}`}
          style={{ left: ballX, top: ballY, width: ballSize, height: ballSize }}
        />
      </div>

      <div className="tilt-maze-controls">
        <div className="tilt-btn empty-slot" />
        <button data-testid="hint-target-tilt-maze-action" className="tilt-btn" onClick={() => tilt("up")} disabled={state.won} aria-label="tilt up">▲</button>
        <div className="tilt-btn empty-slot" />
        <button className="tilt-btn" onClick={() => tilt("left")} disabled={state.won} aria-label="tilt left">◀</button>
        <div className="tilt-btn empty-slot" />
        <button className="tilt-btn" onClick={() => tilt("right")} disabled={state.won} aria-label="tilt right">▶</button>
        <div className="tilt-btn empty-slot" />
        <button className="tilt-btn" onClick={() => tilt("down")} disabled={state.won} aria-label="tilt down">▼</button>
        <div className="tilt-btn empty-slot" />
      </div>
    </div>
  );
}
