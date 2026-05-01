import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WorldFlagsQuizSettings { questions: "10" | "20" | "30"; }
export interface WorldFlagsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WorldFlagsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which country's flag features a red maple leaf?", choices: ["USA","Canada","UK","Australia"], correct: 1 },
  { question: "Which country's flag has a single white star on a red background?", choices: ["Vietnam","Cuba","China","Turkey"], correct: 0 },
  { question: "How many stars are on the flag of the United States?", choices: ["48","49","50","51"], correct: 2 },
  { question: "Which country has a flag with a red dot on a white background?", choices: ["China","Japan","South Korea","Bangladesh"], correct: 1 },
  { question: "Which Nordic country has a yellow Scandinavian cross on a blue background?", choices: ["Norway","Denmark","Sweden","Finland"], correct: 2 },
  { question: "Which country's flag depicts the Cedar tree?", choices: ["Israel","Lebanon","Cyprus","Syria"], correct: 1 },
  { question: "Which country has a flag with green, white, and orange vertical stripes?", choices: ["Italy","Ireland","Cote d'Ivoire","India"], correct: 1 },
  { question: "Whose flag has saffron, white, and green with a navy chakra?", choices: ["Pakistan","India","Bangladesh","Sri Lanka"], correct: 1 },
  { question: "Which country has a flag with three horizontal bands of black, red, and gold?", choices: ["Belgium","Germany","Netherlands","Romania"], correct: 1 },
  { question: "Which country's flag is the only non-rectangular national flag?", choices: ["Switzerland","Vatican City","Nepal","Bhutan"], correct: 2 },
  { question: "Whose flag shows a dragon on a yellow and orange background?", choices: ["China","Wales","Bhutan","Japan"], correct: 2 },
  { question: "Which European country's flag is a square (one of two)?", choices: ["Belgium","Switzerland","Liechtenstein","Czech Republic"], correct: 1 },
  { question: "Which country's flag has a distinctive sun with 16 rays?", choices: ["Argentina","Uruguay","Philippines","Kazakhstan"], correct: 3 },
  { question: "Which country has the Union Jack in the canton along with stars?", choices: ["Australia","New Zealand","Fiji","All of the above"], correct: 3 },
  { question: "Whose flag features the Star of David?", choices: ["Lebanon","Israel","Palestine","Jordan"], correct: 1 },
  { question: "Which African country's flag is fully green?", choices: ["Saudi Arabia","Libya (1977-2011)","Pakistan","Mauritania"], correct: 1 },
  { question: "Which country's flag has a yellow five-pointed star with four small stars?", choices: ["Vietnam","China","North Korea","Cuba"], correct: 1 },
  { question: "Whose flag depicts a soaring eagle holding a snake on a cactus?", choices: ["Spain","Mexico","Ecuador","Peru"], correct: 1 },
  { question: "Whose flag has horizontal red, white, and blue with a red triangle bearing the Union Jack?", choices: ["Cuba","Liberia","Chile","Czech Republic"], correct: 3 },
  { question: "Which country has a flag with the colors of pan-Africa: red, black, green plus yellow star?", choices: ["Ghana","Senegal","Cameroon","Uganda"], correct: 3 },
  { question: "Which country's flag has alternating green/red stripes with the Imperial seal?", choices: ["Iran","Morocco","Saudi Arabia","Tajikistan"], correct: 0 },
  { question: "Whose flag features a Phoenix and is the only one with religious script?", choices: ["Iraq","Saudi Arabia","Iran","Pakistan"], correct: 1 },
  { question: "What is the only country whose flag has only a single solid color (with seal)?", choices: ["Libya","Vatican City","Nepal","None"], correct: 3 },
  { question: "Which country has nine horizontal stripes of red and white with a green canton?", choices: ["Liberia","Malaysia","Thailand","Greece"], correct: 1 },
  { question: "How many stars are on the flag of China?", choices: ["1","3","4","5"], correct: 3 },
  { question: "Which country's flag is divided diagonally with a star in the upper hoist?", choices: ["DR Congo","Guyana","Tanzania","Trinidad and Tobago"], correct: 0 },
  { question: "Which country's flag has a red field with a yellow hammer and sickle (former)?", choices: ["China","USSR","Vietnam","Cuba"], correct: 1 },
  { question: "Whose flag has the colors red and white with a coat of arms in the center showing two eagles?", choices: ["Albania","Mexico","Ecuador","Spain"], correct: 3 },
  { question: "Whose flag features a red kangaroo and emu (coat of arms)?", choices: ["New Zealand","Australia","Papua New Guinea","Fiji"], correct: 1 },
  { question: "What three colors appear on the flag of France?", choices: ["Red, white, blue","Red, yellow, blue","Blue, white, red","Green, white, red"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WorldFlagsQuizSettings): WorldFlagsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WorldFlagsQuizState, action: WorldFlagsQuizAction): WorldFlagsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WorldFlagsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
