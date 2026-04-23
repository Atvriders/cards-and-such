import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShogiState, ShogiSettings, ShogiAction, ShogiBase } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

const PIECE_LABEL: Record<string, string> = {
  king: "王", rook: "飛", bishop: "角", gold: "金", silver: "銀",
  knight: "桂", lance: "香", pawn: "歩",
  prook: "龍", pbishop: "馬", psilver: "全", pknight: "圭", plance: "杏", ppawn: "と",
};

const CELL = 44;

export function Shogi({ state, dispatch, onGameOver }: GameProps<ShogiState, ShogiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === "sente" && !state.winner;
  const W = COLS * CELL; const H = ROWS * CELL;

  let statusText = ""; let statusClass = "";
  if (state.winner === "sente") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "gote") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot (Gote/White) thinking...";
  else if (state.selectedDrop) statusText = `Drop ${PIECE_LABEL[state.selectedDrop]} — click target square`;
  else if (state.selected !== null) statusText = "Select destination";
  else statusText = "Your turn — select a piece or drop from hand";

  function handleCellClick(sq: number) {
    if (!isMyTurn) return;
    if (state.selectedDrop) {
      if (state.legalTargets.includes(sq)) dispatch({ type: "drop", to: sq } satisfies ShogiAction);
      else dispatch({ type: "selectDrop", piece: state.selectedDrop } satisfies ShogiAction);
    } else if (state.selected !== null && state.legalTargets.includes(sq)) {
      dispatch({ type: "move", to: sq, promote: true } satisfies ShogiAction);
    } else {
      dispatch({ type: "select", sq } satisfies ShogiAction);
    }
  }

  const handEntries = Object.entries(state.senteHand).filter(([,v]) => v && v > 0) as [ShogiBase, number][];

  return (
    <div className="shogi-game">
      <div className={`shogi-status ${statusClass}`}>{statusText}</div>
      {/* Gote (bot) hand — shown at top */}
      <div className="shogi-hand" style={{ opacity: 0.6 }}>
        <div className="shogi-hand-label">Bot hand:</div>
        {Object.entries(state.goteHand).filter(([,v])=>v&&v>0).map(([t,cnt])=>(
          <span key={t} className="shogi-hand-piece">{PIECE_LABEL[t]}×{cnt}</span>
        ))}
      </div>
      <div className="shogi-board-wrap" style={{ width: W, height: H }}>
        {state.board.map((piece, sq) => {
          const r = Math.floor(sq / COLS); const c = sq % COLS;
          const isSelected = sq === state.selected;
          const isTarget = state.legalTargets.includes(sq);
          return (
            <div
              key={sq}
              className={`shogi-cell ${isSelected ? "selected" : ""} ${isTarget ? "target" : ""}`}
              style={{ left: c*CELL, top: r*CELL, width: CELL, height: CELL }}
              onClick={() => handleCellClick(sq)}
            >
              {piece && (
                <div className={`shogi-piece ${piece.color} ${piece.promoted ? "promoted" : ""}`}>
                  {PIECE_LABEL[piece.type] ?? "?"}
                </div>
              )}
              {!piece && isTarget && <div style={{ width:10,height:10,background:"rgba(0,180,0,0.5)",borderRadius:"50%" }}/>}
            </div>
          );
        })}
      </div>
      {/* Sente (player) hand */}
      <div className="shogi-hand">
        <div className="shogi-hand-label">Your hand (click to select drop):</div>
        {handEntries.map(([t,cnt])=>(
          <span
            key={t}
            className={`shogi-hand-piece ${state.selectedDrop===t?"selected-drop":""}`}
            onClick={() => isMyTurn && dispatch({ type: "selectDrop", piece: t } satisfies ShogiAction)}
          >
            {PIECE_LABEL[t]}×{cnt}
          </span>
        ))}
        {handEntries.length === 0 && <span style={{fontSize:"0.75rem",color:"#888"}}>empty</span>}
      </div>
    </div>
  );
}
