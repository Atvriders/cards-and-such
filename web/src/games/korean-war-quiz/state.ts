import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KoreanWarQuizSettings { questions: "10" | "20" | "30"; }
export interface KoreanWarQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KoreanWarQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In what year did the Korean War begin?", choices: ["1948","1950","1952","1953"], correct: 1 },
  { question: "On what parallel was Korea divided?", choices: ["17th","38th","45th","60th"], correct: 1 },
  { question: "Who led North Korea during the war?", choices: ["Kim Il-sung","Kim Jong-il","Kim Jong-un","Park Chung-hee"], correct: 0 },
  { question: "Who led South Korea?", choices: ["Park Chung-hee","Syngman Rhee","Chun Doo-hwan","Kim Dae-jung"], correct: 1 },
  { question: "What U.S. general led UN forces initially?", choices: ["Eisenhower","MacArthur","Ridgway","Walker"], correct: 1 },
  { question: "What 1950 amphibious operation reversed the war?", choices: ["Inchon","Pusan","Wonsan","Hungnam"], correct: 0 },
  { question: "What country sent massive troops to aid North Korea?", choices: ["USSR","China","Vietnam","Japan"], correct: 1 },
  { question: "What 1953 ceasefire location?", choices: ["Seoul","Panmunjom","Pyongyang","Pusan"], correct: 1 },
  { question: "What is the buffer zone between North and South Korea called?", choices: ["DMZ","Berlin Wall","Iron Curtain","Bamboo Curtain"], correct: 0 },
  { question: "What U.S. president was in office at the war's start?", choices: ["Roosevelt","Truman","Eisenhower","Kennedy"], correct: 1 },
  { question: "What U.S. president negotiated the truce?", choices: ["Truman","Eisenhower","Kennedy","Johnson"], correct: 1 },
  { question: "Who replaced MacArthur as UN commander in 1951?", choices: ["Walker","Ridgway","Van Fleet","Clark"], correct: 1 },
  { question: "What body authorized UN intervention?", choices: ["League of Nations","UN Security Council","UN General Assembly","NATO"], correct: 1 },
  { question: "What's the technical legal status of the Korean War?", choices: ["Ended","Armistice (no peace treaty)","Cold","Frozen"], correct: 1 },
  { question: "What major UN port-defense effort in 1950?", choices: ["Pusan Perimeter","Inchon","Wonsan","Yalu River"], correct: 0 },
  { question: "What river forms much of Korea's border with China?", choices: ["Yalu","Han","Imjin","Tumen"], correct: 0 },
  { question: "What jet aircraft did the U.S. famously fly?", choices: ["F-86 Sabre","P-51","F-4 Phantom","F-104"], correct: 0 },
  { question: "What enemy jet did F-86s often duel?", choices: ["MiG-15","MiG-17","Yak-9","La-11"], correct: 0 },
  { question: "What was the largest reservoir battle in late 1950?", choices: ["Chosin","Yalu","Wonsan","Hagaru"], correct: 0 },
  { question: "What capital did UN forces take and lose multiple times?", choices: ["Seoul","Pyongyang","Inchon","Pusan"], correct: 0 },
  { question: "What war is known as The Forgotten War in the U.S.?", choices: ["WWI","Korean War","Vietnam","Spanish-American"], correct: 1 },
  { question: "Approximately how many Americans died in the Korean War?", choices: ["10,000","36,000","58,000","100,000"], correct: 1 },
  { question: "What North Korean tank dominated early war?", choices: ["T-34","T-54","KV-1","IS-2"], correct: 0 },
  { question: "What was the major bombing tactic used against North Korean infrastructure?", choices: ["Strategic bombing","Carpet bombing","Tactical bombing","All used"], correct: 3 },
  { question: "What's the name of the truce village?", choices: ["Panmunjom","Kaesong","Wonsan","Inchon"], correct: 0 },
  { question: "What other country contributed major UN ground forces?", choices: ["UK","Turkey","Australia","All did"], correct: 3 },
  { question: "What U.S. army division was famous in Pusan defense?", choices: ["1st Cavalry","24th Infantry","2nd Infantry","All deployed"], correct: 3 },
  { question: "What naval battle in 1950 included a Korean naval action at Chumonchin Chan?", choices: ["Battle of Chumonchin Chan","Battle of the Korea Strait","Battle of the Yalu","Wonsan Landings"], correct: 0 },
  { question: "What 1953 prisoner exchange operation followed the truce?", choices: ["Operation Big Switch","Operation Little Switch","Both","Operation Glory"], correct: 2 },
  { question: "What Chinese general led PLA in Korea?", choices: ["Lin Biao","Peng Dehuai","Zhu De","Chen Yi"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KoreanWarQuizSettings): KoreanWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KoreanWarQuizState, action: KoreanWarQuizAction): KoreanWarQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KoreanWarQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
