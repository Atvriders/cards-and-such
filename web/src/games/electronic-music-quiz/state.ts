import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ElectronicMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface ElectronicMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ElectronicMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Kraftwerk is from which country?", choices: ["Belgium", "Germany", "Netherlands", "Switzerland"], correct: 1 },
  { question: "House music originated in?", choices: ["Detroit", "Chicago", "New York", "Berlin"], correct: 1 },
  { question: "Techno originated in?", choices: ["Detroit", "Chicago", "New York", "Manchester"], correct: 0 },
  { question: "Daft Punk are from?", choices: ["Italy", "Germany", "France", "Belgium"], correct: 2 },
  { question: "Aphex Twin's real name is?", choices: ["Tom Jenkinson", "Richard D. James", "Mike Paradinas", "Sean Booth"], correct: 1 },
  { question: "Brian Eno coined the term?", choices: ["Synthwave", "Ambient", "Techno", "Trance"], correct: 1 },
  { question: "Moby's bestselling album was?", choices: ["Animal Rights", "18", "Play", "Hotel"], correct: 2 },
  { question: "Deadmau5 is from?", choices: ["UK", "USA", "Canada", "Australia"], correct: 2 },
  { question: "Skrillex's real first name is?", choices: ["Sonny", "Tom", "Adam", "Nathan"], correct: 0 },
  { question: "Trance music's classic '90s tempo is around?", choices: ["100 BPM", "120 BPM", "135 BPM", "180 BPM"], correct: 2 },
  { question: "Drum and bass typically runs at?", choices: ["120 BPM", "140 BPM", "175 BPM", "210 BPM"], correct: 2 },
  { question: "The Roland TB-303 is famous for shaping?", choices: ["House", "Acid", "Hardstyle", "UKG"], correct: 1 },
  { question: "The Roland TR-808 is a?", choices: ["Synthesizer", "Drum machine", "Sampler", "Mixer"], correct: 1 },
  { question: "Warp Records is based in?", choices: ["Berlin", "Sheffield (UK)", "Detroit", "Tokyo"], correct: 1 },
  { question: "Detroit techno's 'Belleville Three' did NOT include?", choices: ["Juan Atkins", "Derrick May", "Kevin Saunderson", "Carl Craig"], correct: 3 },
  { question: "Boards of Canada are from?", choices: ["Canada", "USA", "Scotland", "Iceland"], correct: 2 },
  { question: "Chemical Brothers' first album was?", choices: ["Surrender", "Dig Your Own Hole", "Exit Planet Dust", "Push the Button"], correct: 2 },
  { question: "The Prodigy's lead vocalist was?", choices: ["Liam Howlett", "Maxim", "Keith Flint", "Leeroy Thornhill"], correct: 2 },
  { question: "Berlin's most famous techno club is?", choices: ["Tresor", "Berghain", "Watergate", "Sisyphos"], correct: 1 },
  { question: "Disclosure broke through with which album?", choices: ["Caracal", "Settle", "Energy", "Alchemy"], correct: 1 },
  { question: "Calvin Harris is from?", choices: ["Wales", "Ireland", "Scotland", "England"], correct: 2 },
  { question: "Burial's debut album was on which label?", choices: ["Warp", "Hyperdub", "Ninja Tune", "Border Community"], correct: 1 },
  { question: "Avicii's real first name was?", choices: ["Tim", "Tom", "Tommy", "Tobias"], correct: 0 },
  { question: "Goa trance arose from a scene in which country?", choices: ["UK", "India", "Israel", "USA"], correct: 1 },
  { question: "Underworld is best known for the song?", choices: ["Born Slippy", "Rez", "King of Snake", "Dark & Long"], correct: 0 },
  { question: "Massive Attack hails from?", choices: ["London", "Manchester", "Bristol", "Glasgow"], correct: 2 },
  { question: "Portishead's debut was?", choices: ["Dummy", "Portishead", "Third", "Roseland NYC Live"], correct: 0 },
  { question: "Squarepusher is associated with which genre cluster?", choices: ["Trance/EDM", "IDM/drill 'n' bass", "House", "Dubstep"], correct: 1 },
  { question: "Justice's debut album was?", choices: ["Cross", "Audio, Video, Disco", "Woman", "Hyperdrama"], correct: 0 },
  { question: "Caribou (Dan Snaith) holds a PhD in?", choices: ["Physics", "Mathematics", "Computer Science", "Electrical Engineering"], correct: 1 },
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
