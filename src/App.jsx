import { useState, useRef, useEffect } from 'react';
import { generateProblem } from './problemGenerator';
import './App.css';

const GRADES = [1, 2, 3, 4, 5, 6];
const LEVELS = [
  { value: 'below', label: 'Below Average' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
];

function Setup({ onStart, initial }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [grade, setGrade] = useState(initial?.grade ?? '');
  const [level, setLevel] = useState(initial?.level ?? '');

  const valid = name.trim() && grade && level;

  return (
    <div className="card setup">
      <h1>Math Quiz</h1>
      <p className="subtitle">Let&apos;s see what you&apos;ve got!</p>

      <label>
        Your name
        <input
          type="text"
          placeholder="e.g. Gali"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </label>

      <label>
        School year (grade)
        <div className="grade-buttons">
          {GRADES.map(g => (
            <button
              key={g}
              className={`grade-btn ${grade === g ? 'selected' : ''}`}
              onClick={() => setGrade(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </label>

      <label>
        Your level
        <div className="level-buttons">
          {LEVELS.map(l => (
            <button
              key={l.value}
              className={`level-btn ${level === l.value ? 'selected' : ''}`}
              onClick={() => setLevel(l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </label>

      <button
        className="start-btn"
        disabled={!valid}
        onClick={() => onStart({ name: name.trim(), grade, level })}
      >
        Start Quiz!
      </button>
    </div>
  );
}

const BONUS_INTERVAL = 5;

function bonusMessage(correct) {
  if (correct === BONUS_INTERVAL) return { emoji: '🏆', title: 'Perfect round!', sub: 'You got all 5 right!' };
  if (correct >= 4) return { emoji: '🌟', title: 'Amazing!', sub: `${correct} out of 5 — nearly perfect!` };
  if (correct >= 3) return { emoji: '👍', title: 'Good job!', sub: `${correct} out of 5 — keep it up!` };
  return { emoji: '💪', title: 'Keep going!', sub: `${correct} out of 5 — you'll do better next round!` };
}

function Quiz({ profile, onRestart }) {
  const [problem, setProblem] = useState(() => generateProblem(profile.grade, profile.level));
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [showBonus, setShowBonus] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);
  const nextRef = useRef(null);
  const bonusRef = useRef(null);

  useEffect(() => {
    if (showBonus) bonusRef.current?.focus();
    else if (feedback === null) inputRef.current?.focus();
    else nextRef.current?.focus();
  }, [feedback, problem, showBonus]);

  // 10-second hint timer — resets on each new question
  useEffect(() => {
    if (feedback !== null || showBonus) return;
    setShowHint(false);
    const timer = setTimeout(() => setShowHint(true), 10000);
    return () => clearTimeout(timer);
  }, [problem, feedback, showBonus]);

  function submit() {
    if (input.trim() === '') return;
    const userAnswer = parseInt(input.trim(), 10);
    const isCorrect = userAnswer === problem.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setRoundCorrect(r => r + (isCorrect ? 1 : 0));
  }

  function next() {
    const newTotal = score.total + 1;
    if (newTotal % BONUS_INTERVAL === 0) {
      setShowBonus(true);
      setFeedback(null);
      setInput('');
    } else {
      setProblem(generateProblem(profile.grade, profile.level));
      setInput('');
      setFeedback(null);
    }
  }

  function dismissBonus() {
    setShowBonus(false);
    setRoundCorrect(0);
    setProblem(generateProblem(profile.grade, profile.level));
  }

  function tryAgain() {
    setInput('');
    setFeedback(null);
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      if (showBonus) dismissBonus();
      else if (feedback === null) submit();
      else if (feedback === 'correct') next();
      else tryAgain();
    }
  }

  const bonus = bonusMessage(roundCorrect);

  return (
    <div className="card quiz" onKeyDown={handleKey}>
      <div className="quiz-header">
        <div className="profile-info">
          <span className="greeting">Hi {profile.name}!</span>
          <span className="profile-meta">Grade {profile.grade} · {LEVELS.find(l => l.value === profile.level)?.label}</span>
          <button className="restart-link" onClick={onRestart}>Change settings</button>
        </div>
        <span className="score">{score.correct} / {score.total}</span>
      </div>

      {showBonus ? (
        <div className="bonus">
          <div className="bonus-emoji">{bonus.emoji}</div>
          <div className="bonus-title">{bonus.title}</div>
          <div className="bonus-sub">{bonus.sub}</div>
          <button ref={bonusRef} className="start-btn" onClick={dismissBonus}>Keep going! →</button>
        </div>
      ) : (
        <>
          <div className="problem">{problem.question} = ?</div>

          {feedback === null ? (
            <>
              <div className="answer-row">
                <input
                  ref={inputRef}
                  type="number"
                  className="answer-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyUp={handleKey}
                  placeholder="Your answer"
                />
                <button className="submit-btn" onClick={submit} disabled={input.trim() === ''}>
                  Check
                </button>
              </div>
              {showHint && (
                <div className="hint">
                  💡 Hint: the answer starts with <strong>{String(problem.answer)[0]}</strong>
                  {String(problem.answer).length > 1 && ` and has ${String(problem.answer).length} digits`}
                </div>
              )}
            </>
          ) : feedback === 'correct' ? (
            <div className="feedback correct">
              <span>😊 Correct! Well done 😊</span>
              <button ref={nextRef} className="next-btn" onClick={next}>Next →</button>
            </div>
          ) : (
            <div className="feedback wrong">
              <span>😢 Not quite, try again!</span>
              <button ref={nextRef} className="next-btn" onClick={tryAgain}>Try again →</button>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState(null);
  const [previous, setPrevious] = useState(null);

  function handleStart(p) {
    setPrevious(p);
    setProfile(p);
  }

  return profile ? (
    <Quiz profile={profile} onRestart={() => setProfile(null)} />
  ) : (
    <Setup onStart={handleStart} initial={previous} />
  );
}
