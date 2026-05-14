import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  CavernaFullState,
  CavernaFullAction,
  CavernaFullSettings,
  ResourceKey,
} from "./state.js";
import {
  ACTION_SPACES,
  RESOURCE_KEYS,
  isTerminal,
  scoreFor,
  TOTAL_ROUNDS,
  HARVEST_ROUNDS,
} from "./state.js";
import "./Game.css";

const RES_LABEL: Record<ResourceKey, string> = {
  wood: "Wood",
  stone: "Stone",
  ore: "Ore",
  ruby: "Ruby",
  food: "Food",
  wheat: "Wheat",
  grain: "Grain",
  sheep: "Sheep",
  donkey: "Donkey",
  boar: "Boar",
  cow: "Cow",
  dog: "Dog",
};

const RES_GLYPH: Record<ResourceKey, string> = {
  wood: "W",
  stone: "St",
  ore: "O",
  ruby: "R",
  food: "F",
  wheat: "Wh",
  grain: "G",
  sheep: "Sh",
  donkey: "D",
  boar: "B",
  cow: "C",
  dog: "Dg",
};

export function CavernaFullGame(
  props: GameProps<CavernaFullState, CavernaFullSettings>
): JSX.Element {
  const { state, dispatch, onGameOver } = props;

  // Terminal guard
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // CPU auto-step driver
  useEffect(() => {
    if (state.phase !== "cpuTurn") return;
    const id = setTimeout(() => {
      dispatch({ type: "cpu_step" } as CavernaFullAction);
    }, 550);
    return () => clearTimeout(id);
  }, [state, dispatch]);

  const me = state.players[0]!;
  const isMyTurn = state.phase === "playing" && state.current === 0;
  const t = isTerminal(state);

  return (
    <div className="cav-wrap fade-in">
      <header className="cav-header">
        <div className="cav-title">Caverna (Full)</div>
        <div className="cav-round">
          Round <b>{state.round}/{TOTAL_ROUNDS}</b>
          {HARVEST_ROUNDS.has(state.round) ? " (Harvest)" : ""}
        </div>
        <div className="cav-score pulse">Your score: {scoreFor(me)}</div>
      </header>

      <div className="cav-message">{state.message}</div>

      <section className="cav-players">
        {state.players.map((p) => (
          <div
            key={p.id}
            className={
              "cav-player" +
              (p.id === state.current && state.phase !== "done" ? " is-current" : "") +
              (p.isCpu ? " is-cpu" : " is-human")
            }
            data-testid={`caverna-full-player-${p.id}`}
          >
            <div className="cav-player-head">
              <span className="cav-player-name">{p.name}</span>
              <span className="cav-player-dwarves" title="Dwarves placed / total">
                {p.dwarvesPlaced}/{p.dwarvesTotal} dwarves
              </span>
            </div>
            <div className="cav-player-tiles">
              <span title="Forest tiles cleared">Forest: {p.forestCleared}</span>
              <span title="Fields sown">Fields: {p.fields}</span>
              <span title="Mountain caves excavated">Cave: {p.caveExcavated}</span>
              <span title="Dwellings built">Dwell: {p.dwellings}</span>
            </div>
            <div className="cav-player-res">
              {RESOURCE_KEYS.filter((k) => p.resources[k] > 0).map((k) => (
                <span key={k} className={`cav-res cav-res-${k}`} title={RES_LABEL[k]}>
                  <span className="cav-res-g">{RES_GLYPH[k]}</span>
                  <span className="cav-res-n">{p.resources[k]}</span>
                </span>
              ))}
              {RESOURCE_KEYS.every((k) => p.resources[k] === 0) && (
                <span className="cav-res-empty" title="No resources">(empty)</span>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="cav-actions" aria-label="Action spaces">
        <h4 className="cav-actions-h">Action Spaces</h4>
        <div className="cav-actions-grid">
          {ACTION_SPACES.map((a, idx) => {
            const occ = state.occupied[a.id];
            const acc = state.accumulated[a.id];
            const isOccupied = occ != null;
            const canClick =
              isMyTurn &&
              !isOccupied &&
              me.dwarvesPlaced < me.dwarvesTotal;
            const isPrimary = idx === 0;
            const testId = isPrimary
              ? "hint-target-caverna-full-primary"
              : `caverna-full-action-${a.id}`;
            return (
              <button
                key={a.id}
                className={"cav-action" + (isOccupied ? " is-occupied" : "")}
                disabled={!canClick}
                onClick={() =>
                  dispatch({ type: "place", actionId: a.id } as CavernaFullAction)
                }
                title={a.label + (isOccupied ? ` (blocked by ${state.players[occ!]?.name})` : "")}
                data-testid={testId}
              >
                <div className="cav-action-label">{a.label}</div>
                {acc && (
                  <div className="cav-action-acc">
                    {RESOURCE_KEYS.filter((k) => acc[k] > 0).map((k) => (
                      <span key={k} className={`cav-res cav-res-${k}`} title={RES_LABEL[k]}>
                        <span className="cav-res-g">{RES_GLYPH[k]}</span>
                        <span className="cav-res-n">{acc[k]}</span>
                      </span>
                    ))}
                  </div>
                )}
                {isOccupied && (
                  <div className="cav-action-occ" title="Occupied">
                    Occupied: {state.players[occ!]?.name}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {state.phase === "cpuTurn" && (
        <div className="cav-cpu-step">
          <button
            data-testid="caverna-full-cpu-step"
            onClick={() => dispatch({ type: "cpu_step" } as CavernaFullAction)}
            title="Advance CPU action"
          >
            Continue (CPU placing)
          </button>
        </div>
      )}

      <section className="cav-log" aria-label="Log">
        <h4 className="cav-log-h">Log</h4>
        <ul>
          {state.log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      {t && (
        <div className="cav-done bounce-in">
          <h3>
            {state.winnerIndex === 0
              ? "You win!"
              : `${state.players[state.winnerIndex ?? 0]?.name ?? "?"} wins.`}
          </h3>
          <div className="cav-final">
            {state.players.map((p) => (
              <div key={p.id} className="cav-final-row">
                <span>{p.name}</span>
                <b>{scoreFor(p)} pts</b>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
