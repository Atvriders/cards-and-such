import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardLow3State, CardLow3Action, CardLow3Settings } from "./state.js";
import { cardName, isTerminal } from "./state.js";
import "./Game.css";

export function CardLow3({ state, dispatch, onGameOver }: GameProps<CardLow3State, CardLow3Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isRed = (c: number) => { const s = Math.floor(c / 13); return s === 1 || s === 2; };

  return (
    <div className="cm-wrap">
      <div className="cm-round">Round {state.round} / {state.maxRounds}</div>
      <div className="cm-score">Score: {state.score}</div>
      {!terminal ? (
        <>
          <div className="cm-prompt">Deal 3 cards — lowest sum wins most points!</div>
          {state.hand ? (
            <>
              <div className="cm-cards">
                {state.hand.map((c, i) => (
                  <div key={i} className={`cm-card ${isRed(c) ? "red" : ""}`}>{cardName(c)}</div>
                ))}
              </div>
              <div className={`cm-result ${(state.lastSum ?? 99) <= 15 ? "good" : "bad"}`}>
                Sum: {state.lastSum} — {(state.lastSum ?? 99) <= 9 ? "+20!" : (state.lastSum ?? 99) <= 15 ? "+10" : (state.lastSum ?? 99) <= 21 ? "+5" : "No points"}
              </div>
              <button data-testid="hint-target-card-low-3-primary" className="cm-btn" onClick={() => dispatch({ type: "next" } as CardLow3Action)}>Next</button>
            </>
          ) : (
            <button className="cm-btn" onClick={() => dispatch({ type: "deal" } as CardLow3Action)}>Deal</button>
          )}
        </>
      ) : (
        <div className="cm-done"><h2>Done!</h2><div className="cm-final">Score: {state.score}</div></div>
      )}
    </div>
  );
}
