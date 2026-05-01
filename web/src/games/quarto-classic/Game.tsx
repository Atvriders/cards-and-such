import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuartoClassicState, QuartoClassicAction, QuartoClassicSettings } from "./state.js";
import { isTerminal, pieceAttrs, pieceLabel } from "./state.js";
import "./Game.css";

function PieceSvg({ piece, large }: { piece: number; large?: boolean }): JSX.Element {
  const a = pieceAttrs(piece);
  const size = large ? 48 : 32;
  const fill = a.light ? "#f4d35e" : "#3a3a45";
  const stroke = a.light ? "#a07c20" : "#0a0a18";
  const tall = a.tall;
  const square = a.square;
  const solid = a.solid;
  const inner = solid ? fill : "#0e0e1a";
  const w = size, h = tall ? size : size * 0.7;
  const yOffset = (size - h) / 2;
  if (square) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect x={(size - w * 0.85) / 2} y={yOffset + 2} width={w * 0.85} height={h - 4} rx={4} fill={fill} stroke={stroke} strokeWidth={2} />
        {!solid && <rect x={(size - w * 0.55) / 2} y={yOffset + h * 0.25} width={w * 0.55} height={h * 0.5} rx={2} fill={inner} />}
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <ellipse cx={size / 2} cy={size / 2} rx={w * 0.4} ry={h * 0.45} fill={fill} stroke={stroke} strokeWidth={2} />
      {!solid && <ellipse cx={size / 2} cy={size / 2} rx={w * 0.22} ry={h * 0.25} fill={inner} />}
    </svg>
  );
}

export function QuartoClassicGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<QuartoClassicState, QuartoClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  let banner = "";
  let cls = "quarto-banner";
  if (state.gameOver) {
    if (state.winner === "player") { banner = "You win!"; cls += " quarto-win"; }
    else if (state.winner === "bot") { banner = "Bot wins"; cls += " quarto-loss"; }
    else { banner = "Draw"; cls += " quarto-draw"; }
  } else if (state.phase === "place") {
    banner = state.toPlace !== null
      ? `Place this piece: ${pieceLabel(state.toPlace)}`
      : "Place piece";
  } else {
    banner = "Now choose a piece for the bot";
  }

  const winSet = new Set(state.winningLine ?? []);

  return (
    <div className="quarto-root">
      <div className="quarto-header">
        <div className="quarto-title">Quarto · 4×4</div>
        <div className={cls}>{banner}</div>
        <div className="quarto-bot">Bot: {state.settings.botStrength}</div>
      </div>
      {state.toPlace !== null && state.phase === "place" && !state.gameOver && (
        <div className="quarto-toplace">
          <span>To place:</span>
          <span className="quarto-toplace-piece"><PieceSvg piece={state.toPlace} large /></span>
        </div>
      )}
      <div className="quarto-board">
        {Array.from({ length: 16 }).map((_, i) => {
          const piece = state.board[i];
          const cls = ["quarto-cell", winSet.has(i) ? "quarto-win-cell" : ""].filter(Boolean).join(" ");
          return (
            <button
              key={i}
              className={cls}
              onClick={() => dispatch({ type: "place", cell: i } as QuartoClassicAction)}
              disabled={piece !== null || state.phase !== "place" || state.gameOver}
              aria-label={`cell-${i}`}
            >
              {piece !== null && piece !== undefined && <PieceSvg piece={piece as number} />}
            </button>
          );
        })}
      </div>
      {state.phase === "choose" && !state.gameOver && (
        <div className="quarto-choose">
          <div className="quarto-choose-label">Pick a piece for the bot:</div>
          <div className="quarto-choose-grid">
            {state.remaining.map((p) => (
              <button
                key={p}
                className="quarto-choose-piece"
                onClick={() => dispatch({ type: "choose", piece: p } as QuartoClassicAction)}
                title={pieceLabel(p)}
              >
                <PieceSvg piece={p} />
                <span className="quarto-choose-label-small">{pieceLabel(p)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {state.gameOver && (
        <button className="quarto-restart" onClick={() => dispatch({ type: "restart" } as QuartoClassicAction)}>
          New game
        </button>
      )}
      <div className="quarto-foot">Pieces left: {state.remaining.length + (state.toPlace !== null ? 1 : 0)}</div>
    </div>
  );
}
