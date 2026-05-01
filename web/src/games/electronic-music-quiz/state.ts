import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ElectronicMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface ElectronicMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ElectronicMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's a synthesizer?", choices: ["Electronic instrument generating audio","Drum machine","Sampler","Mixer"], correct: 0 },
  { question: "Who pioneered the Moog synthesizer?", choices: ["Robert Moog","Don Buchla","Both pioneered analog synth","Wendy Carlos"], correct: 0 },
  { question: "What 1970s German group pioneered electronic music?", choices: ["Kraftwerk","Tangerine Dream","Both","Cluster"], correct: 2 },
  { question: "What city is German techno's heart?", choices: ["Berlin","Detroit","Both have scenes","Hamburg"], correct: 0 },
  { question: "What U.S. city birthed techno?", choices: ["Detroit","Chicago","Berlin","NYC"], correct: 0 },
  { question: "What U.S. city birthed house music?", choices: ["Chicago","Detroit","NYC","LA"], correct: 0 },
  { question: "What does DJ stand for?", choices: ["Disc Jockey","Digital Jockey","Drum Jockey","Direct Jockey"], correct: 0 },
  { question: "What is BPM?", choices: ["Beats Per Minute","Bass Per Module","Both","Bass Pulse Modulation"], correct: 0 },
  { question: "Typical house music BPM range?", choices: ["~120-130","60-80","160-180","200+"], correct: 0 },
  { question: "Typical drum and bass BPM?", choices: ["~165-180","100-120","60-80","220+"], correct: 0 },
  { question: "Who's Daft Punk's two members?", choices: ["Thomas Bangalter and Guy-Manuel de Homem-Christo","Just Bangalter","Just Homem-Christo","Different lineup"], correct: 0 },
  { question: "What's Daft Punk's nationality?", choices: ["French","American","British","German"], correct: 0 },
  { question: "What's Aphex Twin's real name?", choices: ["Richard D. James","James Newton","David Newman","Tom Jenkinson"], correct: 0 },
  { question: "What 90s subgenre was Aphex Twin associated with?", choices: ["IDM","Trance","House","Dubstep"], correct: 0 },
  { question: "What does EDM stand for?", choices: ["Electronic Dance Music","Electronic Disc Music","Electric Dance Mix","Energetic Dance Music"], correct: 0 },
  { question: "Who created drum machine TR-808?", choices: ["Roland","Yamaha","Korg","Akai"], correct: 0 },
  { question: "What synth bass is iconic in acid house?", choices: ["Roland TB-303","Moog Minimoog","Yamaha DX7","Korg MS-20"], correct: 0 },
  { question: "Who is Skrillex?", choices: ["Sonny Moore","Tom DeLonge","Joel Zimmerman","Sean Paul"], correct: 0 },
  { question: "What's Deadmau5's real name?", choices: ["Joel Zimmerman","Tom Smith","Tim Bergling","Sasha"], correct: 0 },
  { question: "What's Avicii's real name?", choices: ["Tim Bergling","Joel Zimmerman","Anton Zaslavski","Andre Tanneberger"], correct: 0 },
  { question: "Who recorded Levels?", choices: ["Avicii","Calvin Harris","Tiesto","Skrillex"], correct: 0 },
  { question: "What's the Dutch DJ Tiesto known for?", choices: ["Trance/EDM","Dubstep","Drum and Bass","Dub"], correct: 0 },
  { question: "What's a drop in EDM?", choices: ["Big bass section after build-up","Beginning of song","End of song","Vocal section"], correct: 0 },
  { question: "What 1988 UK era was Second Summer of Love?", choices: ["Acid house wave","Brit pop","Punk revival","Synthpop"], correct: 0 },
  { question: "What annual festival is in the Black Rock Desert?", choices: ["Burning Man","Coachella","Tomorrowland","EDC"], correct: 0 },
  { question: "Where is Tomorrowland held?", choices: ["Belgium","Netherlands","Germany","UK"], correct: 0 },
  { question: "What's a sub-bass?", choices: ["Very low frequency bass","Treble","Mid range","Drums"], correct: 0 },
  { question: "What's vocal house?", choices: ["House music featuring vocals","Acapella","Just instrumental","Hip-house"], correct: 0 },
  { question: "Who pioneered minimal techno?", choices: ["Robert Hood","Richie Hawtin","Both","Carl Craig"], correct: 2 },
  { question: "What synth made Bowie's Low album distinctive?", choices: ["EMS Synthi A","ARP Odyssey","Both used","Yamaha"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ElectronicMusicQuizSettings): ElectronicMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ElectronicMusicQuizState, action: ElectronicMusicQuizAction): ElectronicMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ElectronicMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
