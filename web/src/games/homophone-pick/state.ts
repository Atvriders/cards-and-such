import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HomophonePickSettings { questions: "8" | "10" | "12"; }
export interface HomophonePickState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HomophonePickAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which pair are homophones?", choices: ["TWO/TOO","TOP/BOTTOM","CAT/DOG","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["FLOWER/FLOUR","CAT/DOG","UP/DOWN","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["KNIGHT/NIGHT","BROWN/BLUE","CAT/DOG","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["WEEK/WEAK","TOP/BOTTOM","CAT/DOG","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["HEAR/HERE","CAT/DOG","UP/DOWN","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["MEAT/MEET","TOP/BOTTOM","CAT/DOG","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["RIGHT/WRITE","CAT/DOG","UP/DOWN","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["SEA/SEE","TOP/BOTTOM","CAT/DOG","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["KNOW/NO","CAT/DOG","UP/DOWN","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["MAIL/MALE","TOP/BOTTOM","CAT/DOG","RUN/JUMP"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["PAIR/PEAR","BIG/SMALL","HOT/COLD","FAST/SLOW"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["SUN/SON","RED/GREEN","DAY/NIGHT","UP/DOWN"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["EYE/I","BLACK/WHITE","TALL/SHORT","RICH/POOR"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["BEAR/BARE","CAT/DOG","WET/DRY","FAT/THIN"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["HOUR/OUR","TOP/BOTTOM","GOOD/BAD","OLD/NEW"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["BLEW/BLUE","ROUND/SQUARE","OPEN/SHUT","FULL/EMPTY"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["DEAR/DEER","EAST/WEST","NORTH/SOUTH","LEFT/RIGHT"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["TAIL/TALE","SUN/MOON","DAY/NIGHT","FAST/SLOW"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["WAIT/WEIGHT","RAIN/SNOW","WIND/CALM","WARM/COOL"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["BREAK/BRAKE","HARD/SOFT","EARLY/LATE","ON/OFF"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["PEACE/PIECE","OPEN/CLOSE","TRUE/FALSE","HOT/COLD"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["CELL/SELL","WIN/LOSE","BUY/SELL","GIVE/TAKE"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["NEW/KNEW","RICH/POOR","FAR/NEAR","HIGH/LOW"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["WHOLE/HOLE","FULL/EMPTY","DEEP/SHALLOW","WIDE/NARROW"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["ALOUD/ALLOWED","PUSH/PULL","OPEN/SHUT","RAISE/LOWER"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["SCENE/SEEN","ASK/TELL","HIDE/SEEK","GO/STAY"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["BORED/BOARD","JUMP/LAND","SIT/STAND","WALK/RUN"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["STARE/STAIR","STOP/GO","SHUT/OPEN","BEGIN/END"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["THREW/THROUGH","INSIDE/OUTSIDE","ABOVE/BELOW","HERE/THERE"], correct: 0 },
  { question: "Which pair are homophones?", choices: ["FAIR/FARE","WIN/LOSE","GIVE/TAKE","PUSH/PULL"], correct: 0 }

] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: HomophonePickSettings): HomophonePickState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HomophonePickState, action: HomophonePickAction): HomophonePickState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HomophonePickState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
