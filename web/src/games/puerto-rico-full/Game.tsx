import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import {
  isTerminal,
  cpuPickRole,
  CROPS,
  ROLES,
  CROP_PRICE,
  publicVpFor,
  CITY_SLOTS,
} from "./state.js";
import type {
  PuertoRicoState,
  PuertoRicoAction,
  PuertoRicoSettings,
  RoleId,
  Crop,
} from "./state.js";
import "./Game.css";

const CROP_COLORS: Record<Crop, string> = {
  corn: "#e8c66b",
  indigo: "#5972c8",
  sugar: "#f0f0f0",
  tobacco: "#8a6a40",
  coffee: "#3b2a1a",
};

const ROLE_LABELS: Record<RoleId, string> = {
  settler: "Settler",
  mayor: "Mayor",
  builder: "Builder",
  craftsman: "Craftsman",
  trader: "Trader",
  captain: "Captain",
  prospector: "Prospector",
};

const ROLE_DESCRIPTIONS: Record<RoleId, string> = {
  settler: "Each player draws a plantation. You also get a bonus pick.",
  mayor: "Distribute new colonists. Picker takes 1 extra first.",
  builder: "Each player may build a building. Picker gets -1 doubloon discount.",
  craftsman: "All staffed plantations produce goods. Picker takes 1 extra of any crop they make.",
  trader: "Each player may sell 1 good for doubloons. Picker earns +1.",
  captain: "Players ship goods round-robin for VP. Picker gets +1 VP first.",
  prospector: "Picker gains 1 doubloon. Everyone else does nothing.",
};

