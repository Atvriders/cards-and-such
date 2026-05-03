import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WizardCardDuelState, WizardCardDuelSettings, SpellType } from "./state.js";
import { isTerminal } from "./state.js";
import "./WizardCardDuel.css";

const TYPE_EMOJI: Record<SpellType, string> = {
  fire: "🔥",
  ice: "❄️",
  lightning: "⚡",
  shield: "🛡️",
  drain: "💜",
};

export function WizardCardDuel({ state, dispatch, onGameOver }: GameProps<WizardCardDuelState, WizardCardDuelSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="wizard-card-duel">
      <div className="wcd-title">✨ Wizard Card Duel ✨</div>
      <div className="wcd-round">Round {state.round}</div>

      <div className="wcd-hp-row">
        <span>You: {state.playerHp} HP {state.playerShield ? "🛡" : ""}</span>
        <span>Opponent: {state.opponentHp} HP {state.opponentShield ? "🛡" : ""}</span>
      </div>

      <div className="wcd-hand">
        {state.playerHand.map((card, idx) => (
          <button data-testid="hint-target-wizard-card-duel-primary"
            key={card.id}
            className={`wcd-card${state.selectedIdx === idx ? " selected" : ""}`}
            onClick={() => dispatch({ type: "select", idx })}
            disabled={state.gameOver}
          >
            <span>{TYPE_EMOJI[card.type]}</span>
            <span className="wcd-card-type">{card.type}</span>
            <span style={{ fontWeight: "bold" }}>{card.name}</span>
            <span className="wcd-card-power">{card.type === "shield" ? "🛡" : `${card.power} dmg`}</span>
          </button>
        ))}
      </div>

      <div className="wcd-controls">
        <button
          onClick={() => dispatch({ type: "play" })}
          disabled={state.selectedIdx === null || state.gameOver}
        >
          Cast Spell ✨
        </button>
      </div>

      <div className="wcd-log">
        {state.log.map((line, i) => <p key={i}>{line}</p>)}
      </div>

      <div style={{ fontSize: "0.75rem", color: "#8870c0" }}>
        🔥 beats ❄️ · ❄️ beats ⚡ · ⚡ beats 🔥 · 💜 drains HP
      </div>

      {state.gameOver && (
        <>
          <div className="wcd-game-over">
            {state.playerWon ? "Victory! You won the duel!" : "Defeated! The opponent wins."}
          </div>
          <button onClick={() => dispatch({ type: "restart" })}>Duel Again</button>
        </>
      )}
    </div>
  );
}
