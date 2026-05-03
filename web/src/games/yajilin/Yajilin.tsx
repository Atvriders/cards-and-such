import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { YajilinState, YajilinSettings } from "./state.js";
import type { YajilinAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Yajilin.css";

const CELL = 48;
const ARROW: Record<string, string> = { up: "↑", down: "↓", left: "←", right: "→" };

export function Yajilin({ state, dispatch, onGameOver }: GameProps<YajilinState, YajilinSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, cells, won } = state;
  const { size, clues } = puzzle;
  const clueMap = new Map(clues.map(c => [c.idx, c]));

  return (
    <div className="yajilin">
      <div className="yajilin-title">Yajilin</div>
      <div className={`yajilin-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — draw a loop; shade clue-count cells`}
      </div>

      <div className="yajilin-grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const clue = clueMap.get(idx);
          if (clue) {
            return (
              <div key={idx} className="yajilin-cell clue" style={{ width: CELL, height: CELL }}>
                <span className="yajilin-arrow">{ARROW[clue.dir]}</span>
                <span className="yajilin-count">{clue.count}</span>
              </div>
            );
          }
          const cell = cells[idx]!;
          return (
            <div
              key={idx}
              className={`yajilin-cell ${cell}`}
              style={{ width: CELL, height: CELL }}
              onClick={() => !won && dispatch({ type: "clickCell", idx } satisfies YajilinAction)}
            >
              {cell === "loop" ? "○" : ""}
            </div>
          );
        })}
      </div>

      <div className="yajilin-legend">Click: empty → loop (○) → shaded → empty</div>
      <div className="yajilin-btns">
        <button data-testid="hint-target-yajilin-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
