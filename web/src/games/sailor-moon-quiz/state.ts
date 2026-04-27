import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SailorMoonQuizSettings { questions: "10" | "20"; }
export interface SailorMoonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SailorMoonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Sailor Moon's civilian name?", choices: ["Rei Hino", "Usagi Tsukino", "Ami Mizuno", "Makoto Kino"], correct: 1 },
  { question: "Sailor Mercury is?", choices: ["Rei", "Ami", "Makoto", "Minako"], correct: 1 },
  { question: "Sailor Mars's element?", choices: ["Water", "Earth", "Fire", "Wind"], correct: 2 },
  { question: "Sailor Jupiter's element?", choices: ["Lightning and wood", "Fire", "Water", "Ice"], correct: 0 },
  { question: "Sailor Venus's civilian name?", choices: ["Minako Aino", "Ami Mizuno", "Rei Hino", "Makoto Kino"], correct: 0 },
  { question: "Tuxedo Mask's true identity?", choices: ["Mamoru Chiba", "Motoki Furuhata", "Naru's brother", "Helios"], correct: 0 },
  { question: "Luna is a?", choices: ["Black cat", "Owl", "White cat", "Dog"], correct: 0 },
  { question: "Artemis is whose guardian?", choices: ["Mercury", "Mars", "Venus", "Jupiter"], correct: 2 },
  { question: "Sailor Saturn's power involves?", choices: ["Healing", "Death and rebirth", "Time", "Space"], correct: 1 },
  { question: "Sailor Pluto guards?", choices: ["Time Door", "Moon", "Space", "Sun"], correct: 0 },
  { question: "Chibi-Usa is from?", choices: ["Past", "Future", "Mirror world", "Dark Kingdom"], correct: 1 },
  { question: "Crystal Tokyo's queen?", choices: ["Beryl", "Serenity", "Galaxia", "Nehelenia"], correct: 1 },
  { question: "First arc villain queen?", choices: ["Beryl", "Galaxia", "Nehelenia", "Wiseman"], correct: 0 },
  { question: "Sailor Uranus's civilian name?", choices: ["Haruka Tenoh", "Michiru Kaioh", "Setsuna Meioh", "Hotaru Tomoe"], correct: 0 },
  { question: "Sailor Neptune is?", choices: ["Haruka", "Michiru", "Setsuna", "Hotaru"], correct: 1 },
  { question: "Sailor Saturn's name?", choices: ["Hotaru Tomoe", "Setsuna Meioh", "Haruka Tenoh", "Michiru Kaioh"], correct: 0 },
  { question: "Mercury's catchphrase weapon is?", choices: ["Fire arrow", "Mercury bubbles", "Venus chain", "Jupiter thunder"], correct: 1 },
  { question: "Moonlight Knight only appears in?", choices: ["R", "S", "SuperS", "Stars"], correct: 0 },
  { question: "Helios's true form?", choices: ["Pegasus", "Phoenix", "Wolf", "Dragon"], correct: 0 },
  { question: "Galaxia is in which arc?", choices: ["R", "S", "SuperS", "Stars"], correct: 3 },
  { question: "Sailor Moon's brooch contains?", choices: ["Silver Crystal", "Garnet Orb", "Talisman", "Holy Grail"], correct: 0 },
  { question: "Three Talismans were held by Uranus, Neptune, and?", choices: ["Saturn", "Pluto", "Mercury", "Mars"], correct: 1 },
  { question: "Witches 5 serve which villains?", choices: ["Death Busters", "Dark Kingdom", "Black Moon Clan", "Dead Moon Circus"], correct: 0 },
  { question: "Black Moon Clan's leader?", choices: ["Galaxia", "Wiseman or Death Phantom", "Beryl", "Nehelenia"], correct: 1 },
  { question: "Sailor Stars introduces the?", choices: ["Starlights", "Witches 5", "Black Moon", "Dead Moon Circus"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SailorMoonQuizSettings): SailorMoonQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SailorMoonQuizState, action: SailorMoonQuizAction): SailorMoonQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SailorMoonQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
