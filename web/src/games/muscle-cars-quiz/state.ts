import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MuscleCarsQuizSettings { questions: "10" | "20" | "30"; }
export interface MuscleCarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MuscleCarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "First \"muscle car\" by most accounts?", choices: ["Mustang GT", "Pontiac GTO", "Camaro SS", "Charger R/T"], correct: 1 },
  { question: "Pontiac GTO debuted in what year?", choices: ["1962", "1964", "1967", "1970"], correct: 1 },
  { question: "Ford Mustang debuted on?", choices: ["Apr 1964", "Jan 1965", "Sep 1964", "Jul 1965"], correct: 0 },
  { question: "Chevy Camaro debuted in?", choices: ["1965", "1967", "1969", "1970"], correct: 1 },
  { question: "Plymouth Barracuda first launched in?", choices: ["1962", "1964", "1967", "1970"], correct: 1 },
  { question: "Hemi engine displacement most famous?", choices: ["383", "426", "440", "454"], correct: 1 },
  { question: "Dodge Charger Daytona wing was for?", choices: ["Style", "Aero", "Marketing", "Cooling"], correct: 1 },
  { question: "Boss 302 Mustang made its mark in?", choices: ["NASCAR", "Trans-Am", "Drag", "Rally"], correct: 1 },
  { question: "Chevelle SS 454 LS6 produced (advertised)?", choices: ["350 hp", "400 hp", "450 hp", "500 hp"], correct: 2 },
  { question: "Plymouth Road Runner used what cartoon?", choices: ["Coyote", "Roadrunner", "Beep-Beep", "Tweety"], correct: 1 },
  { question: "Olds 442 stood for?", choices: ["4-bbl/4-spd/2-exhaust", "4-cyl/4-doors/2 seats", "400 cu/4 tires/2 row", "None"], correct: 0 },
  { question: "Buick GSX top engine?", choices: ["350", "400", "455", "502"], correct: 2 },
  { question: "AMC SC/Rambler colors were?", choices: ["Red/white/blue", "Black/silver", "Green/yellow", "Orange/black"], correct: 0 },
  { question: "Pontiac Trans Am screaming chicken decals appeared in?", choices: ["1969", "1973", "1976", "1980"], correct: 1 },
  { question: "1970 Plymouth Hemi Cuda is famous for being?", choices: ["Underpowered", "Rare/valuable", "Diesel", "Front-wheel drive"], correct: 1 },
  { question: "Ford Torino Cobra used what engine size?", choices: ["351", "390", "428", "429"], correct: 3 },
  { question: "Chevy Nova SS was based on what platform?", choices: ["F", "X", "A", "B"], correct: 1 },
  { question: "Dodge Demon based on which body?", choices: ["Dart", "Charger", "Coronet", "Challenger"], correct: 0 },
  { question: "Ford Mustang Mach 1 first appeared in?", choices: ["1965", "1969", "1971", "1973"], correct: 1 },
  { question: "Chevy Camaro Z/28 was tuned for?", choices: ["Drag", "Trans-Am", "Rally", "Top speed"], correct: 1 },
  { question: "Pontiac Firebird Trans Am peaked in early-70s with?", choices: ["Ram Air IV", "SD-455", "HO-455", "455 6X"], correct: 1 },
  { question: "Hurst was famous for?", choices: ["Tires", "Shifters", "Carburetors", "Mufflers"], correct: 1 },
  { question: "1968 Charger body code?", choices: ["B", "E", "C", "A"], correct: 0 },
  { question: "Yenko Camaros were prepped by?", choices: ["Hurst", "A dealer", "GM", "Holley"], correct: 1 },
  { question: "Buick GS Stage 1 used what engine?", choices: ["400", "455", "350", "430"], correct: 1 },
  { question: "Mercury Cyclone Spoiler II was built for?", choices: ["Showroom", "NASCAR", "Drag", "Off-road"], correct: 1 },
  { question: "Corvette ZL1 of 1969 was an aluminum-block?", choices: ["396", "427", "454", "430"], correct: 1 },
  { question: "Big-block Chevy \"rat motor\" started at?", choices: ["396", "402", "427", "454"], correct: 0 },
  { question: "Plymouth Superbird was based on the?", choices: ["Charger", "Road Runner", "Cuda", "Belvedere"], correct: 1 },
  { question: "Insurance crackdowns and emissions ended muscle by?", choices: ["1968", "1972", "1974", "1980"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MuscleCarsQuizSettings): MuscleCarsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MuscleCarsQuizState, action: MuscleCarsQuizAction): MuscleCarsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MuscleCarsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
