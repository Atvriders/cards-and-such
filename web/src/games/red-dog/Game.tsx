import React from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RedDogState, RedDogAction, RedDogSettings } from "./state.js";
import { isTerminal, spreadPayout } from "./state.js";
import type { Card } from "../../engines/deck/index.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Game.css";

type Props = GameProps<RedDogState, RedDogSettings>;

function CardView({ card, hidden }: { card?: Card | null; hidden?: boolean }) {
  if (!card || hidden) return <div className="rd-card hidden"><span>?</span></div>;
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div className={`rd-card${red ? " red" : ""}`}>
      <span>{rankLabel(card.rank)}</span>
      <span style={{ fontSize: "0.7rem" }}>{card.suit}</span>
    </div>
  );
}

function spreadLabel(spread: number): string {
  if (spread === -1) return "Consecutive — Push";
  if (spread === -2) return "Pair — third card needed";
  return `Spread: ${spread} (pays ${spreadPayout(spread)}:1)`;
}

export function RedDog({ state, dispatch, onGameOver }: Props) {
  const term = isTerminal(state);
  if (term) onGameOver(term.score);

  const ante = parseInt(state.settings.anteSize, 10);

  return (
    <div className="rd-root">
      <div className="rd-bankroll">Bankroll: ${state.bankroll}</div>
      <div>Hands played: {state.handsPlayed}</div>

      {(state.phase === "betting" || state.phase === "settled") && (
        <div className="rd-section">
          {state.lastResult && <div className="rd-result">{state.lastResult}</div>}
          <div className="rd-actions">
            <button data-testid="hint-target-red-dog-primary"
              className="rd-btn primary"
              onClick={() => dispatch({ type: "deal" } as RedDogAction)}
              disabled={state.bankroll < ante}
            >
              Deal (${ante})
            </button>
          </div>
        </div>
      )}

      {state.card1 && (
        <div className="rd-section">
          <div className="rd-label">First two cards:</div>
          <div className="rd-cards">
            <CardView card={state.card1} />
            <CardView card={state.card2} />
            {state.card3 && <CardView card={state.card3} />}
          </div>

          {state.phase !== "betting" && state.spread !== undefined && (
            <div className="rd-spread" style={{ marginTop: 10, textAlign: "center" }}>
              {spreadLabel(state.spread)}
            </div>
          )}

          {state.phase === "decision" && (
            <>
              <div className="rd-label" style={{ marginTop: 10 }}>
                Raise doubles your bet. Third card must fall between {state.card1 && state.card2 ?
                  `${Math.min(state.card1.rank === 1 ? 14 : state.card1.rank, state.card2.rank === 1 ? 14 : state.card2.rank) + 1} and ${Math.max(state.card1.rank === 1 ? 14 : state.card1.rank, state.card2.rank === 1 ? 14 : state.card2.rank) - 1}` : "…"}.
              </div>
              <div className="rd-actions">
                <button className="rd-btn secondary" onClick={() => dispatch({ type: "stay" } as RedDogAction)}>
                  Stay (${ante})
                </button>
                <button
                  className="rd-btn primary"
                  onClick={() => dispatch({ type: "raise" } as RedDogAction)}
                  disabled={state.bankroll < ante}
                >
                  Raise (${ante * 2})
                </button>
              </div>
            </>
          )}

          {state.phase === "settled" && (
            <div className="rd-result" style={{ marginTop: 8 }}>{state.lastResult}</div>
          )}
        </div>
      )}
    </div>
  );
}
