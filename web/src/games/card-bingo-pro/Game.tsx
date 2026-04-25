import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardBingoPro, CardBingoProSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const COL_LABELS = ["B", "I", "N", "G", "O"];

export function CardBingoProGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CardBingoPro, CardBingoProSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="cbp-game">
      <div className="cbp-title">Card Bingo Pro</div>

      <div className="cbp-hud">
        <span>Drawn: {state.drawn.length}/75</span>
        {state.lastDrawn !== null && <span className="cbp-last">Last: {state.lastDrawn}</span>}
      </div>

      {/* Bingo Cards */}
      <div className="cbp-cards-row">
        {state.cards.map((card, ci) => (
          <div key={ci} className={`cbp-card${state.bingoCards.includes(ci) ? " bingo-card" : ""}`}>
            <div className="cbp-col-labels">
              {COL_LABELS.map(l => <div key={l} className="cbp-col-label">{l}</div>)}
            </div>
            <div className="cbp-grid">
              {card.map((num, i) => (
                <div
                  key={i}
                  className={`cbp-cell${state.marked[ci]![i] ? " marked" : ""}${num === 0 ? " free" : ""}${num === state.lastDrawn ? " just-drawn" : ""}`}
                >
                  {num === 0 ? "FREE" : num}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Drawn numbers ticker */}
      <div className="cbp-drawn-list">
        {state.drawn.slice(-10).map((n, i) => (
          <span key={i} className="cbp-drawn-num">{n}</span>
        ))}
      </div>

      {!state.gameOver && (
        <button className="cbp-draw-btn" onClick={() => dispatch({ type: "draw" })}>
          Draw Number
        </button>
      )}

      {state.gameOver && (
        <div className="cbp-result">
          BINGO! Score: {terminal?.score}
          <div className="cbp-result-sub">{state.drawn.length} numbers drawn</div>
        </div>
      )}
    </div>
  );
}
