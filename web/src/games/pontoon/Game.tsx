import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PontoonState, PontoonAction, PontoonSettings } from "./state.js";
import { handValue, isPontoon, isFiveCardTrick, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function PontoonGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<PontoonState, PontoonSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, playerHand, dealerHand, lastResult } = state;
  const pv = handValue(playerHand.cards);
  const isPon = isPontoon(playerHand.cards);
  const isFCT = isFiveCardTrick(playerHand.cards);
  const canStick = phase === "player" && pv.best >= 15;
  const canBuy = phase === "player" && !playerHand.twisted && playerHand.cards.length < 5 && bankroll >= playerHand.bet;

  function dis(a: PontoonAction) { dispatch(a); }

  return (
    <div className="pontoon">
      <div className="pontoon-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase === "player" ? 1 : 0)}/{settings.handsPerSession}</span>
        <span>Bet: ${playerHand.bet}</span>
      </div>

      {lastResult && <div className="pontoon-result">{lastResult}</div>}

      <div className="pontoon-section">
        <div className="pontoon-label">Banker</div>
        <div className="pontoon-hand">
          {dealerHand.map((c, i) => (
            <Card key={c.id + i} card={c} faceDown={phase === "player"} />
          ))}
        </div>
        {dealerHand.length > 0 && phase === "player" && (
          <div className="pontoon-value">?</div>
        )}
        {dealerHand.length > 0 && phase !== "player" && (
          <div className="pontoon-value">{handValue(dealerHand).best}</div>
        )}
      </div>

      <div className="pontoon-section">
        <div className="pontoon-label">Your Hand ({playerHand.cards.length} cards)</div>
        <div className="pontoon-hand">
          {playerHand.cards.map((c, i) => <Card key={c.id + i} card={c} />)}
        </div>
        {playerHand.cards.length > 0 && (
          <div className="pontoon-value">
            {playerHand.busted ? "Bust!" : `${pv.best}${pv.soft ? " soft" : ""}${playerHand.bought ? " (Bought)" : ""}`}
          </div>
        )}
        {isPon && <div className="pontoon-special">Pontoon! (2:1)</div>}
        {isFCT && <div className="pontoon-special">Five Card Trick!</div>}
      </div>

      <div className="pontoon-actions">
        {(phase === "betting" || phase === "settled") && !terminal && (
          <button className="primary" data-testid="hint-target-pontoon-deal" onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
        {phase === "player" && !playerHand.busted && (
          <>
            <button data-testid="hint-target-pontoon-twist" onClick={() => dis({ type: "twist" })}>Twist</button>
            <button data-testid="hint-target-pontoon-stick" onClick={() => dis({ type: "stick" })} disabled={!canStick}>Stick</button>
            <button onClick={() => dis({ type: "buy" })} disabled={!canBuy}>Buy (Double)</button>
          </>
        )}
        {terminal && <div className="pontoon-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
