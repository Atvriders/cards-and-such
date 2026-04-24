import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StockTickerState } from "./state.js";
import { isTerminal, portfolioValue, STOCK_NAMES, TOTAL_TURNS } from "./state.js";
import type { StockAction } from "./state.js";
import "./Game.css";

export function StockTicker({
  state,
  dispatch,
  onGameOver,
}: GameProps<StockTickerState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [qty, setQty] = useState<number[]>(new Array(5).fill(1));
  const d = (a: StockAction) => dispatch(a);

  const total = state.cash + portfolioValue(state);

  return (
    <div className="stock-wrap">
      <div className="stock-header">
        <span>📈 Stock Ticker</span>
        <span>Turn {state.turn}/{TOTAL_TURNS}</span>
        <span>Cash: <strong>${state.cash.toFixed(2)}</strong></span>
        <span>Total: <strong>${total.toFixed(2)}</strong></span>
      </div>

      <div className="stock-msg">{state.lastMsg}</div>

      <table className="stock-table">
        <thead>
          <tr>
            <th>Stock</th>
            <th>Price</th>
            <th>Chg</th>
            <th>Held</th>
            <th>Qty</th>
            <th>Buy</th>
            <th>Sell</th>
          </tr>
        </thead>
        <tbody>
          {STOCK_NAMES.map((name, i) => {
            const price = state.prices[i] ?? 0;
            const hist = state.history[i] ?? [];
            const prev = hist.length >= 2 ? hist[hist.length - 2]! : price;
            const chg = price - prev;
            return (
              <tr key={i}>
                <td className="stock-name">{name}</td>
                <td className="stock-price">${price.toFixed(2)}</td>
                <td className={`stock-chg ${chg > 0 ? "up" : chg < 0 ? "dn" : ""}`}>
                  {chg > 0 ? "+" : ""}{chg.toFixed(2)}
                </td>
                <td>{state.shares[i] ?? 0}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={qty[i] ?? 1}
                    onChange={e => {
                      const q = [...qty];
                      q[i] = Math.max(1, +e.target.value);
                      setQty(q);
                    }}
                    className="stock-qty"
                  />
                </td>
                <td>
                  <button
                    className="stock-btn buy"
                    onClick={() => d({ type: "buy", stock: i, qty: qty[i] ?? 1 })}
                    disabled={state.phase === "done"}
                  >Buy</button>
                </td>
                <td>
                  <button
                    className="stock-btn sell"
                    onClick={() => d({ type: "sell", stock: i, qty: qty[i] ?? 1 })}
                    disabled={state.phase === "done" || (state.shares[i] ?? 0) === 0}
                  >Sell</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {state.phase !== "done" && (
        <button className="stock-tick-btn" onClick={() => d({ type: "tick" })}>
          Next Turn →
        </button>
      )}

      {state.phase === "done" && (
        <div className="stock-done">
          Final portfolio: ${total.toFixed(2)} {total > 1000 ? "📈 Profit!" : "📉 Loss"}
        </div>
      )}
    </div>
  );
}
