import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DragonEggHatchState, DragonEggHatchSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DragonEggHatchGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<DragonEggHatchState, DragonEggHatchSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (!state.over) {
      tickTimer.current = setInterval(() => dispatch({ type: "tick" }), 200);
    }
    return () => { if (tickTimer.current) clearInterval(tickTimer.current); };
  }, [state.over, dispatch]);

  function eggState(egg: DragonEggHatchState["eggs"][0]): string {
    if (egg.tapped && egg.hatched) return "hatched";
    if (egg.tapped && !egg.hatched) return "cracked";
    if (egg.missed) return "missed";
    if (state.tick >= egg.hatchStart && state.tick <= egg.hatchEnd) return "glowing";
    if (state.tick < egg.hatchStart) return "waiting";
    return "missed";
  }

  function eggEmoji(eg: DragonEggHatchState["eggs"][0]): string {
    const st = eggState(eg);
    if (st === "hatched") return "🐉";
    if (st === "cracked") return "💔";
    if (st === "missed") return "🪦";
    if (st === "glowing") return "✨";
    return "🥚";
  }

  return (
    <div className="deh-game">
      <div className="deh-title">Dragon Egg Hatch</div>
      <div className="deh-stats">
        <span>Score: {state.score}</span>
        <span>Tick: {state.tick}</span>
      </div>
      <div className="deh-hint">Tap an egg when it glows (✨) to hatch it!</div>
      <div className="deh-eggs">
        {state.eggs.map((egg) => {
          const st = eggState(egg);
          return (
            <div
              key={egg.id}
              className={`deh-egg ${st}`}
              onClick={() => !egg.tapped && !egg.missed && dispatch({ type: "tap", eggId: egg.id })}
            >
              <span className="deh-emoji">{eggEmoji(egg)}</span>
              <span className="deh-pts">{egg.hatched ? `+${egg.points}` : ""}</span>
            </div>
          );
        })}
      </div>
      {state.over && (
        <div className="deh-result">
          Game Over! Final Score: {state.score}<br />
          {state.eggs.filter(e => e.hatched).length}/{state.eggs.length} eggs hatched
        </div>
      )}
    </div>
  );
}
