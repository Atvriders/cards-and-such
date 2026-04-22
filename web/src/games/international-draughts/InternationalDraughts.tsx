import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IDState, IDSettings, IDPiece } from "./state.js";
import type { IDAction } from "./state.js";
import { isTerminal, getLegalMoves } from "./state.js";
import type { Coord } from "../../engines/grid/index.js";
import "./InternationalDraughts.css";

export function InternationalDraughts({
  state,
  dispatch,
  onGameOver,
}: GameProps<IDState, IDSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Coord | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => { setSelected(null); }, [state.turn, state.mustContinueFrom]);

  const isPlayerTurn = state.turn === "white";
  const legalMoves = isPlayerTurn && !terminal
    ? getLegalMoves(state.grid, state.turn, state.mustContinueFrom)
    : [];

  const selectedMoves = selected
    ? legalMoves.filter((m) => m.from.row === selected.row && m.from.col === selected.col)
    : [];
  const legalTargets = new Set(selectedMoves.map((m) => `${m.to.row},${m.to.col}`));
  const legalSources = new Set(legalMoves.map((m) => `${m.from.row},${m.from.col}`));

  function handleCellClick(c: Coord) {
    if (terminal || !isPlayerTurn) return;
    const key = `${c.row},${c.col}`;
    if (selected && legalTargets.has(key)) {
      dispatch({ type: "move", from: selected, to: c } as IDAction);
      setSelected(null);
      return;
    }
    if (state.mustContinueFrom) {
      const mcf = state.mustContinueFrom;
      if (c.row === mcf.row && c.col === mcf.col) setSelected(c);
      return;
    }
    if (legalSources.has(key)) {
      const p = state.grid.get(c);
      if (p && p.color === state.turn) { setSelected(c); return; }
    }
    setSelected(null);
  }

  function getCellClass(c: Coord): string {
    const isDark = (c.row + c.col) % 2 === 1;
    const base = isDark ? "id-dark-square" : "id-light-square";
    const key = `${c.row},${c.col}`;
    const isSelected = selected && selected.row === c.row && selected.col === c.col;
    const isMustContinue = state.mustContinueFrom && state.mustContinueFrom.row === c.row && state.mustContinueFrom.col === c.col;
    if (isSelected) return `${base} selected-source`;
    if (legalTargets.has(key)) return `${base} legal-target`;
    if (isMustContinue) return `${base} must-continue`;
    return base;
  }

  function renderPiece(p: IDPiece | null) {
    if (!p) return null;
    return <div className={`id-piece ${p.color}`}>{p.king ? "♛" : ""}</div>;
  }

  const CELL_SIZE = 50;

  let statusText = "";
  let statusClass = "";
  if (state.winner === "white") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "black") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.mustContinueFrom) { statusText = "Continue jumping!"; }
  else { statusText = state.turn === "white" ? "Your turn (White)" : "Bot thinking..."; }

  return (
    <div className="intl-draughts">
      <div className="intl-draughts-info">
        <span>International Draughts (10×10)</span>
        <span>{state.settings.opponent}</span>
      </div>
      <div className={`intl-draughts-status ${statusClass}`}>{statusText}</div>
      <div className="intl-draughts-board-wrap">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(10, ${CELL_SIZE}px)`, border: "2px solid #555" }}>
          {[...state.grid.coords()].map((c) => (
            <div
              key={`${c.row}-${c.col}`}
              className={`cell ${getCellClass(c)}`}
              style={{ width: CELL_SIZE, height: CELL_SIZE, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onClick={() => handleCellClick(c)}
            >
              {renderPiece(state.grid.get(c))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
