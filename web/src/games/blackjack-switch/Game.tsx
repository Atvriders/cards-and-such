import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlackjackSwitchState, BlackjackSwitchAction, BlackjackSwitchSettings, BSHand } from "./state.js";
import { handValue, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function BlackjackSwitchGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<BlackjackSwitchState, BlackjackSwitchSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, hand1, hand2, dealerHand, dealerFaceDown, activeHandIndex, lastResult, switched } = state;

  function dis(a: BlackjackSwitchAction) { dispatch(a); }

  function renderHand(hand: BSHand, index: number) {
    const val = handValue(hand.cards);
    const isActive = index === activeHandIndex && phase === "player";
    return (
      <div key={index} className={`bjs-hand-group${isActive ? " active" : ""}`}>
        <div className="bjs-label">Hand {index + 1}{hand.doubled ? " (Dbl)" : ""}</div>
        <div className="bjs-hand">
          {hand.cards.map((c, i) => <Card key={c.id + i} card={c} />)}
        </div>
        <div className="bjs-value">
          {hand.busted ? "Bust!" : `${val.best}${val.soft ? "s" : ""}`}
        </div>
      </div>
    );
  }

  const activeHand = activeHandIndex === 0 ? hand1 : hand2;
  const canDouble = phase === "player" && activeHand.cards.length === 2 && bankroll >= activeHand.bet;
  const dealerVal = handValue(dealerFaceDown ? dealerHand.slice(0, 1) : dealerHand);

  return (
    <div className="bjs">
      <div className="bjs-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase === "player" || phase === "switch-decision" ? 1 : 0)}/{settings.handsPerSession}</span>
        <span>Bet: ${settings.bet}×2</span>
      </div>

      {lastResult && <div className="bjs-result">{lastResult}</div>}

      {/* Dealer */}
      <div className="bjs-hand-group">
        <div className="bjs-label">Dealer</div>
        <div className="bjs-hand">
          {dealerHand.map((c, i) => <Card key={c.id + i} card={c} faceDown={i === 1 && dealerFaceDown} />)}
        </div>
        {dealerHand.length > 0 && <div className="bjs-value">{dealerFaceDown ? dealerHand.slice(0,1).map(c=>c.rank===1?11:c.rank>=11?10:c.rank).reduce((a,b)=>a+b,0) : dealerVal.best}</div>}
      </div>

      {/* Player Hands */}
      <div className="bjs-hands">
        {renderHand(hand1, 0)}
        {renderHand(hand2, 1)}
      </div>

      {phase === "switch-decision" && (
        <div className="bjs-switch-prompt">
          Swap the second cards between hands?
          {switched && " (Switched)"}
        </div>
      )}

      <div className="bjs-actions">
        {(phase === "betting" || phase === "settled") && !terminal && (
          <button className="primary" data-testid="hint-target-blackjack-switch-deal" onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
        {phase === "switch-decision" && (
          <>
            <button className="switch-btn" onClick={() => dis({ type: "switch" })}>Switch!</button>
            <button onClick={() => dis({ type: "no-switch" })}>No Switch</button>
          </>
        )}
        {phase === "player" && (
          <>
            <button data-testid="hint-target-blackjack-switch-hit" onClick={() => dis({ type: "hit" })}>Hit</button>
            <button data-testid="hint-target-blackjack-switch-stand" onClick={() => dis({ type: "stand" })}>Stand</button>
            <button onClick={() => dis({ type: "double" })} disabled={!canDouble}>Double</button>
          </>
        )}
        {terminal && (
          <div className="bjs-game-over">Game Over — Final: ${terminal.score}</div>
        )}
      </div>
    </div>
  );
}
