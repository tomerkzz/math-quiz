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
  const inputRef = useRef(null);
  const nextRef = useRef(null);
  const bonusRef = useRef(null);

  useEffect(() => {
    if (showBonus) bonusRef.current?.focus();
    else if (feedback === null) inputRef.current?.focus();
    else nextRef.current?.focus();
  }, [feedback, problem, showBonus]);

  function submit() {
    if (input.trim() === '') return;
    const userAnswer = parseInt(input.trim(), 10);
    const isCorrect = userAnswer === problem.answer;
    const newRoundCorrect = roundCorrect + (isCorrect ? 1 : 0);
    const newTotal = score.total + 1;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: newTotal }));
    setRoundCorrect(newRoundCorrect);
    if (newTotal % BONUS_INTERVAL === 0) {
      setTimeout(() => {
        setShowBonus(true);
      }, 800);
    }
  }

  function next() {
    setProblem(generateProblem(profile.grade, profile.level));
    setInput('');
    setFeedback(null);
  }

  function dismissBonus() {
    setShowBonus(false);
    setRoundCorrect(0);
    next();
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      if (showBonus) dismissBonus();
      else if (feedback === null) submit();
      else next();
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
          ) : (
            <div className={`feedback ${feedback}`}>
              {feedback === 'correct' ? (
                <span>😊 Correct! Well done 😊</span>
              ) : (
                <span>😢 Not quite — the answer was <strong>{problem.answer}</strong> 😢</span>
              )}
              <button ref={nextRef} className="next-btn" onClick={next}>Next →</button>
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
