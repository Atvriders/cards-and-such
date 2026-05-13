import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HexMatchState, HexMatchSettings } from "./state.js";
import { isTerminal, allHexCells } from "./state.js";
import "./HexMatch3.css";

const HEX_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];
const HEX_W = 52;
const HEX_H = 52;
const GAP = 4;

function hexToPixel(q: number, r: number, radius: number): { x: number; y: number } {
  const cx = (radius + 1) * (HEX_W + GAP);
  const cy = (radius + 1) * (HEX_H * 0.75 + GAP);
  const x = cx + q * (HEX_W + GAP) + r * (HEX_W + GAP) * 0.5;
  const y = cy + r * (HEX_H * 0.75 + GAP);
  return { x, y };
}

export function HexMatch3({ state, dispatch, onGameOver }: GameProps<HexMatchState, HexMatchSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const terminal = isTerminal(state);
  const radius = parseInt(state.settings.radius, 10);
  const cells = allHexCells(radius);

  // Compute SVG container size
  const maxExtent = (radius + 2) * (HEX_W + GAP) * 2;
  const containerSize = maxExtent;

  return (
    <div className="hexmatch-game">
      <div className="hexmatch-header">
        <span>Score: {state.score}</span>
        <span>Moves: {state.moves} / {state.maxMoves}</span>
      </div>

      <div className="hexmatch-grid" style={{ width: containerSize, height: containerSize }}>
        {cells.map(({ q, r }) => {
          const key = `${q},${r}`;
          const colorIdx = state.tiles.get(key);
          if (colorIdx === undefined) return null;
          const { x, y } = hexToPixel(q, r, radius);
          const isSelected = state.selected?.q === q && state.selected?.r === r;
          return (
            <div
              key={key}
              className={`hexmatch-hex${isSelected ? " hexmatch-hex--selected" : ""}`}
              style={{
                left: x - HEX_W / 2,
                top: y - HEX_H / 2,
                background: HEX_COLORS[colorIdx % HEX_COLORS.length],
              }}
              onClick={() => dispatch({ type: "select", q, r })}
            />
          );
        })}
      </div>

      <div className="hexmatch-hint">Click a hex to select, click an adjacent hex to swap. Match 3+ in a line.</div>

      {terminal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: 12, zIndex: 10 }}>
          <h2 style={{ margin: 0 }}>Game Over</h2>
          <p style={{ margin: 0, color: "#ccc" }}>Final Score: {terminal.score}</p>
        </div>
      )}
    </div>
  );
}
