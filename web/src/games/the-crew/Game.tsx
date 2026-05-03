import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrewState, CrewAction, CrewCard } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const COLOR_SYMBOL: Record<string, string> = {
  red: "R", yellow: "Y", green: "G", blue: "B", rocket: "🚀"
};

function Card({ card, selected, onClick, isTask }: {
  card: CrewCard | null;
  selected?: boolean;
  onClick?: () => void;
  isTask?: boolean;
}) {
  if (!card) {
    return <div className="crew-card crew-card--empty">·</div>;
  }
  let cls = `crew-card crew-card--${card.color}`;
  if (onClick) cls += " crew-card--clickable";
  if (selected) cls += " crew-card--selected";
  if (isTask) cls += " crew-card--task";
  return (
    <div className={cls} onClick={onClick} title={`${card.color} ${card.value}`}>
      <span style={{ fontSize: "0.65rem" }}>{COLOR_SYMBOL[card.color]}</span>
      <span>{card.value}</span>
    </div>
  );
}

export function TheCrewGame({ state, dispatch }: GameProps<CrewState, Record<string, never>>): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null);
  const terminal = isTerminal(state);

  const taskCardIds = new Set(state.tasks.map(t => t.card.id));
  const playerHand = state.hands[0]!;

  function handleCardClick(cardId: number) {
    if (terminal || state.turnInTrick !== 0) return;
    if (selected === cardId) {
      dispatch({ type: "playCard", cardId } satisfies CrewAction);
      setSelected(null);
    } else {
      setSelected(cardId);
    }
  }

  return (
    <div className="crew">
      <div className="crew-mission">
        <strong>Mission:</strong> You (Player 0) must win{" "}
        {state.tasks.map((t, i) => (
          <span key={i} style={{ fontWeight: "bold" }}>
            {t.card.color} {t.card.value}
            {t.completed ? " ✓" : ""}
          </span>
        ))}
      </div>

      {terminal && (
        <div className={`crew-status${state.won ? " crew-status--won" : " crew-status--lost"}`}>
          {state.won ? "Mission Complete! +100" : "Mission Failed"}
        </div>
      )}

      <div className="crew-section">
        <h3>Current Trick {state.currentTrick.led ? `(led: ${state.currentTrick.led})` : ""}</h3>
        <div className="crew-trick-area">
          {[0, 1, 2, 3].map(p => (
            <div key={p} className="crew-trick-slot">
              <span>P{p === 0 ? "You" : p}</span>
              <Card card={state.currentTrick.plays[p]?.card ?? null} />
            </div>
          ))}
        </div>
      </div>

      <div className="crew-section">
        <h3>Your Hand {state.turnInTrick === 0 ? "(your turn — click twice to play)" : "(bots playing...)"}</h3>
        <div className="crew-hand" data-testid="hint-target-the-crew-primary">
          {playerHand.map(card => (
            <Card
              key={card.id}
              card={card}
              selected={selected === card.id}
              onClick={() => handleCardClick(card.id)}
              isTask={taskCardIds.has(card.id)}
            />
          ))}
        </div>
      </div>

      {[1, 2, 3].map(bi => (
        <div key={bi} className="crew-section">
          <h3>Bot {bi} hand ({state.hands[bi]?.length} cards)</h3>
          <div className="crew-hand">
            {state.hands[bi]?.map(card => (
              <Card key={card.id} card={card} />
            ))}
          </div>
        </div>
      ))}

      <div className="crew-log">
        {state.log.slice(-8).reverse().map((m, i) => <div key={i}>{m}</div>)}
      </div>
    </div>
  );
}
