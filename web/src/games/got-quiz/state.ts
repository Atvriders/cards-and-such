import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GoTSettings { questions: "10" | "20" | "30"; }
export interface GoTState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GoTAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "GoT was based on novels by?", choices: ["GRR Martin","Tolkien","Jordan","Sanderson"], correct: 0 },
  { question: "The Stark words are?", choices: ["Winter is Coming","Hear me roar","Fire and Blood","Family duty honor"], correct: 0 },
  { question: "Lannister words?", choices: ["Hear Me Roar","Winter is Coming","Fire and Blood","Unbowed"], correct: 0 },
  { question: "Targaryen words?", choices: ["Fire and Blood","Hear me roar","Winter is coming","Family duty"], correct: 0 },
  { question: "Daenerys's title?", choices: ["Mother of Dragons","Queen of Wolves","Lady of Light","Mother Wolf"], correct: 0 },
  { question: "Jon Snow's birth name?", choices: ["Aegon Targaryen","Eddard","Jaehaerys","Snow"], correct: 0 },
  { question: "Number of dragons born?", choices: ["3","2","1","4"], correct: 0 },
  { question: "Dragon names?", choices: ["Drogon, Viserion, Rhaegal","Smaug etc","Khan","Drogon only"], correct: 0 },
  { question: "The Iron Throne is in?", choices: ["King's Landing","Winterfell","Pentos","Braavos"], correct: 0 },
  { question: "The Wall is in the?", choices: ["North","South","East","West"], correct: 0 },
  { question: "Night's Watch motto?", choices: ["Night gathers...","Hi","Bye","What"], correct: 0 },
  { question: "White Walkers are killed by?", choices: ["Valyrian steel/dragonglass","Fire","Water","Ice"], correct: 0 },
  { question: "Cersei is whose mother?", choices: ["Joffrey, Myrcella, Tommen","Robb","Arya","Sansa"], correct: 0 },
  { question: "The Hound's name?", choices: ["Sandor Clegane","Gregor","Rickon","Cersei"], correct: 0 },
  { question: "The Mountain's name?", choices: ["Gregor Clegane","Sandor","Robb","Tywin"], correct: 0 },
  { question: "Tyrion's family?", choices: ["Lannister","Stark","Targaryen","Greyjoy"], correct: 0 },
  { question: "Bran becomes the?", choices: ["Three-Eyed Raven","King","Hand","Lord"], correct: 0 },
  { question: "Arya kills the?", choices: ["Night King","Cersei","Jaime","Robb"], correct: 0 },
  { question: "Red Wedding location?", choices: ["The Twins","Winterfell","Pyke","Casterly"], correct: 0 },
  { question: "Show creators?", choices: ["Benioff & Weiss","GRR Martin","HBO","Disney"], correct: 0 },
  { question: "Show ran how many seasons?", choices: ["6","7","8","9"], correct: 2 },
  { question: "Battle of the Bastards opponents?", choices: ["Stark vs Bolton","Stark vs Lannister","Targaryen vs Lannister","North vs South"], correct: 0 },
  { question: "Khal Drogo is?", choices: ["Dothraki Khal","King","Lord","Knight"], correct: 0 },
  { question: "Jaime's nickname?", choices: ["Kingslayer","Lionheart","Goldfist","Sword"], correct: 0 },
  { question: "The Faceless Men train in?", choices: ["Braavos","King's Landing","Volantis","Pentos"], correct: 0 },
  { question: "Daenerys's last name?", choices: ["Targaryen","Stark","Lannister","Snow"], correct: 0 },
  { question: "The Lord of Light is?", choices: ["R'hllor","The Drowned God","Old Gods","The Seven"], correct: 0 },
  { question: "Sansa marries (later)?", choices: ["Tyrion, then Ramsay","Jon","Theon","Bran"], correct: 0 },
  { question: "Hodor's actual name?", choices: ["Wylis","Hodor","Walder","Roger"], correct: 0 },
  { question: "Final episode aired in?", choices: ["2017","2018","2019","2020"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GoTSettings): GoTState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GoTState, action: GoTAction): GoTState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GoTState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
