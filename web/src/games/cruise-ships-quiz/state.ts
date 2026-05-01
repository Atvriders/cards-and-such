import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CruiseShipsQuizSettings { questions: "10" | "20" | "30"; }
export interface CruiseShipsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CruiseShipsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is currently the largest cruise ship in the world?", choices: ["Royal Caribbean's Icon of the Seas", "Wonder of the Seas", "Symphony of the Seas", "Harmony of the Seas"], correct: 0 },
  { question: "Icon of the Seas debuted in?", choices: ["2024", "2022", "2023", "2025"], correct: 0 },
  { question: "Royal Caribbean's Oasis-class first ship?", choices: ["Oasis of the Seas (2009)", "Allure of the Seas", "Harmony", "Symphony"], correct: 0 },
  { question: "Cunard's flagship cruise liner is the?", choices: ["Queen Mary 2", "Queen Elizabeth", "Queen Victoria", "Queen Anne"], correct: 0 },
  { question: "Queen Mary 2 is unique as a?", choices: ["True ocean liner (transatlantic) not just a cruise ship", "Pure cruise ship", "Ferry", "Container hybrid"], correct: 0 },
  { question: "Carnival Cruise Line was founded in?", choices: ["1972", "1980", "1965", "1990"], correct: 0 },
  { question: "Who founded Carnival Cruise Line?", choices: ["Ted Arison", "Micky Arison", "Frank del Rio", "Richard Fain"], correct: 0 },
  { question: "Norwegian Cruise Line is owned by?", choices: ["Norwegian Cruise Line Holdings (NCLH)", "Carnival Corp", "Royal Caribbean", "MSC"], correct: 0 },
  { question: "Disney Cruise Line first ship?", choices: ["Disney Magic (1998)", "Disney Wonder", "Disney Dream", "Disney Fantasy"], correct: 0 },
  { question: "MSC Cruises is based in?", choices: ["Switzerland (HQ Geneva); Italian heritage", "Italy only", "France", "UK"], correct: 0 },
  { question: "What is a 'Panamax' cruise ship?", choices: ["Maximum size to fit through old Panama Canal", "Maximum cargo", "Panama-flagged", "Panama-built"], correct: 0 },
  { question: "What was the largest passenger ship of WWII era for troops?", choices: ["RMS Queen Mary (and Queen Elizabeth)", "RMS Olympic", "SS United States", "RMS Aquitania"], correct: 0 },
  { question: "SS United States holds what record?", choices: ["Fastest transatlantic crossing (1952)", "Largest", "Oldest", "First all-aluminum"], correct: 0 },
  { question: "Cruise ship Costa Concordia famously?", choices: ["Sank/capsized off Italy in 2012", "Caught fire", "Hit iceberg", "Disappeared"], correct: 0 },
  { question: "Costa Concordia captain?", choices: ["Francesco Schettino", "Edward Smith", "Carlo Marini", "Luigi Costa"], correct: 0 },
  { question: "Holland America Line is based in?", choices: ["Seattle (originally Rotterdam)", "Amsterdam", "London", "Miami"], correct: 0 },
  { question: "Princess Cruises was made famous by which TV show?", choices: ["The Love Boat", "Below Deck", "Cruise Ship", "Vacation"], correct: 0 },
  { question: "Cruise ship 'gross tonnage' measures?", choices: ["Internal volume (not weight)", "Weight", "Engine power", "Passenger count"], correct: 0 },
  { question: "Royal Caribbean was founded in?", choices: ["1968", "1972", "1980", "1958"], correct: 0 },
  { question: "Where does most cruise traffic in U.S. originate?", choices: ["Port of Miami / South Florida", "New York", "Los Angeles", "Galveston"], correct: 0 },
  { question: "What is the cruise capital of the world?", choices: ["PortMiami", "Port Canaveral", "Port Everglades", "Port of Los Angeles"], correct: 0 },
  { question: "Viking Cruises specializes in?", choices: ["River and ocean cruises (Scandinavian)", "Tropical only", "Antarctic only", "Mediterranean only"], correct: 0 },
  { question: "Symphony of the Seas length?", choices: ["About 362 m (1,188 ft)", "300 m", "400 m", "250 m"], correct: 0 },
  { question: "Cruise ships' 'azipod' is?", choices: ["A 360-degree rotating propulsion pod", "A swimming pool", "An exhaust", "A radar"], correct: 0 },
  { question: "Largest cruise line by fleet?", choices: ["Carnival Corporation (parent)", "Royal Caribbean Group", "MSC", "NCL"], correct: 0 },
  { question: "Cunard ships traditionally have what suffix?", choices: ["Queen [name]", "RMS only", "MS [name]", "MV [name]"], correct: 0 },
  { question: "Titanic's sister ships?", choices: ["Olympic and Britannic", "Lusitania and Mauretania", "Aquitania and Carmania", "Queen Mary and Elizabeth"], correct: 0 },
  { question: "What classifies a 'mega ship' in cruising?", choices: ["Generally over 100,000 GT", "Over 50,000 GT", "Over 200,000 GT", "Over 300m long"], correct: 0 },
  { question: "Wind Surf is operated by?", choices: ["Windstar Cruises", "Princess", "Royal Caribbean", "Holland America"], correct: 0 },
  { question: "Norwegian Epic features what unique?", choices: ["Curved cabins/Solo studios", "Underwater rooms", "Submarine deck", "Roller coaster (newer ships)"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CruiseShipsQuizSettings): CruiseShipsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CruiseShipsQuizState, action: CruiseShipsQuizAction): CruiseShipsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CruiseShipsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
