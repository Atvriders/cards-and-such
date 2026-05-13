import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NineCardBragState, NineCardBragSettings } from "./state.js";
import { isTerminal, bragHandScore } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type NineCardBragAction =
  | { type: "toggleCard"; index: number }
  | { type: "confirmGroup" }
  | { type: "resetArrangement" }
  | { type: "reveal" }
  | { type: "newRound" };

function handLabel(score: number): string {
  if (score >= 500) return "Prial";
  if (score >= 400) return "Straight Flush";
  if (score >= 300) return "Flush";
  if (score >= 200) return "Straight";
  if (score >= 100) return "Pair";
  return "High Card";
}

export function NineCardBragGame({ state, dispatch, onGameOver }: GameProps<NineCardBragState, NineCardBragSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, playerArrangement, botArrangement, phase, selected, currentGroup, playerWins, botWins, roundsTarget, roundResult } = state;

  // Which cards are already placed in a group
  const placedIndices = new Set((playerArrangement ?? []).flatMap(g => g.cards.map(c => playerHand.indexOf(c))));

  return (
    <div className="brag fade-in">
      <div className="brag-header">
        <h2>Nine-Card Brag</h2>
        <div className="brag-score pulse">You {playerWins} – Bot {botWins} (first to {roundsTarget})</div>
      </div>

      {phase === "arrange" && (
        <>
          <div className="brag-info">
            {currentGroup < 3
              ? `Select 3 cards for Hand ${currentGroup + 1}. Selected: ${selected.length}/3`
              : "All hands set — click Reveal!"}
          </div>
          <div className="brag-hand">
            {playerHand.map((card, i) => {
              const isPlaced = placedIndices.has(i);
              const isSel = selected.includes(i);
              return (
                <div key={card.id}
                  className={`brag-slot${isSel ? " sel" : ""}${isPlaced ? " placed" : " clickable"}`}
                  onClick={() => !isPlaced && dispatch({ type: "toggleCard", index: i } as NineCardBragAction)}>
                  <Card card={card} />
                </div>
              );
            })}
          </div>

          {(playerArrangement ?? []).map((g, gi) => (
            <div key={gi} className="brag-group">
              <span className="brag-group-label">Hand {gi + 1} ({handLabel(bragHandScore(g.cards))}):</span>
              <div className="brag-group-cards">{g.cards.map(c => <Card key={c.id} card={c} />)}</div>
            </div>
          ))}

          <div className="brag-arrange-actions">
            {currentGroup < 3 && (
              <button data-testid="hint-target-nine-card-brag-primary" className="brag-btn confirm" disabled={selected.length !== 3}
                onClick={() => dispatch({ type: "confirmGroup" } as NineCardBragAction)}>
                Confirm Hand {currentGroup + 1}
              </button>
            )}
            {currentGroup === 3 && (
              <button className="brag-btn reveal"
                onClick={() => dispatch({ type: "reveal" } as NineCardBragAction)}>
                Reveal!
              </button>
            )}
            <button className="brag-btn reset" onClick={() => dispatch({ type: "resetArrangement" } as NineCardBragAction)}>
              Reset
            </button>
          </div>
        </>
      )}

      {(phase === "reveal" || phase === "done") && (
        <>
          <div className="brag-result-label">{roundResult}</div>
          <div className="brag-comparison">
            {[0, 1, 2].map(i => {
              const pH = state.playerArrangement![i]!;
              const bH = botArrangement[i]!;
              const ps = bragHandScore(pH.cards);
              const bs = bragHandScore(bH.cards);
              const winner = ps > bs ? "You" : ps < bs ? "Bot" : "Tie";
              return (
                <div key={i} className="brag-round-row">
                  <div className="brag-hand-col">
                    <div className="brag-hand-label">Your Hand {i + 1} ({handLabel(ps)})</div>
                    <div className="brag-cards">{pH.cards.map(c => <Card key={c.id} card={c} />)}</div>
                  </div>
                  <div className={`brag-vs ${winner === "You" ? "win" : winner === "Bot" ? "lose" : "tie"}`}>{winner}</div>
                  <div className="brag-hand-col">
                    <div className="brag-hand-label">Bot Hand {i + 1} ({handLabel(bs)})</div>
                    <div className="brag-cards">{bH.cards.map(c => <Card key={c.id} card={c} />)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {phase === "reveal" && (
            <button className="brag-btn next" onClick={() => dispatch({ type: "newRound" } as NineCardBragAction)}>
              Next Round
            </button>
          )}
          {phase === "done" && (
            <div className="brag-final">{playerWins >= roundsTarget ? "You win!" : "Bot wins!"}</div>
          )}
        </>
      )}
    </div>
  );
}
