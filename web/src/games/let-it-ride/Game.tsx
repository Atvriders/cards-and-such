import React from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LetItRideState, LetItRideAction, LetItRideSettings } from "./state.js";
import { isTerminal } from "./state.js";
import type { Card } from "../../engines/deck/index.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Game.css";

type Props = GameProps<LetItRideState, LetItRideSettings>;

function CardView({ card, hidden }: { card: Card; hidden?: boolean }) {
  if (hidden) return <div className="lir-card hidden"><span>?</span></div>;
  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div className={`lir-card${red ? " red" : ""}`}>
      <span>{rankLabel(card.rank)}</span>
      <span style={{ fontSize: "0.7rem" }}>{card.suit}</span>
    </div>
  );
}

export function LetItRide({ state, dispatch, onGameOver }: Props) {
  const term = isTerminal(state);
  if (term) onGameOver(term.score);

  const ante = parseInt(state.settings.anteSize, 10);

  const revealCount = state.phase === "decision1" ? 0 : state.phase === "decision2" ? 1 : 2;

  return (
    <div className="lir-root">
      <div className="lir-bankroll">Bankroll: ${state.bankroll}</div>
      <div>Hand {state.handsPlayed + 1} / {state.settings.handsPerSession}</div>

      {(state.phase === "betting" || state.phase === "settled") && (
        <div className="lir-section">
          {state.lastResult && <div className="lir-result">{state.lastResult}</div>}
          <div className="lir-actions">
            <button data-testid="hint-target-let-it-ride-primary"
              className="lir-btn primary"
              onClick={() => dispatch({ type: "deal" } as LetItRideAction)}
              disabled={state.bankroll < ante * 3 || state.handsPlayed >= state.settings.handsPerSession}
            >
              Deal (3 × ${ante})
            </button>
          </div>
        </div>
      )}

      {(state.phase === "decision1" || state.phase === "decision2" || state.phase === "settled") && state.playerCards.length > 0 && (
        <div className="lir-section">
          <div className="lir-bets">
            <div className={`lir-bet${state.bet1Pulled ? " pulled" : ""}`}>
              {state.bet1Pulled ? "Pulled" : `$${ante}`}
              <div style={{ fontSize: "0.6rem", position: "absolute", bottom: 4 }}>Bet 1</div>
            </div>
            <div className={`lir-bet${state.bet2Pulled ? " pulled" : ""}`}>
              {state.bet2Pulled ? "Pulled" : `$${ante}`}
              <div style={{ fontSize: "0.6rem", position: "absolute", bottom: 4 }}>Bet 2</div>
            </div>
            <div className="lir-bet">
              ${ante}
              <div style={{ fontSize: "0.6rem", position: "absolute", bottom: 4 }}>Bet 3</div>
            </div>
          </div>

          <div className="lir-label" style={{ marginTop: 10 }}>Your cards:</div>
          <div className="lir-cards">
            {state.playerCards.map(c => <CardView key={c.id} card={c} />)}
          </div>

          <div className="lir-label" style={{ marginTop: 10 }}>Community cards:</div>
          <div className="lir-cards">
            <CardView card={state.community[0] ?? { rank: 1, suit: "♠", id: "x" }} hidden={revealCount < 1} />
            <CardView card={state.community[1] ?? { rank: 1, suit: "♠", id: "y" }} hidden={revealCount < 2} />
          </div>

          {state.phase === "decision1" && (
            <>
              <div className="lir-label" style={{ marginTop: 10 }}>Bet 1 decision — pull back ${ante} or let it ride?</div>
              <div className="lir-actions">
                <button className="lir-btn secondary" onClick={() => dispatch({ type: "pull-back" } as LetItRideAction)}>
                  Pull Back ${ante}
                </button>
                <button className="lir-btn primary" onClick={() => dispatch({ type: "let-it-ride" } as LetItRideAction)}>
                  Let It Ride!
                </button>
              </div>
            </>
          )}

          {state.phase === "decision2" && (
            <>
              <div className="lir-label" style={{ marginTop: 10 }}>Community card 1 revealed! Bet 2 decision:</div>
              <div className="lir-actions">
                <button className="lir-btn secondary" onClick={() => dispatch({ type: "pull-back" } as LetItRideAction)}>
                  Pull Back ${ante}
                </button>
                <button className="lir-btn primary" onClick={() => dispatch({ type: "let-it-ride" } as LetItRideAction)}>
                  Let It Ride!
                </button>
              </div>
            </>
          )}

          {state.phase === "settled" && (
            <div className="lir-result" style={{ marginTop: 8 }}>{state.lastResult}</div>
          )}
        </div>
      )}
    </div>
  );
}
