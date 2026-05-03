import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlienCardBattleState, AlienCardBattleSettings, AlienType } from "./state.js";
import { isTerminal } from "./state.js";
import "./AlienCardBattle.css";

const SPECIES_EMOJI: Record<AlienType, string> = {
  zorg: "👽",
  nexu: "🛸",
  vrix: "🌌",
  plaz: "⚡",
};

const ABILITY_LABEL: Record<string, string> = {
  double: "DOUBLE",
  steal: "STEAL",
  block: "BLOCK",
  none: "",
};

export function AlienCardBattle({ state, dispatch, onGameOver }: GameProps<AlienCardBattleState, AlienCardBattleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="alien-card-battle">
      <div className="acb-title">👽 ALIEN CARD BATTLE 👽</div>

      <div className="acb-scores">
        <span>You: {state.playerScore} wins</span>
        <span>Round {Math.min(state.roundNum, state.totalRounds)}/{state.totalRounds}</span>
        <span>Them: {state.opponentScore} wins</span>
      </div>

      <div className="acb-hand">
        {state.playerHand.map((card, idx) => (
          <button data-testid="hint-target-alien-card-battle-primary"
            key={card.id}
            className={`acb-card${state.selectedIdx === idx ? " selected" : ""}`}
            onClick={() => dispatch({ type: "select", idx })}
            disabled={state.gameOver}
          >
            <span>{SPECIES_EMOJI[card.species]}</span>
            <span style={{ fontWeight: "bold", fontSize: "0.72rem" }}>{card.name}</span>
            <span className="acb-card-str">{card.strength}</span>
            {card.ability !== "none" && (
              <span className="acb-card-abil">{ABILITY_LABEL[card.ability]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="acb-controls">
        <button data-testid="hint-target-alien-card-battle-play"
          onClick={() => dispatch({ type: "play" })}
          disabled={state.selectedIdx === null || state.gameOver}
        >
          Battle! ⚔️
        </button>
      </div>

      <div className="acb-result">{state.roundResult}</div>

      {state.gameOver && (
        <>
          <div className="acb-game-over">
            {state.playerWon
              ? `Victory! ${state.playerScore}–${state.opponentScore}`
              : state.playerScore === state.opponentScore
              ? `Draw! ${state.playerScore}–${state.opponentScore}`
              : `Defeated! ${state.playerScore}–${state.opponentScore}`}
          </div>
          <button onClick={() => dispatch({ type: "restart" })}>Battle Again</button>
        </>
      )}
    </div>
  );
}
