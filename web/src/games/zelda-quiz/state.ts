import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ZeldaSettings { questions: "10" | "20" | "30"; }
export interface ZeldaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ZeldaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Hero's name?", choices: ["Link","Zelda","Ganon","Sheik"], correct: 0 },
  { question: "Princess's name?", choices: ["Zelda","Peach","Saria","Malon"], correct: 0 },
  { question: "Main villain?", choices: ["Ganon/Ganondorf","Vaati","Yuga","Calamity"], correct: 0 },
  { question: "Setting?", choices: ["Hyrule","Termina","Lorule","Gerudo"], correct: 0 },
  { question: "Triforce has how many parts?", choices: ["3","2","4","1"], correct: 0 },
  { question: "Triforce of?", choices: ["Power, Wisdom, Courage","Wind, Earth, Fire","Sun, Moon, Star","Time, Space, Soul"], correct: 0 },
  { question: "First Zelda game year?", choices: ["1986","1990","1985","1988"], correct: 0 },
  { question: "Ocarina of Time console?", choices: ["N64","SNES","GameCube","Wii"], correct: 0 },
  { question: "Wind Waker console?", choices: ["GameCube","N64","Wii","Switch"], correct: 0 },
  { question: "Link is from?", choices: ["Hyrule (Kokiri/Hylian)","Termina","Earth","Skyloft variants"], correct: 0 },
  { question: "Master Sword pulls from?", choices: ["Pedestal of Time","Triforce stone","Stone Tower","Lake"], correct: 0 },
  { question: "Navi is a?", choices: ["Fairy","Bird","Dragon","Wolf"], correct: 0 },
  { question: "Twilight Princess wolf form?", choices: ["Yes","No","Once","Sometimes"], correct: 0 },
  { question: "BotW console?", choices: ["Switch / Wii U","3DS","GameCube","PC"], correct: 0 },
  { question: "BotW year?", choices: ["2017","2015","2018","2020"], correct: 0 },
  { question: "Ocarina of Time year?", choices: ["1998","2000","1996","2002"], correct: 0 },
  { question: "Tears of Kingdom year?", choices: ["2023","2022","2024","2021"], correct: 0 },
  { question: "Sheik is?", choices: ["Zelda in disguise","Villain","Sage","Ally"], correct: 0 },
  { question: "Link's horse?", choices: ["Epona","Bessie","Roan","Star"], correct: 0 },
  { question: "Saria gives Link a?", choices: ["Fairy ocarina","Sword","Shield","Bow"], correct: 0 },
  { question: "Skull Kid wears?", choices: ["Majora's Mask","Ocarina","Sword","Sheild"], correct: 0 },
  { question: "Majora's Mask system?", choices: ["N64","SNES","GameCube","Wii"], correct: 0 },
  { question: "Spirit Tracks main vehicle?", choices: ["Train","Boat","Horse","Plane"], correct: 0 },
  { question: "Phantom Hourglass main vehicle?", choices: ["Boat","Train","Horse","Plane"], correct: 0 },
  { question: "Link's Awakening setting?", choices: ["Koholint Island","Hyrule","Termina","Lorule"], correct: 0 },
  { question: "A Link Between Worlds parallels?", choices: ["A Link to the Past","Ocarina","Wind Waker","BotW"], correct: 0 },
  { question: "Hylian symbol?", choices: ["Triforce","Tri-shield","Sword","Eye"], correct: 0 },
  { question: "Link's tunic color?", choices: ["Green","Red","Blue","Black"], correct: 0 },
  { question: "Skyward Sword introduces?", choices: ["Origin of Master Sword","Triforce","Hyrule","Goron"], correct: 0 },
  { question: "Goron race lives in?", choices: ["Mountains","Sea","Sky","Desert"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ZeldaSettings): ZeldaState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ZeldaState, action: ZeldaAction): ZeldaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ZeldaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
