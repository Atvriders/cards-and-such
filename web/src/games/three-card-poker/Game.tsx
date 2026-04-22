import React from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThreeCardPokerState, ThreeCardPokerAction, ThreeCardPokerSettings } from "./state.js";
import { isTerminal, rankThreeHand } from "./state.js";
import type { Card } from "../../engines/deck/index.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Game.css";

type Props = GameProps<ThreeCardPokerState, ThreeCardPokerSettings>;

function CardView({ card, hidden }: { card: Card; hidden?: boolean }) {
  if (hidden) return <div className="tcp-card hidden"><span>??</span></div>;
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div className={`tcp-card${red ? " red" : ""}`}>
      <span>{rankLabel(card.rank)}</span>
      <span style={{ fontSize: "0.7rem" }}>{card.suit}</span>
    </div>
  );
}

export function ThreeCardPoker({ state, dispatch, onGameOver }: Props) {
  const term = isTerminal(state);
  if (term) onGameOver(term.score);

  const ante = parseInt(state.settings.anteSize, 10);
  const usesAnte = state.settings.bets === "ante" || state.settings.bets === "both";
  const usesPairPlus = state.settings.bets === "pair-plus" || state.settings.bets === "both";
  const betNeeded = (usesAnte ? ante : 0) + (usesPairPlus ? ante : 0);

  const playerRank = state.playerCards.length === 3 ? rankThreeHand(state.playerCards) : null;
  const dealerRank = state.dealerCards.length === 3 && state.phase === "settled"
    ? rankThreeHand(state.dealerCards) : null;

  return (
    <div className="tcp-root">
      <div className="tcp-bankroll">Bankroll: ${state.bankroll}</div>
      <div>Hands played: {state.handsPlayed}</div>

      {(state.phase === "betting" || state.phase === "settled") && (
        <div className="tcp-section">
          {state.lastResult && <div className="tcp-result">{state.lastResult}</div>}
          <div className="tcp-label" style={{ marginTop: 8 }}>
            Bet: {usesAnte && `Ante $${ante}`}{usesAnte && usesPairPlus && " + "}{usesPairPlus && `Pair Plus $${ante}`}
          </div>
          <div className="tcp-actions">
            <button
              className="tcp-btn primary"
              onClick={() => dispatch({ type: "deal" } as ThreeCardPokerAction)}
              disabled={state.bankroll < betNeeded}
            >
              Deal
            </button>
          </div>
        </div>
      )}

      {state.playerCards.length === 3 && (
        <div className="tcp-section">
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            <div>
              <div className="tcp-label">Your Hand{playerRank ? `: ${playerRank.class}` : ""}</div>
              <div className="tcp-cards">{state.playerCards.map(c => <CardView key={c.id} card={c} />)}</div>
            </div>
            <div>
              <div className="tcp-label">Dealer{dealerRank ? `: ${dealerRank.class}` : " (1 card visible)"}</div>
              <div className="tcp-cards">
                {state.dealerCards.map((c, i) => (
                  <CardView key={c.id} card={c} hidden={state.phase === "decision" && i > 0} />
                ))}
              </div>
            </div>
          </div>

          {state.phase === "decision" && usesAnte && (
            <div className="tcp-actions">
              <button className="tcp-btn danger" onClick={() => dispatch({ type: "fold" } as ThreeCardPokerAction)}>
                Fold
              </button>
              <button
                className="tcp-btn primary"
                onClick={() => dispatch({ type: "play" } as ThreeCardPokerAction)}
                disabled={state.bankroll < ante}
              >
                Play (${ante} more)
              </button>
            </div>
          )}

          {state.phase === "settled" && (
            <div className="tcp-result" style={{ marginTop: 10 }}>{state.lastResult}</div>
          )}
        </div>
      )}
    </div>
  );
}
