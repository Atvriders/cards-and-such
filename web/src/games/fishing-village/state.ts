import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_DAYS = 14;

export type Weather = "sunny" | "cloudy" | "stormy";
export type FishType = "cod" | "tuna" | "herring" | "salmon" | "bass";
export type DayAction = "fish_shore" | "fish_deep" | "rest" | "trade" | "repair";

export interface FishingVillageState {
  rngSeed: number;
  day: number;
  coins: number;
  fish: Record<FishType, number>;
  boatDurability: number; // 0-10
  energy: number; // 0-5
  weather: Weather;
  phase: "choose" | "result" | "done";
  lastResult: string;
  log: readonly string[];
}

export type FishingVillageAction =
  | { type: "choose"; action: DayAction }
  | { type: "nextDay" };

const FISH_PRICES: Record<FishType, number> = {
  cod: 8, tuna: 25, herring: 5, salmon: 18, bass: 12,
};
export { FISH_PRICES };

const FISH_LIST: FishType[] = ["cod", "tuna", "herring", "salmon", "bass"];

const WEATHER_CHANCE: Record<Weather, Record<Weather, number>> = {
  sunny:  { sunny: 50, cloudy: 35, stormy: 15 },
  cloudy: { sunny: 30, cloudy: 40, stormy: 30 },
  stormy: { sunny: 20, cloudy: 45, stormy: 35 },
};

function nextWeather(current: Weather, rng: () => number): Weather {
  const chances = WEATHER_CHANCE[current];
  const roll = rng() * 100;
  if (roll < chances.sunny) return "sunny";
  if (roll < chances.sunny + chances.cloudy) return "cloudy";
  return "stormy";
}

function randomFish(rng: () => number, isDeep: boolean): { fish: FishType; qty: number } {
  const deepFish: FishType[] = isDeep ? ["tuna","salmon"] : ["cod","herring","bass"];
  const fish = deepFish[Math.floor(rng() * deepFish.length)]!;
  const qty = 1 + Math.floor(rng() * 4);
  return { fish, qty };
}

export function initialState(seed: number): FishingVillageState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    day: 1,
    coins: 30,
    fish: { cod: 0, tuna: 0, herring: 0, salmon: 0, bass: 0 },
    boatDurability: 10,
    energy: 5,
    weather: "sunny",
    phase: "choose",
    lastResult: "",
    log: [],
  };
}

export function reducer(state: FishingVillageState, action: FishingVillageAction): FishingVillageState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "choose": {
      if (state.phase !== "choose") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);

      let { coins, fish, boatDurability, energy } = state;
      fish = { ...fish };
      let resultMsg = "";

      switch (action.action) {
        case "fish_shore": {
          if (energy < 1) { resultMsg = "Too tired to fish!"; break; }
          energy -= 1;
          if (state.weather === "stormy") {
            resultMsg = "Storm too rough even for shore fishing. Caught nothing.";
            break;
          }
          const caught = randomFish(rng2, false);
          const weatherBonus = state.weather === "sunny" ? 1 : 0;
          const qty = caught.qty + weatherBonus;
          fish[caught.fish] += qty;
          resultMsg = `Shore fished: caught ${qty} ${caught.fish}`;
          break;
        }
        case "fish_deep": {
          if (energy < 2) { resultMsg = "Not enough energy for deep fishing!"; break; }
          if (boatDurability <= 0) { resultMsg = "Boat is broken! Repair it first."; break; }
          energy -= 2;
          if (state.weather === "stormy") {
            boatDurability = Math.max(0, boatDurability - 2);
            resultMsg = "Storm damaged the boat during deep fishing! -2 durability";
            break;
          }
          const caught2 = randomFish(rng2, true);
          const qty2 = state.weather === "sunny" ? caught2.qty + 1 : caught2.qty;
          fish[caught2.fish] += qty2;
          boatDurability = Math.max(0, boatDurability - 1);
          resultMsg = `Deep fished: caught ${qty2} ${caught2.fish} (-1 boat durability)`;
          break;
        }
        case "rest": {
          energy = Math.min(5, energy + 3);
          resultMsg = `Rested. Energy restored to ${energy}.`;
          break;
        }
        case "trade": {
          const totalFish = FISH_LIST.reduce((sum, f) => sum + fish[f], 0);
          if (totalFish === 0) { resultMsg = "No fish to sell!"; break; }
          let earned = 0;
          for (const f of FISH_LIST) {
            earned += fish[f] * FISH_PRICES[f];
            fish[f] = 0;
          }
          coins += earned;
          resultMsg = `Sold all fish for ${earned} coins!`;
          break;
        }
        case "repair": {
          const repairCost = (10 - boatDurability) * 5;
          if (coins < repairCost) { resultMsg = `Not enough coins to repair (need ${repairCost}c).`; break; }
          coins -= repairCost;
          resultMsg = `Boat repaired for ${repairCost} coins.`;
          boatDurability = 10;
          break;
        }
      }

      return {
        ...state,
        rngSeed: nextSeed,
        coins,
        fish,
        boatDurability,
        energy,
        phase: "result",
        lastResult: resultMsg,
        log: [...state.log, `Day ${state.day}: ${resultMsg}`],
      };
    }

    case "nextDay": {
      if (state.phase !== "result") return state;
      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const rng2 = mulberry32(nextSeed);
      const nextDay = state.day + 1;
      const weather = nextWeather(state.weather, rng2);

      if (nextDay > TOTAL_DAYS) {
        // Sell remaining fish at end
        let finalCoins = state.coins;
        for (const f of FISH_LIST) {
          finalCoins += state.fish[f] * FISH_PRICES[f];
        }
        return {
          ...state,
          rngSeed: nextSeed,
          day: nextDay,
          coins: finalCoins,
          fish: { cod: 0, tuna: 0, herring: 0, salmon: 0, bass: 0 },
          phase: "done",
          weather,
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        day: nextDay,
        weather,
        phase: "choose",
        lastResult: "",
      };
    }
  }
}

export function isTerminal(state: FishingVillageState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, Math.min(100, Math.round((state.coins / 300) * 100))) };
}
