import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PentalathState } from "./state.js";
import { isTerminal, allHexes, hexKey, onBoard } from "./state.js";
import "./Game.css";

type PentalathSettings = Record<string, never>;

const HEX_SIZE = 22;
const CX = 240, CY = 240;

function hexToPixel(q: number, r: number): { x: number; y: number } {
  const x = HEX_SIZE * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
  const y = HEX_SIZE * (3 / 2 * r);
  return { x: CX + x, y: CY + y };
}

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 6) + (Math.PI / 3) * i;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

export function PentalathGame({ state, dispatch, onGameOver }: GameProps<PentalathState, PentalathSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! 5 connected!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isHumanTurn) statusText = "Bot thinking…";
  else statusText = "Click any empty hex to place your stone.";

  const hexes = allHexes();

  return (
    <div className="pentalath">
      <div className={`penta-status ${statusClass}`}>{statusText}</div>
      <svg className="penta-svg" width={480} height={480} viewBox="0 0 480 480">
        {hexes.map(({ q, r }) => {
          const { x, y } = hexToPixel(q, r);
          const key = hexKey(q, r);
          const owner = state.board.get(key);
          const isEmpty = owner === null;

          const fill = owner === 0 ? "#222"
            : owner === 1 ? "#f0f0f0"
            : (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) % 4 < 2 ? "#d4c090" : "#c8b07a";

          return (
            <g key={key}
              onClick={() => { if (isHumanTurn && isEmpty) dispatch({ type: "place", q, r }); }}
              style={{ cursor: isHumanTurn && isEmpty ? "pointer" : "default" }}>
              <polygon points={hexPoints(x, y, HEX_SIZE - 1)}
                fill={fill} stroke="#8b6020" strokeWidth={1} />
              {owner === 0 && <circle cx={x} cy={y} r={HEX_SIZE * 0.5} fill="#333" stroke="#111" strokeWidth={1} />}
              {owner === 1 && <circle cx={x} cy={y} r={HEX_SIZE * 0.5} fill="#eee" stroke="#aaa" strokeWidth={1} />}
              {isEmpty && isHumanTurn && (
                <polygon points={hexPoints(x, y, HEX_SIZE - 1)} fill="transparent" stroke="none" />
              )}
            </g>
          );
        })}
      </svg>
      <div className="penta-legend">
        <span className="penta-dark">● You (dark) — connect 5</span>
        <span className="penta-light">● Bot (light) — connect 5</span>
      </div>
    </div>
  );
}
