import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BleachQuizSettings { questions: "10" | "20"; }
export interface BleachQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BleachQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ichigo's Zanpakuto is named?", choices: ["Zangetsu", "Zabimaru", "Senbonzakura", "Hyorinmaru"], correct: 0 },
  { question: "Soul Reapers fight which souls?", choices: ["Hollows", "Quincy", "Fullbringers", "Arrancar"], correct: 0 },
  { question: "Rukia Kuchiki's released form?", choices: ["Senbonzakura", "Sode no Shirayuki", "Zangetsu", "Hyorinmaru"], correct: 1 },
  { question: "Aizen's true Zanpakuto?", choices: ["Kyoka Suigetsu", "Zangetsu", "Senbonzakura", "Tensa"], correct: 0 },
  { question: "Captain Toshiro Hitsugaya leads squad?", choices: ["10", "11", "12", "8"], correct: 0 },
  { question: "Captain Kenpachi Zaraki leads squad?", choices: ["10", "11", "12", "8"], correct: 1 },
  { question: "Byakuya is Captain of squad?", choices: ["6", "8", "10", "13"], correct: 0 },
  { question: "Yamamoto leads squad?", choices: ["1", "2", "3", "4"], correct: 0 },
  { question: "Espada are ranked from?", choices: ["1 to 10 weakest first", "1 to 10 strongest first", "0 to 9", "Random"], correct: 1 },
  { question: "Hollow mask appears when soul becomes?", choices: ["Quincy", "Hollow", "Soul Reaper", "Fullbringer"], correct: 1 },
  { question: "Urahara was once captain of squad?", choices: ["10", "11", "12", "13"], correct: 2 },
  { question: "Yoruichi was once captain of squad?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Ulquiorra Cifer is Espada number?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Grimmjow is Espada number?", choices: ["6", "7", "8", "9"], correct: 0 },
  { question: "Ichigo's hollow form is called?", choices: ["Hollow Ichigo", "Tensa Zangetsu", "Final Getsuga", "Bankai"], correct: 0 },
  { question: "Quincy use what kind of energy?", choices: ["Reishi", "Reiatsu", "Kido", "Hollow Power"], correct: 0 },
  { question: "Yhwach is leader of?", choices: ["Espada", "Wandenreich", "Visored", "Soul Society"], correct: 1 },
  { question: "Karakura Town is in?", choices: ["Tokyo", "Kanto region", "Kyoto", "Hokkaido"], correct: 1 },
  { question: "Kon is what kind of soul?", choices: ["Hollow", "Mod Soul", "Quincy", "Spirit"], correct: 1 },
  { question: "Orihime's powers are?", choices: ["Healing and rejection", "Fire", "Ice", "Lightning"], correct: 0 },
  { question: "Chad's arms transform into?", choices: ["Hollow", "Devil", "Spirit", "Demon"], correct: 0 },
  { question: "Renji's Bankai is?", choices: ["Senbonzakura", "Hihio Zabimaru", "Daiguren", "Ryujin Jakka"], correct: 1 },
  { question: "Captain Komamura's appearance?", choices: ["Wolf-headed", "Bear-headed", "Cat-headed", "Lion-headed"], correct: 0 },
  { question: "Bankai means?", choices: ["First release", "Final release", "Initial form", "Hollow form"], correct: 1 },
  { question: "Zaraki gained Bankai during?", choices: ["Soul Society arc", "Arrancar arc", "Thousand Year Blood War", "Lost Agent arc"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BleachQuizSettings): BleachQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BleachQuizState, action: BleachQuizAction): BleachQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BleachQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
