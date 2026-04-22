import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RazzState, RazzAction, RazzSettings } from "./state.js";
import { isTerminal, razzRank } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Razz.css";

function describeRazzHand(cards: import("../../engines/deck/index.js").Card[]): string {
  if (cards.length < 5) return "";
  const r = razzRank(cards);
  return r.map(v => v === 1 ? "A" : String(v)).join("-");
}

export function Razz({
  state,
  dispatch,
  onGameOver,
}: GameProps<RazzState, RazzSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, street, pot, player, bot, playerTurn, lastAction, lastResult, settings } = state;

  function dis(a: RazzAction) { dispatch(a); }

  const ante = parseInt(settings.anteSize, 10);
  const betAmt = (street >= 5) ? ante * 2 : ante;
  const toCall = player.bet - bot.bet;

  const canCheck = playerTurn && toCall <= 0;
  const canCall = playerTurn && toCall > 0;
  const canRaise = playerTurn && player.bankroll >= toCall + betAmt;
  const isActive = phase === "betting";

  const playerLow = player.cards.length >= 5 ? describeRazzHand(player.cards) : "";
  const botLow = phase === "showdown" && bot.cards.length >= 5 ? describeRazzHand(bot.cards) : "";

  return (
    <div className="razz">
      <div className="rz-header">
        <span>You: ${player.bankroll}</span>
        <span>Bot: ${bot.bankroll}</span>
        {isActive && (
          <span className="rz-street">
            {street === 3 ? "3rd" : street === 4 ? "4th" : street === 5 ? "5th" : street === 6 ? "6th" : "7th"} St.
          </span>
        )}
      </div>

      <div className="rz-goal">Goal: lowest 5-card hand · Aces low · Straights/flushes don't count</div>

      {lastResult && <div className="rz-result">{lastResult}</div>}
      {lastAction && !lastResult && <div className="rz-action-log">{lastAction}</div>}

      <div className="rz-table">
        <div className="rz-side">
          <div className="rz-side-label">Bot</div>
          <div className="rz-cards">
            {bot.cards.map((c, i) => (
              <Card key={c.id + i} card={c} faceDown={phase !== "showdown" && !bot.faceUp[i]} />
            ))}
            {bot.cards.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {botLow && <div className="rz-low-hand">Low hand: {botLow}</div>}
        </div>

        <div className="rz-side">
          <div className="rz-side-label">You</div>
          <div className="rz-cards">
            {player.cards.map((c, i) => (
              <Card key={c.id + i} card={c} faceDown={!player.faceUp[i]} />
            ))}
            {player.cards.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {playerLow && <div className="rz-low-hand">Low hand: {playerLow}</div>}
        </div>
      </div>

      {isActive && <div className="rz-pot">Pot: ${pot} {toCall > 0 ? `· To call: $${toCall}` : ""}</div>}

      <div className="rz-actions">
        {(phase === "waiting" || phase === "showdown") && !terminal && (
          <button className="btn-deal" onClick={() => dis({ type: "deal" })}>Deal Hand</button>
        )}
        {isActive && playerTurn && (
          <>
            <button className="btn-fold" onClick={() => dis({ type: "fold" })}>Fold</button>
            {canCheck && <button className="btn-check" onClick={() => dis({ type: "check" })}>Check</button>}
            {canCall && <button className="btn-call" onClick={() => dis({ type: "call" })}>Call ${toCall}</button>}
            {canRaise && (
              <button className="btn-raise" onClick={() => dis({ type: "raise" })}>
                {toCall > 0 ? `Raise $${toCall + betAmt}` : `Bet $${betAmt}`}
              </button>
            )}
          </>
        )}
        {!playerTurn && isActive && (
          <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>Bot is thinking...</div>
        )}
        {terminal && <div className="rz-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
