import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BaristaRushState, BaristaRushSettings, DrinkSize, DrinkType, Extra } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const SIZES: DrinkSize[] = ["S", "M", "L"];
const TYPES: DrinkType[] = ["espresso", "latte", "cappuccino", "americano"];
const EXTRAS: { label: string; value: Extra }[] = [
  { label: "Sugar", value: "sugar" },
  { label: "Milk", value: "milk" },
  { label: "Decaf", value: "decaf" },
  { label: "None", value: null },
];

const TYPE_EMOJI: Record<DrinkType, string> = {
  espresso: "☕",
  latte: "🥛",
  cappuccino: "☁️",
  americano: "🍵",
};

export function BaristaRushGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<BaristaRushState, BaristaRushSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const tick = useCallback(() => {
    dispatch({ type: "tick" });
  }, [dispatch]);

  useEffect(() => {
    if (state.gameOver) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state.gameOver, tick]);

  const pending = state.queue.filter(o => !o.done && !o.failed);
  const target = pending[0];

  return (
    <div className="br-game">
      <div className="br-title">Barista Rush ☕</div>
      <div className="br-hud">
        <span>Score: {state.score}</span>
        <span>✅ {state.served}</span>
        <span>❌ {state.failed}</span>
        <span>⏱ {state.maxTick - state.tick}s</span>
      </div>

      {/* Order queue */}
      <div className="br-queue">
        {pending.map((order, i) => (
          <div key={order.id} className={`br-order${i === 0 ? " active-order" : ""}${order.timeLeft < 5 ? " urgent" : ""}`}>
            <div className="br-order-time">{order.timeLeft}s</div>
            <div className="br-order-drink">
              {TYPE_EMOJI[order.type]} {order.size} {order.type}
              {order.extra ? ` +${order.extra}` : ""}
            </div>
          </div>
        ))}
      </div>

      {target && (
        <div className="br-next-label">Next: {TYPE_EMOJI[target.type]} {target.size} {target.type}{target.extra ? ` +${target.extra}` : ""}</div>
      )}

      {/* Controls */}
      <div className="br-section">
        <div className="br-label">Size</div>
        <div className="br-row">
          {SIZES.map(s => (
            <button
              key={s}
              className={`br-btn${state.current.size === s ? " active" : ""}`}
              onClick={() => dispatch({ type: "set-size", size: s })}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="br-section">
        <div className="br-label">Drink</div>
        <div className="br-row">
          {TYPES.map(t => (
            <button
              key={t}
              className={`br-btn${state.current.type === t ? " active" : ""}`}
              onClick={() => dispatch({ type: "set-type", drink: t })}
            >{TYPE_EMOJI[t]} {t}</button>
          ))}
        </div>
      </div>

      <div className="br-section">
        <div className="br-label">Extra</div>
        <div className="br-row">
          {EXTRAS.map(e => (
            <button
              key={String(e.value)}
              className={`br-btn${state.current.extra === e.value ? " active" : ""}`}
              onClick={() => dispatch({ type: "set-extra", extra: e.value })}
            >{e.label}</button>
          ))}
        </div>
      </div>

      <div className="br-preview">
        {state.current.size && state.current.type
          ? `${TYPE_EMOJI[state.current.type]} ${state.current.size} ${state.current.type}${state.current.extra ? ` +${state.current.extra}` : ""}`
          : "Select size and drink type"}
      </div>

      <button
        className="br-serve-btn"
        disabled={!state.current.size || !state.current.type || state.gameOver}
        onClick={() => dispatch({ type: "serve" })}
      >
        Serve!
      </button>

      {state.gameOver && (
        <div className="br-gameover">
          Shift over! Score: {terminal?.score}
          <div className="br-sub">Served: {state.served} | Failed: {state.failed}</div>
        </div>
      )}
    </div>
  );
}
