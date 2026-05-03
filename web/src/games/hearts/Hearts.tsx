import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HeartsState, HeartsSettings, HeartsAction } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Hearts.css";

export function Hearts({ state, dispatch, onGameOver }: GameProps<HeartsState, HeartsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, currentTrick, turn, heartsBroken, tricksPlayed, takenCards, handDone, finalScores, phase, passSelection } = state;
  const myHand = hands[0] ?? [];

  const legalIds = new Set(
    !handDone && phase === "playing" && turn === 0 ? legalPlays(state, 0, myHand).map(c => c.id) : []
  );

  const penalties = takenCards.map(cards =>
    cards.reduce((sum, c) => (c.suit === "♥" ? sum + 1 : c.suit === "♠" && c.rank === 12 ? sum + 13 : sum), 0)
  );
  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;

  const sortedHand = [...myHand].sort((a, b) => {
    const order = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 } as const;
    const sd = order[a.suit] - order[b.suit];
    return sd !== 0 ? sd : a.rank - b.rank;
  });

  let statusLine: string;
  if (handDone) statusLine = "Hand complete!";
  else if (phase === "passing") statusLine = "Pick 3 cards to pass left";
  else if (turn === 0) statusLine = currentTrick.length === 0 ? "Your lead" : "Your turn";
  else statusLine = `Bot ${turn} thinking…`;

  const moonText = (() => {
    if (!handDone || !finalScores) return "";
    const shooter = finalScores.findIndex(s => s === 0) >= 0 && finalScores.filter(s => s === 26).length === 3 ? finalScores.findIndex(s => s === 0) : -1;
    if (shooter < 0) return "";
    return shooter === 0 ? "You shot the moon!" : `${seatName(shooter)} shot the moon!`;
  })();

  return (
    <div className="hearts-wrap">
      <div className="hearts-hud">
        <div>Trick <b>{tricksPlayed}/13</b></div>
        <div>Hearts broken: <b>{heartsBroken ? "yes" : "no"}</b></div>
        {[0, 1, 2, 3].map(s => <div key={s}>{seatName(s)}: <b>{penalties[s]}</b></div>)}
      </div>

      <div className="hearts-bots">
        {[1, 2, 3].map(s => (
          <div key={s} className={`hearts-seat ${turn === s && phase === "playing" ? "active" : ""}`}>
            <div className="hearts-seat-label">{seatName(s)}</div>
            <div className="hearts-card-row">
              {hands[s]!.slice(0, 8).map((_, i) => <div key={i} className="hearts-card-tight"><Card faceDown /></div>)}
            </div>
            <div className="hearts-pts">{penalties[s]} pts</div>
          </div>
        ))}
      </div>

      <div className="hearts-trick">
        <div className="hearts-trick-label">
          Current trick {currentTrick.length > 0 ? `(led ${currentTrick[0]!.card.suit})` : ""}
        </div>
        <div className="hearts-trick-cards">
          {currentTrick.length === 0
            ? <div className="hearts-empty">— no cards yet —</div>
            : currentTrick.map(({ seat, card }) => (
                <div key={card.id} className="hearts-trick-slot">
                  <div className="hearts-trick-seat">{seatName(seat)}</div>
                  <Card card={card} />
                </div>
              ))}
        </div>
      </div>

      <div className="hearts-status">{statusLine}</div>

      {phase === "passing" && (
        <div className="hearts-pass">
          <div className="hearts-pass-label">Selected: {passSelection.length}/3</div>
          <button data-testid="hint-target-hearts-action"
            className="hearts-btn primary"
            disabled={passSelection.length !== 3}
            onClick={() => (dispatch as (a: HeartsAction) => void)({ type: "submitPass" })}
          >
            Pass 3 cards left
          </button>
        </div>
      )}

      <div className="hearts-you">
        <div className="hearts-pass-label">Your hand — {penalties[0]} pts taken</div>
        <div className="hearts-hand">
          {sortedHand.map((card, idx) => {
            const isSel = passSelection.includes(card.id);
            const playable = phase === "playing" && legalIds.has(card.id);
            const interactive = phase === "passing" || playable;
            const cls = phase === "passing"
              ? (isSel ? "selected" : "")
              : (playable ? "legal" : "illegal");
            const handleClick = () => {
              if (phase === "passing") (dispatch as (a: HeartsAction) => void)({ type: "togglePass", cardId: card.id });
              else if (playable) (dispatch as (a: HeartsAction) => void)({ type: "play", cardId: card.id });
            };
            return (
              <div
                key={card.id}
                className={`hearts-card-slot ${cls}`}
                role="button"
                tabIndex={interactive ? 0 : -1}
                aria-label={`Card ${idx + 1}${isSel ? ", selected to pass" : ""}${!playable && phase === "playing" ? ", not playable" : ""}`}
                aria-pressed={isSel}
                onClick={handleClick}
                onKeyDown={(e) => { if (interactive && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleClick(); } }}
              >
                <Card card={card} />
              </div>
            );
          })}
        </div>
      </div>

      {handDone && finalScores && (
        <div className="hearts-result">
          <h2>Hand Over</h2>
          <div className="hearts-result-scores">
            {[0, 1, 2, 3].map(s => <div key={s}>{seatName(s)}: {finalScores[s]} pts</div>)}
          </div>
          {moonText && <div className="hearts-moon">{moonText}</div>}
          <div>Score: <b>{Math.max(0, 26 - finalScores[0]!)}</b> / 26</div>
        </div>
      )}
    </div>
  );
}
