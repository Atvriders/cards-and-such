import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PokerSquares2PState, PokerSquares2PSettings } from "./state.js";
import { isTerminal, scoreHand, scoreGrid } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type PokerSquares2PAction = { type: "place"; cellIndex: number };

function handLabel(score: number): string {
  if (score === 100) return "Royal Flush";
  if (score === 75) return "Str. Flush";
  if (score === 50) return "Four-of-Kind";
  if (score === 25) return "Full House";
  if (score === 20) return "Flush";
  if (score === 15) return "Straight";
  if (score === 10) return "Three-of-Kind";
  if (score === 5) return "Two Pair";
  if (score === 2) return "Pair";
  return score > 0 ? `${score}pts` : "—";
}

export function PokerSquares2PGame({ state, dispatch, onGameOver }: GameProps<PokerSquares2PState, PokerSquares2PSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { currentCard, playerGrid, botGrid, cardsPlaced, phase, playerScore, botScore } = state;

  const rowScores = [0, 1, 2, 3, 4].map(r => scoreHand(playerGrid.slice(r * 5, r * 5 + 5) as Parameters<typeof scoreHand>[0]));
  const colScores = [0, 1, 2, 3, 4].map(c => scoreHand([playerGrid[c], playerGrid[c + 5], playerGrid[c + 10], playerGrid[c + 15], playerGrid[c + 20]] as Parameters<typeof scoreHand>[0]));

  return (
    <div className="ps2p">
      <div className="ps2p-header">
        <h2>Poker Squares (2P)</h2>
        <div className="ps2p-info">Card {cardsPlaced}/25 placed · You: {scoreGrid([...playerGrid])} | Bot: {scoreGrid([...botGrid])}</div>
      </div>

      {phase === "placing" && currentCard && (
        <div className="ps2p-current">
          <div className="ps2p-current-label">Place this card:</div>
          <Card card={currentCard} />
        </div>
      )}

      <div className="ps2p-grids">
        <div className="ps2p-grid-section">
          <div className="ps2p-grid-title">Your Grid</div>
          <div className="ps2p-grid">
            {playerGrid.map((card, i) => (
              <div data-testid="hint-target-poker-squares-2p-primary" key={i} className={`ps2p-cell${card ? " filled" : phase === "placing" ? " empty clickable" : " empty"}`}
                onClick={() => !card && phase === "placing" && dispatch({ type: "place", cellIndex: i } as PokerSquares2PAction)}>
                {card ? <Card card={card} /> : <span className="ps2p-empty-label">+</span>}
              </div>
            ))}
          </div>
          <div className="ps2p-scores">
            <div className="ps2p-row-scores">
              {rowScores.map((s, i) => <div key={i} className="ps2p-score-badge">{handLabel(s)}</div>)}
            </div>
            <div className="ps2p-col-scores">
              {colScores.map((s, i) => <div key={i} className="ps2p-score-badge">{handLabel(s)}</div>)}
            </div>
          </div>
        </div>

        <div className="ps2p-grid-section bot">
          <div className="ps2p-grid-title">Bot Grid</div>
          <div className="ps2p-grid">
            {botGrid.map((card, i) => (
              <div key={i} className={`ps2p-cell${card ? " filled" : " empty"}`}>
                {card ? <Card card={card} /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {phase === "done" && (
        <div className="ps2p-result">
          <h3>{playerScore > botScore ? "You Win!" : playerScore < botScore ? "Bot Wins!" : "Tie!"}</h3>
          <div>Your score: {playerScore} · Bot score: {botScore}</div>
        </div>
      )}
    </div>
  );
}
