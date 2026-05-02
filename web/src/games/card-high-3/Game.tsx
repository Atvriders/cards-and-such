import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardHigh3State, CardHigh3Action, CardHigh3Settings } from "./state.js";
import { cardName, isTerminal } from "./state.js";
import "./Game.css";

export function CardHigh3({ state, dispatch, onGameOver }: GameProps<CardHigh3State, CardHigh3Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isRed = (c: number) => { const s = Math.floor(c / 13); return s === 1 || s === 2; };

  return (
    <div className="cm-wrap">
      <div className="cm-round">Round {state.round} / {state.maxRounds}</div>
      <div className="cm-score">Score: {state.score}</div>
      {!terminal ? (
        <>
          <div className="cm-prompt">Deal 3 cards — highest sum wins most points!</div>
          {state.hand ? (
            <>
              <div className="cm-cards">
                {state.hand.map((c, i) => (
                  <div key={i} className={`cm-card ${isRed(c) ? "red" : ""}`}>{cardName(c)}</div>
                ))}
              </div>
              <div className={`cm-result ${(state.lastSum ?? 0) >= 24 ? "good" : "bad"}`}>
                Sum: {state.lastSum} — {(state.lastSum ?? 0) >= 30 ? "+20!" : (state.lastSum ?? 0) >= 24 ? "+10" : (state.lastSum ?? 0) >= 18 ? "+5" : "No points"}
              </div>
              <button data-testid="hint-target-card-high-3-primary" className="cm-btn" onClick={() => dispatch({ type: "next" } as CardHigh3Action)}>Next</button>
            </>
          ) : (
            <button className="cm-btn" onClick={() => dispatch({ type: "deal" } as CardHigh3Action)}>Deal</button>
          )}
        </>
      ) : (
        <div className="cm-done"><h2>Done!</h2><div className="cm-final">Score: {state.score}</div></div>
      )}
    </div>
  );
}
