import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpadesState, SpadesSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Spades.css";

type SpadesAction =
  | { type: "bid"; amount: number }
  | { type: "play"; cardId: string };

const SEAT_NAMES = ["You", "Bot 1", "Bot 2 (Partner)", "Bot 3"];

export function Spades({ state, dispatch, onGameOver }: GameProps<SpadesState, SpadesSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase === "bidding" && state.turn === 0 && /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        (dispatch as (a: SpadesAction) => void)({ type: "bid", amount: parseInt(e.key, 10) });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase, state.turn]);

  const { hands, bids, tricks, currentTrick, turn, phase, teamScore, teamBags, message, spadesBroken } = state;
  const done = phase === "done";

  const legalIds = new Set(
    !done && phase === "playing" && turn === 0 ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="spades-wrap">
      <div className="spades-hud">
        <div>Team You/Bot2 <b>{teamScore[0]}</b> pts <span className="spades-bags">({teamBags[0]} bags)</span></div>
        <div>Team Bot1/Bot3 <b>{teamScore[1]}</b> pts <span className="spades-bags">({teamBags[1]} bags)</span></div>
        <div>Spades broken: <b>{spadesBroken ? "yes" : "no"}</b></div>
      </div>

      <div className="spades-bots">
        {[1, 2, 3].map(s => (
          <div key={s} className={`spades-seat ${turn === s && !done ? "active" : ""}`}>
            <div className="spades-seat-label">{SEAT_NAMES[s]}</div>
            <div className="spades-card-row">
              {hands[s]!.slice(0, 8).map((_, i) => <div key={i} className="spades-card-tight"><Card faceDown /></div>)}
            </div>
            <div className="spades-bid-info">
              Bid <b>{bids[s] === null ? "?" : bids[s] === 0 ? "Nil" : bids[s]}</b> · Won <b>{tricks[s]}</b>
            </div>
          </div>
        ))}
      </div>

      <div className="spades-trick">
        <div className="spades-trick-label">Current trick</div>
        <div className="spades-trick-cards">
          {currentTrick.length === 0
            ? <div className="spades-empty">— no cards yet —</div>
            : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="spades-trick-slot">
                  <div className="spades-trick-seat">{SEAT_NAMES[seat]}</div>
                  <Card card={card} />
                </div>
              ))}
        </div>
      </div>

      <div className="spades-status">{message}</div>

      {phase === "bidding" && turn === 0 && (
        <div className="spades-bid-area">
          <div className="spades-bid-label">Your bid (0 = Nil)</div>
          <div className="spades-bid-buttons">
            {Array.from({ length: 14 }, (_, i) => (
              <button data-testid="hint-target-spades-primary"
                key={i}
                className="spades-bid-btn"
                aria-label={`Bid ${i === 0 ? "Nil" : i} ${i <= 9 ? `(key ${i})` : ""}`}
                onClick={() => (dispatch as (a: SpadesAction) => void)({ type: "bid", amount: i })}
              >
                {i === 0 ? "Nil" : String(i)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="spades-you">
        <div className="spades-pass-label">
          Your hand · Bid <b>{bids[0] === null ? "?" : bids[0] === 0 ? "Nil" : bids[0]}</b> · Won <b>{tricks[0]}</b>
        </div>
        <div className="spades-hand">
          {[...hands[0]!]
            .sort((a, b) => {
              const order = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 } as const;
              const sd = order[a.suit] - order[b.suit];
              return sd !== 0 ? sd : a.rank - b.rank;
            })
            .map((card, idx) => {
              const legal = legalIds.has(card.id);
              const play = () => legal && (dispatch as (a: SpadesAction) => void)({ type: "play", cardId: card.id });
              return (
                <div
                  key={card.id}
                  className={`spades-card-slot ${legal ? "legal" : "illegal"}`}
                  role="button"
                  tabIndex={legal ? 0 : -1}
                  aria-label={`Card ${idx + 1}${legal ? "" : ", not playable"}`}
                  aria-disabled={!legal}
                  onClick={play}
                  onKeyDown={(e) => { if (legal && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); play(); } }}
                >
                  <Card card={card} />
                </div>
              );
            })}
        </div>
      </div>

      {done && (
        <div className="spades-result">
          <h2>Hand Complete</h2>
          <div>{message}</div>
          <div className="spades-result-grid">
            {[0, 1, 2, 3].map(s => (
              <div key={s}>{SEAT_NAMES[s]}: bid {bids[s] === 0 ? "Nil" : bids[s]} · won {tricks[s]}</div>
            ))}
          </div>
          <div className="spades-result-totals">
            Your team: <b>{teamScore[0]}</b> · Bots: <b>{teamScore[1]}</b>
          </div>
        </div>
      )}
    </div>
  );
}
