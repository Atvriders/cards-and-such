import type { Coord } from "./index.js";
import type { Grid } from "./index.js";
import "./Board.css";

interface Props<T> {
  grid: Grid<T>;
  renderCell: (coord: Coord, value: T) => React.ReactNode;
  onCellClick?: (coord: Coord) => void;
  highlight?: Coord[];     // cells to emphasize (win line)
  cellSize?: number;       // px, default 64
}

export function Board<T>({ grid, renderCell, onCellClick, highlight, cellSize = 64 }: Props<T>): JSX.Element {
  const highlightSet = new Set((highlight ?? []).map((c) => `${c.row},${c.col}`));
  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${grid.rows}, ${cellSize}px)`,
      }}
      role="grid"
    >
      {[...grid.coords()].map((c) => {
        const key = `${c.row},${c.col}`;
        return (
          <div
            key={key}
            role="gridcell"
            className={`cell ${highlightSet.has(key) ? "highlight" : ""}`}
            onClick={() => onCellClick?.(c)}
            data-testid={`cell-${c.row}-${c.col}`}
          >
            {renderCell(c, grid.get(c))}
          </div>
        );
      })}
    </div>
  );
}
