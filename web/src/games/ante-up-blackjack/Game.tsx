import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AnteUpState, AnteUpAction, AnteUpSettings } from "./state.js";
import { handValue, isBlackjack, anteBonus, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function AnteUpBlackjackGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<AnteUpState, AnteUpSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, playerHand, dealerHand, dealerFaceDown, lastResult } = state;
  const pv = handValue(playerHand.cards);
  const bj = isBlackjack(playerHand.cards);
  const bonus = phase === "player" ? anteBonus(playerHand.cards, playerHand.anteBet) : null;
  const canDouble = phase === "player" && playerHand.cards.length === 2 && bankroll >= playerHand.mainBet;

  function dis(a: AnteUpAction) { dispatch(a); }

  return (
    <div className="aubj">
      <div className="aubj-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase === "player" ? 1 : 0)}/{settings.handsPerSession}</span>
        <span>Main: ${playerHand.mainBet}</span>
        <span>Ante: ${playerHand.anteBet}</span>
      </div>

      {lastResult && <div className="aubj-result">{lastResult}</div>}

      <div className="aubj-section">
        <div className="aubj-label">Dealer</div>
        <div className="aubj-hand">
          {dealerHand.map((c, i) => <Card key={c.id + i} card={c} faceDown={i === 1 && dealerFaceDown} />)}
        </div>
        {dealerHand.length > 0 && (
          <div className="aubj-value">{dealerFaceDown ? "?" : handValue(dealerHand).best}</div>
        )}
      </div>

      <div className="aubj-section">
        <div className="aubj-label">Your Hand</div>
        <div className="aubj-hand">
          {playerHand.cards.map((c, i) => <Card key={c.id + i} card={c} />)}
        </div>
        {playerHand.cards.length > 0 && (
          <div className="aubj-value">
            {bj ? "Blackjack!" : playerHand.busted ? "Bust!" : `${pv.best}${pv.soft ? " soft" : ""}${playerHand.doubled ? " (Doubled)" : ""}`}
          </div>
        )}
        {bonus && <div className="aubj-bonus">{bonus.label}</div>}
      </div>

      <div className="aubj-actions">
        {(phase === "betting" || phase === "settled") && !terminal && (
          <button className="primary" onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
        {phase === "player" && !playerHand.busted && (
          <>
            <button onClick={() => dis({ type: "hit" })}>Hit</button>
            <button onClick={() => dis({ type: "stand" })}>Stand</button>
            <button onClick={() => dis({ type: "double" })} disabled={!canDouble}>Double</button>
          </>
        )}
        {terminal && <div className="aubj-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
