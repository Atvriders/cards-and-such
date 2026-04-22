import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HanabiState, HanabiAction, HanabiColor, HanabiNumber } from "./state.js";
import { COLORS, NUMBERS } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const COLOR_LABEL: Record<HanabiColor, string> = {
  red: "R", yellow: "Y", green: "G", blue: "B", white: "W"
};

function CardBack({ card }: { card: { knownColor: HanabiColor | null; knownNumber: HanabiNumber | null } }) {
  const label = [
    card.knownColor ? COLOR_LABEL[card.knownColor] : "?",
    card.knownNumber ? String(card.knownNumber) : "?",
  ].join("");
  return (
    <div className="hanabi-card hanabi-card--back">
      {label}
    </div>
  );
}

function CardFront({ card, selected, onClick }: {
  card: { color: HanabiColor; number: HanabiNumber };
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`hanabi-card hanabi-card-color-${card.color}${selected ? " hanabi-card--selected" : ""}`}
      onClick={onClick}
    >
      <span style={{ fontSize: "0.7rem" }}>{COLOR_LABEL[card.color]}</span>
      <span>{card.number}</span>
    </div>
  );
}

type ClueMode = { player: number; type: "color" | "number" } | null;

export function HanabiGame({ state, dispatch }: GameProps<HanabiState, Record<string, never>>): JSX.Element {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [clueMode, setClueMode] = useState<ClueMode>(null);
  const terminal = isTerminal(state);

  function handlePlay() {
    if (selectedCard === null) return;
    dispatch({ type: "playCard", index: selectedCard } satisfies HanabiAction);
    setSelectedCard(null);
  }

  function handleDiscard() {
    if (selectedCard === null) return;
    dispatch({ type: "discardCard", index: selectedCard } satisfies HanabiAction);
    setSelectedCard(null);
  }

  function handleClue(type: "color" | "number", value: HanabiColor | HanabiNumber) {
    if (!clueMode) return;
    dispatch({ type: "giveClue", toPlayer: clueMode.player, clueType: type, value } satisfies HanabiAction);
    setClueMode(null);
  }

  const playerHand = state.hands[0]!;

  return (
    <div className="hanabi hanabi-wrap">
      {terminal && (
        <div className="hanabi-overlay">
          <h2>{state.won ? "Fireworks! You won!" : "Game over"}</h2>
          <p>Score: {state.score} / 25</p>
        </div>
      )}

      <div className="hanabi-tokens">
        <span>Clues: {state.clueTokens}/8</span>
        <span>Lives: {"❤️".repeat(state.lives)}{"🖤".repeat(3 - state.lives)}</span>
        <span>Deck: {state.deck.length}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="hanabi-fireworks">
        {COLORS.map(color => (
          <div key={color} className={`hanabi-fw hanabi-color-${color}`}>
            <div className="hanabi-fw-bar">
              <div className="hanabi-fw-fill" style={{ height: `${(state.fireworks[color] / 5) * 100}%` }} />
            </div>
            <span>{COLOR_LABEL[color]}: {state.fireworks[color]}</span>
          </div>
        ))}
      </div>

      <div className="hanabi-section">
        <h3>Your hand (you can see it)</h3>
        <div className="hanabi-hand">
          {playerHand.map((card, i) => (
            <CardBack
              key={card.id}
              card={card}
            />
          ))}
        </div>
        <div className="hanabi-hand" style={{ marginTop: 4 }}>
          {playerHand.map((card, i) => (
            <CardFront
              key={card.id}
              card={card}
              selected={selectedCard === i}
              onClick={() => setSelectedCard(selectedCard === i ? null : i)}
            />
          ))}
        </div>
        <p style={{ fontSize: "0.75rem", color: "#888", margin: "4px 0 0" }}>
          Top row = what you "see" (clue marks). Bottom row = actual cards (for reference). Click a bottom card to select.
        </p>
      </div>

      <div className="hanabi-actions">
        <button
          className="hanabi-btn"
          disabled={selectedCard === null || terminal !== null}
          onClick={handlePlay}
        >
          Play Card
        </button>
        <button
          className="hanabi-btn hanabi-btn--danger"
          disabled={selectedCard === null || state.clueTokens >= 8 || terminal !== null}
          onClick={handleDiscard}
        >
          Discard
        </button>
        <button
          className="hanabi-btn"
          disabled={state.clueTokens <= 0 || terminal !== null}
          onClick={() => setClueMode(clueMode ? null : { player: 1, type: "color" })}
        >
          Give Clue
        </button>
      </div>

      {clueMode && (
        <div className="hanabi-clue-panel">
          <div className="hanabi-clue-row">
            <strong>To player:</strong>
            {[1, 2, 3].map(p => (
              <button
                key={p}
                className={`hanabi-clue-btn${clueMode.player === p ? " hanabi-clue-btn--selected" : ""}`}
                onClick={() => setClueMode({ ...clueMode, player: p })}
              >
                Bot {p}
              </button>
            ))}
          </div>
          <div className="hanabi-clue-row">
            <strong>Color:</strong>
            {COLORS.map(c => (
              <button key={c} className="hanabi-clue-btn" onClick={() => handleClue("color", c)}>{c}</button>
            ))}
          </div>
          <div className="hanabi-clue-row">
            <strong>Number:</strong>
            {NUMBERS.map(n => (
              <button key={n} className="hanabi-clue-btn" onClick={() => handleClue("number", n)}>{n}</button>
            ))}
          </div>
        </div>
      )}

      {[1, 2, 3].map(bi => (
        <div key={bi} className="hanabi-section">
          <h3>Bot {bi} hand</h3>
          <div className="hanabi-hand">
            {state.hands[bi]?.map(card => (
              <CardFront key={card.id} card={card} />
            ))}
          </div>
        </div>
      ))}

      <div className="hanabi-log">
        {state.log.slice(-10).reverse().map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
}
