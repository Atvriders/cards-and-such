import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OklahomaGinRState, OklahomaGinRSettings } from "./state.js";
import { RummyView } from "../_shared/RummyView.js";
import "./Game.css";

export function OklahomaGinRGame(props: GameProps<OklahomaGinRState, OklahomaGinRSettings>): JSX.Element {
  return <RummyView {...(props as any)} prefix="okgr" title="Oklahoma Gin" />;
}
