import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BingoState, BingoAction, BingoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Bingo.css";

const COL_LABELS = ["B", "I", "N", "G", "O"];

export function Bingo({
  state,
  dispatch,
  onGameOver,
}: GameProps<BingoState, BingoSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const gameOver = state.gameOver;

  return (
    <div className="bingo-game">
      <div className="bingo-title">B I N G O</div>

      {/* Draw area */}
      <div className="bingo-draw-area">
        <div className="bingo-current-number">
          {state.currentNumber !== null ? state.currentNumber : "—"}
        </div>
        <div className="bingo-draw-info">
          Drawn: {state.drawCount} / 75
        </div>
        {!gameOver && (
          <button data-testid="hint-target-bingo-action"
            className="bingo-draw-button"
            onClick={() => dispatch({ type: "draw" })}
            disabled={state.drawCount >= 75}
          >
            Draw Number
          </button>
        )}
      </div>

      {/* Opponents status */}
      <div className="bingo-opponents">
        {state.opponentCards.map((_, i) => (
          <div key={i} className={`bingo-opp${state.opponentWon === i ? " won" : ""}`}>
            Bot {i + 1}: {state.opponentWon === i ? "BINGO!" : "playing"}
          </div>
        ))}
      </div>

      {/* Bingo card */}
      <div className="bingo-card-section">
        <div className="bingo-column-headers">
          {COL_LABELS.map((l) => <div key={l} className="bingo-col-header">{l}</div>)}
        </div>
        <div className="bingo-card">
          {state.card.map((row, r) =>
            row.map((num, c) => {
              const isFree = r === 2 && c === 2;
              const isMarked = state.marked[r]![c]!;
              const isCallable = !isMarked && !isFree && num === state.currentNumber;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`bingo-cell${isFree ? " free" : isMarked ? " marked" : isCallable ? " callable" : ""}`}
                  onClick={() => isCallable ? dispatch({ type: "mark", row: r, col: c }) : undefined}
                >
                  {isFree ? "FREE" : num}
                </div>
              );
            })
          )}
        </div>
      </div>

      {!gameOver && state.currentNumber !== null && (
        <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>
          Click your highlighted number to mark it!
        </div>
      )}

      {gameOver && (
        <div className="bingo-game-over">
          {state.playerWon ? (
            <>
              BINGO! You win!
              <br />
              <span style={{ fontSize: "0.9rem", opacity: 0.75 }}>
                {state.drawCount} numbers drawn — Score: {terminal?.score}
              </span>
            </>
          ) : (
            <>Bot got BINGO first! Better luck next time.</>
          )}
        </div>
      )}
    </div>
  );
}
