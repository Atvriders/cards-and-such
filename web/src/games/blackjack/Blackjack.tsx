import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlackjackState, BlackjackAction, BlackjackSettings, BlackjackHand } from "./state.js";
import { handValue, isBlackjack, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Blackjack.css";

export function Blackjack({
  state,
  dispatch,
  onGameOver,
}: GameProps<BlackjackState, BlackjackSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, playerHands, dealerHand, dealerFaceDown, activeHandIndex, lastResult } = state;

  const activeHand: BlackjackHand | undefined = playerHands[activeHandIndex];
  const canDouble = phase === "player" && activeHand && activeHand.cards.length === 2 && bankroll >= (activeHand.bet);
  const canSplit = phase === "player" && activeHand && activeHand.cards.length === 2
    && activeHand.cards[0]!.rank === activeHand.cards[1]!.rank
    && playerHands.length === 1 && bankroll >= activeHand.bet;

  function dis(a: BlackjackAction) {
    dispatch(a);
  }

  function renderHand(hand: BlackjackHand, index: number) {
    const val = handValue(hand.cards);
    const bj = isBlackjack(hand.cards) && playerHands.length === 1;
    const isActive = index === activeHandIndex && phase === "player";
    return (
      <div key={index} className={`bj-hand-group${isActive ? " active" : ""}`}>
        <div className="bj-hand">
          {hand.cards.map((c, i) => (
            <Card key={c.id + i} card={c} />
          ))}
        </div>
        <div className="bj-hand-value">
          {bj ? "Blackjack!" : hand.busted ? "Bust!" : `${val.best}${val.soft ? " (soft)" : ""}`}
          {hand.doubled ? " (Doubled)" : ""}
        </div>
      </div>
    );
  }

  const dealerVal = handValue(dealerFaceDown ? dealerHand.slice(0, 1) : dealerHand);

  return (
    <div className="blackjack">
      <div className="bj-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase === "player" || phase === "dealer" ? 1 : 0)} / {settings.handsPerSession}</span>
        <span>Bet: ${settings.bet}</span>
      </div>

      {lastResult && <div className="bj-result">{lastResult}</div>}

      <div className="bj-dealer">
        <div className="bj-section-label">Dealer</div>
        <div className="bj-hand">
          {dealerHand.map((c, i) => (
            <Card
              key={c.id + i}
              card={c}
              faceDown={i === 1 && dealerFaceDown}
            />
          ))}
        </div>
        {dealerHand.length > 0 && (
          <div className="bj-hand-value">
            {dealerFaceDown ? dealerVal.best : handValue(dealerHand).best}
            {!dealerFaceDown && handValue(dealerHand).soft ? " (soft)" : ""}
          </div>
        )}
      </div>

      <div className="bj-player">
        <div className="bj-section-label">Player</div>
        {playerHands.map((hand, i) => renderHand(hand, i))}
      </div>

      <div className="bj-actions">
        {(phase === "betting" || phase === "settled") && !terminal && (
          <button className="primary" onClick={() => dis({ type: "deal" })}>
            Deal
          </button>
        )}
        {phase === "player" && (
          <>
            <button onClick={() => dis({ type: "hit" })}>Hit</button>
            <button onClick={() => dis({ type: "stand" })}>Stand</button>
            <button onClick={() => dis({ type: "double" })} disabled={!canDouble}>
              Double
            </button>
            <button onClick={() => dis({ type: "split" })} disabled={!canSplit}>
              Split
            </button>
          </>
        )}
        {terminal && (
          <div className="bj-game-over">
            Game Over — Final Bankroll: ${terminal.score}
          </div>
        )}
      </div>
    </div>
  );
}
