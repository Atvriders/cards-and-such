import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface Ww2QuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface Ww2QuizState { settings: Ww2QuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type Ww2QuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "When did World War II begin?", answer: "1939", wrong: ["1937","1941","1938"] },
  { question: "What event brought the USA into WWII?", answer: "Attack on Pearl Harbor", wrong: ["Fall of France","D-Day","Battle of Britain"] },
  { question: "What was the Allied D-Day invasion called?", answer: "Operation Overlord", wrong: ["Operation Barbarossa","Operation Market Garden","Operation Torch"] },
  { question: "Which country did Germany invade first to start WWII?", answer: "Poland", wrong: ["France","Austria","Czechoslovakia"] },
  { question: "What was Hitler's invasion of the Soviet Union called?", answer: "Operation Barbarossa", wrong: ["Operation Sea Lion","Operation Overlord","Operation Typhoon"] },
  { question: "In which city did Germany surrender in 1945?", answer: "Berlin", wrong: ["Munich","Hamburg","Dresden"] },
  { question: "What was the systematic genocide of Jews called?", answer: "Holocaust", wrong: ["Pogrom","Kristallnacht","Final Solution only"] },
  { question: "Who was the British Prime Minister during most of WWII?", answer: "Winston Churchill", wrong: ["Neville Chamberlain","Clement Attlee","Anthony Eden"] },
  { question: "What atomic bombs were dropped on Japan?", answer: "Little Boy and Fat Man", wrong: ["Trinity and Gadget","Big Boy and Thin Man","Alpha and Beta"] },
  { question: "Which battle was the turning point on the Eastern Front?", answer: "Battle of Stalingrad", wrong: ["Battle of Kursk","Siege of Leningrad","Battle of Moscow"] },
  { question: "Who were the three main Allied leaders at Yalta?", answer: "Roosevelt, Churchill, Stalin", wrong: ["Truman, Churchill, Stalin","Roosevelt, De Gaulle, Stalin","Eisenhower, Churchill, Stalin"] },
  { question: "What was the Enigma machine used for?", answer: "German military encryption", wrong: ["Radar detection","Bomb guidance","Radio broadcasting"] },
  { question: "Which Japanese cities were hit by atomic bombs?", answer: "Hiroshima and Nagasaki", wrong: ["Tokyo and Osaka","Hiroshima and Kyoto","Nagasaki and Yokohama"] },
  { question: "What was the German submarine campaign called?", answer: "Battle of the Atlantic", wrong: ["Wolf Pack Campaign","U-boat War","Sea Lion Operation"] },
  { question: "Who commanded Allied forces on D-Day?", answer: "Dwight D. Eisenhower", wrong: ["Bernard Montgomery","Omar Bradley","George Patton"] },
  { question: "What was the last major German offensive in the West?", answer: "Battle of the Bulge", wrong: ["Battle of Berlin","Operation Market Garden","Siegfried Line breach"] },
  { question: "Which country suffered the most casualties in WWII?", answer: "Soviet Union", wrong: ["Germany","China","Poland"] },
  { question: "What year did WWII end?", answer: "1945", wrong: ["1944","1946","1943"] },
  { question: "What was the code name for the Manhattan Project?", answer: "Manhattan Project", wrong: ["Tube Alloys","S-1 Project","Trinity Project"] },
  { question: "Which organization was formed after WWII to promote peace?", answer: "United Nations", wrong: ["League of Nations","NATO","Warsaw Pact"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: Ww2QuizSettings): Ww2QuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: Ww2QuizState, action: Ww2QuizAction): Ww2QuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: Ww2QuizState): { score: number } | null { return state.done?{score:state.score}:null; }
