import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LakeQuizSettings { questions: "10" | "20"; }
export interface LakeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LakeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the largest lake by area (also a sea by name)?", choices: ["Caspian Sea","Lake Superior","Lake Victoria","Aral Sea"], correct: 0 },
  { question: "What is the largest freshwater lake by surface area?", choices: ["Lake Victoria","Lake Superior","Lake Michigan","Lake Huron"], correct: 1 },
  { question: "What is the deepest lake in the world?", choices: ["Caspian","Tanganyika","Baikal","Malawi"], correct: 2 },
  { question: "What is the largest lake in Africa?", choices: ["Tanganyika","Victoria","Malawi","Turkana"], correct: 1 },
  { question: "On which continent is Lake Titicaca?", choices: ["Africa","Asia","South America","North America"], correct: 2 },
  { question: "What two countries share Lake Titicaca?", choices: ["Peru and Ecuador","Peru and Bolivia","Bolivia and Chile","Chile and Argentina"], correct: 1 },
  { question: "What is the largest of the U.S. Great Lakes?", choices: ["Erie","Michigan","Superior","Huron"], correct: 2 },
  { question: "How many Great Lakes are there?", choices: ["3","4","5","6"], correct: 2 },
  { question: "Which Great Lake is entirely within the U.S.?", choices: ["Superior","Michigan","Erie","Ontario"], correct: 1 },
  { question: "What is the largest lake entirely within Canada?", choices: ["Great Bear Lake","Great Slave Lake","Lake Winnipeg","Lake Athabasca"], correct: 0 },
  { question: "What lake in Israel/Jordan is the lowest on Earth's surface?", choices: ["Sea of Galilee","Dead Sea","Lake Tiberias","Sea of Aral"], correct: 1 },
  { question: "How salty is the Dead Sea (approximate)?", choices: ["3 percent","10 percent","20 percent","34 percent"], correct: 3 },
  { question: "What is the largest lake in Western Europe?", choices: ["Lake Geneva","Lake Constance","Lake Garda","Lough Neagh"], correct: 0 },
  { question: "In which mountain range is Lake Titicaca?", choices: ["Rockies","Andes","Sierra Madre","Himalaya"], correct: 1 },
  { question: "What is the largest lake in Italy?", choices: ["Como","Maggiore","Garda","Iseo"], correct: 2 },
  { question: "What lake in Scotland is famous for a mythical creature?", choices: ["Loch Lomond","Loch Ness","Loch Awe","Loch Tay"], correct: 1 },
  { question: "What lake formerly straddled Kazakhstan and Uzbekistan but mostly disappeared?", choices: ["Caspian","Aral","Balkhash","Issyk-Kul"], correct: 1 },
  { question: "On which continent is Lake Eyre, often dry?", choices: ["Australia","Africa","Asia","South America"], correct: 0 },
  { question: "What lake on the Uganda-Kenya-Tanzania border is the source of the White Nile?", choices: ["Tanganyika","Victoria","Albert","Edward"], correct: 1 },
  { question: "What is the deepest lake in North America?", choices: ["Crater Lake","Great Slave","Tahoe","Superior"], correct: 1 },
  { question: "What U.S. crater lake formed in a volcanic caldera in Oregon?", choices: ["Crater Lake","Mono Lake","Lake Tahoe","Lake Mead"], correct: 0 },
  { question: "What is the largest lake in Russia?", choices: ["Onega","Ladoga","Baikal","Beloye"], correct: 2 },
  { question: "What lake is partly in Switzerland and partly in France?", choices: ["Constance","Geneva","Maggiore","Como"], correct: 1 },
  { question: "Lake Tahoe is on the border of which two states?", choices: ["California and Nevada","Oregon and Idaho","Utah and Nevada","California and Oregon"], correct: 0 },
  { question: "What's the largest lake in Central America?", choices: ["Lake Atitlan","Lake Nicaragua","Lake Managua","Lake Yojoa"], correct: 1 },
  { question: "What's the highest navigable lake in the world?", choices: ["Tahoe","Titicaca","Nahuel Huapi","Maracaibo"], correct: 1 },
  { question: "What lake in central Africa straddles the border of DRC and Rwanda?", choices: ["Tanganyika","Kivu","Edward","Albert"], correct: 1 },
  { question: "How old is Lake Baikal estimated to be?", choices: ["About 5 million years","About 25 million years","About 100 million years","About 500,000 years"], correct: 1 },
  { question: "What is the saltiest lake in the world (saltier than the Dead Sea)?", choices: ["Don Juan Pond","Mono Lake","Lake Asal","Lake Tahoe"], correct: 0 },
  { question: "What is the largest lake in Sweden?", choices: ["Vanern","Vattern","Malaren","Hjalmaren"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: LakeQuizSettings): LakeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LakeQuizState, action: LakeQuizAction): LakeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LakeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
