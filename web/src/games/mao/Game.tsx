import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MaoState, MaoSettings } from "./state.js";
import { isTerminal, RULE_HINTS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type MaoAction =
  | { type: "play"; cardId: string; announcement?: string }
  | { type: "draw" }
  | { type: "acknowledgePenalty" };

export function MaoGame({ state, dispatch, onGameOver }: GameProps<MaoState, MaoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, turn, discard, currentSuit, phase, penaltyMessage, discoveredRules, activeRules } = state;
  const myHand = hands[0]!;
  const topCard = discard[discard.length - 1]!;
  const isMyTurn = turn === 0 && phase === "playing";
  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;

  function toggleCard(id: string): void {
    if (!isMyTurn) return;
    setSelected(prev => prev === id ? null : id);
  }

  function playCard(): void {
    if (!selected) return;
    dispatch({ type: "play", cardId: selected, announcement: announcement.trim() } as MaoAction);
    setSelected(null);
    setAnnouncement("");
  }

  return (
    <div className="mao">
      <div className="mao-header">
        <h2>Mao</h2>
        <div className="mao-subtitle">The game with secret rules — discover them or face penalties!</div>
        <div className="mao-info">
          {[0, 1, 2, 3].map(s => (
            <span key={s}>{seatName(s)}: {hands[s]!.length}</span>
          ))}
        </div>
      </div>

      {discoveredRules.length > 0 && (
        <div className="mao-rules">
          <div className="mao-rules-title">Discovered Rules:</div>
          {discoveredRules.map(r => <div key={r} className="mao-rule-item">• {RULE_HINTS[r]}</div>)}
        </div>
      )}

      <div className="mao-pile">
        <div>
          <div className="mao-pile-label">Top card:</div>
          <Card card={topCard} />
        </div>
        <div>
          <div className="mao-pile-label">Suit:</div>
          <div className="mao-suit-display">{currentSuit}</div>
        </div>
      </div>

      {phase === "penalty" && (
        <div className="mao-penalty">
          <p style={{ fontWeight: 700 }}>Penalty!</p>
          <p>{penaltyMessage}</p>
          <p style={{ fontSize: ".8rem", opacity: .8 }}>You drew a card as penalty.</p>
          <button className="mao-penalty-btn" onClick={() => dispatch({ type: "acknowledgePenalty" } as MaoAction)}>
            OK, continue
          </button>
        </div>
      )}

      <div className="mao-status">
        {phase === "playing"
          ? isMyTurn ? "Your turn — select a card to play" : `Waiting for ${seatName(turn)}…`
          : phase === "penalty" ? "Penalty in progress" : "Game over!"}
      </div>

      {phase === "playing" && isMyTurn && (
        <div className="mao-announcement">
          <input
            type="text"
            placeholder="Type an announcement (if a rule requires it)…"
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
          />
        </div>
      )}

      {(phase === "playing" || phase === "penalty") && (
        <>
          <div className="mao-hand-label">Your hand ({myHand.length}):</div>
          <div className="mao-hand">
            {myHand.map(c => (
              <div key={c.id}
                className={`mao-slot${selected === c.id ? " sel" : ""}${isMyTurn ? " clickable" : ""}${isMyTurn && c.suit !== currentSuit && c.rank !== topCard.rank ? " dimmed" : ""}`}
                onClick={() => toggleCard(c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <div className="mao-actions">
            <button className="mao-btn play" onClick={playCard} disabled={!isMyTurn || !selected}>
              Play card
            </button>
            <button className="mao-btn draw" onClick={() => dispatch({ type: "draw" } as MaoAction)} disabled={!isMyTurn}>
              Draw
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="mao-result">
          <h3>Game Over!</h3>
          {hands[0]!.length === 0
            ? <div className="mao-win">You win! (Remember: in real Mao you must say "Mao" on your last card!)</div>
            : <div>Better luck next time!</div>}
          <div className="mao-rules-reveal">
            <strong>The secret rules were:</strong>
            {activeRules.map(r => <div key={r}>• {RULE_HINTS[r]}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
