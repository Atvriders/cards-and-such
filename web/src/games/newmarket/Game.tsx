import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NewmarketState, NewmarketSettings } from "./state.js";
import { isTerminal, BOODLE_CARDS, cardMatchesBoodle } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type NewmarketAction =
  | { type: "placeBet"; amount: number }
  | { type: "playCard"; cardId: string }
  | { type: "pass" };

const SUIT_SYMBOLS: Record<string, string> = { "♠": "♠", "♥": "♥", "♦": "♦", "♣": "♣" };
const RANK_NAMES: Record<number, string> = { 10: "10", 11: "J", 12: "Q", 13: "K" };

export function NewmarketGame({ state, dispatch, onGameOver }: GameProps<NewmarketState, NewmarketSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, played, currentSuit, boodlePot, playerChips, turn, phase } = state;
  const myHand = hands[0]!;
  const isMyTurn = turn === 0 && phase === "playing";
  const lastPlayed = played.length > 0 ? played[played.length - 1]! : null;

  // Determine playable cards
  function isPlayable(card: typeof myHand[0]): boolean {
    if (!isMyTurn) return false;
    if (played.length === 0 || currentSuit === null) return true; // can lead anything
    if (!lastPlayed) return true;
    return card.suit === lastPlayed.suit && card.rank === lastPlayed.rank + 1;
  }

  const sortedHand = [...myHand].sort((a, b) => {
    if (a.suit !== b.suit) return a.suit.localeCompare(b.suit);
    return a.rank - b.rank;
  });

  if (phase === "betting") {
    return (
      <div className="newmarket">
        <div className="newmarket-header">
          <h2>Newmarket</h2>
          <div className="newmarket-chips">Your chips: {playerChips}</div>
        </div>
        <div className="newmarket-betting">
          <p>Place your bet to add chips to the boodle pots!</p>
          <p style={{ fontSize: ".85rem", opacity: .8 }}>Each boodle card already has 2 chips from the house.</p>
          <div className="newmarket-actions">
            <button data-testid="hint-target-newmarket-primary" className="newmarket-btn bet" onClick={() => dispatch({ type: "placeBet", amount: 1 } as NewmarketAction)}>
              Bet 1 chip
            </button>
            <button className="newmarket-btn bet" onClick={() => dispatch({ type: "placeBet", amount: 0 } as NewmarketAction)}>
              No bet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="newmarket">
      <div className="newmarket-header">
        <h2>Newmarket</h2>
        <div className="newmarket-chips">Your chips: {playerChips}</div>
      </div>

      <div className="newmarket-board">
        {BOODLE_CARDS.map((b, i) => (
          <div key={i} className="newmarket-boodle">
            <div className="newmarket-boodle-card">{RANK_NAMES[b.rank]}{SUIT_SYMBOLS[b.suit]}</div>
            <div className="newmarket-boodle-pot">{boodlePot[i]} chips</div>
            <div className="newmarket-boodle-label">Boodle</div>
          </div>
        ))}
      </div>

      <div className="newmarket-sequence">
        <div className="newmarket-sequence-label">
          {currentSuit ? `Current sequence (${currentSuit}):` : "No active sequence"}
        </div>
        <div className="newmarket-seq-cards">
          {played.slice(-6).map(c => <Card key={c.id} card={c} />)}
        </div>
      </div>

      <div className="newmarket-status">
        {phase === "playing"
          ? isMyTurn
            ? lastPlayed ? `Continue the ${lastPlayed.suit} sequence or pass to let bots lead` : "Lead any card to start a sequence"
            : "Bots playing…"
          : "Game over!"}
      </div>

      {phase === "playing" && (
        <>
          <div className="newmarket-hand-label">Your hand ({myHand.length}):</div>
          <div className="newmarket-hand">
            {sortedHand.map(c => {
              const playable = isPlayable(c);
              const isBoodle = cardMatchesBoodle(c) >= 0 && boodlePot[cardMatchesBoodle(c)]! > 0;
              return (
                <div key={c.id}
                  className={`newmarket-slot${playable ? " playable" : ""}${isBoodle && playable ? " boodle" : ""}`}
                  onClick={() => playable && dispatch({ type: "playCard", cardId: c.id } as NewmarketAction)}>
                  <Card card={c} />
                </div>
              );
            })}
          </div>
          {isMyTurn && (
            <div className="newmarket-actions">
              <button className="newmarket-btn pass" onClick={() => dispatch({ type: "pass" } as NewmarketAction)}>
                Pass / Let bots lead
              </button>
            </div>
          )}
        </>
      )}

      {phase === "done" && (
        <div className="newmarket-result">
          <h3>Game Over!</h3>
          <div className="newmarket-final">Final chips: {playerChips}</div>
          {playerChips >= 20 ? <div style={{ color: "#a5d6a7" }}>You came out ahead!</div> : <div>Better luck next time.</div>}
        </div>
      )}
    </div>
  );
}
