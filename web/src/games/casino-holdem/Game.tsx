import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CasinoHoldemState, CasinoHoldemAction, CasinoHoldemSettings } from "./state.js";
import { bestHand, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function CasinoHoldemGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<CasinoHoldemState, CasinoHoldemSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, playerCards, communityCards, dealerCards, lastResult } = state;

  function dis(a: CasinoHoldemAction) { dispatch(a); }

  const ante = parseInt(settings.anteSize, 10);
  const showDealerHole = phase === "settled";

  const playerBest = playerCards.length > 0 && communityCards.length > 0
    ? bestHand(playerCards, communityCards)
    : null;

  return (
    <div className="choldem">
      <div className="choldem-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase === "decision" ? 1 : 0)}/{settings.hands}</span>
        <span>Ante: ${ante} | Call: ${ante * 2}</span>
      </div>

      {lastResult && <div className="choldem-result">{lastResult}</div>}

      {/* Community cards */}
      <div className="choldem-community">
        <div className="choldem-label">Community</div>
        <div className="choldem-hand">
          {communityCards.map((c, i) => <Card key={c.id + i} card={c} />)}
          {communityCards.length === 3 && phase === "decision" && (
            // Turn and River shown face-down during decision
            <>
              <Card card={{ rank: 1, suit: "♠", id: "ph1" }} faceDown />
              <Card card={{ rank: 1, suit: "♠", id: "ph2" }} faceDown />
            </>
          )}
        </div>
      </div>

      <div className="choldem-rows">
        <div className="choldem-player-section">
          <div className="choldem-label">You</div>
          <div className="choldem-hand">
            {playerCards.map((c, i) => <Card key={c.id + i} card={c} />)}
          </div>
          {playerBest && <div className="choldem-value">{playerBest.class}</div>}
        </div>
        <div className="choldem-dealer-section">
          <div className="choldem-label">Dealer</div>
          <div className="choldem-hand">
            {dealerCards.map((c, i) => (
              <Card key={c.id + i} card={c} faceDown={!showDealerHole} />
            ))}
          </div>
        </div>
      </div>

      <div className="choldem-actions">
        {(phase === "ante" || phase === "settled") && !terminal && (
          <button data-testid="hint-target-casino-holdem-deal" className="primary" onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
        {phase === "decision" && (
          <>
            <button data-testid="hint-target-casino-holdem-call" onClick={() => dis({ type: "call" })}>Call (${ante * 2})</button>
            <button data-testid="hint-target-casino-holdem-fold" className="fold-btn" onClick={() => dis({ type: "fold" })}>Fold</button>
          </>
        )}
        {terminal && <div className="choldem-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
