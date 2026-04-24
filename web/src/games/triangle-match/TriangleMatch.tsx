import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TriangleMatchState, TriangleMatchSettings } from "./state.js";
import { isTerminal, findGroup, NUM_ROWS } from "./state.js";
import "./TriangleMatch.css";

const TRI_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c"];
const SIDE = 44; // side length of each triangle in px

export function TriangleMatch({ state, dispatch }: GameProps<TriangleMatchState, TriangleMatchSettings>): JSX.Element {
  const terminal = isTerminal(state);

  // Compute points for triangle (row r, col c)
  // Row r has 2r+1 triangles. Each has base = SIDE, height = SIDE * √3/2
  const H = SIDE * (Math.sqrt(3) / 2);
  const totalWidth = (2 * NUM_ROWS - 1) * (SIDE / 2) + SIDE / 2;
  const totalHeight = NUM_ROWS * H + 4;

  function triPoints(r: number, c: number): string {
    // Row r spans from x = (MAX_ROW - r) * SIDE/2 to that + (2r+1)*SIDE/2
    const rowStart = (NUM_ROWS - 1 - r) * (SIDE / 2);
    const isUp = (r + c) % 2 === 0;
    const x0 = rowStart + c * (SIDE / 2);
    const y0 = r * H;

    if (isUp) {
      // Up triangle: apex top, base bottom
      const apex = [x0 + SIDE / 2, y0];
      const bl = [x0, y0 + H];
      const br = [x0 + SIDE, y0 + H];
      return `${apex[0]},${apex[1]} ${bl[0]},${bl[1]} ${br[0]},${br[1]}`;
    } else {
      // Down triangle: base top, apex bottom
      const tl = [x0, y0];
      const tr = [x0 + SIDE, y0];
      const apex = [x0 + SIDE / 2, y0 + H];
      return `${tl[0]},${tl[1]} ${tr[0]},${tr[1]} ${apex[0]},${apex[1]}`;
    }
  }

  return (
    <div className="trimatch-game">
      <div className="trimatch-header">Score: {state.score}</div>

      <svg
        className="trimatch-svg"
        width={totalWidth + 8}
        height={totalHeight + 8}
        viewBox={`-4 -4 ${totalWidth + 8} ${totalHeight + 8}`}
      >
        {Array.from({ length: NUM_ROWS }, (_, r) =>
          Array.from({ length: 2 * r + 1 }, (_, c) => {
            const color = state.grid[r]?.[c];
            if (color === undefined || color === -1) return null;
            const pts = triPoints(r, c);
            const fill = TRI_COLORS[color % TRI_COLORS.length] ?? "#888";
            return (
              <polygon
                key={`${r},${c}`}
                points={pts}
                fill={fill}
                stroke="#111"
                strokeWidth={2}
                onClick={() => dispatch({ type: "click", row: r, col: c })}
                style={{ cursor: "pointer", transition: "filter 0.1s" }}
                onMouseEnter={(e) => { (e.target as SVGElement).style.filter = "brightness(1.4)"; }}
                onMouseLeave={(e) => { (e.target as SVGElement).style.filter = ""; }}
              />
            );
          })
        )}
      </svg>

      <div className="trimatch-hint">Click a group of 3+ same-color triangles to remove them.</div>

      {terminal && (
        <div className="trimatch-overlay">
          <h2>No More Groups</h2>
          <p>Final Score: {terminal.score}</p>
        </div>
      )}
    </div>
  );
}
