import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KartTournamentState, KartTournamentSettings } from "./state.js";
import type { KartTournamentAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const ITEM_ICONS: Record<string, string> = {
  boost: "⚡",
  shell: "🐢",
  star: "⭐",
  banana: "🍌",
  none: "",
};

export function KartTournamentGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<KartTournamentState, KartTournamentSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.phase === "gameOver";
  const player = state.racers[state.playerIdx]!;
  const playerPoints = state.points[state.playerIdx] ?? 0;
  const maxPoints = Math.max(...state.points);
  const statusClass = isOver ? (playerPoints === maxPoints ? " win" : " lose") : "";

  return (
    <div className="kart-tournament">
      <div className="kart-header">
        <span>Track {state.track}/{state.totalTracks}</span>
        <span>Speed: {player.speed}</span>
        <span>Your pts: {playerPoints}</span>
      </div>

      <div className="kart-track">
        {state.racers.map((racer, i) => (
          <div key={i} className="kart-racer-row">
            <span className={`kart-racer-name${i === state.playerIdx ? " player" : ""}`}>
              {racer.name}
            </span>
            <div className="kart-bar-bg">
              <div
                className={`kart-bar-fill${i === state.playerIdx ? " player" : ""}`}
                style={{ width: `${racer.position}%` }}
              />
            </div>
            <span className="kart-racer-item">{ITEM_ICONS[racer.item] ?? ""}</span>
            <span className="kart-item-icons">{racer.finished ? "✓" : `${racer.position}%`}</span>
          </div>
        ))}
      </div>

      <div className="kart-event">{state.lastEvent}</div>

      <div className="kart-points">
        Points: {state.racers.map((r, i) => `${r.name} ${state.points[i] ?? 0}`).join(" | ")}
      </div>

      <div className={`kart-status${statusClass}`}>
        {isOver
          ? playerPoints === maxPoints ? "You win the tournament!" : "Tournament over!"
          : state.phase === "interRace"
          ? "Race complete!"
          : "Drive!"}
      </div>

      <div className="kart-controls">
        {state.phase === "racing" && (
          <>
            <button className="accel" onClick={() => dispatch({ type: "drive", action: "accelerate" } as KartTournamentAction)}>
              ⚡ Accelerate
            </button>
            <button className="brake" onClick={() => dispatch({ type: "drive", action: "brake" } as KartTournamentAction)}>
              🛑 Brake
            </button>
            <button
              className="item"
              onClick={() => dispatch({ type: "drive", action: "useItem" } as KartTournamentAction)}
              disabled={player.item === "none"}
            >
              {player.item !== "none" ? `Use ${ITEM_ICONS[player.item]} ${player.item}` : "No item"}
            </button>
          </>
        )}
        {state.phase === "interRace" && (
          <button className="next" onClick={() => dispatch({ type: "nextRace" } as KartTournamentAction)}>
            Next Race ▶
          </button>
        )}
      </div>
    </div>
  );
}
