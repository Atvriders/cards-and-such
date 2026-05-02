import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SevenCardStudState, StudAction, SevenCardStudSettings } from "./state.js";
import { isTerminal, bestFiveOf } from "./state.js";
import { rankHand } from "../../engines/deck/ranking.js";
import { Card } from "../../engines/deck/Card.js";
import "./SevenCardStud.css";

export function SevenCardStud({
  state,
  dispatch,
  onGameOver,
}: GameProps<SevenCardStudState, SevenCardStudSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, street, pot, player, bot, playerTurn, lastAction, lastResult, settings } = state;

  function dis(a: StudAction) { dispatch(a); }

  const ante = parseInt(settings.anteSize, 10);
  const betAmt = (street >= 5) ? ante * 2 : ante;
  const toCall = player.bet - bot.bet;

  const canCheck = playerTurn && toCall <= 0;
  const canCall = playerTurn && toCall > 0;
  const canRaise = playerTurn && player.bankroll >= toCall + betAmt;
  const isActive = phase === "betting";

  const playerBest = player.cards.length >= 5 ? rankHand(bestFiveOf(player.cards)).class : "";
  const botBest = phase === "showdown" && bot.cards.length >= 5 ? rankHand(bestFiveOf(bot.cards)).class : "";

  return (
    <div className="seven-card-stud">
      <div className="scs-header">
        <span>You: ${player.bankroll}</span>
        <span>Bot: ${bot.bankroll}</span>
        {isActive && <span className="scs-street">{street === 3 ? "3rd" : street === 4 ? "4th" : street === 5 ? "5th" : street === 6 ? "6th" : "7th"} Street</span>}
      </div>

      {lastResult && <div className="scs-result">{lastResult}</div>}
      {lastAction && !lastResult && <div className="scs-action-log">{lastAction}</div>}

      <div className="scs-table">
        <div className="scs-side">
          <div className="scs-side-label">Bot</div>
          <div className="scs-cards">
            {bot.cards.map((c, i) => (
              <Card key={c.id + i} card={c} faceDown={phase !== "showdown" && !bot.faceUp[i]} />
            ))}
            {bot.cards.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {botBest && <div className="scs-hand-name">{botBest}</div>}
        </div>

        <div className="scs-side">
          <div className="scs-side-label">You</div>
          <div className="scs-cards">
            {player.cards.map((c, i) => (
              <Card key={c.id + i} card={c} faceDown={!player.faceUp[i]} />
            ))}
            {player.cards.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {playerBest && <div className="scs-hand-name">{playerBest}</div>}
        </div>
      </div>

      {isActive && <div className="scs-pot">Pot: ${pot} {toCall > 0 ? `· To call: $${toCall}` : ""}</div>}

      <div className="scs-actions">
        {(phase === "waiting" || phase === "showdown") && !terminal && (
          <button data-testid="hint-target-seven-card-stud-deal" className="btn-deal" onClick={() => dis({ type: "deal" })}>Deal Hand</button>
        )}
        {isActive && playerTurn && (
          <>
            <button data-testid="hint-target-seven-card-stud-fold" className="btn-fold" onClick={() => dis({ type: "fold" })}>Fold</button>
            {canCheck && <button data-testid="hint-target-seven-card-stud-check" className="btn-check" onClick={() => dis({ type: "check" })}>Check</button>}
            {canCall && <button data-testid="hint-target-seven-card-stud-call" className="btn-call" onClick={() => dis({ type: "call" })}>Call ${toCall}</button>}
            {canRaise && (
              <button data-testid="hint-target-seven-card-stud-raise" className="btn-raise" onClick={() => dis({ type: "raise" })}>
                {toCall > 0 ? `Raise $${toCall + betAmt}` : `Bet $${betAmt}`}
              </button>
            )}
          </>
        )}
        {!playerTurn && isActive && (
          <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>Bot is thinking...</div>
        )}
        {terminal && <div className="scs-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
