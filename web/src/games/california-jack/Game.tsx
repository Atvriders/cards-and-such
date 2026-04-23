import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CaliforniaJackState, CaliforniaJackSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type CaliforniaJackAction =
  | { type: "play"; cardId: string }
  | { type: "collectTrick" }
  | { type: "nextRound" };

export function CaliforniaJackGame({ state, dispatch, onGameOver }: GameProps<CaliforniaJackState, CaliforniaJackSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, botHand, currentTrick, trumpSuit, trickLead, playerScore, botScore, stock, phase, roundResult, settings } = state;
  const target = parseInt(settings.target, 10);

  const [pTrickCard, bTrickCard] = currentTrick;
  const canPlay = phase === "playing" && (trickLead === 0 ? (pTrickCard === null && bTrickCard === null) : (pTrickCard === null && bTrickCard !== null));
  const sorted = [...playerHand].sort((a, b) => {
    const ta = a.suit === trumpSuit ? 1 : 0;
    const tb = b.suit === trumpSuit ? 1 : 0;
    if (ta !== tb) return tb - ta;
    const ra = a.rank === 1 ? 14 : a.rank;
    const rb = b.rank === 1 ? 14 : b.rank;
    return ra - rb;
  });

  function play(): void {
    if (!selectedCard) return;
    dispatch({ type: "play", cardId: selectedCard } as CaliforniaJackAction);
    setSelectedCard(null);
  }

  return (
    <div className="cj">
      <div className="cj-header">
        <h2>California Jack</h2>
        <div className="cj-scores">You: {playerScore} · Bot: {botScore} (target: {target})</div>
        <div className="cj-trump">Trump: <strong>{trumpSuit}</strong> · Stock: {stock.length}</div>
      </div>

      <div className="cj-info">{roundResult}</div>

      <div className="cj-table">
        <div className="cj-trick-area">
          <div className="cj-trick-slot">
            <div className="cj-trick-label">You</div>
            {pTrickCard ? <Card card={pTrickCard} /> : <div className="cj-empty-trick" />}
          </div>
          <div className="cj-trick-slot">
            <div className="cj-trick-label">Bot</div>
            {bTrickCard ? <Card card={bTrickCard} /> : <div className="cj-empty-trick" />}
          </div>
        </div>
        <div className="cj-bot-hand-count">Bot's hand: {botHand.length} cards</div>
      </div>

      {phase === "drawing" && (
        <button className="cj-btn" onClick={() => dispatch({ type: "collectTrick" } as CaliforniaJackAction)}>
          Collect Trick
        </button>
      )}

      {phase === "scoring" && (
        <div className="cj-scoring">
          <div className="cj-scoring-result">{roundResult}</div>
          <div>Score: You {playerScore} – Bot {botScore}</div>
          <button className="cj-btn" onClick={() => dispatch({ type: "nextRound" } as CaliforniaJackAction)}>
            Next Round
          </button>
        </div>
      )}

      {phase === "playing" && (
        <>
          {!canPlay && trickLead === 1 && bTrickCard && (
            <div className="cj-bot-led">Bot led with {bTrickCard.rank}{bTrickCard.suit} — play your card!</div>
          )}
          <div className="cj-hand-label">Your hand ({trickLead === 0 ? "your lead" : "follow"}):</div>
          <div className="cj-hand">
            {sorted.map(c => (
              <div key={c.id}
                className={`cj-slot${c.suit === trumpSuit ? " trump" : ""}${selectedCard === c.id ? " sel" : ""}${canPlay ? " clickable" : ""}`}
                onClick={() => canPlay && setSelectedCard(selectedCard === c.id ? null : c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <button className="cj-btn" disabled={!selectedCard || !canPlay} onClick={play}>
            Play Card
          </button>
        </>
      )}

      {phase === "done" && (
        <div className="cj-done">
          <h3>{playerScore >= target ? "You Win!" : "Bot Wins!"}</h3>
          <div>Final: You {playerScore} – Bot {botScore}</div>
        </div>
      )}
    </div>
  );
}
