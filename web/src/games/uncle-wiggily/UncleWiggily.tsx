import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UncleWiggilyState, UncleWiggilySettings } from "./state.js";
import { isTerminal, SPECIAL_SPACES, FINISH, PLAYER_COLORS, PLAYER_NAMES } from "./state.js";
import "./UncleWiggily.css";

function cardLabel(card: import("./state.js").WiggilyCard): string {
  switch (card.kind) {
    case "move":  return `Move +${card.value}`;
    case "back":  return `Go back ${card.value}`;
    case "skip":  return "Skip a turn!";
    case "bonus": return `Bonus +${card.value} next move`;
    case "jump":  return `Story Jump → Space ${card.to}`;
  }
}

export function UncleWiggily({
  state,
  dispatch,
  onGameOver,
}: GameProps<UncleWiggilyState, UncleWiggilySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const specialSpaceNums = new Set(SPECIAL_SPACES.map((s) => s.space));

  return (
    <div className="uncle-wiggily">
      <div className="uw-title">Uncle Wiggily's Race</div>

      <div className="uw-players">
        {Array.from({ length: state.numPlayers }, (_, i) => (
          <div className="uw-player" key={i}>
            <div className="uw-player-dot" style={{ background: PLAYER_COLORS[i] }} />
            <span style={{ fontWeight: state.turn === i ? 700 : 400 }}>
              {PLAYER_NAMES[i]}: space {state.positions[i]}
            </span>
          </div>
        ))}
      </div>

      <div className="uw-track">
        {Array.from({ length: 80 }, (_, i) => {
          const space = i + 1;
          const isFinish = space === FINISH;
          const isSpecial = specialSpaceNums.has(space);
          const playersHere = Array.from({ length: state.numPlayers }, (_, p) => p).filter(
            (p) => state.positions[p] === space
          );
          return (
            <div
              key={space}
              className={`uw-space${isFinish ? " finish" : isSpecial ? " special" : ""}`}
              title={isSpecial ? SPECIAL_SPACES.find((s) => s.space === space)?.label : undefined}
            >
              {isFinish ? "🏁" : space}
              {playersHere.length > 0 && (
                <div className="uw-tokens">
                  {playersHere.map((p) => (
                    <div key={p} className="uw-token" style={{ background: PLAYER_COLORS[p] }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {state.winner !== null ? (
        <div className="uw-winner">
          {state.winner === 0 ? "You win! 🎉" : `${PLAYER_NAMES[state.winner]} wins!`}
        </div>
      ) : state.phase === "result" && state.currentCard ? (
        <div className="uw-card-area">
          <div className="uw-card-title">Card drawn:</div>
          <div className="uw-card-value">{cardLabel(state.currentCard)}</div>
          {state.currentEffect && <div className="uw-card-effect">{state.currentEffect}</div>}
          <button className="uw-btn" style={{ marginTop: 8 }} onClick={() => dispatch({ type: "confirm" })}>
            Continue
          </button>
        </div>
      ) : (
        <button
          className="uw-btn"
          onClick={() => dispatch({ type: "draw" })}
          disabled={state.turn !== 0}
        >
          {state.turn !== 0 ? "Bot's turn..." : state.skipNext[0] ? "Skip My Turn" : "Draw Card"}
        </button>
      )}

      <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
        Yellow spaces = story events · Hover for details
      </p>
    </div>
  );
}
