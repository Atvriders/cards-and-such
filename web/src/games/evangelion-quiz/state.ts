import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EvangelionQuizSettings { questions: "10" | "20"; }
export interface EvangelionQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EvangelionQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Shinji pilots which Eva unit?", choices: ["00", "01", "02", "03"], correct: 1 },
  { question: "Asuka pilots Eva?", choices: ["00", "01", "02", "03"], correct: 2 },
  { question: "Rei pilots Eva?", choices: ["00", "01", "02", "04"], correct: 0 },
  { question: "NERV's commander?", choices: ["Gendo Ikari", "Kozo Fuyutsuki", "Misato Katsuragi", "Ritsuko Akagi"], correct: 0 },
  { question: "The Angels are referred to as?", choices: ["Devils", "Apostles or Shito", "Spirits", "Gods"], correct: 1 },
  { question: "The capital city in NGE?", choices: ["Tokyo-3", "Tokyo-2", "Neo-Tokyo", "Kyoto-3"], correct: 0 },
  { question: "Misato Katsuragi's pet is?", choices: ["Pen Pen the penguin", "Cat", "Dog", "Bird"], correct: 0 },
  { question: "The First Angel is?", choices: ["Adam", "Lilith", "Sachiel", "Tabris"], correct: 0 },
  { question: "The Lance of Longinus pierces?", choices: ["Adam", "Lilith", "Eva 01", "Sachiel"], correct: 1 },
  { question: "Kaworu Nagisa is the?", choices: ["1st Angel", "13th Angel", "17th Angel", "Last Angel"], correct: 2 },
  { question: "NERV's parent organization?", choices: ["JSSDF", "SEELE", "UN", "Marduk"], correct: 1 },
  { question: "Eva 01 went berserk in episode?", choices: ["1", "2", "19", "26"], correct: 1 },
  { question: "Mass production Eva count?", choices: ["5", "7", "9", "12"], correct: 2 },
  { question: "Asuka's heritage?", choices: ["Japanese", "American and German", "French", "Russian"], correct: 1 },
  { question: "End of Evangelion premiered in?", choices: ["1995", "1996", "1997", "1998"], correct: 2 },
  { question: "Rebuild Eva 4th film is called?", choices: ["3.0", "3.0+1.0", "3.33", "Air"], correct: 1 },
  { question: "Mari Makinami appears in?", choices: ["Original NGE", "Rebuild only", "Comic only", "Game only"], correct: 1 },
  { question: "Director of Evangelion?", choices: ["Anno", "Tomino", "Miyazaki", "Oshii"], correct: 0 },
  { question: "Yui Ikari's soul is in?", choices: ["Eva 00", "Eva 01", "Eva 02", "Eva 03"], correct: 1 },
  { question: "Toji pilots Eva?", choices: ["02", "03", "04", "05"], correct: 1 },
  { question: "The Magi system is?", choices: ["Three computers", "AI", "Power source", "Spaceship"], correct: 0 },
  { question: "Ritsuko Akagi's mother developed?", choices: ["Eva 01", "Magi", "AT Field", "S2 Engine"], correct: 1 },
  { question: "Episode 26 is famously?", choices: ["Action-packed", "Abstract and introspective", "Comedic", "A clip show"], correct: 1 },
  { question: "Asuka's Eva number 02 unit color?", choices: ["Blue", "Red", "Purple", "Black"], correct: 1 },
  { question: "AT Field stands for?", choices: ["Absolute Terror Field", "Anti-Tank Field", "Active Threat", "Adam's Tomb"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EvangelionQuizSettings): EvangelionQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EvangelionQuizState, action: EvangelionQuizAction): EvangelionQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EvangelionQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
