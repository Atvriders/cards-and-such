import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FeedTheCatState, FeedAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const FOOD_EMOJI: Record<string, string> = {
  fish: "🐟", milk: "🥛", treat: "🍬", kibble: "🟤",
};

const CAT_MOOD: Record<string, string> = {
  happy: "😸", okay: "😺", sad: "😿",
};

export function FeedTheCat({
  state,
  dispatch,
  onGameOver,
}: GameProps<FeedTheCatState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, dispatch]);

  const d = (a: FeedAction) => dispatch(a);
  const hungerColor = state.hunger >= 60 ? "#66bb6a" : state.hunger >= 30 ? "#ffa726" : "#ef5350";
  const timeLeft = Math.ceil((state.maxTicks - state.tick) / 10);

  return (
    <div className="ftc-wrap">
      <div className="ftc-header">
        <span className="ftc-title">Feed the Cat</span>
        <span className="ftc-timer">{timeLeft}s</span>
        <span className="ftc-score">Score: {state.score}</span>
      </div>

      <div className="ftc-hunger-bar">
        <div className="ftc-hunger-fill" style={{ width: `${state.hunger}%`, background: hungerColor }} />
      </div>

      <div className="ftc-arena">
        {state.items
          .filter(i => !i.caught && !i.missed)
          .map(item => (
            <div data-testid="hint-target-feed-the-cat-action"
              key={item.id}
              className="ftc-food"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={() => d({ type: "catch", id: item.id })}
            >
              {FOOD_EMOJI[item.type] ?? "🍖"}
            </div>
          ))}
        <div className="ftc-cat">
          {CAT_MOOD[state.catMood] ?? "😺"}
        </div>
      </div>

      <div className="ftc-mood">
        Cat is {state.catMood} — hunger: {Math.round(state.hunger)}%
      </div>

      {state.phase === "done" && (
        <div className="ftc-done">
          {state.hunger <= 0 ? "The cat is starving! Game over." : "Time's up!"} Score: {state.score}
        </div>
      )}
    </div>
  );
}
