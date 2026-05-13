import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AceFinderState, AceFinderAction, AceFinderSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number, idx: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `af-${idx}-${c}` };
}

export function AceFinder({ state, dispatch, onGameOver }: GameProps<AceFinderState, AceFinderSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "gameover") {
    return <div className="card-game-wrap"><h2>Game Over!</h2><p>Score: <strong>{state.score}</strong></p></div>;
  }

  const win = state.picked !== null && state.picked === state.acePos;
  const isPicking = state.phase === "picking";

  return (
    <div className="card-game-wrap">
      <div className="card-game-header"><span>Round {state.round}/{state.maxRounds}</span><span>Score: {state.score}</span></div>
      <p style={{ color: "#555", fontSize: "0.9rem" }}>Find the Ace! {!state.hintUsed && isPicking && "Use Hint to reveal a non-Ace (-5 pts penalty)."}</p>
      <div className="card-game-cards" style={{ flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
        {state.cards.map((card, i) => {
          const canClick = isPicking && state.revealed[i] !== true;
          const clsExtra = `${state.picked === i ? (win ? " card-win" : " card-lose") : ""}${state.revealed[i] && state.picked !== i ? " card-revealed" : ""}`;
          if (state.revealed[i]) {
            return <Card key={i} card={toEngineCard(card, i)} className={`playing-card${clsExtra}`} />;
          }
          return (
            <Card key={i} faceDown className={`playing-card${clsExtra}`}
              {...(canClick ? { onClick: () => dispatch({ type: "pick", pos: i } as AceFinderAction) } : {})} />
          );
        })}
      </div>
      {isPicking && !state.hintUsed && (
        <button data-testid="hint-target-ace-finder-hint" className="bet-btn" style={{ background: "#f39c12", marginTop: "8px" }} onClick={() => dispatch({ type: "hint" } as AceFinderAction)}>Hint (-5 pts)</button>
      )}
      {state.phase === "result" && (
        <div>
          <p className={`result-msg ${win ? "win" : "lose"}`}>{win ? `Found the Ace! +${state.hintUsed ? 20 : 25} pts` : `Missed! Ace was at position ${state.acePos + 1}`}</p>
          <button data-testid="hint-target-ace-finder-next" className="bet-btn" onClick={() => dispatch({ type: "next" } as AceFinderAction)}>Next</button>
        </div>
      )}
    </div>
  );
}
