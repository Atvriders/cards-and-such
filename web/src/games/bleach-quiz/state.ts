import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BleachQuizSettings { questions: "10" | "20"; }
export interface BleachQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BleachQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Ichigo's last name is?", choices: ["Kuchiki", "Kurosaki", "Ishida", "Abarai"], correct: 1 },
  { question: "Ichigo's zanpakuto is named?", choices: ["Senbonzakura", "Zangetsu", "Sode no Shirayuki", "Hyorinmaru"], correct: 1 },
  { question: "The afterlife society is called?", choices: ["Hueco Mundo", "Soul Society", "Hell", "Royal Realm"], correct: 1 },
  { question: "Soul Reapers are also called?", choices: ["Bount", "Shinigami", "Quincy", "Arrancar"], correct: 1 },
  { question: "Rukia's family name?", choices: ["Kuchiki", "Kurosaki", "Hitsugaya", "Soifon"], correct: 0 },
  { question: "Captain of Squad 10 (with ice zanpakuto)?", choices: ["Hitsugaya", "Byakuya", "Komamura", "Ukitake"], correct: 0 },
  { question: "The white-masked monsters are called?", choices: ["Hollows", "Quincys", "Bounts", "Fullbringers"], correct: 0 },
  { question: "Aizen's zanpakuto's release name?", choices: ["Kyoka Suigetsu", "Senbonzakura", "Ryujin Jakka", "Engetsu"], correct: 0 },
  { question: "How many Espada are there originally?", choices: ["8", "9", "10", "13"], correct: 2 },
  { question: "Espada #1 is?", choices: ["Stark", "Barragan", "Halibel", "Ulquiorra"], correct: 0 },
  { question: "Ulquiorra is Espada number?", choices: ["1", "2", "3", "4"], correct: 3 },
  { question: "The desert-like Hollow world is?", choices: ["Hueco Mundo", "Soul Society", "Karakura", "Las Noches"], correct: 0 },
  { question: "Captain Yamamoto's zanpakuto?", choices: ["Ryujin Jakka", "Zangetsu", "Suzumebachi", "Tobiume"], correct: 0 },
  { question: "Quincys use a bow made of?", choices: ["Spirit energy (reishi)", "Wood", "Steel", "Bone"], correct: 0 },
  { question: "Uryu Ishida is a?", choices: ["Quincy", "Soul Reaper", "Arrancar", "Fullbringer"], correct: 0 },
  { question: "Orihime's powers manifest as?", choices: ["Six fairies (Shun Shun Rikka)", "Lightning", "Ice", "Shadow"], correct: 0 },
  { question: "Chad's full first name?", choices: ["Yasutora", "Renji", "Sojiro", "Hikari"], correct: 0 },
  { question: "Renji's bankai is called?", choices: ["Hihio Zabimaru", "Senbonzakura Kageyoshi", "Daiguren Hyorinmaru", "Tensa Zangetsu"], correct: 0 },
  { question: "The Captain-Commander in the 1000-Year Blood War is?", choices: ["Yamamoto", "Kyoraku", "Ukitake", "Aizen"], correct: 1 },
  { question: "The Quincy king is?", choices: ["Yhwach", "Aizen", "Juha Bach", "Kenpachi"], correct: 0 },
  { question: "Soul Society's Kuchiki captain is?", choices: ["Byakuya", "Kenpachi", "Toshiro", "Mayuri"], correct: 0 },
  { question: "Soul-cleaving sword swung by all Soul Reapers?", choices: ["Asauchi (untrained zanpakuto)", "Katana", "Wakizashi", "Tachi"], correct: 0 },
  { question: "Kenpachi commands which squad?", choices: ["Squad 11", "Squad 10", "Squad 12", "Squad 13"], correct: 0 },
  { question: "Mayuri Kurotsuchi heads?", choices: ["Squad 12 (R&D)", "Squad 4 (medical)", "Squad 13", "Squad 8"], correct: 0 },
  { question: "Healer/medical Squad is?", choices: ["Squad 4", "Squad 11", "Squad 7", "Squad 6"], correct: 0 },
  { question: "Ichigo's hollow form is also called?", choices: ["Hollow Ichigo / Inner Hollow", "Vasto Lorde", "Adjuchas", "Espada Ichigo"], correct: 0 },
  { question: "Soifon's bankai uses a giant?", choices: ["Missile launcher", "Bee swarm", "Energy bow", "Fire wheel"], correct: 0 },
  { question: "Aizen escaped Soul Society to?", choices: ["Hueco Mundo", "Karakura Town", "Royal Realm", "Hell"], correct: 0 },
  { question: "The author of Bleach is?", choices: ["Tite Kubo", "Eiichiro Oda", "Akira Toriyama", "Masashi Kishimoto"], correct: 0 },
  { question: "Final form of Ichigo's zanpakuto called?", choices: ["Tensa Zangetsu", "Mugetsu", "Getsuga", "Engetsu"], correct: 0 },
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
