import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardBidStreakState, CardBidStreakAction, CardBidStreakSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `cbs-${c}` };
}

export function CardBidStreak({ state, dispatch, onGameOver }: GameProps<CardBidStreakState, CardBidStreakSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  return (
    <div className="cm-wrap">
      <div className="cm-round">Round {state.round} / {state.maxRounds}</div>
      <div className="cm-score">Coins: {state.coins} | Streak: {state.streak} | Best: {state.bestStreak}</div>
      {!terminal ? (
        <>
          <div className="cm-cards">
            {state.currentCard !== null
              ? <Card card={toEngineCard(state.currentCard)} className="cm-card" />
              : <Card faceDown className="cm-card" />}
          </div>
          {state.phase === "bidding" && (
            <>
              <div className="cm-prompt">Will the NEXT card be Higher or Lower?</div>
              <div className="cm-btns">
                <button data-testid="hint-target-card-bid-streak-primary" className="cm-btn" onClick={() => dispatch({ type: "guess", higher: true } as CardBidStreakAction)}>Higher</button>
                <button className="cm-btn alt" onClick={() => dispatch({ type: "guess", higher: false } as CardBidStreakAction)}>Lower</button>
              </div>
            </>
          )}
          {state.phase === "revealed" && (
            <>
              <div className={`cm-result ${state.lastCorrect ? "good" : "bad"}`}>{state.lastCorrect ? "Correct! +" + (state.streak >= 3 ? 3 : 1) : "Wrong!"}</div>
              <button className="cm-btn" onClick={() => dispatch({ type: "next" } as CardBidStreakAction)}>Next</button>
            </>
          )}
        </>
      ) : (
        <div className="cm-done"><h2>Game Over!</h2><div className="cm-final">Coins: {state.coins} | Best Streak: {state.bestStreak}</div></div>
      )}
    </div>
  );
}
