import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HelicoptersQuizSettings { questions: "10" | "20" | "30"; }
export interface HelicoptersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HelicoptersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who built the first practical helicopter (1939)?", choices: ["Igor Sikorsky", "Heinrich Focke", "Juan de la Cierva", "Arthur Young"], correct: 0 },
  { question: "Sikorsky's first practical helicopter is the?", choices: ["VS-300", "R-4", "S-55", "S-58"], correct: 0 },
  { question: "Who flew the world's first untethered helicopter flight (1907)?", choices: ["Paul Cornu (briefly) / Generally credited around then", "Wright Brothers", "Igor Sikorsky", "Harold Pitcairn"], correct: 0 },
  { question: "What is the most-produced helicopter in history?", choices: ["Mil Mi-8/17 series", "Bell UH-1 Huey", "Sikorsky Black Hawk", "Robinson R44"], correct: 0 },
  { question: "What helicopter is known as the 'Huey'?", choices: ["Bell UH-1 Iroquois", "Sikorsky CH-53", "Boeing AH-64 Apache", "Bell AH-1 Cobra"], correct: 0 },
  { question: "Apache attack helicopter is made by?", choices: ["Boeing (originally Hughes/McDonnell Douglas)", "Sikorsky", "Bell", "Airbus"], correct: 0 },
  { question: "Apache designation?", choices: ["AH-64", "UH-60", "CH-47", "AH-1"], correct: 0 },
  { question: "Black Hawk designation?", choices: ["UH-60", "AH-64", "CH-47", "OH-58"], correct: 0 },
  { question: "Who manufactures the Black Hawk?", choices: ["Sikorsky (Lockheed Martin)", "Bell", "Boeing", "Airbus"], correct: 0 },
  { question: "CH-47 nickname?", choices: ["Chinook", "Sea Knight", "Sea Stallion", "Super Stallion"], correct: 0 },
  { question: "Chinook has how many rotors?", choices: ["Two (tandem)", "One", "Three", "Four"], correct: 0 },
  { question: "What is the world's largest helicopter ever built?", choices: ["Mil V-12 (prototype)", "Mil Mi-26", "Sikorsky CH-53K", "Boeing CH-47"], correct: 0 },
  { question: "Largest helicopter in production?", choices: ["Mil Mi-26", "Sikorsky CH-53K", "Boeing CH-47", "Airbus H225"], correct: 0 },
  { question: "Robinson Helicopter Company is famous for?", choices: ["Light helicopters R22, R44, R66", "Military attack", "Heavy lift", "Tilt rotor"], correct: 0 },
  { question: "Bell V-22 Osprey is what type of aircraft?", choices: ["Tiltrotor", "Conventional helicopter", "Tandem rotor", "Coaxial"], correct: 0 },
  { question: "Who manufactures the V-22 Osprey?", choices: ["Bell-Boeing joint venture", "Sikorsky", "Boeing alone", "Lockheed"], correct: 0 },
  { question: "Marine One (Presidential helicopter) is which model?", choices: ["Currently VH-60N White Hawk and VH-3D Sea King; new VH-92", "Apache", "Chinook", "Black Hawk"], correct: 0 },
  { question: "What does VTOL stand for?", choices: ["Vertical Take-Off and Landing", "Variable Takeoff Landing", "Vector Takeoff Liftoff", "Vertical Tilt Off Lateral"], correct: 0 },
  { question: "What helicopter is known as 'Cobra'?", choices: ["Bell AH-1", "Sikorsky AH-60", "Boeing AH-64", "MD 500"], correct: 0 },
  { question: "Coast Guard rescue helicopter MH-65?", choices: ["Dolphin", "Pelican", "Jayhawk", "Ranger"], correct: 0 },
  { question: "MH-60 Coast Guard variant nickname?", choices: ["Jayhawk", "Dolphin", "Stallion", "Knight"], correct: 0 },
  { question: "What helicopter rescued bin Laden raid (2011)?", choices: ["Stealth-modified MH-60 Black Hawks (and a CH-47)", "Apache", "Chinook only", "V-22"], correct: 0 },
  { question: "What is autorotation?", choices: ["Unpowered descent using rotor windmilling", "Auto-pilot rotation", "Engine-driven rotation", "Braking system"], correct: 0 },
  { question: "Helicopter that famously appeared in 'Apocalypse Now' attack scene?", choices: ["Bell UH-1 Huey", "Apache", "Chinook", "Black Hawk"], correct: 0 },
  { question: "Which helicopter is the Russian 'Hind'?", choices: ["Mil Mi-24", "Mil Mi-8", "Mil Mi-26", "Kamov Ka-50"], correct: 0 },
  { question: "Kamov helicopters are known for?", choices: ["Coaxial counter-rotating rotors (no tail rotor)", "Tandem rotors", "Tiltrotor", "Single rotor"], correct: 0 },
  { question: "Eurocopter became which company?", choices: ["Airbus Helicopters", "Boeing Rotorcraft", "Sikorsky", "Bell"], correct: 0 },
  { question: "Augusta Westland (now Leonardo) is from?", choices: ["Italy and UK", "Germany", "France", "Spain"], correct: 0 },
  { question: "What is the maximum altitude for typical helicopter operation?", choices: ["Around 25,000 ft for many; record summit Everest landing", "60,000 ft", "10,000 ft", "5,000 ft"], correct: 0 },
  { question: "First helicopter to land on Everest summit (2005)?", choices: ["Eurocopter AS350 Ecureuil/B3", "Sikorsky", "Bell", "Robinson"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HelicoptersQuizSettings): HelicoptersQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HelicoptersQuizState, action: HelicoptersQuizAction): HelicoptersQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HelicoptersQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
