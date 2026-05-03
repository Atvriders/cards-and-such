import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoppelkopfState } from "./state.js";
import { isTerminal, isTrump, cardValue } from "./state.js";
import "./Doppelkopf.css";

type DKAction = { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

export function Doppelkopf({ state, dispatch, onGameOver }: GameProps<DoppelkopfState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, currentTrick, wonCards, teams, phase, message } = state;
  const playerHand = hands[0]!;
  const playerTeamIdx = teams[0]!.includes(0) ? 0 : 1;
  const playerTeam = playerTeamIdx === 0 ? "Re" : "Kontra";
  const pts = (seats: readonly number[]) =>
    seats.reduce((sum, s) => sum + wonCards[s]!.reduce((a, c) => a + cardValue(c.rank), 0), 0);

  return (
    <div className="doppelkopf">
      <div className="doppelkopf-header">
        <div className={`doppelkopf-team re`}>Re: {pts(teams[0]!)} pts</div>
        <div className={`doppelkopf-team kontra`}>Kontra: {pts(teams[1]!)} pts</div>
        <div style={{ fontSize: "0.8rem", color: "#666" }}>You are: {playerTeam}</div>
      </div>
      <div className="doppelkopf-message">{message}</div>

      <div className="doppelkopf-trick">
        {currentTrick.length === 0
          ? <span className="doppelkopf-label">— trick area —</span>
          : currentTrick.map(({ seat, card }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="doppelkopf-label">{seat === 0 ? "You" : `S${seat + 1}`}</div>
              <div className={`doppelkopf-card${isTrump(card) ? " trump" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333", cursor: "default" }}>
                {card.suit}{rankLabel(card.rank)}
              </div>
            </div>
          ))}
      </div>

      {phase === "playing" && (
        <>
          <div className="doppelkopf-label">Your hand — click to play:</div>
          <div className="doppelkopf-hand">
            {playerHand.map(card => (
              <div data-testid="hint-target-doppelkopf-primary" key={card.id}
                className={`doppelkopf-card${isTrump(card) ? " trump" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333" }}
                onClick={() => dispatch({ type: "play", cardId: card.id } as DKAction)}
              >
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.6rem", color: "#888" }}>{cardValue(card.rank)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
