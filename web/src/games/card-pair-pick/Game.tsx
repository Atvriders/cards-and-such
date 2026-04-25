import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPairPickState, CardPairPickAction, CardPairPickSettings } from "./state.js";
import { isTerminal, cardName } from "./state.js";
import "./Game.css";

export function CardPairPick({ state, dispatch, onGameOver }: GameProps<CardPairPickState, CardPairPickSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  }

  const isResult = state.phase === "result";

  return (
    <div className="card-game-wrap">
      <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
      <p style={{ fontSize: "0.95rem", color: "#555" }}>Pick 2 cards that share the same rank!</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", margin: "10px 0" }}>
        {state.cards.map((card, i) => {
          const isFlipped = state.flipped.includes(i);
          const isPicked = state.picks.includes(i);
          return (
            <button key={i} className={`playing-card${isPicked ? " card-win" : ""}`}
              style={{ fontSize: "1.4rem", cursor: isResult ? "default" : "pointer", minWidth: "60px" }}
              disabled={isResult || state.picks.length >= 2}
              onClick={() => dispatch({ type: "flip", pos: i } as CardPairPickAction)}>
              {isFlipped || isResult ? cardName(card) : "🂠"}
            </button>
          );
        })}
      </div>
      {isResult && (
        <p className={`result-msg ${state.matched ? "win" : "lose"}`}>
          {state.matched ? "Pair found! +30 pts" : "No match this time."}
        </p>
      )}
      <div className="card-game-bets">
        {!isResult && state.picks.length === 2 && (
          <button className="bet-btn" onClick={() => dispatch({ type: "confirm" } as CardPairPickAction)}>Confirm Pick</button>
        )}
        {isResult && <button className="bet-btn" onClick={() => dispatch({ type: "next" } as CardPairPickAction)}>Next Round</button>}
      </div>
    </div>
  );
}
