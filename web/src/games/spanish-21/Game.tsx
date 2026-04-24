import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Spanish21State, Spanish21Action, Spanish21Settings } from "./state.js";
import { handValue, getBonus, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

export function Spanish21Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<Spanish21State, Spanish21Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, playerHand, dealerHand, dealerFaceDown, lastResult } = state;
  const pv = handValue(playerHand.cards);
  const dv = handValue(dealerFaceDown ? dealerHand.slice(0, 1) : dealerHand);
  const bonus = phase === "player" ? getBonus(playerHand.cards) : null;
  const canDouble = phase === "player" && playerHand.cards.length === 2 && bankroll >= playerHand.bet;
  const canSurrender = phase === "player" && playerHand.cards.length === 2;

  function dis(a: Spanish21Action) { dispatch(a); }

  return (
    <div className="s21">
      <div className="s21-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase === "player" ? 1 : 0)}/{settings.handsPerSession}</span>
        <span>Bet: ${settings.bet}</span>
      </div>

      {lastResult && <div className="s21-result">{lastResult}</div>}

      <div className="s21-section">
        <div className="s21-section-label">Dealer (Spanish 21 — no 10s)</div>
        <div className="s21-hand">
          {dealerHand.map((c, i) => <Card key={c.id + i} card={c} faceDown={i === 1 && dealerFaceDown} />)}
        </div>
        {dealerHand.length > 0 && <div className="s21-value">{dealerFaceDown ? "?" : dv.best}</div>}
      </div>

      <div className="s21-section">
        <div className="s21-section-label">Your Hand</div>
        <div className="s21-hand">
          {playerHand.cards.map((c, i) => <Card key={c.id + i} card={c} />)}
        </div>
        {playerHand.cards.length > 0 && (
          <div className="s21-value">
            {playerHand.busted ? "Bust!" : `${pv.best}${pv.soft ? " soft" : ""}${playerHand.doubled ? " (Doubled)" : ""}`}
          </div>
        )}
        {bonus && <div className="s21-bonus">{bonus.label}</div>}
      </div>

      <div className="s21-actions">
        {(phase === "betting" || phase === "settled") && !terminal && (
          <button className="primary" onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
        {phase === "player" && !playerHand.busted && (
          <>
            <button onClick={() => dis({ type: "hit" })}>Hit</button>
            <button onClick={() => dis({ type: "stand" })}>Stand</button>
            <button onClick={() => dis({ type: "double" })} disabled={!canDouble}>Double</button>
            <button className="surrender-btn" onClick={() => dis({ type: "surrender" })} disabled={!canSurrender}>Surrender</button>
          </>
        )}
        {terminal && <div className="s21-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
