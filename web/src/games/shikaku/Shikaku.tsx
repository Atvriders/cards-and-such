import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShikakuState, ShikakuSettings, ShikakuAction } from "./state.js";
import { isTerminal, draftToRect, findClueInRect } from "./state.js";
import "./Shikaku.css";

const CELL = 48;
const COLORS = ["#bbdefb","#c8e6c9","#fff9c4","#ffe0b2","#f3e5f5","#e0f2f1","#fce4ec","#e8eaf6","#f1f8e9","#fff3e0","#e3f2fd","#fbe9e7"];

export function Shikaku({ state, dispatch, onGameOver }: GameProps<ShikakuState, ShikakuSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [dragging, setDragging] = useState(false);
  const { puzzle, placed, draft, won } = state;
  const { size, clues } = puzzle;

  // Build a color map: cell idx → color (from placed rects)
  const cellColor = new Array(size * size).fill(null) as (string | null)[];
  placed.forEach((rect, i) => {
    if (!rect) return;
    const color = COLORS[i % COLORS.length]!;
    for (let r = rect.r; r < rect.r + rect.h; r++)
      for (let c = rect.c; c < rect.c + rect.w; c++)
        cellColor[r * size + c] = color;
  });

  // Highlight draft rect cells
  const draftRect = draft ? draftToRect(draft) : null;
  const draftValid = draftRect ? findClueInRect(puzzle, draftRect) !== -1 : false;

  const clueMap = new Map(clues.map((cl, i) => [cl.r * size + cl.c, { cl, i }]));

  function handleMouseDown(r: number, c: number) {
    if (won) return;
    setDragging(true);
    dispatch({ type: "startDrag", r, c } satisfies ShikakuAction);
  }
  function handleMouseEnter(r: number, c: number) {
    if (!dragging) return;
    dispatch({ type: "updateDrag", r, c } satisfies ShikakuAction);
  }
  function handleMouseUp() {
    if (!dragging) return;
    setDragging(false);
    dispatch({ type: "endDrag" } satisfies ShikakuAction);
  }

  return (
    <div className="shikakumosaic" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="shikakumosaic-title">Shikaku</div>
      <div className={`shikakumosaic-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — drag to divide into rectangles`}
      </div>

      <div
        className="shikakumosaic-grid"
        style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}
      >
        {Array.from({ length: size * size }, (_, idx) => {
          const r = Math.floor(idx / size), c = idx % size;
          const clueInfo = clueMap.get(idx);
          const bg = cellColor[idx];
          const inDraft = draftRect
            ? r >= draftRect.r && r < draftRect.r + draftRect.h &&
              c >= draftRect.c && c < draftRect.c + draftRect.w
            : false;

          return (
            <div
              key={idx}
              className={["shikakumosaic-cell", inDraft ? (draftValid ? "draft-valid" : "draft-invalid") : ""].join(" ")}
              style={{ width: CELL, height: CELL, background: bg || undefined }}
              onMouseDown={() => handleMouseDown(r, c)}
              onMouseEnter={() => handleMouseEnter(r, c)}
            >
              {clueInfo ? <span className="shikakumosaic-clue">{clueInfo.cl.value}</span> : null}
            </div>
          );
        })}
      </div>

      <div className="shikakumosaic-btns">
        <button data-testid="hint-target-shikaku-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
