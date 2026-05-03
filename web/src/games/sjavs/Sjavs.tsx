import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SjavsState, SjavsSettings } from "./state.js";
import { legalPlays, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Sjavs.css";

type SjavsAction = { type: "play"; cardId: string };
const SEAT_NAMES = ["You", "Bot 1", "Bot 2*", "Bot 3"];

export function Sjavs({ state, dispatch, onGameOver }: GameProps<SjavsState, SjavsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, trumpSuit, currentTrick, turn, phase, tricks, teamTricks, teamScore, message } = state;
  const done = phase === "done";
  const legalIds = new Set(
    (!done && turn === 0) ? legalPlays(state, 0).map(c => c.id) : []
  );

  return (
    <div className="sjavs">
      <div className="sj-header">
        <span>Team 0 (You+Bot2): {teamScore[0]} pts</span>
        <span>Team 1 (Bot1+Bot3): {teamScore[1]} pts</span>
        <span>Trump: {trumpSuit}</span>
        <span>Tricks T0={teamTricks[0]} T1={teamTricks[1]}</span>
      </div>
      <div className="sj-bots-row">
        {[1, 2, 3].map(s => (
          <div key={s} className={`sj-seat${turn === s && !done ? " active" : ""}`}>
            <div className="sj-seat-label">{SEAT_NAMES[s]}</div>
            <div className="sj-card-backs">
              {hands[s]!.map((_, i) => <div key={i} className="sj-card-back" />)}
            </div>
            <div className="sj-seat-label">Won: {tricks[s]}</div>
          </div>
        ))}
      </div>
      <div className="sj-trick-area">
        <div className="sj-label">Current Trick</div>
        <div className="sj-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="sj-trick-slot">
                <div className="sj-trick-name">{SEAT_NAMES[seat]}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="sj-status">{message}</div>
      <div className="sj-player-area">
        <div className="sj-player-label">Your Hand — Won: {tricks[0]}</div>
        <div data-testid="hint-target-sjavs-hand" className="sj-player-hand">
          {hands[0]!.map(card => {
            const legal = legalIds.has(card.id);
            return legal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SjavsAction)} />
              : <Card key={card.id} card={card} className={turn === 0 ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="sj-result">
          <h2>Game Over</h2>
          <div>{message}</div>
          <div>Team 0: <strong>{teamScore[0]}</strong> | Team 1: <strong>{teamScore[1]}</strong></div>
        </div>
      )}
    </div>
  );
}
