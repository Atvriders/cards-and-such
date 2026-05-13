import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LaserMazeState, LaserMazeSettings } from "./state.js";
import type { LaserMazeAction } from "./state.js";
import { isTerminal, traceBeam } from "./state.js";
import type { MirrorType } from "./puzzles.js";
import "./LaserMaze.css";

const DIR_ARROW: Record<string, string> = {
  right: "→", left: "←", up: "↑", down: "↓"
};

type Tool = "/" | "\\" | "erase";

export function LaserMaze({ state, dispatch, onGameOver }: GameProps<LaserMazeState, LaserMazeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, placedMirrors, won } = state;
  const { size, grid, emitter, target, mirrorCount } = puzzle;
  const [tool, setTool] = useState<Tool>("/");

  const beam = traceBeam(puzzle, placedMirrors);
  const beamSet = new Set(beam.cells);

  // For each cell, what direction is the beam entering/exiting? We need this for rendering.
  // We'll just show "lit" cells and overlay a laser line.

  function handleCellClick(idx: number) {
    if (won) return;
    const cell = grid[idx]!;
    if (cell.wall || cell.mirror) return;
    if (idx === target) return;
    if (tool === "erase") {
      if (placedMirrors.has(idx)) {
        dispatch({ type: "removeMirror", idx } satisfies LaserMazeAction);
      }
    } else {
      if (placedMirrors.has(idx)) {
        // Toggle or remove
        const cur = placedMirrors.get(idx)!;
        if (cur === tool) {
          dispatch({ type: "removeMirror", idx } satisfies LaserMazeAction);
        } else {
          dispatch({ type: "placeMirror", idx, mirror: tool as MirrorType } satisfies LaserMazeAction);
        }
      } else {
        dispatch({ type: "placeMirror", idx, mirror: tool as MirrorType } satisfies LaserMazeAction);
      }
    }
  }

  // Emitter cell is outside grid — find which edge
  const emitterLabel = DIR_ARROW[emitter.dir] ?? "→";

  return (
    <div className="laser-maze fade-in">
      <div className="laser-maze-title">Laser Maze</div>
      <div className={`laser-maze-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Place ${mirrorCount} mirror(s). Placed: ${placedMirrors.size} | Moves: ${state.moves}`}
      </div>

      <div className="laser-maze-info">
        <span>Emitter: ({emitter.r},{emitter.c}) {emitterLabel}</span>
        <span>Target: ({Math.floor(target/size)},{target%size})</span>
      </div>

      <div className="laser-maze-grid" style={{ gridTemplateColumns: `repeat(${size}, 60px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const cell = grid[idx]!;
          const r = Math.floor(idx / size);
          const c = idx % size;
          const isTarget = idx === target;
          const isEmitter = r === emitter.r && c === emitter.c && !isTarget;
          const isLit = beamSet.has(idx);
          const placed = placedMirrors.get(idx);
          const fixedMirror = cell.mirror;

          let className = "lm-cell";
          if (cell.wall) className += " wall";
          else if (isEmitter) className += " emitter";
          else if (isTarget) className += " target";
          else if (isLit) className += " lit";

          return (
            <div
              key={idx}
              className={className}
              onClick={() => handleCellClick(idx)}
            >
              {cell.wall ? "▪" :
               isEmitter ? emitterLabel :
               isTarget ? (beam.hitTarget ? "★" : "◎") :
               fixedMirror ? <span className="lm-mirror-fixed">{fixedMirror}</span> :
               placed ? <span className="lm-mirror-placed">{placed}</span> :
               ""}
              {isLit && !cell.wall && !fixedMirror && !placed && (
                <div className="laser-line h" />
              )}
            </div>
          );
        })}
      </div>

      <div className="laser-maze-controls">
        <button
          className={`lm-mirror-btn${tool === "/" ? " selected" : ""}`}
          onClick={() => setTool("/")}
        >/ mirror</button>
        <button
          className={`lm-mirror-btn${tool === "\\" ? " selected" : ""}`}
          onClick={() => setTool("\\")}
        >\ mirror</button>
        <button
          className={`lm-mirror-btn erase${tool === "erase" ? " selected" : ""}`}
          onClick={() => setTool("erase")}
        >Erase</button>
      </div>

      <div className="laser-maze-hint">
        Select a mirror type, then click cells to place it. Red emitter fires {emitterLabel}, reach green target.
      </div>

      <div className="laser-maze-btns">
        <button data-testid="hint-target-laser-maze-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
