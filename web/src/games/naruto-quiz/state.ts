import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NarutoQuizSettings { questions: "10" | "20"; }
export interface NarutoQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NarutoQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What village is Naruto from?", choices: ["Konohagakure (Hidden Leaf)", "Sunagakure", "Kirigakure", "Iwagakure"], correct: 0 },
  { question: "What is Naruto's signature jutsu?", choices: ["Chidori", "Rasengan", "Amaterasu", "Kamui"], correct: 1 },
  { question: "Who is Naruto's father?", choices: ["Hiruzen Sarutobi", "Jiraiya", "Minato Namikaze", "Hashirama Senju"], correct: 2 },
  { question: "Who is Naruto's mother?", choices: ["Kushina Uzumaki", "Mikoto Uchiha", "Tsunade", "Mei Terumi"], correct: 0 },
  { question: "Which tailed beast is sealed inside Naruto?", choices: ["One-Tails", "Five-Tails", "Nine-Tails (Kurama)", "Eight-Tails"], correct: 2 },
  { question: "What clan does Sasuke belong to?", choices: ["Hyuga", "Uchiha", "Senju", "Aburame"], correct: 1 },
  { question: "Kakashi's Sharingan was given to him by?", choices: ["Itachi", "Obito", "Madara", "Shisui"], correct: 1 },
  { question: "Sakura's primary medical-ninjutsu teacher was?", choices: ["Tsunade", "Kakashi", "Kurenai", "Anko"], correct: 0 },
  { question: "Who leads Akatsuki publicly as 'Pain'?", choices: ["Nagato (as Pain)", "Itachi", "Kisame", "Tobi"], correct: 0 },
  { question: "Rock Lee's specialty is?", choices: ["Genjutsu", "Ninjutsu", "Taijutsu", "Sealing"], correct: 2 },
  { question: "Hinata belongs to which clan?", choices: ["Uchiha", "Hyuga", "Nara", "Yamanaka"], correct: 1 },
  { question: "Gaara is from which village?", choices: ["Sunagakure (Sand)", "Leaf", "Stone", "Mist"], correct: 0 },
  { question: "The First Hokage's name?", choices: ["Tobirama", "Hashirama Senju", "Hiruzen", "Minato"], correct: 1 },
  { question: "Itachi's signature genjutsu is?", choices: ["Tsukuyomi", "Izanami", "Susanoo", "Amaterasu"], correct: 0 },
  { question: "Shikamaru's clan technique uses?", choices: ["Bugs", "Shadows", "Fire", "Mind transfer"], correct: 1 },
  { question: "Who killed Jiraiya?", choices: ["Itachi", "Madara", "Pain", "Orochimaru"], correct: 2 },
  { question: "Who is Konohamaru's grandfather?", choices: ["Minato", "Hiruzen Sarutobi", "Hashirama", "Tobirama"], correct: 1 },
  { question: "Ino's clan technique works on?", choices: ["Body", "Mind", "Shadow", "Bones"], correct: 1 },
  { question: "Choji's clan signature technique?", choices: ["Multi-Size (Expansion)", "Bug Swarm", "Fang Over Fang", "Shadow Possession"], correct: 0 },
  { question: "Sasuke's older brother is?", choices: ["Madara", "Itachi", "Obito", "Shisui"], correct: 1 },
  { question: "Who taught Naruto the Rasengan?", choices: ["Kakashi", "Jiraiya", "Minato", "Tsunade"], correct: 1 },
  { question: "Neji belongs to which clan?", choices: ["Inuzuka", "Hyuga", "Aburame", "Akimichi"], correct: 1 },
  { question: "Kisame's sword is named?", choices: ["Kubikiribocho", "Samehada", "Kusanagi", "Sword of Totsuka"], correct: 1 },
  { question: "Kiba's ninken (dog) companion is?", choices: ["Pakkun", "Akamaru", "Kuromaru", "Shiba"], correct: 1 },
  { question: "Which village is Killer Bee from?", choices: ["Kumogakure (Cloud)", "Iwagakure", "Kirigakure", "Konoha"], correct: 0 },
  { question: "The Fourth Hokage was?", choices: ["Minato Namikaze", "Tobirama", "Tsunade", "Hiruzen"], correct: 0 },
  { question: "Naruto's team number was?", choices: ["Team 7", "Team 8", "Team 10", "Team Guy"], correct: 0 },
  { question: "Orochimaru's signature summon?", choices: ["Toads", "Snakes", "Slugs", "Hawks"], correct: 1 },
  { question: "Tsunade's signature summon?", choices: ["Slug (Katsuyu)", "Toad", "Snake", "Monkey"], correct: 0 },
  { question: "Which dojutsu does Pain use?", choices: ["Sharingan", "Byakugan", "Rinnegan", "Mangekyo"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NarutoQuizSettings): NarutoQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NarutoQuizState, action: NarutoQuizAction): NarutoQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NarutoQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
