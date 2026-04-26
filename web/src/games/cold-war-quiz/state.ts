import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface ColdWarQuizSettings { questionCount: "5" | "10" | "15"; }
export interface QuizEntry { question: string; answer: string; choices: string[]; }
export interface ColdWarQuizState { settings: ColdWarQuizSettings; entries: QuizEntry[]; current: number; selected: number | null; score: number; done: boolean; }
export type ColdWarQuizAction = { type: "select"; index: number } | { type: "next" };
const BANK = [
  { question: "What were the two superpowers in the Cold War?", answer: "USA and Soviet Union", wrong: ["USA and China","USA and UK","Soviet Union and China"] },
  { question: "What was the policy of preventing communism's spread called?", answer: "Containment", wrong: ["Détente","Truman Doctrine only","Marshall Plan only"] },
  { question: "What was the Berlin Wall built in?", answer: "1961", wrong: ["1949","1955","1963"] },
  { question: "What crisis in 1962 brought the world to nuclear war?", answer: "Cuban Missile Crisis", wrong: ["Berlin Blockade","Korean War","Vietnam War"] },
  { question: "What was the first artificial satellite launched?", answer: "Sputnik", wrong: ["Explorer 1","Vanguard","Telstar"] },
  { question: "What US economic aid plan rebuilt Europe after WWII?", answer: "Marshall Plan", wrong: ["Truman Doctrine","Lend-Lease","NATO aid"] },
  { question: "Which alliance was NATO's Cold War opponent?", answer: "Warsaw Pact", wrong: ["SEATO","CENTO","Non-Aligned Movement"] },
  { question: "Who was the first human in space?", answer: "Yuri Gagarin", wrong: ["Alan Shepard","John Glenn","Buzz Aldrin"] },
  { question: "What wall symbolized the Iron Curtain?", answer: "Berlin Wall", wrong: ["Siegfried Line","Maginot Line","Eastern Wall"] },
  { question: "What policy reduced Cold War tensions in the 1970s?", answer: "Détente", wrong: ["Containment","Brinkmanship","Rollback"] },
  { question: "Who coined the term 'Iron Curtain'?", answer: "Winston Churchill", wrong: ["Harry Truman","George Marshall","Dean Acheson"] },
  { question: "What was the Korean War's result?", answer: "Armistice — Korea stayed divided", wrong: ["North Korea won","South Korea won","UN took control"] },
  { question: "Who led the Soviet Union during the Cuban Missile Crisis?", answer: "Nikita Khrushchev", wrong: ["Joseph Stalin","Leonid Brezhnev","Mikhail Gorbachev"] },
  { question: "What was the US spy plane shot down over the USSR in 1960?", answer: "U-2", wrong: ["SR-71","B-52","F-105"] },
  { question: "Which Soviet leader introduced glasnost and perestroika?", answer: "Mikhail Gorbachev", wrong: ["Yuri Andropov","Konstantin Chernenko","Leonid Brezhnev"] },
  { question: "In which year did the Berlin Wall fall?", answer: "1989", wrong: ["1991","1985","1987"] },
  { question: "Which year did the Soviet Union officially dissolve?", answer: "1991", wrong: ["1989","1990","1992"] },
  { question: "What was the US-Soviet arms control treaty of 1972?", answer: "SALT I", wrong: ["START I","INF Treaty","NPT"] },
  { question: "Which war was the longest US military conflict of the Cold War era?", answer: "Vietnam War", wrong: ["Korean War","Gulf War","Cold War itself"] },
  { question: "What doctrine said the US would aid nations threatened by communism?", answer: "Truman Doctrine", wrong: ["Monroe Doctrine","Marshall Plan","Nixon Doctrine"] },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ColdWarQuizSettings): ColdWarQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questionCount,10);
  const entries=shuffle(BANK,rng).slice(0,count).map(item=>({question:item.question,answer:item.answer,choices:shuffle([item.answer,...item.wrong.slice(0,3)],rng)}));
  return {settings,entries,current:0,selected:null,score:0,done:false};
}
export function reducer(state: ColdWarQuizState, action: ColdWarQuizAction): ColdWarQuizState {
  if(state.done)return state;
  if(action.type==="select"){if(state.selected!==null)return state;const e=state.entries[state.current]!;return{...state,selected:action.index,score:e.choices[action.index]===e.answer?state.score+10:state.score};}
  if(action.type==="next"){if(state.selected===null)return state;const n=state.current+1;return n>=state.entries.length?{...state,done:true}:{...state,current:n,selected:null};}
  return state;
}
export function isTerminal(state: ColdWarQuizState): { score: number } | null { return state.done?{score:state.score}:null; }
