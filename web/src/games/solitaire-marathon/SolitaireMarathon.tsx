import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SolitaireMarathonState, SolitaireMarathonSettings, Card } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./SolitaireMarathon.css";

const RANK_LABELS: Record<number, string> = {
  1: "A", 11: "J", 12: "Q", 13: "K",
};
function rankLabel(r: number) { return RANK_LABELS[r] ?? String(r); }
function isRed(suit: Card["suit"]) { return suit === "♥" || suit === "♦"; }

function canCollectTop(pile: Card[]) {
  if (pile.length < 2) return false;
  const top = pile[pile.length - 1]!;
  const second = pile[pile.length - 2]!;
  return top.suit === second.suit || top.rank === second.rank;
}

export function SolitaireMarathon({ state, dispatch, onGameOver }: GameProps<SolitaireMarathonState, SolitaireMarathonSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const remaining = state.deck.length - state.deckIdx;
  const collectible = canCollectTop(state.pile);

  return (
    <div className="solitaire-marathon">
      <div className="sol-marathon-info">
        <span>Round: {state.round}/{state.totalRounds}</span>
        <span>Collected: {state.collected}</span>
        <span>Total: {state.totalCollected + state.collected}</span>
        <span>Deck: {remaining}</span>
      </div>

      <div className="sol-marathon-area">
        <div className="sol-marathon-deck-zone">
          <div
            className={`sol-marathon-card-back ${remaining === 0 || state.roundOver ? "empty" : ""}`}
            onClick={() => dispatch({ type: "draw" })}
            title="Draw a card"
          >
            🂠
          </div>
          <span style={{ fontSize: "0.8rem", color: "#aaa" }}>Draw</span>
        </div>

        <div className="sol-marathon-pile-zone">
          <div className="sol-marathon-top-cards">
            {state.pile.slice(-2).map((card, i) => (
              <div key={i} className={`sol-marathon-card ${isRed(card.suit) ? "red" : "black"}`}>
                <span>{rankLabel(card.rank)}</span>
                <span>{card.suit}</span>
              </div>
            ))}
            {state.pile.length === 0 && <div style={{ color: "#555", padding: "10px" }}>No cards yet</div>}
          </div>
          <button
            className="sol-marathon-collect-btn"
            disabled={!collectible}
            onClick={() => dispatch({ type: "collect" })}
          >
            Collect Pair
          </button>
          <span style={{ fontSize: "0.8rem", color: "#aaa" }}>Pile: {state.pile.length} cards</span>
        </div>
      </div>

      <div className="sol-marathon-hint">
        Draw cards one at a time. If the top two pile cards share a suit or rank, click Collect Pair to remove them and score 2 points.
      </div>

      {state.roundOver && !state.gameOver && (
        <div className="sol-marathon-buttons">
          <button onClick={() => dispatch({ type: "nextRound" })}>Next Round</button>
        </div>
      )}

      {state.gameOver && (
        <>
          <div className="sol-marathon-status">Game over! Total collected: {state.totalCollected} — Score: {terminal?.score}/100</div>
          <div className="sol-marathon-buttons">
            <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
          </div>
        </>
      )}
    </div>
  );
}
