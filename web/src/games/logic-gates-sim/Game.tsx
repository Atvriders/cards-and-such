import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LogicGatesState, LogicGatesSettings, LogicGatesAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

function evalGate(
  gateId: number,
  gates: LogicGatesState["gates"],
  inputs: LogicGatesState["inputs"],
  cache: Map<number, 0 | 1>,
): 0 | 1 {
  if (cache.has(gateId)) return cache.get(gateId)!;
  const gate = gates.find((g) => g.id === gateId)!;
  const getVal = (ref: number | null): 0 | 1 => {
    if (ref === null) return 0;
    if (ref < 0) return inputs[~ref] ?? 0;
    return evalGate(ref, gates, inputs, cache);
  };
  const a = getVal(gate.inputA);
  const b = getVal(gate.inputB);
  let out: 0 | 1;
  switch (gate.type) {
    case "AND":  out = (a & b) as 0 | 1; break;
    case "OR":   out = (a | b) as 0 | 1; break;
    case "NOT":  out = a === 0 ? 1 : 0; break;
    case "NAND": out = (a & b) === 0 ? 1 : 0; break;
    case "NOR":  out = (a | b) === 0 ? 1 : 0; break;
    case "XOR":  out = (a ^ b) as 0 | 1; break;
    default:     out = 0;
  }
  cache.set(gateId, out);
  return out;
}

function describeInput(ref: number | null): string {
  if (ref === null) return "—";
  if (ref < 0) return `Input ${String.fromCharCode(65 + ~ref)}`;
  return `Gate ${ref}`;
}

export function LogicGatesGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<LogicGatesState, LogicGatesSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleToggle = useCallback(
    (inputIndex: number) => {
      if (terminal) return;
      dispatch({ type: "toggle", inputIndex } as LogicGatesAction);
    },
    [dispatch, terminal],
  );

  const { gates, inputs, targetOutput } = state;
  const cache = new Map<number, 0 | 1>();
  const gateValues = gates.map((g) => evalGate(g.id, gates, inputs, cache));
  const currentOutput = gateValues[gateValues.length - 1] ?? 0;

  return (
    <div className="logic-gates">
      <div className="logic-gates-info">
        <span>Difficulty: {state.settings.difficulty}</span>
        <span>Toggles: {state.movesMade}</span>
      </div>
      <div className={`logic-gates-status${state.won ? " win" : ""}`}>
        {state.won ? "Output matches target! Circuit solved!" : "Toggle inputs to match the target output"}
      </div>

      <div className="logic-gates-layout">
        <div className="logic-gates-inputs">
          <strong style={{ fontSize: 13, color: "#555" }}>Inputs</strong>
          {inputs.map((val, i) => (
            <div key={i} className="logic-gates-input-row">
              <span className="logic-gates-input-label">{String.fromCharCode(65 + i)}</span>
              <div
                className={`logic-gates-switch ${val === 1 ? "on" : "off"}`}
                onClick={() => handleToggle(i)}
                role="switch"
                aria-checked={val === 1}
              >
                <div className="logic-gates-switch-knob" />
              </div>
              <span style={{ fontSize: 14, fontWeight: "bold", color: val === 1 ? "#2a9d2a" : "#c0392b" }}>
                {val}
              </span>
            </div>
          ))}
        </div>

        <div className="logic-gates-circuit">
          <strong style={{ fontSize: 13, color: "#555" }}>Gates</strong>
          {gates.map((gate, idx) => {
            const val = gateValues[idx]!;
            return (
              <div key={gate.id} className="logic-gate-box">
                <span className="logic-gate-type">{gate.type}</span>
                <span className="logic-gate-inputs-desc">
                  {describeInput(gate.inputA)}
                  {gate.type !== "NOT" ? `, ${describeInput(gate.inputB)}` : ""}
                </span>
                <span className={`logic-gate-value${val === 0 ? " zero" : ""}`}>{val}</span>
              </div>
            );
          })}
        </div>

        <div className="logic-gates-output">
          <strong style={{ fontSize: 13, color: "#555" }}>Output</strong>
          <div className={`logic-gates-output-box ${currentOutput === targetOutput ? "match" : "mismatch"}`}>
            {currentOutput}
          </div>
          <span className="logic-gates-output-label">Current</span>
          <div style={{ height: 16 }} />
          <div className="logic-gates-output-box match">{targetOutput}</div>
          <span className="logic-gates-output-label">Target</span>
        </div>
      </div>

      <p className="logic-gates-hint">Toggle input switches until the circuit output matches the target.</p>
    </div>
  );
}
