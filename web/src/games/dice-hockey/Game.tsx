import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceHockeyState, DiceHockeySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceHockey({ state, dispatch, onGameOver }: GameProps<DiceHockeyState, DiceHockeySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.phase === "gameOver";
  const yourTurn = state.possession === "player" && !isOver;
  const puckPct = `${state.puckPosition * 10}%`;

  return (
    <div className="dice-hockey">
      <div className="dh-scoreboard">
        <span>You: {state.playerScore}</span>
        <span>P{Math.min(state.period, state.totalPeriods)}/{state.totalPeriods}</span>
        <span>AI: {state.aiScore}</span>
      </div>

      <div className="dh-rink">
        <div className="dh-net dh-net-left">🥅</div>
        <div className="dh-ice">
          <div className="dh-puck" style={{ left: puckPct }}>🏒</div>
        </div>
        <div className="dh-net dh-net-right">🥅</div>
      </div>

      <div className="dh-possession">
        {state.possession === "player" ? "Your puck" : "AI puck"} — Position {state.puckPosition}/10
      </div>

      <div className="dh-last-play">{state.lastPlay}</div>

      {state.lastDice.length > 0 && (
        <div className="dh-dice">
          {state.lastDice.map((d, i) => <span key={i}>{DICE_FACES[d] ?? d}</span>)}
        </div>
      )}

      {!isOver && (
        <div className="dh-controls">
          {yourTurn ? (
            <>
              <button data-testid="hint-target-dice-hockey-play" onClick={() => dispatch({ type: "play", move: "pass" })}>Skate</button>
              <button data-testid="hint-target-dice-hockey-play" onClick={() => dispatch({ type: "play", move: "wrist" })} disabled={state.puckPosition > 5}>
                Wrist Shot {state.puckPosition > 5 ? "(far)" : ""}
              </button>
              <button data-testid="hint-target-dice-hockey-play" onClick={() => dispatch({ type: "play", move: "slap" })} disabled={state.puckPosition > 4}>
                Slap Shot {state.puckPosition > 4 ? "(far)" : ""}
              </button>
            </>
          ) : (
            <button data-testid="hint-target-dice-hockey-play" onClick={() => dispatch({ type: "play", move: "block" })}>Block / Steal</button>
          )}
        </div>
      )}

      {isOver && (
        <div className="dh-result">
          {state.playerScore > state.aiScore ? "You win!" :
           state.playerScore < state.aiScore ? "AI wins!" : "Tie!"}
        </div>
      )}

      <button className="dh-restart" onClick={() => dispatch({ type: "restart" })}>New Game</button>
    </div>
  );
}
