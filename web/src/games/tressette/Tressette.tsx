import { useEffect } from "react";
import type { Card as CardType } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TressetteState } from "./state.js";
import { isTerminal } from "./state.js";
import "./Tressette.css";

type TressetteAction = { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

function cardPoints(rank: number): number {
  if (rank === 1 || rank === 2 || rank === 3) return 1;
  return 0;
}

function isFaceCard(rank: number): boolean {
  return rank === 11 || rank === 12 || rank === 13;
}

export function Tressette({ state, dispatch, onGameOver }: GameProps<TressetteState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trick, phase, message } = state;
  const currentTrick = trick ?? [];
  const wonCards: readonly (readonly CardType[])[] = [[], [], [], []];
  const playerHand = hands[0] ?? [];

  const team02 = (wonCards[0] ?? []).concat(wonCards[2] ?? []);
  const team13 = (wonCards[1] ?? []).concat(wonCards[3] ?? []);
  const pts02 = team02.reduce((s: number, c: CardType) => s + cardPoints(c.rank), 0)
    + Math.floor(team02.filter((c: CardType) => isFaceCard(c.rank)).length / 3);
  const pts13 = team13.reduce((s: number, c: CardType) => s + cardPoints(c.rank), 0)
    + Math.floor(team13.filter((c: CardType) => isFaceCard(c.rank)).length / 3);

  return (
    <div className="tressette fade-in">
      <div className="tressette-header">
        <span>Your team (You+S3): {pts02} pts</span>
        <span>Opponents (S2+S4): {pts13} pts</span>
      </div>
      <div className="tressette-message">{message}</div>

      <div className="tressette-trick">
        {currentTrick.length === 0
          ? <span className="tressette-label">— trick area —</span>
          : currentTrick.map(({ seat, card }: { seat: number; card: CardType }) => (
            <div key={card.id} style={{ textAlign: "center" }}>
              <div className="tressette-label">{seat === 0 ? "You" : `S${seat + 1}`}</div>
              <div className={`tressette-card${card.rank === 3 || card.rank === 2 ? " high" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333" }}>
                {card.suit}{rankLabel(card.rank)}
              </div>
            </div>
          ))}
      </div>

      {phase === "playing" && (
        <>
          <div className="tressette-label">Your hand — click to play:</div>
          <div className="tressette-hand">
            {playerHand.map((card: CardType) => (
              <div key={card.id}
                className={`tressette-card${card.rank === 3 || card.rank === 2 ? " high" : ""}`}
                style={{ color: isRed(card.suit) ? "#c62828" : "#333" }}
                onClick={() => dispatch({ type: "play", cardId: card.id } as TressetteAction)}
              >
                {card.suit}{rankLabel(card.rank)}
                <div style={{ fontSize: "0.65rem", color: "#888" }}>{cardPoints(card.rank)}pt</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
