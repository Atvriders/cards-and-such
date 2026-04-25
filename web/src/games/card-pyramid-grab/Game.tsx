import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPyramidGrabState, CardPyramidGrabAction, CardPyramidGrabSettings } from "./state.js";
import { isTerminal, cardName, cardPoints } from "./state.js";
import "./Game.css";

export function CardPyramidGrab({ state, dispatch, onGameOver }: GameProps<CardPyramidGrabState, CardPyramidGrabSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") return (
    <div className="cpg-wrap"><div className="cpg-done">
      <h2>Pyramid Cleared!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#9b59b6" }}>{state.score} pts</p>
    </div></div>
  );

  return (
    <div className="cpg-wrap">
      <div className="cpg-header">
        <span>Row {state.currentRow + 1} / {state.maxRows}</span>
        <span className="cpg-score">{state.score} pts</span>
      </div>
      <p className="cpg-hint">{state.selectedInRow === null ? "Pick a card from this row:" : "You picked — press Next to continue."}</p>
      <div className="cpg-rows">
        {state.pyramid.map((row, ri) => (
          <div key={ri} className={`cpg-row ${ri === state.currentRow ? "active" : ri < state.currentRow ? "done" : "future"}`}>
            {row.map((card, ci) => {
              const isRevealed = state.revealed[ri]?.[ci] ?? false;
              const isCurrent = ri === state.currentRow;
              return (
                <button key={ci} className={`cpg-card ${isRevealed ? "revealed" : ""} ${isCurrent && !isRevealed && state.selectedInRow === null ? "pickable" : ""}`}
                  onClick={() => isCurrent && state.selectedInRow === null && dispatch({ type: "pick", col: ci } as CardPyramidGrabAction)}
                  disabled={!isCurrent || state.selectedInRow !== null}>
                  {isRevealed ? <><span>{cardName(card)}</span><small>+{cardPoints(card)}</small></> : "?"}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {state.selectedInRow !== null && (
        <button className="cpg-btn" onClick={() => dispatch({ type: "next" } as CardPyramidGrabAction)}>
          {state.currentRow + 1 >= state.maxRows ? "Finish" : "Next Row"}
        </button>
      )}
    </div>
  );
}
