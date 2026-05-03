import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LogicGridState, LogicGridSettings, CellMark } from "./state.js";
import type { LogicGridAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./LogicGrid.css";

export function LogicGrid({ state, dispatch, onGameOver }: GameProps<LogicGridState, LogicGridSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, marks, won } = state;
  const n = puzzle.attributes[0].length;
  const entities = puzzle.attributes[0];

  // Cycle: null -> true -> false -> null
  function nextMark(m: CellMark): CellMark {
    if (m === null) return true;
    if (m === true) return false;
    return null;
  }

  function markLabel(m: CellMark): string {
    if (m === true) return "✓";
    if (m === false) return "✗";
    return "";
  }

  function markClass(m: CellMark): string {
    if (m === true) return "mark-cell yes";
    if (m === false) return "mark-cell no";
    return "mark-cell";
  }

  return (
    <div className="logic-grid">
      <div className="logic-grid-title">Logic Grid — {puzzle.title}</div>
      <div className={`logic-grid-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Click cells: ✓=Yes, ✗=No, blank=Unknown | Moves: ${state.moves}`}
      </div>

      <div className="logic-grid-layout">
        <div className="logic-grid-table-wrap">
          <table className="logic-grid-table">
            <thead>
              <tr>
                <th />
                {puzzle.attributes.slice(1).map((attr, ai) => (
                  <th key={ai} colSpan={n} className="attr-group">
                    {["House/Region", "Pet/Mode", "Drink/Find", "Position/Other"][ai] ?? `Attr ${ai + 1}`}
                  </th>
                ))}
              </tr>
              <tr>
                <th>Person</th>
                {puzzle.attributes.slice(1).flatMap((attr, ai) =>
                  attr.map((val, vi) => (
                    <th key={`${ai}-${vi}`}>{val}</th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {entities.map((name, ei) => (
                <tr key={ei}>
                  <td className="entity-label">{name}</td>
                  {puzzle.attributes.slice(1).flatMap((attr, ai) =>
                    attr.map((_val, vi) => {
                      const m = marks[ei]![ai]![vi]!;
                      return (
                        <td
                          key={`${ai}-${vi}`}
                          className={markClass(m)}
                          onClick={() =>
                            !won &&
                            dispatch({ type: "setMark", entity: ei, attr: ai, value: vi, mark: nextMark(m) } satisfies LogicGridAction)
                          }
                        >
                          {markLabel(m)}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="logic-grid-clues">
          <h3>Clues</h3>
          <ol>
            {puzzle.clues.map((clue, i) => <li key={i}>{clue}</li>)}
          </ol>
        </div>
      </div>

      <div className="logic-grid-btns">
        <button data-testid="hint-target-logic-grid-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
