import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FiveCardDrawState, DrawAction, FiveCardDrawSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { rankHand } from "../../engines/deck/ranking.js";
import { Card } from "../../engines/deck/Card.js";
import "./FiveCardDraw.css";

export function FiveCardDraw({
  state,
  dispatch,
  onGameOver,
}: GameProps<FiveCardDrawState, FiveCardDrawSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, botBankroll, pot, playerHand, botHand,
    playerTurn, lastAction, lastResult, selectedToDiscard } = state;

  function dis(a: DrawAction) { dispatch(a); }

  const toCall = state.botBet - state.playerBet;
  const ante = parseInt(state.settings.anteSize, 10);
  const canCheck = playerTurn && toCall <= 0;
  const canCall = playerTurn && toCall > 0;
  const canRaise = playerTurn && bankroll >= toCall + ante;
  const isBetting = phase === "pre-draw-bet" || phase === "post-draw-bet";
  const isDraw = phase === "draw";

  const playerHandName = playerHand.length === 5 ? rankHand(playerHand).class : "";
  const botHandName = phase === "showdown" && botHand.length === 5 ? rankHand(botHand).class : "";

  return (
    <div className="five-card-draw">
      <div className="fcd-header">
        <span>You: ${bankroll}</span>
        <span>Bot: ${botBankroll}</span>
        <span style={{ opacity: 0.7, fontSize: "0.85rem" }}>{phase.replace("-", " ")}</span>
      </div>

      {lastResult && <div className="fcd-result">{lastResult}</div>}
      {lastAction && !lastResult && <div className="fcd-action-log">{lastAction}</div>}

      <div className="fcd-table">
        <div className="fcd-side">
          <div className="fcd-side-label">Bot</div>
          <div className="fcd-cards">
            {botHand.map((c, i) => (
              <Card key={c.id + i} card={c} faceDown={phase !== "showdown"} />
            ))}
            {botHand.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {botHandName && <div className="fcd-hand-name">{botHandName}</div>}
        </div>

        <div className="fcd-side">
          <div className="fcd-side-label">You {isDraw ? "(click cards to discard)" : ""}</div>
          <div className="fcd-cards">
            {playerHand.map((c, i) => (
              <div
                key={c.id + i}
                className={`fcd-card-wrapper${selectedToDiscard.includes(i) ? " selected" : ""}`}
                onClick={() => isDraw && dis({ type: "toggle-discard", index: i })}
              >
                <Card card={c} />
                {isDraw && selectedToDiscard.includes(i) && (
                  <span className="fcd-discard-label">DISCARD</span>
                )}
              </div>
            ))}
            {playerHand.length === 0 && <span style={{ opacity: 0.4 }}>Waiting...</span>}
          </div>
          {playerHandName && <div className="fcd-hand-name">{playerHandName}</div>}
        </div>
      </div>

      {isBetting && <div className="fcd-pot">Pot: ${pot} {toCall > 0 ? `· To call: $${toCall}` : ""}</div>}
      {isDraw && (
        <div className="fcd-draw-hint">
          Select cards to discard, then click Draw ({selectedToDiscard.length} selected)
        </div>
      )}

      <div className="fcd-actions">
        {(phase === "waiting" || phase === "showdown") && !terminal && (
          <button className="btn-deal" onClick={() => dis({ type: "deal" })}>Deal Hand</button>
        )}
        {isBetting && playerTurn && (
          <>
            <button className="btn-fold" onClick={() => dis({ type: "fold" })}>Fold</button>
            {canCheck && <button className="btn-check" onClick={() => dis({ type: "check" })}>Check</button>}
            {canCall && <button className="btn-call" onClick={() => dis({ type: "call" })}>Call ${toCall}</button>}
            {canRaise && (
              <button className="btn-raise" onClick={() => dis({ type: "raise" })}>
                {toCall > 0 ? `Raise $${toCall + ante}` : `Bet $${ante}`}
              </button>
            )}
          </>
        )}
        {isDraw && (
          <button className="btn-draw" onClick={() => dis({ type: "draw" })}>
            Draw ({selectedToDiscard.length === 0 ? "Stand Pat" : `${selectedToDiscard.length} new card${selectedToDiscard.length !== 1 ? "s" : ""}`})
          </button>
        )}
        {terminal && <div className="fcd-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}
