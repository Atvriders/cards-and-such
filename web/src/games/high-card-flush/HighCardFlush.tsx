import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HCFState, HCFAction, HCFSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./HighCardFlush.css";

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

function rankStr(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function HighCardFlush({
  state,
  dispatch,
  onGameOver,
}: GameProps<HCFState, HCFSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const gameOver = terminal !== null;

  return (
    <div className="hcf-game">
      <div className="hcf-title">High Card Flush</div>
      <div className="hcf-bankroll">Bankroll: ${state.bankroll}</div>
      <div className="hcf-round-info">
        Round {state.currentRound} / {state.totalRounds} — Bet: ${state.betAmount}
      </div>

      {state.phase === "reveal" && state.lastOutcome && (
        <>
          <div className="hcf-hands">
            <div className="hcf-hand-section">
              <div className="hcf-hand-label">Your Hand</div>
              <div className="hcf-cards">
                {state.playerHand.map((c) => {
                  const inFlush = state.playerFlush?.cards.some((f) => f.id === c.id);
                  return (
                    <div key={c.id} className={`hcf-card${isRed(c.suit) ? " red" : ""}${inFlush ? " flush-best" : ""}`}>
                      {rankStr(c.rank)}{c.suit}
                    </div>
                  );
                })}
              </div>
              {state.playerFlush && (
                <div className="hcf-flush-summary">
                  Best flush: {state.playerFlush.cards.length} {state.playerFlush.suit}
                </div>
              )}
            </div>
            <div className="hcf-hand-section">
              <div className="hcf-hand-label">Bot's Hand</div>
              <div className="hcf-cards">
                {state.botHand.map((c) => {
                  const inFlush = state.botFlush?.cards.some((f) => f.id === c.id);
                  return (
                    <div key={c.id} className={`hcf-card${isRed(c.suit) ? " red" : ""}${inFlush ? " flush-best" : ""}`}>
                      {rankStr(c.rank)}{c.suit}
                    </div>
                  );
                })}
              </div>
              {state.botFlush && (
                <div className="hcf-flush-summary">
                  Best flush: {state.botFlush.cards.length} {state.botFlush.suit}
                </div>
              )}
            </div>
          </div>

          {state.lastOutcome && (
            <div className={`hcf-result ${state.lastOutcome.winner === "player" ? "win" : state.lastOutcome.winner === "bot" ? "lose" : "draw"}`}>
              {state.lastOutcome.winner === "player" && `You win! +$${state.betAmount}`}
              {state.lastOutcome.winner === "bot" && `Bot wins! -$${state.betAmount}`}
              {state.lastOutcome.winner === "draw" && "Draw! Bet returned."}
            </div>
          )}
        </>
      )}

      {state.phase === "deal" && state.currentRound === 0 && (
        <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>
          Seven cards each. Longest flush wins!
        </div>
      )}

      {!gameOver && (
        <div className="hcf-actions">
          {state.phase === "deal" && (
            <button data-testid="hint-target-high-card-flush-primary" onClick={() => dispatch({ type: "deal" })}>Deal Cards</button>
          )}
          {state.phase === "reveal" && (
            <button onClick={() => dispatch({ type: "next-round" })}>Next Round</button>
          )}
        </div>
      )}

      {gameOver && (
        <div className="hcf-game-over">
          {state.bankroll > 1000 && `You win! Final bankroll: $${state.bankroll}`}
          {state.bankroll < 1000 && `Bot wins! Final bankroll: $${state.bankroll}`}
          {state.bankroll === 1000 && `Breakeven! Final bankroll: $${state.bankroll}`}
          <br />
          <span style={{ fontSize: "0.9rem", opacity: 0.75 }}>Score: {terminal?.score ?? 0}</span>
        </div>
      )}
    </div>
  );
}
