import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FactoryState, FactoryAction, Product } from "./state.js";
import { isTerminal, TOTAL_SHIFTS, PRODUCTS, MACHINE_UPGRADE_COST, QC_COST } from "./state.js";
import "./Game.css";

export function FactoryLine({
  state,
  dispatch,
  onGameOver,
}: GameProps<FactoryState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const d = (a: FactoryAction) => dispatch(a);
  const orderPct = Math.min(100, Math.round((state.unitsProduced / state.orderSize) * 100));

  return (
    <div className="factory-wrap">
      <div className="factory-header">
        <span className="factory-title">🏭 Factory Line</span>
        <span className="factory-shift">Shift {state.shift}/{TOTAL_SHIFTS}</span>
        <span className="factory-cash">${state.cash}</span>
      </div>

      <div className="factory-order">
        <strong>Current Order:</strong> {state.orderSize} {PRODUCTS[state.activeProduct].label}s @ ${state.contractPrice}/unit
        <br />Progress: {state.unitsProduced}/{state.orderSize} units ({orderPct}%)
        <div className="factory-order-progress">
          <div className="factory-order-bar" style={{ width: `${orderPct}%` }} />
        </div>
      </div>

      <div className="factory-stats">
        <div className="factory-badge">Machine: Lv{state.machineLevel}/4</div>
        <div className="factory-badge">Workers: {state.workers}</div>
        <div className="factory-badge">Orders: {state.ordersFilled}</div>
      </div>

      {state.phase === "plan" && (
        <div className="factory-plan">
          <label>
            Workers: <strong>{state.workers}</strong> (${state.workers * 30}/shift wages)
            <input type="range" min={2} max={10} step={1} value={state.workers}
              onChange={e => d({ type: "setWorkers", value: +e.target.value })} />
          </label>
          <div>
            <div style={{ fontSize: "0.85rem", marginBottom: 6 }}>Product:</div>
            <div className="factory-products">
              {(Object.keys(PRODUCTS) as Product[]).map(p => (
                <button key={p}
                  className={`factory-prod-btn${state.activeProduct === p ? " active" : ""}`}
                  onClick={() => d({ type: "setProduct", value: p })}>
                  {PRODUCTS[p].label}
                </button>
              ))}
            </div>
          </div>
          <div className="factory-invest">
            <button className="factory-invest-btn"
              disabled={state.machineLevel >= 4 || state.cash < MACHINE_UPGRADE_COST}
              onClick={() => d({ type: "upgradeMachine" })}>
              Upgrade Machine (${MACHINE_UPGRADE_COST})
            </button>
            <button
              className={`factory-invest-btn${state.qualityControl ? " active" : ""}`}
              onClick={() => d({ type: "toggleQC" })}>
              {state.qualityControl ? "✓ QC On ($" + QC_COST + "/shift)" : `Enable QC ($${QC_COST}/shift)`}
            </button>
          </div>
          <div style={{ fontSize: "0.82rem", color: "#888" }}>
            Est. output: ~{Math.round(state.workers * PRODUCTS[state.activeProduct].baseOutput * (1 + state.machineLevel * 0.2))} good units/shift
          </div>
          <button className="factory-btn" onClick={() => d({ type: "runShift" })}>Run Shift!</button>
        </div>
      )}

      {state.phase === "results" && (
        <div className="factory-results">
          <div className="factory-result-row">Good units produced: <strong>{state.lastOutput}</strong></div>
          <div className="factory-result-row">Defects caught: {state.lastDefects}</div>
          <div className="factory-result-row">Order revenue: ${state.lastRevenue}</div>
          <div className="factory-result-row">Shift costs (wages + QC): ${state.lastCost}</div>
          <div className={`factory-result-row profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
            Net: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
          </div>
          <button className="factory-btn" onClick={() => d({ type: "nextShift" })}>
            {state.shift >= TOTAL_SHIFTS ? "Clock Out (Final Score)" : "Next Shift →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="factory-done">
          <div className="factory-final">Final Cash: ${state.cash}</div>
          <div>{state.ordersFilled} orders filled</div>
          <div style={{ marginTop: 8 }}>{state.cash >= 2500 ? "🏆 Production Master!" : state.cash >= 1200 ? "👍 Factory running!" : "📉 Need efficiency"}</div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="factory-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="factory-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
