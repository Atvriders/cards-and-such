import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PacificWarQuizSettings { questions: "10" | "20" | "30"; }
export interface PacificWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PacificWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What 1941 attack drew the U.S. into WWII Pacific?", choices: ["Pearl Harbor","Wake Island","Midway","Singapore"], correct: 0 },
  { question: "What date was the Pearl Harbor attack?", choices: ["Dec 5 1941","Dec 7 1941","Dec 8 1941","Dec 11 1941"], correct: 1 },
  { question: "What 1942 battle is considered Pacific War's turning point?", choices: ["Coral Sea","Midway","Guadalcanal","Iwo Jima"], correct: 1 },
  { question: "Who commanded U.S. forces in the Southwest Pacific?", choices: ["Nimitz","MacArthur","Halsey","Spruance"], correct: 1 },
  { question: "Who commanded U.S. Pacific Fleet?", choices: ["Nimitz","King","MacArthur","Halsey"], correct: 0 },
  { question: "What 1944 battle was the largest naval battle in history?", choices: ["Coral Sea","Midway","Leyte Gulf","Philippine Sea"], correct: 2 },
  { question: "What island was first atomic bomb dropped on?", choices: ["Hiroshima","Nagasaki","Tokyo","Yokohama"], correct: 0 },
  { question: "What date was Hiroshima bombed?", choices: ["Aug 6 1945","Aug 9 1945","Aug 14 1945","Aug 2 1945"], correct: 0 },
  { question: "What was the second atomic bomb city?", choices: ["Hiroshima","Nagasaki","Kyoto","Tokyo"], correct: 1 },
  { question: "What name was given to the U.S. island-hopping strategy?", choices: ["Island-Hopping","Leapfrogging","Pacific Crawl","Both first two terms"], correct: 3 },
  { question: "What 1945 battle saw heavy U.S. casualties on a small island?", choices: ["Iwo Jima","Tarawa","Saipan","Peleliu"], correct: 0 },
  { question: "What island was the last major battle before Japan?", choices: ["Iwo Jima","Okinawa","Saipan","Luzon"], correct: 1 },
  { question: "What plane dropped the first atomic bomb?", choices: ["B-17","B-24","B-29","B-25"], correct: 2 },
  { question: "What was the B-29 that dropped Hiroshima's bomb called?", choices: ["Enola Gay","Bockscar","Memphis Belle","Big Stink"], correct: 0 },
  { question: "What plane attacked Pearl Harbor most famously?", choices: ["A6M Zero","Aichi D3A","Nakajima B5N","All did"], correct: 3 },
  { question: "What U.S. Navy carrier was sunk at Coral Sea?", choices: ["Lexington","Yorktown","Hornet","Wasp"], correct: 0 },
  { question: "What carrier was sunk at Midway by Japan?", choices: ["Yorktown","Lexington","Hornet","Wasp"], correct: 0 },
  { question: "How many Japanese carriers were lost at Midway?", choices: ["2","3","4","5"], correct: 2 },
  { question: "What 1942 6-month battle in the Solomons?", choices: ["Coral Sea","Guadalcanal","New Guinea","Tarawa"], correct: 1 },
  { question: "What date did Japan formally surrender?", choices: ["Aug 15 1945","Sep 2 1945","Aug 14 1945","Aug 6 1945"], correct: 1 },
  { question: "Where was Japan's surrender ceremony held?", choices: ["USS Missouri","USS Iowa","USS Enterprise","USS Yorktown"], correct: 0 },
  { question: "What's the name of Japanese suicide aircraft?", choices: ["Kamikaze","Banzai","Bushido","Tokko"], correct: 0 },
  { question: "What was the iconic photograph from Iwo Jima?", choices: ["Flag raising on Mount Suribachi","Marines on beach","Carrier landing","Kamikaze hit"], correct: 0 },
  { question: "What 1942 raid bombed Tokyo for first time?", choices: ["Doolittle Raid","Tokyo Express","Inferno","B-29 Raid"], correct: 0 },
  { question: "What pilot led the Doolittle Raid?", choices: ["Jimmy Doolittle","Curtis LeMay","Hap Arnold","George Marshall"], correct: 0 },
  { question: "What heroic submarine commander surfaced near Japan?", choices: ["Dick O'Kane","Eugene Fluckey","Sam Dealey","All decorated"], correct: 3 },
  { question: "What island was the 'gateway to Japan' battle of April-June 1945?", choices: ["Iwo Jima","Okinawa","Saipan","Tinian"], correct: 1 },
  { question: "What Japanese battleship was the largest ever built?", choices: ["Yamato","Musashi","Both same class","Nagato"], correct: 2 },
  { question: "What was Japan's southern advance theater?", choices: ["Solomons","Indonesia","Burma","All part of it"], correct: 3 },
  { question: "What 1942 battle prevented Japanese capture of Port Moresby?", choices: ["Coral Sea","Midway","Guadalcanal","Bismarck Sea"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PacificWarQuizSettings): PacificWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PacificWarQuizState, action: PacificWarQuizAction): PacificWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PacificWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
