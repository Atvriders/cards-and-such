import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HighCardDrawState, HighCardDrawSettings } from "./state.js";
import { isTerminal, rankLabel } from "./state.js";
import "./HighCardDraw.css";

function CardDisplay({ rank, suit, hidden }: { rank: number; suit: string; hidden?: boolean }): JSX.Element {
  const isRed = suit === "♥" || suit === "♦";
  if (hidden) return <div className="hcd-card hcd-card-back">🂠</div>;
  return (
    <div className={`hcd-card ${isRed ? "red" : "black"}`}>
      <div className="hcd-rank-top">{rankLabel(rank as any)}{suit}</div>
      <div className="hcd-rank-mid">{suit}</div>
      <div className="hcd-rank-bot">{rankLabel(rank as any)}{suit}</div>
    </div>
  );
}

export function HighCardDraw({
  state,
  dispatch,
  onGameOver,
}: GameProps<HighCardDrawState, HighCardDrawSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const resultText = state.lastResult === "player"
    ? "You win the round!"
    : state.lastResult === "bot"
    ? "Bot wins the round!"
    : state.lastResult === "tie"
    ? "Tie — no points!"
    : null;

  return (
    <div className="hcd-game">
      <div className="hcd-title">High Card Draw</div>

      <div className="hcd-score">
        <div className="hcd-score-col player">
          <span className="hcd-score-name">You</span>
          <span className="hcd-score-val">{state.playerWins}</span>
        </div>
        <div className="hcd-score-goal">First to {state.roundsToWin}</div>
        <div className="hcd-score-col bot">
          <span className="hcd-score-name">Bot</span>
          <span className="hcd-score-val">{state.botWins}</span>
        </div>
      </div>

      <div className="hcd-table">
        <div className="hcd-player-area">
          <div className="hcd-label">Your card</div>
          {state.playerCard
            ? <CardDisplay rank={state.playerCard.rank} suit={state.playerCard.suit} />
            : <div className="hcd-card hcd-card-empty">?</div>
          }
        </div>

        <div className="hcd-vs">VS</div>

        <div className="hcd-bot-area">
          <div className="hcd-label">Bot card</div>
          {state.botCard
            ? <CardDisplay rank={state.botCard.rank} suit={state.botCard.suit} />
            : <div className="hcd-card hcd-card-empty">?</div>
          }
        </div>
      </div>

      {resultText && (
        <div className={`hcd-result ${state.lastResult}`}>
          {resultText}
        </div>
      )}

      {!state.done && (
        <button data-testid="hint-target-high-card-draw-action" className="hcd-draw-btn" onClick={() => dispatch({ type: "draw" })}>
          Draw Cards
        </button>
      )}

      {state.done && (
        <div className="hcd-game-over">
          {state.playerWon ? "You won the match!" : "Bot won the match!"}<br />
          <span className="hcd-final">Score: {terminal?.score}</span>
        </div>
      )}

      <div className="hcd-remaining">Cards left: {state.deck.length}</div>
    </div>
  );
}
