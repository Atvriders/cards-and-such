import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CaribbeanStudState, CaribbeanStudSettings, CaribbeanStudAction } from "./state.js";
import { isTerminal } from "./state.js";
import { rankHand } from "../../engines/deck/ranking.js";
import { Card } from "../../engines/deck/Card.js";
import "./CaribbeanStud.css";

export function CaribbeanStud({
  state,
  dispatch,
  onGameOver,
}: GameProps<CaribbeanStudState, CaribbeanStudSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, playerCards, dealerCards, lastResult } = state;
  const maxHands = parseInt(settings.hands, 10);
  const ante = parseInt(settings.anteSize, 10);
  const raise = ante * 2;

  function dis(a: CaribbeanStudAction) { dispatch(a); }

  const playerHandName = playerCards.length === 5 ? rankHand(playerCards).class : "";

  const isDecision = phase === "decision";
  const isAnte = phase === "ante" || phase === "settled";

  return (
    <div className="caribbean-stud">
      <div className="cs-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed} / {maxHands}</span>
        <span>Ante: ${ante}</span>
      </div>

      {lastResult && <div className="cs-result">{lastResult}</div>}

      <div className="cs-table">
        <div className="cs-side">
          <div className="cs-side-label">Dealer</div>
          <div className="cs-cards">
            {dealerCards.map((c, i) => (
              <Card
                key={c.id + i}
                card={c}
                faceDown={isDecision && i > 0}
              />
            ))}
            {dealerCards.length === 0 && <div style={{ opacity: 0.4 }}>Waiting...</div>}
          </div>
          {isDecision && (
            <div className="cs-dealer-note">4 cards hidden — only one shown</div>
          )}
          {phase === "settled" && dealerCards.length === 5 && (
            <div className="cs-hand-name">
              {state.dealerQualifies
                ? `Qualifies: ${rankHand(dealerCards).class}`
                : "Does not qualify (below A-K)"}
            </div>
          )}
        </div>

        <div className="cs-side">
          <div className="cs-side-label">Player</div>
          <div className="cs-cards">
            {playerCards.map((c, i) => (
              <Card key={c.id + i} card={c} />
            ))}
            {playerCards.length === 0 && <div style={{ opacity: 0.4 }}>Waiting...</div>}
          </div>
          {playerHandName && (
            <div className="cs-hand-name">{playerHandName}</div>
          )}
        </div>
      </div>

      {isDecision && (
        <div className="cs-raise-info">
          Fold: lose ante ${ante} | Raise: bet ${raise} more (2× ante)
        </div>
      )}

      <div className="cs-actions">
        {!terminal && isAnte && (
          <button className="deal" onClick={() => dis({ type: "deal" })}>
            Deal Hand
          </button>
        )}
        {!terminal && isDecision && (
          <>
            <button className="fold" onClick={() => dis({ type: "fold" })}>
              Fold (lose ${ante})
            </button>
            <button
              className="raise"
              onClick={() => dis({ type: "raise" })}
              disabled={bankroll < raise}
            >
              Raise (bet ${raise})
            </button>
          </>
        )}
        {terminal && (
          <div className="cs-game-over">
            Game Over — Final Bankroll: ${terminal.score}
          </div>
        )}
      </div>
    </div>
  );
}
