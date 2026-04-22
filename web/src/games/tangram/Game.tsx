import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TangramState, TangramAction, PieceId } from "./state.js";
import { getPieceDef, ALL_PIECES, getCells, isTerminal } from "./state.js";
import "./Game.css";

export function TangramGame({ state, dispatch }: GameProps<TangramState, Record<string, never>>): JSX.Element {
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);
  const terminal = isTerminal(state);

  // Build cell map
  const cellMap: Record<string, string> = {}; // "r,c" -> color
  for (const p of state.placedPieces) {
    const def = getPieceDef(p.id);
    for (const [r, c] of getCells(p.id, p.rotation, p.row, p.col)) {
      cellMap[`${r},${c}`] = def.color;
    }
  }

  // Build outline set
  const outlineSet = new Set(state.puzzle.outline.map(([r, c]) => `${r},${c}`));

  // Preview cells
  const previewCells = new Set<string>();
  if (state.selectedPiece && hoverCell) {
    const [hr, hc] = hoverCell;
    for (const [r, c] of getCells(state.selectedPiece, state.selectedRotation, hr, hc)) {
      if (r >= 0 && r < 10 && c >= 0 && c < 10) previewCells.add(`${r},${c}`);
    }
  }

  const placedIds = new Set(state.placedPieces.map(p => p.id));

  function handleCellClick(r: number, c: number) {
    if (terminal || !state.selectedPiece) return;
    dispatch({ type: "placePiece", row: r, col: c } satisfies TangramAction);
  }

  return (
    <div className="tangram">
      <div className="tangram-title">Tangram — {state.puzzle.name}</div>

      {terminal && (
        <div className="tangram-msg">Puzzle solved! Score: {state.score}</div>
      )}

      <div className="tangram-layout">
        <div className="tangram-grid-wrap">
          <div className="tangram-grid">
            {Array.from({ length: 10 }).map((_, r) =>
              Array.from({ length: 10 }).map((_, c) => {
                const key = `${r},${c}`;
                const placed = cellMap[key];
                const isOutline = outlineSet.has(key);
                const isPreview = previewCells.has(key);
                let bg = placed ?? (isOutline ? "rgba(0,0,0,0.08)" : "transparent");
                if (isPreview && !placed) bg = state.selectedPiece
                  ? `${getPieceDef(state.selectedPiece).color}88`
                  : "transparent";
                return (
                  <div
                    key={key}
                    className={`tangram-cell${isOutline && !placed ? " tangram-cell--outline" : ""}${placed ? " tangram-cell--placed" : ""}${isPreview ? " tangram-cell--preview" : ""}`}
                    style={{ background: bg }}
                    onClick={() => handleCellClick(r, c)}
                    onMouseEnter={() => setHoverCell([r, c])}
                    onMouseLeave={() => setHoverCell(null)}
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="tangram-pieces">
          <strong style={{ fontSize: "0.85rem" }}>Pieces:</strong>
          {ALL_PIECES.map(id => {
            const def = getPieceDef(id);
            const isPlaced = placedIds.has(id);
            const isSelected = state.selectedPiece === id;
            return (
              <button
                key={id}
                className={`tangram-piece-btn${isSelected ? " tangram-piece-btn--selected" : ""}${isPlaced ? " tangram-piece-btn--placed" : ""}`}
                style={{ borderLeftColor: def.color, borderLeftWidth: 6 }}
                onClick={() => {
                  if (isPlaced) {
                    dispatch({ type: "removePiece", pieceId: id } satisfies TangramAction);
                  } else {
                    dispatch({ type: "selectPiece", pieceId: id } satisfies TangramAction);
                  }
                }}
              >
                {def.label} {isPlaced ? "(click to remove)" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {!terminal && (
        <div className="tangram-controls">
          <button
            className="tangram-btn"
            onClick={() => dispatch({ type: "rotate" } satisfies TangramAction)}
          >
            Rotate (R: {state.selectedRotation * 90}°)
          </button>
        </div>
      )}

      <div className="tangram-hint">
        Select a piece, rotate it, then click a grid cell to place it. The shaded area is the target outline.
        Click a placed piece to remove and reposition it.
      </div>
    </div>
  );
}
