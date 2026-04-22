import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CodenamesState, CodenamesAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CodenamesLiteGame({ state, dispatch }: GameProps<CodenamesState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  function handleTile(i: number) {
    if (terminal || state.tiles[i]?.revealed) return;
    dispatch({ type: "guess", tileIndex: i } satisfies CodenamesAction);
  }

  return (
    <div className="codenames">
      {state.clue && (
        <div className="codenames-clue">
          "{state.clue.word}" — {state.clue.count}
        </div>
      )}

      <div className="codenames-status">
        Agents left: {state.agentsLeft} / {state.agentsTotal} | Guesses left: {state.guessesLeft}
      </div>

      {terminal && (
        <div className={`codenames-result${state.won ? " codenames-result--won" : " codenames-result--lost"}`}>
          {state.won ? "All agents found! You win!" : state.lost ? "Hit the assassin — game over!" : ""}
        </div>
      )}

      <div className="codenames-grid">
        {state.tiles.map((tile, i) => {
          let cls = "codenames-tile";
          if (tile.revealed) {
            cls += ` codenames-tile--revealed codenames-tile--${tile.type}`;
          }
          return (
            <div key={i} className={cls} onClick={() => handleTile(i)}>
              {tile.word}
            </div>
          );
        })}
      </div>

      {!terminal && (
        <div className="codenames-actions">
          <button
            className="codenames-btn"
            onClick={() => dispatch({ type: "endGuessing" } satisfies CodenamesAction)}
          >
            End Guessing (next clue)
          </button>
        </div>
      )}

      <div className="codenames-log">
        {state.log.slice(-8).reverse().map((m, i) => <div key={i}>{m}</div>)}
      </div>
    </div>
  );
}
