import React from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CasinoWarState, CasinoWarAction, CasinoWarSettings } from "./state.js";
import { isTerminal } from "./state.js";
import type { Card } from "../../engines/deck/index.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Game.css";

type Props = GameProps<CasinoWarState, CasinoWarSettings>;

function CardView({ card }: { card?: Card | null }) {
  if (!card) return null;
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div className={`cw-card${red ? " red" : ""}`}>
      <span>{rankLabel(card.rank)}</span>
      <span style={{ fontSize: "0.75rem" }}>{card.suit}</span>
    </div>
  );
}

export function CasinoWar({ state, dispatch, onGameOver }: Props) {
  const term = isTerminal(state);
  if (term) onGameOver(term.score);

  const ante = parseInt(state.settings.anteSize, 10);

  return (
    <div className="cw-root">
      <div className="cw-bankroll">Bankroll: ${state.bankroll}</div>
      <div>Hand {state.handsPlayed} / {state.settings.handsPerSession}</div>

      {state.playerCard && (
        <div className="cw-table">
          <div className="cw-player-side">
            <div className="cw-label">You</div>
            <CardView card={state.playerCard} />
            {state.playerFinal && (
              <>
                <div style={{ fontSize: "0.75rem", color: "#888" }}>War card:</div>
                <CardView card={state.playerFinal} />
              </>
            )}
          </div>
          <div className="cw-vs">VS</div>
          <div className="cw-dealer-side">
            <div className="cw-label">Dealer</div>
            <CardView card={state.dealerCard} />
            {state.dealerFinal && (
              <>
                <div style={{ fontSize: "0.75rem", color: "#888" }}>War card:</div>
                <CardView card={state.dealerFinal} />
              </>
            )}
          </div>
        </div>
      )}

      {state.phase === "tie-decision" && (
        <div className="cw-section">
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>TIE! Choose your action:</div>
          <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: 8 }}>
            Surrender: lose half ante (${Math.floor(ante / 2)}). Go to War: match ante and fight!
          </div>
          <div className="cw-actions">
            <button className="cw-btn secondary" onClick={() => dispatch({ type: "surrender" } as CasinoWarAction)}>
              Surrender (−${Math.floor(ante / 2)})
            </button>
            <button data-testid="hint-target-casino-war-war"
              className="cw-btn primary"
              onClick={() => dispatch({ type: "go-to-war" } as CasinoWarAction)}
              disabled={state.bankroll < ante}
            >
              Go to War! (${ante} more)
            </button>
          </div>
        </div>
      )}

      {(state.phase === "betting" || state.phase === "settled") && (
        <div className="cw-section">
          {state.lastResult && <div className="cw-result">{state.lastResult}</div>}
          <div className="cw-actions">
            <button data-testid="hint-target-casino-war-deal"
              className="cw-btn deal"
              onClick={() => dispatch({ type: "deal" } as CasinoWarAction)}
              disabled={state.bankroll < ante || state.handsPlayed >= state.settings.handsPerSession}
            >
              Deal (${ante})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
