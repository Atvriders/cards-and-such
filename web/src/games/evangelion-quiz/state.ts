import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EvangelionQuizSettings { questions: "10" | "20"; }
export interface EvangelionQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EvangelionQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The protagonist of Evangelion is?", choices: ["Shinji Ikari", "Kaworu", "Asuka", "Rei"], correct: 0 },
  { question: "Shinji pilots which Eva unit?", choices: ["Unit-00", "Unit-01", "Unit-02", "Unit-03"], correct: 1 },
  { question: "Rei Ayanami pilots?", choices: ["Unit-00", "Unit-01", "Unit-02", "Unit-04"], correct: 0 },
  { question: "Asuka Langley pilots?", choices: ["Unit-00", "Unit-01", "Unit-02", "Unit-03"], correct: 2 },
  { question: "The organization that fights Angels is?", choices: ["NERV", "SEELE", "WILLE", "GEHIRN"], correct: 0 },
  { question: "NERV's commander is?", choices: ["Gendo Ikari", "Misato", "Ritsuko", "Fuyutsuki"], correct: 0 },
  { question: "Shinji's guardian and superior officer?", choices: ["Misato Katsuragi", "Ritsuko", "Maya", "Yui"], correct: 0 },
  { question: "The hostile beings attacking humanity?", choices: ["Angels", "Titans", "Demons", "Ghosts"], correct: 0 },
  { question: "The series director is?", choices: ["Hideaki Anno", "Mamoru Oshii", "Satoshi Kon", "Hayao Miyazaki"], correct: 0 },
  { question: "Kaworu Nagisa is the?", choices: ["17th Angel (Tabris)", "First Child", "Second Child", "Mass-production Eva"], correct: 0 },
  { question: "The series first aired in?", choices: ["1995", "1992", "1998", "2000"], correct: 0 },
  { question: "AT Field stands for?", choices: ["Absolute Terror Field", "Angel Tracking Field", "Anti-Titan Field", "Active Threat Field"], correct: 0 },
  { question: "Shinji's mother is?", choices: ["Yui Ikari", "Kyoko", "Naoko", "Misato"], correct: 0 },
  { question: "Asuka's mother is?", choices: ["Yui", "Kyoko Zeppelin Soryu", "Naoko", "Ritsuko"], correct: 1 },
  { question: "The first Angel encountered in series?", choices: ["Sachiel (3rd)", "Adam", "Lilith", "Tabris"], correct: 0 },
  { question: "The shadowy organization above NERV?", choices: ["SEELE", "WILLE", "JSSDF", "Marduk"], correct: 0 },
  { question: "Rebuild of Evangelion films number how many?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "End of Evangelion film features?", choices: ["The Third Impact", "First Impact", "Second Impact", "Final fight with Adam"], correct: 0 },
  { question: "The composer for most Eva music?", choices: ["Shiro Sagisu", "Joe Hisaishi", "Kenji Kawai", "Yoko Kanno"], correct: 0 },
  { question: "Misato's pet is a?", choices: ["Penguin (Pen-Pen)", "Cat", "Dog", "Owl"], correct: 0 },
  { question: "The supercomputer system at NERV?", choices: ["MAGI", "JANUS", "MOTHER", "ORACLE"], correct: 0 },
  { question: "Eva pilots are called the?", choices: ["Children", "Pilots", "Saints", "Angels"], correct: 0 },
  { question: "Lilith is sealed beneath?", choices: ["NERV HQ (Terminal Dogma)", "Tokyo Tower", "Mt. Fuji", "Antarctica"], correct: 0 },
  { question: "Adam was found at?", choices: ["The South Pole/Antarctica", "Mt. Everest", "Mariana Trench", "The Moon"], correct: 0 },
  { question: "Second Impact occurred in?", choices: ["2000", "1995", "1999", "2015"], correct: 0 },
  { question: "Tokyo-3 is built around what mountain?", choices: ["Hakone (around Lake Ashi)", "Fuji", "Yari", "Tate"], correct: 0 },
  { question: "Toji pilots which Eva (briefly)?", choices: ["Unit-03", "Unit-01", "Unit-02", "Unit-00"], correct: 0 },
  { question: "The dummy plug system uses?", choices: ["Rei's data/clones", "Asuka's data", "Shinji's data", "Kaworu's data"], correct: 0 },
  { question: "Gendo's true plan involves?", choices: ["Reuniting with Yui via Instrumentality", "Destroying SEELE", "Becoming an Angel", "Saving Shinji"], correct: 0 },
  { question: "The opening theme song is titled?", choices: ["A Cruel Angel's Thesis", "Fly Me to the Moon", "Tank!", "Inner Universe"], correct: 0 },
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