export function PuertoRicoFullGame(
  props: GameProps<PuertoRicoState, PuertoRicoSettings>
): JSX.Element {
  const { state, dispatch, onGameOver } = props;
  const t = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [t, onGameOver]);

  // Auto-tick CPU role pick when CPU is governor.
  useEffect(() => {
    if (state.phase === "select_role") {
      const picker = state.governor;
      if (state.players[picker]?.isCpu) {
        const id = setTimeout(() => {
          const role = cpuPickRole(state);
          if (role) dispatch({ type: "pick_role", role } as PuertoRicoAction);
        }, 500);
        return () => clearTimeout(id);
      }
    }
    return undefined;
  }, [state, dispatch]);

  // Auto-tick resolve_step for CPU phases.
  useEffect(() => {
    if (!state.activeRole || state.phase === "game_over") return undefined;
    if (state.phase === "select_role") return undefined;
    const seat = state.resolveOrder[state.resolveIndex];
    if (seat === undefined) return undefined;
    const player = state.players[seat];
    if (!player) return undefined;
    // Auto-resolve roles always tick; for builder/trader/captain only when CPU.
    const isAutoRole =
      state.activeRole === "settler" ||
      state.activeRole === "mayor" ||
      state.activeRole === "craftsman" ||
      state.activeRole === "prospector";
    if (isAutoRole || player.isCpu) {
      const id = setTimeout(() => {
        dispatch({ type: "resolve_step" } as PuertoRicoAction);
      }, 450);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [state, dispatch]);

  const me = state.players[0]!;
  const currentSeat = state.resolveOrder[state.resolveIndex];
  const isMyResolveTurn = currentSeat === 0 && state.activeRole !== null;

  const availableRoles = ROLES.filter(r => !state.usedRoles.includes(r));

  return (
    <div className="puerto-rico-full fade-in" data-testid="puerto-rico-full">
      <header className="pr-header">
        <h2>Puerto Rico</h2>
        <div className="pr-status pulse" data-testid="pr-status">
          {state.phase === "game_over"
            ? "Game over"
            : state.phase === "select_role"
              ? `${state.players[state.governor]!.name} chooses a role`
              : `Resolving ${ROLE_LABELS[state.activeRole!]} — ${state.players[currentSeat!]?.name ?? ""}`}
        </div>
      </header>

      {/* Player boards summary */}
      <section className="pr-players">
        {state.players.map((p) => (
          <div
            key={p.seat}
            className={`pr-player ${p.seat === state.governor ? "governor" : ""} ${p.seat === state.rolePicker ? "picker" : ""}`}
            data-testid={`pr-player-${p.seat}`}
          >
            <div className="pr-player-name">{p.name}</div>
            <div className="pr-player-stats">
              <span title="Doubloons">${p.doubloons}</span>
              <span title="Colonists">@{p.colonists}</span>
              <span title="Victory Points" data-testid={`pr-vp-${p.seat}`}>{publicVpFor(p)} VP</span>
            </div>
            <div className="pr-goods">
              {CROPS.map(c => (
                <span key={c} className="pr-good" style={{ background: CROP_COLORS[c] }} title={`${c}: ${p.goods[c]}`}>
                  {p.goods[c]}
                </span>
              ))}
            </div>
            <div className="pr-plant">
              <span className="pr-section-label">Plantations ({p.plantations.length}/12)</span>
              <div className="pr-plant-row">
                {p.plantations.map((pl, i) => (
                  <span
                    key={i}
                    className={`pr-tile ${pl.staffed ? "staffed" : ""}`}
                    style={{ background: CROP_COLORS[pl.crop] }}
                    title={`${pl.crop}${pl.staffed ? " (staffed)" : ""}`}
                  >
                    {pl.crop[0]?.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            <div className="pr-build">
              <span className="pr-section-label">Buildings ({p.buildings.length}/{CITY_SLOTS})</span>
              <div className="pr-build-row">
                {p.buildings.map((b, bi) => (
                  <span key={bi} className="pr-building" title={`${b.id} (+${b.vp} VP)`}>{b.id}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Ships + trading house */}
      <section className="pr-board">
        <div className="pr-ships">
          <span className="pr-section-label">Ships</span>
          {state.ships.map((sh, i) => (
            <div className="pr-ship" key={i} data-testid={`pr-ship-${i}`}>
              <span>Ship-{sh.capacity}</span>
              <span>{sh.cargo ? `${sh.cargo} ${sh.count}/${sh.capacity}` : `empty (cap ${sh.capacity})`}</span>
            </div>
          ))}
        </div>
        <div className="pr-trading">
          <span className="pr-section-label">Trading House</span>
          <div className="pr-trading-row">
            {state.tradingHouse.slots.length === 0 ? (
              <span className="pr-empty">empty</span>
            ) : (
              state.tradingHouse.slots.map((c, i) => (
                <span key={i} className="pr-good" style={{ background: CROP_COLORS[c] }} title={c}>{c[0]?.toUpperCase()}</span>
              ))
            )}
          </div>
        </div>
        <div className="pr-supply">
          <span className="pr-section-label">Colonist Supply</span>
          <span data-testid="pr-supply">{state.colonistSupply}</span>
        </div>
      </section>

      {/* Role selection for human */}
      {state.phase === "select_role" && state.governor === 0 && (
        <section className="pr-roles" data-testid="pr-roles">
          <h3>Choose a role</h3>
          <div className="pr-role-row">
            {ROLES.map(r => {
              const used = state.usedRoles.includes(r);
              const bonus = state.roleDoubloons[r];
              return (
                <button
                  key={r}
                  className="pr-role-btn"
                  disabled={used}
                  onClick={() => dispatch({ type: "pick_role", role: r } as PuertoRicoAction)}
                  title={`${ROLE_LABELS[r]}: ${ROLE_DESCRIPTIONS[r]}${bonus > 0 ? ` (+${bonus} doubloon bonus)` : ""}`}
                  data-testid={`pr-role-${r}`}
                >
                  {ROLE_LABELS[r]}
                  {bonus > 0 && <span className="pr-bonus"> +${bonus}</span>}
                </button>
              );
            })}
          </div>
          <p className="pr-hint">Available roles: {availableRoles.length}. Governor: {state.players[state.governor]!.name}.</p>
        </section>
      )}

      {/* Builder phase UI for human */}
      {state.phase === "resolve_builder" && isMyResolveTurn && (
        <section className="pr-builder" data-testid="pr-builder">
          <h3>Builder — Choose a building</h3>
          <div className="pr-build-pool">
            {state.buildingPool.map(b => {
              const isPicker = state.rolePicker === 0;
              const cost = Math.max(0, b.cost - (isPicker ? 1 : 0));
              const owned = me.buildings.some(bb => bb.id === b.id);
              const canAfford = me.doubloons >= cost;
              const cityFull = me.buildings.length >= CITY_SLOTS;
              return (
                <button
                  key={b.id}
                  className="pr-build-btn"
                  disabled={!canAfford || owned || cityFull}
                  onClick={() => dispatch({ type: "human_build", buildingId: b.id } as PuertoRicoAction)}
                  title={`${b.name}: cost ${cost} doubloons, +${b.vp} VP`}
                  data-testid={`pr-build-${b.id}`}
                >
                  {b.name} (${cost} → +{b.vp} VP)
                </button>
              );
            })}
          </div>
          <button
            className="pr-skip"
            onClick={() => dispatch({ type: "human_skip_build" } as PuertoRicoAction)}
            title="Skip building this round"
            data-testid="pr-skip-build"
          >
            Skip
          </button>
        </section>
      )}

      {/* Trader phase UI for human */}
      {state.phase === "resolve_trader" && isMyResolveTurn && (
        <section className="pr-trader" data-testid="pr-trader">
          <h3>Trader — Sell a good</h3>
          <div className="pr-trade-row">
            {CROPS.map(c => {
              const have = me.goods[c];
              const isPicker = state.rolePicker === 0;
              const earn = CROP_PRICE[c] + (isPicker ? 1 : 0);
              return (
                <button
                  key={c}
                  className="pr-trade-btn"
                  disabled={have <= 0 || state.tradingHouse.slots.length >= 4}
                  onClick={() => dispatch({ type: "human_trade", crop: c } as PuertoRicoAction)}
                  title={`Sell 1 ${c} for ${earn} doubloons`}
                  data-testid={`pr-trade-${c}`}
                >
                  Sell {c} (+${earn})
                </button>
              );
            })}
          </div>
          <button
            className="pr-skip"
            onClick={() => dispatch({ type: "human_skip_trade" } as PuertoRicoAction)}
            title="Skip trade this round"
            data-testid="pr-skip-trade"
          >
            Skip
          </button>
        </section>
      )}

      {/* Captain phase UI for human */}
      {state.phase === "resolve_captain" && isMyResolveTurn && (
        <section className="pr-captain" data-testid="pr-captain">
          <h3>Captain — Ship goods</h3>
          <div className="pr-captain-grid">
            {state.ships.map((sh, si) => (
              <div key={si} className="pr-captain-ship">
                <div className="pr-ship-title">Ship-{sh.capacity} {sh.cargo ? `(${sh.cargo} ${sh.count}/${sh.capacity})` : "(empty)"}</div>
                <div className="pr-captain-row">
                  {CROPS.map(c => {
                    const have = me.goods[c];
                    const compatible = sh.cargo === null || sh.cargo === c;
                    const full = sh.count >= sh.capacity;
                    return (
                      <button
                        key={c}
                        className="pr-ship-btn"
                        disabled={have <= 0 || !compatible || full}
                        onClick={() => dispatch({ type: "human_ship", shipIndex: si, crop: c } as PuertoRicoAction)}
                        title={`Load ${c} onto Ship-${sh.capacity}`}
                        data-testid={`pr-ship-${si}-${c}`}
                      >
                        Ship {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            className="pr-skip"
            onClick={() => dispatch({ type: "human_skip_ship" } as PuertoRicoAction)}
            title="Skip shipping this round"
            data-testid="pr-skip-ship"
          >
            Done shipping
          </button>
        </section>
      )}

      {/* Game over panel */}
      {state.phase === "game_over" && (
        <section className="pr-gameover bounce-in" data-testid="pr-gameover">
          <h3>Game over</h3>
          <ol className="pr-finals">
            {[...state.players]
              .map(p => ({ p, total: publicVpFor(p) }))
              .sort((a, b) => b.total - a.total)
              .map(({ p, total }, i) => (
                <li key={p.seat}>
                  <strong>{i + 1}.</strong> {p.name} — {total} VP
                </li>
              ))}
          </ol>
        </section>
      )}

      {/* Footer / round info */}
      <footer className="pr-footer">
        <span>Round: {state.round}</span>
        <span>Shipping pool: {state.shippingPool} VP</span>
        <span data-testid="pr-roles-used">Used: {state.usedRoles.map(r => ROLE_LABELS[r]).join(", ") || "—"}</span>
      </footer>
    </div>
  );
}

// Bind `onGameOver` properly via closure (the `arguments` indexer earlier is a
// quirky pattern; cleaner pattern below as a backup default export hook).
// (Kept implementation simple — Game.tsx is the canonical export above.)

export default PuertoRicoFullGame;
