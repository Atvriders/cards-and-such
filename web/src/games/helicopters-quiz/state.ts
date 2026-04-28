import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HelicoptersQuizSettings { questions: "10" | "20" | "30"; }
export interface HelicoptersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HelicoptersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Father of the modern helicopter?", choices: ["Wright", "Sikorsky", "Cierva", "Bell"], correct: 1 },
  { question: "Sikorsky VS-300 first flew in?", choices: ["1929", "1939", "1945", "1950"], correct: 1 },
  { question: "Cierva invented the?", choices: ["Helicopter", "Autogyro", "Tilt-rotor", "Drone"], correct: 1 },
  { question: "Bell UH-1 nickname?", choices: ["Cobra", "Huey", "Apache", "Chinook"], correct: 1 },
  { question: "UH-1 first served in?", choices: ["Korea", "Vietnam", "Gulf", "Iraq"], correct: 1 },
  { question: "CH-47 Chinook has how many rotors?", choices: ["1", "2 tandem", "2 side-by-side", "3"], correct: 1 },
  { question: "AH-64 Apache main armor target?", choices: ["Tanks", "Ships", "Subs", "Bombers"], correct: 0 },
  { question: "Mi-8/17 manufacturer?", choices: ["Mil", "Kamov", "Sikorsky", "Bell"], correct: 0 },
  { question: "Sea King is made by?", choices: ["Sikorsky", "Bell", "Westland", "MBB"], correct: 0 },
  { question: "Robinson R22 seats?", choices: ["1", "2", "4", "6"], correct: 1 },
  { question: "Tail rotor counters?", choices: ["Yaw", "Pitch", "Roll", "Drag"], correct: 0 },
  { question: "NOTAR uses?", choices: ["Air", "Tail rotor", "Twin rotors", "Jet"], correct: 0 },
  { question: "Coaxial rotors are used by?", choices: ["Bell", "Kamov", "Westland", "Eurocopter"], correct: 1 },
  { question: "V-22 Osprey is a?", choices: ["Helicopter", "Tilt-rotor", "Drone", "Glider"], correct: 1 },
  { question: "Eurocopter became?", choices: ["Airbus Helicopters", "Bell", "Boeing", "Sikorsky"], correct: 0 },
  { question: "Lynx held a speed record around (knots)?", choices: ["190", "200", "216", "250"], correct: 2 },
  { question: "CH-53 was used by?", choices: ["Army", "USMC", "Navy", "All"], correct: 1 },
  { question: "Black Hawk first flew in?", choices: ["1969", "1974", "1979", "1985"], correct: 1 },
  { question: "MD 500 / Hughes 500 was used in?", choices: ["Crop", "Recon", "Many roles", "Air taxi"], correct: 2 },
  { question: "Heliport is also called?", choices: ["Helibase", "Helipad", "Hangar", "Apron"], correct: 1 },
  { question: "Autorotation is used during?", choices: ["Engine failure", "Hover", "Cruise", "Climb"], correct: 0 },
  { question: "Cyclic controls?", choices: ["Yaw", "Pitch/roll", "Throttle", "Tail"], correct: 1 },
  { question: "Collective controls?", choices: ["Pitch of all blades", "Yaw", "Roll", "Tail"], correct: 0 },
  { question: "Anti-torque pedals control?", choices: ["Pitch", "Yaw", "Roll", "Throttle"], correct: 1 },
  { question: "Bell 47 is famous for?", choices: ["Police", "Bubble canopy/MASH", "Sea King", "Cargo"], correct: 1 },
  { question: "Boeing CH-47 first flew in?", choices: ["1961", "1971", "1981", "1991"], correct: 0 },
  { question: "Sikorsky S-92 used as?", choices: ["Air taxi", "Civilian transport", "Spec ops", "All"], correct: 3 },
  { question: "Largest helicopter ever flown?", choices: ["Mi-26", "Mi-12", "CH-53", "CH-47"], correct: 1 },
  { question: "Mi-26 is made in?", choices: ["Russia", "U.S.", "France", "UK"], correct: 0 },
  { question: "HH-65 Dolphin used by?", choices: ["USCG", "USAF", "USMC", "USN"], correct: 0 },
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
