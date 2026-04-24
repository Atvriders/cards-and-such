import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TumbleweedState } from "./state.js";
import { isTerminal, getLegalMoves, countLOS, hexKey, onBoard, allHexes } from "./state.js";
import "./Game.css";

type TumbleweedSettings = Record<string, never>;

const HEX_SIZE = 30;
const CX = 220, CY = 220;

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

export function TumbleweedGame({ state, dispatch, onGameOver }: GameProps<TumbleweedState, TumbleweedSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;
  const legalMoves = isHumanTurn ? getLegalMoves(state.board, 0) : [];
  const legalSet = new Set(legalMoves.map((m) => hexKey(m.q, m.r)));

  let humanScore = 0, botScore = 0;
  for (const cell of state.board.values()) {
    if (cell.owner === 0) humanScore++;
    else if (cell.owner === 1) botScore++;
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = `You win! ${humanScore}–${botScore}`; statusClass = "win"; }
  else if (state.winner === 1) { statusText = `Bot wins! ${botScore}–${humanScore}`; statusClass = "loss"; }
  else if (!isHumanTurn) statusText = "Bot thinking…";
  else if (legalMoves.length === 0) statusText = "No moves available — pass.";
  else statusText = "Click a highlighted hex to place, or Pass.";

  const hexes = allHexes();

  return (
    <div className="tumbleweed">
      <div className={`tw-status ${statusClass}`}>{statusText}</div>
      <div className="tw-score">
        <span>You: {humanScore}</span>
        <span>Bot: {botScore}</span>
      </div>
      <svg className="tw-svg" width={440} height={440} viewBox="0 0 440 440">
        {hexes.map(({ q, r }) => {
          const { x, y } = hexToPixel(q, r);
          const key = hexKey(q, r);
          const cell = state.board.get(key);
          const isLegal = legalSet.has(key);
          const los = isHumanTurn ? countLOS(state.board, q, r, 0) : 0;

          const fill = cell?.owner === 0 ? "#3355cc"
            : cell?.owner === 1 ? "#cccccc"
            : isLegal ? "#aaffaa"
            : "#d4c090";
          const stroke = isLegal ? "#22aa22" : "#8b6020";

          return (
            <g key={key}
              onClick={() => { if (isHumanTurn && isLegal) dispatch({ type: "place", q, r }); }}
              style={{ cursor: isHumanTurn && isLegal ? "pointer" : "default" }}>
              <polygon points={hexPoints(x, y, HEX_SIZE - 2)} fill={fill} stroke={stroke} strokeWidth={isLegal ? 2 : 1} />
              {cell && cell.owner !== null && (
                <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight="bold"
                  fill={cell.owner === 0 ? "#fff" : "#333"}>{cell.stack}</text>
              )}
              {isLegal && !cell?.owner !== undefined && los > 0 && !cell?.owner !== null && (
                <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fill="#226622">{los}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="tw-controls">
        {isHumanTurn && (
          <button className="tw-pass-btn" onClick={() => dispatch({ type: "pass" })}>
            Pass
          </button>
        )}
      </div>
      <div className="tw-legend">
        <span className="tw-human">■ You (dark blue)</span>
        <span className="tw-bot">■ Bot (light grey)</span>
        <span className="tw-hint">Green = legal placements (showing LOS)</span>
      </div>
    </div>
  );
}
