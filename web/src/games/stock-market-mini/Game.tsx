import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StockMarketState } from "./state.js";
import { isTerminal, totalValue, portfolioValue, TOTAL_TURNS, STARTING_CASH } from "./state.js";
import type { StockMarketAction } from "./state.js";
import "./Game.css";

export function StockMarketMini({ state, dispatch, onGameOver }: GameProps<StockMarketState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [qty, setQty] = useState<number[]>([1, 1, 1, 1, 1]);
  const d = (a: StockMarketAction) => dispatch(a);
  const total = totalValue(state);
  const portVal = portfolioValue(state);

  return (
    <div className="stock-wrap">
      <div className="stock-header">
        <span className="stock-title">📈 Stock Market Mini</span>
        <span className="stock-turn">Turn {state.turn}/{TOTAL_TURNS}</span>
        <span className="stock-val">Total: ${total.toFixed(2)}</span>
      </div>
      <div className="stock-summary">
        Cash: <strong>${state.cash.toFixed(2)}</strong> | Portfolio: <strong>${portVal.toFixed(2)}</strong>
        {" "} | PnL: <span style={{ color: total >= STARTING_CASH ? "#2a7d2e" : "#c62828" }}>
          {total >= STARTING_CASH ? "+" : ""}${(total - STARTING_CASH).toFixed(2)}
        </span>
      </div>

      {state.phase === "trading" && (
        <>
          <div className="stock-table">
            <div className="stock-row stock-head">
              <span>Stock</span><span>Price</span><span>Held</span><span>Qty</span><span>Buy</span><span>Sell</span>
            </div>
            {state.stocks.map((stock, i) => {
              const histLen = stock.history.length;
              const prevPrice: number = histLen > 1 ? (stock.history[histLen - 2] ?? stock.price) : stock.price;
              const dir = stock.price > prevPrice ? "▲" : stock.price < prevPrice ? "▼" : "–";
              const clr = stock.price > prevPrice ? "#2a7d2e" : stock.price < prevPrice ? "#c62828" : "#888";
              const qtyI: number = qty[i] ?? 1;
              const heldI: number = state.portfolio[i] ?? 0;
              return (
                <div key={stock.symbol} className="stock-row">
                  <span className="stock-sym">{stock.symbol}<br /><small>{stock.name}</small></span>
                  <span style={{ color: clr }}>{dir} ${stock.price.toFixed(2)}</span>
                  <span>{heldI}</span>
                  <span>
                    <input type="number" min={1} max={99} value={qtyI}
                      onChange={e => { const n = [...qty]; n[i] = Math.max(1, +e.target.value); setQty(n); }}
                      className="stock-qty" />
                  </span>
                  <span>
                    <button className="stock-btn buy"
                      disabled={state.cash < stock.price * qtyI}
                      onClick={() => d({ type: "buy", stockIndex: i, shares: qtyI })}>
                      Buy
                    </button>
                  </span>
                  <span>
                    <button className="stock-btn sell"
                      disabled={heldI < qtyI}
                      onClick={() => d({ type: "sell", stockIndex: i, shares: qtyI })}>
                      Sell
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
          <button className="stock-end-btn" onClick={() => d({ type: "endTurn" })}>
            {state.turn >= TOTAL_TURNS ? "Final Turn — End Game" : "End Turn (advance prices)"}
          </button>
        </>
      )}

      {state.phase === "done" && (
        <div className="stock-done bounce-in">
          <div className="stock-final">Final Value: <strong>${state.cash.toFixed(2)}</strong></div>
          <div className="stock-result">
            {state.cash >= 2000 ? "🏆 Stock Market Master!" : state.cash >= 1200 ? "👍 Profitable!" : "📉 Lost Money"}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="stock-log">
          {[...state.log].reverse().slice(0, 6).map((l, i) => <div key={i} className="stock-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
