import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DayTraderState, DayTraderSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DayTraderGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<DayTraderState, DayTraderSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const portfolioValue = state.portfolio.reduce((sum, s) => sum + s.price * s.shares, 0);

  return (
    <div className="dt-game">
      <div className="dt-title">Day Trader</div>
      <div className="dt-stats">
        <span>Day {state.day}/{state.maxDays}</span>
        <span>Cash: <b>${Math.round(state.cash)}</b></span>
        <span>Holdings: ${Math.round(portfolioValue)}</span>
        <span>Net: ${Math.round(state.cash + portfolioValue)}</span>
      </div>
      <div className="dt-log">{state.log}</div>

      {!state.over && (
        <>
          <div className="dt-stocks">
            {state.portfolio.map(stock => {
              const hist = state.history[stock.ticker] ?? [];
              const prev = hist.length >= 2 ? hist[hist.length - 2] : stock.price;
              const delta = stock.price - (prev ?? stock.price);
              return (
                <div key={stock.ticker} className="dt-stock">
                  <div className="dt-ticker">{stock.ticker}</div>
                  <div className={`dt-price ${delta >= 0 ? "dt-up" : "dt-down"}`}>
                    ${stock.price} {delta >= 0 ? "▲" : "▼"}{Math.abs(delta).toFixed(2)}
                  </div>
                  <div className="dt-shares">Owned: {stock.shares}</div>
                  <div className="dt-actions">
                    <button className="dt-buy-btn" onClick={() => dispatch({ type: "buy", ticker: stock.ticker, qty: 1 })}>Buy 1</button>
                    <button className="dt-buy-btn" onClick={() => dispatch({ type: "buy", ticker: stock.ticker, qty: 5 })}>Buy 5</button>
                    <button className="dt-sell-btn" onClick={() => dispatch({ type: "sell", ticker: stock.ticker, qty: 1 })}>Sell 1</button>
                    <button className="dt-sell-btn" onClick={() => dispatch({ type: "sell", ticker: stock.ticker, qty: 5 })}>Sell 5</button>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="dt-next-btn" onClick={() => dispatch({ type: "next-day" })}>Next Day &rarr;</button>
        </>
      )}

      {state.over && (
        <div className="dt-result">Final Score: {state.score}</div>
      )}
    </div>
  );
}
