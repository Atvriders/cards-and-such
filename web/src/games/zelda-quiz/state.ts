import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ZeldaSettings { questions: "10" | "20" | "30"; }
export interface ZeldaState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ZeldaAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the name of the green-clad hero in The Legend of Zelda?", choices: ["Link","Zelda","Sheik","Hero of Time"], correct: 0 },
  { question: "Who is the recurring princess of Hyrule the series is named after?", choices: ["Princess Zelda","Princess Peach","Princess Ruto","Princess Hilda"], correct: 0 },
  { question: "Which Gerudo king is the primary antagonist across many Zelda games?", choices: ["Ganondorf","Vaati","Yuga","Demise"], correct: 0 },
  { question: "What is the name of the kingdom most Zelda games take place in?", choices: ["Hyrule","Termina","Lorule","Holodrum"], correct: 0 },
  { question: "How many golden triangles make up the Triforce?", choices: ["Three","Two","Four","One"], correct: 0 },
  { question: "Which three virtues do the Triforce pieces represent?", choices: ["Power, Wisdom, Courage","Strength, Magic, Love","Sun, Moon, Stars","Fire, Water, Wind"], correct: 0 },
  { question: "In what year did the original Legend of Zelda release in Japan on the Famicom Disk System?", choices: ["1986","1985","1988","1990"], correct: 0 },
  { question: "On which Nintendo console did Ocarina of Time launch in 1998?", choices: ["Nintendo 64","SNES","GameCube","Game Boy Advance"], correct: 0 },
  { question: "On which console did The Wind Waker debut in 2002-2003?", choices: ["Nintendo GameCube","Nintendo 64","Wii","Wii U"], correct: 0 },
  { question: "What legendary blade can repel evil and is wielded by the chosen hero?", choices: ["Master Sword","Biggoron Sword","Four Sword","Goddess Sword"], correct: 0 },
  { question: "What fairy companion accompanies Link throughout Ocarina of Time?", choices: ["Navi","Tatl","Ciela","Proxi"], correct: 0 },
  { question: "In Twilight Princess, what animal form does Link transform into?", choices: ["A wolf","A bear","A hawk","A deer"], correct: 0 },
  { question: "What console did Breath of the Wild launch on alongside the Wii U in 2017?", choices: ["Nintendo Switch","Wii","3DS","GameCube"], correct: 0 },
  { question: "What is the name of Link's loyal horse, first seen in Ocarina of Time?", choices: ["Epona","Bessie","Argo","Lon"], correct: 0 },
  { question: "Who is Princess Zelda's mysterious Sheikah alter ego in Ocarina of Time?", choices: ["Sheik","Impa","Tetra","Hilda"], correct: 0 },
  { question: "Which 2000 sequel takes place in the doomed land of Termina?", choices: ["Majora's Mask","Oracle of Ages","Oracle of Seasons","Four Swords"], correct: 0 },
  { question: "What is the name of the pirate captain who is secretly Zelda in The Wind Waker?", choices: ["Tetra","Aryll","Komali","Medli"], correct: 0 },
  { question: "Skull Kid wears what cursed item in Majora's Mask?", choices: ["Majora's Mask","Mask of Truth","Bunny Hood","Stone Mask"], correct: 0 },
  { question: "In Spirit Tracks, what vehicle does Link primarily pilot?", choices: ["A train","A boat","A horse","An airship"], correct: 0 },
  { question: "In Phantom Hourglass, what vehicle does Link primarily pilot?", choices: ["A steamboat","A train","A horse","An airship"], correct: 0 },
  { question: "On what dreamlike island is Link's Awakening set?", choices: ["Koholint Island","Outset Island","Windfall Island","Dragon Roost Island"], correct: 0 },
  { question: "Which 2013 3DS game serves as a sequel to A Link to the Past?", choices: ["A Link Between Worlds","Phantom Hourglass","Spirit Tracks","Tri Force Heroes"], correct: 0 },
  { question: "What gold three-triangle emblem of the Hyrulean royal family appears throughout the series?", choices: ["Triforce","Hylian Crest","Sheikah Eye","Gerudo symbol"], correct: 0 },
  { question: "What is the traditional color of Link's tunic in most games?", choices: ["Green","Blue","Red","White"], correct: 0 },
  { question: "Which 2011 Wii game tells the origin of the Master Sword?", choices: ["Skyward Sword","Twilight Princess","A Link to the Past","Breath of the Wild"], correct: 0 },
  { question: "What rocky mountain-dwelling race is led by elders like Darunia?", choices: ["Gorons","Zoras","Rito","Gerudo"], correct: 0 },
  { question: "What aquatic race is ruled by King Dorephan in Breath of the Wild?", choices: ["Zora","Goron","Rito","Sheikah"], correct: 0 },
  { question: "Which 2023 Nintendo Switch sequel is set largely in the skies above Hyrule?", choices: ["Tears of the Kingdom","Breath of the Wild","Echoes of Wisdom","Skyward Sword HD"], correct: 0 },
  { question: "Who composed the iconic Zelda main theme music?", choices: ["Koji Kondo","Nobuo Uematsu","Yasunori Mitsuda","Yoko Shimomura"], correct: 0 },
  { question: "Who created and directed the original Legend of Zelda?", choices: ["Shigeru Miyamoto","Eiji Aonuma","Hidemaro Fujibayashi","Yoshiaki Koizumi"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ZeldaSettings): ZeldaState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ZeldaState, action: ZeldaAction): ZeldaState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ZeldaState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
