import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type {
  TerraMysticaFullState,
  TerraMysticaFullAction,
  TerraMysticaFullSettings,
  FactionId,
  CultName,
  Building,
} from "./state.js";
import {
  isTerminal,
  FACTIONS,
  CULT_NAMES,
  NUM_PLAYERS,
  MAP_COLS,
  legalBuildHexes,
  legalUpgrades,
  spadeCostFor,
} from "./state.js";
import "./Game.css";

const PLAYER_LABELS = ["You", "CPU 1", "CPU 2", "CPU 3"];

export function TerraMysticaFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<TerraMysticaFullState, TerraMysticaFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Drive CPU turns + automatic round advance.
  useEffect(() => {
    if (state.phase === "done") return;
    if (state.phase === "scoring") {
      const id = window.setTimeout(() => {
        dispatch({ type: "advanceRound" } as TerraMysticaFullAction);
      }, 700);
      return () => window.clearTimeout(id);
    }
    if (state.phase === "playing" && state.active !== 0) {
      const id = window.setTimeout(() => {
        dispatch({ type: "cpuStep" } as TerraMysticaFullAction);
      }, 550);
      return () => window.clearTimeout(id);
    }
    return;
  }, [state.active, state.phase, state.round, dispatch]);

  const me = state.players[0];
  const isHumanTurn = state.active === 0 && state.phase === "playing" && !!me && !me.passed;
  const myLegalBuild = me ? legalBuildHexes(state, 0) : [];
  const myLegalUpgrades = me ? legalUpgrades(state, 0) : [];

  function selectFaction(faction: FactionId): void {
    dispatch({ type: "selectFaction", player: 0, faction } as TerraMysticaFullAction);
  }
  function build(hex: number): void {
    dispatch({ type: "build", player: 0, hex } as TerraMysticaFullAction);
  }
  function upgrade(hex: number, to: Building): void {
    dispatch({ type: "upgrade", player: 0, hex, to } as TerraMysticaFullAction);
  }
  function shipping(): void {
    dispatch({ type: "shipping", player: 0 } as TerraMysticaFullAction);
  }
  function spadeUp(): void {
    dispatch({ type: "spadeUp", player: 0 } as TerraMysticaFullAction);
  }
  function cult(track: CultName): void {
    dispatch({ type: "cult", player: 0, track } as TerraMysticaFullAction);
  }
  function pass(): void {
    dispatch({ type: "pass", player: 0 } as TerraMysticaFullAction);
  }

  if (state.phase === "factionSelect") {
    return (
      <div className="tm-wrap fade-in">
        <header className="tm-header">
          <div className="tm-title">Terra Mystica (Full)</div>
          <div className="tm-meta">Pick your faction. The CPUs will play the others.</div>
        </header>
        <section className="tm-faction-grid">
          {FACTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="tm-faction-card"
              data-testid={`tm-faction-${f.id}`}
              title={`${f.name}: home terrain ${f.home}. ${f.description}`}
              onClick={() => selectFaction(f.id)}
            >
              <div className={`tm-faction-name tm-terrain-${f.home}`}>{f.name}</div>
              <div className="tm-faction-home">Home: {f.home}</div>
              <div className="tm-faction-desc">{f.description}</div>
            </button>
          ))}
        </section>
      </div>
    );
  }

  const factionFor = (idx: number): string =>
    FACTIONS.find((f) => f.id === state.players[idx]?.faction)?.name ?? `P${idx + 1}`;

  return (
    <div className="tm-wrap fade-in">
      <header className="tm-header">
        <div className="tm-title">Terra Mystica (Full)</div>
        <div className="tm-meta">
          Round <strong>{state.round}</strong> / {6} · Phase: <strong>{state.phase}</strong>
          {state.phase === "playing" && (
            <>
              {" "}· Turn:{" "}
              <strong>{PLAYER_LABELS[state.active] ?? "?"}</strong>
              {" "}({factionFor(state.active)})
            </>
          )}
        </div>
        <div className="tm-scoring-tile" title="This round's scoring tile">
          {state.scoringTiles[state.round - 1]?.description ?? ""}
        </div>
      </header>

      <section className="tm-board" aria-label="Map">
        <div
          className="tm-hex-grid"
          style={{ gridTemplateColumns: `repeat(${MAP_COLS}, 1fr)` }}
        >
          {state.hexes.map((hex, h) => {
            const canBuild = isHumanTurn && myLegalBuild.includes(h);
            const myUpgrade = myLegalUpgrades.find((u) => u.hex === h);
            const owner = hex.owner;
            const ownerClass = owner >= 0 ? `tm-owner-${owner}` : "";
            const buildingChar =
              hex.building === "dwelling" ? "D" :
              hex.building === "trading" ? "T" :
              hex.building === "temple" ? "★" :
              hex.building === "sanctuary" ? "✦" :
              hex.building === "stronghold" ? "▣" : "";
            const cost = me ? spadeCostFor(me, hex.terrain) : 0;
            return (
              <button
                key={h}
                type="button"
                className={`tm-hex tm-terrain-${hex.terrain} ${ownerClass} ${canBuild ? "tm-hex-legal" : ""}`}
                data-testid={`tm-hex-${h}`}
                title={
                  hex.building !== "none"
                    ? `Hex ${h}: ${hex.terrain} — ${PLAYER_LABELS[owner] ?? "?"}'s ${hex.building}`
                    : `Hex ${h}: ${hex.terrain}${me ? ` (terraform cost: ${cost} spades)` : ""}${
                        canBuild ? " — click to build a dwelling here" : ""
                      }`
                }
                aria-label={`Hex ${h}, ${hex.terrain}`}
                disabled={!canBuild && !myUpgrade}
                onClick={() => {
                  if (canBuild) build(h);
                  else if (myUpgrade) upgrade(h, myUpgrade.to);
                }}
              >
                <span className="tm-hex-building">{buildingChar}</span>
                {myUpgrade && (
                  <span className="tm-hex-upgrade-tag">↑{myUpgrade.to}</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="tm-players">
        {state.players.map((p, i) => (
          <div
            key={i}
            className={`tm-player tm-owner-${i} ${i === state.active && state.phase === "playing" ? "tm-player-active" : ""} ${p.passed ? "tm-player-passed" : ""}`}
          >
            <div className="tm-player-head">
              <span>{PLAYER_LABELS[i] ?? `P${i + 1}`}</span>
              <span className="tm-player-faction">{factionFor(i)}</span>
              <span className="tm-player-vp pulse">{p.vp} VP</span>
            </div>
            <div className="tm-player-row">
              <span title="Coin">${p.coin}</span>
              <span title="Wood">🪵{p.wood}</span>
              <span title="Priests">✝{p.priests}</span>
              <span title="Spade bank">⛏{p.spades}</span>
            </div>
            <div className="tm-player-row tm-small">
              <span title="Shipping level">Ship {p.shippingLevel}</span>
              <span title="Spade efficiency">Spd-Eff {p.spadeLevel}</span>
              {p.hasStronghold && <span>SH</span>}
              {p.hasSanctuary && <span>SA</span>}
              {p.passed && <span className="tm-passed-tag">PASSED</span>}
            </div>
            <div className="tm-cult-row tm-small">
              {CULT_NAMES.map((c) => (
                <span key={c} title={`${c} cult position`}>
                  {c[0]?.toUpperCase()}:{p.cult[c]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="tm-controls">
        {isHumanTurn && (
          <>
            <button
              type="button"
              className="tm-btn"
              title="Advance shipping (4 coin + 1 priest; max level 3)"
              disabled={!me || me.shippingLevel >= 3 || me.coin < 4 || me.priests < 1}
              onClick={shipping}
              data-testid="tm-shipping"
            >
              Shipping +1
            </button>
            <button
              type="button"
              className="tm-btn"
              title="Advance spade efficiency (5 coin + 1 priest; max level 2)"
              disabled={!me || me.spadeLevel >= 2 || me.coin < 5 || me.priests < 1}
              onClick={spadeUp}
              data-testid="tm-spade-up"
            >
              Spade-Eff +1
            </button>
            {CULT_NAMES.map((c) => (
              <button
                key={c}
                type="button"
                className="tm-btn"
                title={`Send a priest to the ${c} cult track (+2 cult steps)`}
                disabled={!me || me.priests < 1}
                onClick={() => cult(c)}
                data-testid={`tm-cult-${c}`}
              >
                {c[0]?.toUpperCase() ?? c}+
              </button>
            ))}
            <button
              type="button"
              className="tm-btn tm-btn-warn"
              title="Pass for this round and gain a +1 VP bonus tile"
              onClick={pass}
              data-testid="tm-pass"
            >
              Pass
            </button>
          </>
        )}
        {state.phase === "playing" && state.active !== 0 && (
          <button
            type="button"
            className="tm-btn"
            title="Advance the CPU's turn"
            data-testid="tm-cpu-step"
            onClick={() => dispatch({ type: "cpuStep" } as TerraMysticaFullAction)}
          >
            Run CPU
          </button>
        )}
        {state.phase === "scoring" && (
          <button
            type="button"
            className="tm-btn tm-btn-primary"
            title="Advance to the next round (income + new scoring tile)"
            data-testid="tm-advance-round"
            onClick={() => dispatch({ type: "advanceRound" } as TerraMysticaFullAction)}
          >
            Advance Round
          </button>
        )}
      </section>

      {state.lastEvent && (
        <div className="tm-event" aria-live="polite">
          {state.lastEvent}
        </div>
      )}

      {terminal && (
        <div className="tm-final bounce-in">
          <div className="tm-final-title">Game Over</div>
          <ul className="tm-final-list">
            {state.players
              .map((p, i) => ({ p, i }))
              .sort((a, b) => b.p.vp - a.p.vp)
              .map(({ p, i }) => (
                <li key={i} className={i === 0 ? "tm-final-you" : ""}>
                  {PLAYER_LABELS[i] ?? `P${i + 1}`} ({factionFor(i)}):{" "}
                  <strong>{p.vp}</strong> VP
                </li>
              ))}
          </ul>
          <div className="tm-final-meta">
            {NUM_PLAYERS} players · 6 rounds complete.
          </div>
        </div>
      )}
    </div>
  );
}
