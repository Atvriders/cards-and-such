import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardRankGuessState, CardRankGuessAction, CardRankGuessSettings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import "./Game.css";

const RANKS = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

export function CardRankGuess({ state, dispatch, onGameOver }: GameProps<CardRankGuessState, CardRankGuessSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  }

  return (
    <div className="card-game-wrap">
      <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
      {state.revealed ? (
        <>
          <div className="card-game-cards">
            <div className="playing-card" style={{ fontSize: "2rem" }}>{cardName(state.card)}</div>
          </div>
          <p className={`result-msg ${state.lastPoints === 50 ? "win" : state.lastPoints === 20 ? "tie" : "lose"}`}>
            {state.lastPoints === 50 ? `Exact! +50` : state.lastPoints === 20 ? `Close! +20` : "Off by more than 2 — no points"}
          </p>
          {state.phase === "result" && <button className="bet-btn" onClick={() => dispatch({ type: "next" } as CardRankGuessAction)}>Next</button>}
        </>
      ) : (
        <>
          <p style={{ fontSize: "1rem", color: "#555", textAlign: "center" }}>A card is face-down. Guess its rank!</p>
          <div className="card-game-bets" style={{ flexWrap: "wrap", maxWidth: "360px" }}>
            {RANKS.map((r, i) => (
              <button key={r} className="bet-btn" style={{ padding: "8px 12px", minWidth: "48px" }}
                onClick={() => dispatch({ type: "guess", rank: i } as CardRankGuessAction)}>{r}</button>
            ))}
          </div>
          <p style={{ fontSize: "0.85rem", color: "#888" }}>Exact = 50 pts | Within 2 ranks = 20 pts</p>
        </>
      )}
    </div>
  );
}
