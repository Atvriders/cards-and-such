import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NorseMythQuizSettings { questions: "10" | "20" | "30"; }
export interface NorseMythQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NorseMythQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is the chief Norse god?", choices: ["Odin","Thor","Loki","Freyr"], correct: 0 },
  { question: "Who's Thor's father?", choices: ["Odin","Loki","Freyr","Tyr"], correct: 0 },
  { question: "What's Thor's hammer called?", choices: ["Mjolnir","Stormbreaker","Gungnir","Mistilteinn"], correct: 0 },
  { question: "What's Odin's spear?", choices: ["Gungnir","Mjolnir","Stormbreaker","Vingnir"], correct: 0 },
  { question: "How many ravens does Odin have?", choices: ["2 (Huginn and Muninn)","3","1","4"], correct: 0 },
  { question: "What are Huginn and Muninn?", choices: ["Odin's ravens (Thought and Memory)","Wolves","Both","Just ravens"], correct: 2 },
  { question: "What are Geri and Freki?", choices: ["Odin's wolves","Ravens","Just wolves","Eagle"], correct: 0 },
  { question: "What is Valhalla?", choices: ["Odin's hall for slain warriors","Underworld","Both","Just hall"], correct: 2 },
  { question: "What are Valkyries?", choices: ["Choosers of the slain","Just warriors","Both","Goddesses"], correct: 2 },
  { question: "What's the Norse afterlife for non-heroes?", choices: ["Hel","Niflheim","Both used","Just Hel"], correct: 2 },
  { question: "What's Loki's role?", choices: ["Trickster god","Warrior","Healer","Just god"], correct: 0 },
  { question: "Who are Loki's monstrous children?", choices: ["Fenrir, Jormungandr, Hel","Just one","Both","Three"], correct: 2 },
  { question: "What is Fenrir?", choices: ["Giant wolf, Loki's child","Snake","Both","Just wolf"], correct: 2 },
  { question: "What is Jormungandr?", choices: ["World Serpent","Wolf","Both","Just snake"], correct: 2 },
  { question: "What is Yggdrasil?", choices: ["World Tree","Just tree","Both","Magic tree"], correct: 2 },
  { question: "What's Ragnarok?", choices: ["End of the world","Just battle","Both","Doomsday"], correct: 2 },
  { question: "Who fights Jormungandr in Ragnarok?", choices: ["Thor","Odin","Loki","Freyr"], correct: 0 },
  { question: "Who fights Fenrir in Ragnarok?", choices: ["Odin","Thor","Loki","Tyr"], correct: 0 },
  { question: "What sword does Freyr give up?", choices: ["His magical sword for Gerd","Gungnir","Mjolnir","Mistilteinn"], correct: 0 },
  { question: "Who are the two main Norse god families?", choices: ["Aesir and Vanir","Just Aesir","Both","Just Vanir"], correct: 2 },
  { question: "Who's the goddess of love and beauty?", choices: ["Freyja","Frigg","Both involved","Just Freyja"], correct: 2 },
  { question: "Who's Odin's wife?", choices: ["Frigg","Freyja","Both","Just Frigg"], correct: 0 },
  { question: "What's the Norse rainbow bridge?", choices: ["Bifrost","Yggdrasil","Both","Just bridge"], correct: 2 },
  { question: "Who guards Bifrost?", choices: ["Heimdall","Odin","Thor","Loki"], correct: 0 },
  { question: "What are the Norns?", choices: ["Goddesses of fate","Warriors","Both","Just norns"], correct: 2 },
  { question: "How many Norns are there primarily?", choices: ["3 (Urd, Verdandi, Skuld)","2","4","Many"], correct: 0 },
  { question: "What's the Norse word for giants?", choices: ["Jotnar","Trolls","Both","Just giants"], correct: 2 },
  { question: "What is Asgard?", choices: ["Realm of gods","Mortal world","Underworld","Giant realm"], correct: 0 },
  { question: "What is Midgard?", choices: ["Mortal world","Asgard","Both","Just Earth"], correct: 2 },
  { question: "What's the eight-legged horse?", choices: ["Sleipnir (Odin's)","Just any horse","Both","Just Sleipnir"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NorseMythQuizSettings): NorseMythQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NorseMythQuizState, action: NorseMythQuizAction): NorseMythQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NorseMythQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
