import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FinalFantasySettings { questions: "10" | "20" | "30"; }
export interface FinalFantasyState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FinalFantasyAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which company has developed the Final Fantasy series since 1987?", choices: ["Square (now Square Enix)","Capcom","Konami","Enix alone"], correct: 0 },
  { question: "Who created Final Fantasy and directed the early entries?", choices: ["Hironobu Sakaguchi","Yoshinori Kitase","Tetsuya Nomura","Hajime Tabata"], correct: 0 },
  { question: "In what year did the original Final Fantasy launch on the Famicom?", choices: ["1987","1985","1990","1992"], correct: 0 },
  { question: "Who is the spiky-haired protagonist of Final Fantasy VII?", choices: ["Cloud Strife","Tidus","Squall Leonhart","Lightning"], correct: 0 },
  { question: "Who is the silver-haired antagonist of Final Fantasy VII?", choices: ["Sephiroth","Kefka Palazzo","Kuja","Seymour Guado"], correct: 0 },
  { question: "Who is the half-Esper protagonist of Final Fantasy VI?", choices: ["Terra Branford","Celes Chere","Locke Cole","Edgar Roni Figaro"], correct: 0 },
  { question: "Who is the protagonist of Final Fantasy X?", choices: ["Tidus","Yuna","Wakka","Auron"], correct: 0 },
  { question: "In what world is Final Fantasy X set?", choices: ["Spira","Gaia","Ivalice","Eorzea"], correct: 0 },
  { question: "Which realm is the setting of Final Fantasy XIV?", choices: ["Eorzea","Spira","Ivalice","Cocoon"], correct: 0 },
  { question: "What genre is Final Fantasy XIV?", choices: ["MMORPG","Single-player JRPG","Fighting game","Tactical RPG"], correct: 0 },
  { question: "Who is the gunblade-wielding hero of Final Fantasy VIII?", choices: ["Squall Leonhart","Cloud","Zidane Tribal","Tidus"], correct: 0 },
  { question: "Who is the tailed thief protagonist of Final Fantasy IX?", choices: ["Zidane Tribal","Vivi","Steiner","Garnet"], correct: 0 },
  { question: "Who is the female knight protagonist of Final Fantasy XIII?", choices: ["Lightning","Yuna","Terra","Aerith"], correct: 0 },
  { question: "In which game is Aerith Gainsborough killed by Sephiroth?", choices: ["Final Fantasy VII","Final Fantasy VIII","Final Fantasy IX","Final Fantasy X"], correct: 0 },
  { question: "Who is the recurring summoned dragon king of the series?", choices: ["Bahamut","Ifrit","Shiva","Leviathan"], correct: 0 },
  { question: "Which recurring summon is associated with fire?", choices: ["Ifrit","Shiva","Ramuh","Odin"], correct: 0 },
  { question: "Which recurring summon is associated with ice?", choices: ["Shiva","Ifrit","Titan","Leviathan"], correct: 0 },
  { question: "Which composer scored most of the mainline Final Fantasy games?", choices: ["Nobuo Uematsu","Koji Kondo","Yasunori Mitsuda","Yoko Shimomura"], correct: 0 },
  { question: "What yellow flightless birds are commonly used as mounts?", choices: ["Chocobos","Moogles","Tonberries","Cactuars"], correct: 0 },
  { question: "What small white-winged creatures often run shops and say \"Kupo\"?", choices: ["Moogles","Chocobos","Tonberries","Cactuars"], correct: 0 },
  { question: "Which Final Fantasy was first localized for the NES in North America in 1990?", choices: ["Final Fantasy (I)","Final Fantasy IV","Final Fantasy VI","Final Fantasy VII"], correct: 0 },
  { question: "Final Fantasy IV was released in North America in 1991 under what title?", choices: ["Final Fantasy II","Final Fantasy IV","Final Fantasy The After Years","Final Fantasy Mystic Quest"], correct: 0 },
  { question: "Final Fantasy VI was released on the SNES in North America under what title?", choices: ["Final Fantasy III","Final Fantasy VI","Final Fantasy V","Final Fantasy IV"], correct: 0 },
  { question: "Which 1997 PlayStation entry sold tens of millions and made the series mainstream worldwide?", choices: ["Final Fantasy VII","Final Fantasy VI","Final Fantasy VIII","Final Fantasy IX"], correct: 0 },
  { question: "Final Fantasy XV stars which prince and his three companions?", choices: ["Noctis Lucis Caelum","Cloud Strife","Squall Leonhart","Vaan"], correct: 0 },
  { question: "Which 2023 PS5 action RPG entry stars Clive Rosfield?", choices: ["Final Fantasy XVI","Final Fantasy XV","Final Fantasy VII Rebirth","Stranger of Paradise"], correct: 0 },
  { question: "What 2020 remake reimagines the Midgar segment of FFVII?", choices: ["Final Fantasy VII Remake","Final Fantasy VII Rebirth","Crisis Core","Dirge of Cerberus"], correct: 0 },
  { question: "What item revives a knocked-out party member in Final Fantasy?", choices: ["Phoenix Down","Potion","Ether","Remedy"], correct: 0 },
  { question: "Which 1994 SNES entry features the time-traveling Bartz Klauser? (Note: lead is Bartz)", choices: ["Final Fantasy V","Final Fantasy IV","Final Fantasy VI","Final Fantasy III"], correct: 0 },
  { question: "Which Final Fantasy is famous for the opera scene with Celes singing 'Aria di Mezzo Carattere'?", choices: ["Final Fantasy VI","Final Fantasy VII","Final Fantasy VIII","Final Fantasy IX"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FinalFantasySettings): FinalFantasyState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FinalFantasyState, action: FinalFantasyAction): FinalFantasyState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FinalFantasyState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
