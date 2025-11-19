import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuizById } from "../../utils/storage";
import "./ResultView.css";

export default function ResultView() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setValues() {
      try {
        setLoading(true);
        // load stored result (if any)
        const raw = sessionStorage.getItem("last_result_" + id);
        if (raw) setResult(JSON.parse(raw));

        // load quiz from API
        const q = await getQuizById(id);
        if (q) setQuiz(q);
      } catch (e) {
        console.error("Failed to load result or quiz:", e);
      } finally {
        setLoading(false);
      }
    }

    setValues();
  }, [id]);

  // helper: try many keys to find an answer for a question
  function findGivenForQuestion(q, index, answers) {
    if (!answers) return undefined;

    // Try direct keys that may exist on the question
    const tryKeys = [q.__qid, q.clientId, q.id, q._id].filter(Boolean);

    for (const k of tryKeys) {
      if (k in answers) return answers[k];
    }

    // Try to find a key that encodes the question index, e.g. "...-q-2-..." or "...-q-2"
    // This handles __qid patterns like "quizid-q-2-<timestamp>-<rand>"
    const indexPattern = new RegExp(`-q-${index}(?:-|$)`);
    for (const key of Object.keys(answers)) {
      if (indexPattern.test(key)) return answers[key];
    }

    // As last resort, if answers has numeric-index keys (e.g., "0","1","2"), try that
    if (String(index) in answers) return answers[String(index)];

    // nothing found
    return undefined;
  }

  if (loading) {
    return (
      <div className="result-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!result || !quiz) {
    return (
      <div className="result-container">
        <div className="error-state">
          <div className="error-icon">📊</div>
          <h3>No Results Found</h3>
          <p>Please take the quiz first to see your results.</p>
          <Link to={`/quiz/${id}`} className="btn-primary">
            Take Quiz Now
          </Link>
        </div>
      </div>
    );
  }

  const { answers, score, total, date } = result;
  const percentage = Math.round((score / total) * 100);
  const isPerfectScore = score === total;
  const isPassingScore = percentage >= 70;

  // Calculate performance message
  const getPerformanceMessage = () => {
    if (isPerfectScore) return "Perfect! Outstanding performance! 🎉";
    if (percentage >= 90) return "Excellent work! You've mastered this material!";
    if (percentage >= 80) return "Great job! You have a solid understanding.";
    if (percentage >= 70) return "Good work! You passed with a solid score.";
    if (percentage >= 60) return "Not bad! Review the material and try again.";
    return "Keep practicing! Review the questions below and try again.";
  };

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Quizzes</Link>
          <span className="breadcrumb-separator">/</span>
          <span>Results</span>
        </div>
        <h1 className="result-title">{quiz.title}</h1>
        <p className="result-subtitle">Quiz Results Summary</p>
      </div>

      {/* Score Summary Card */}
      <div className="score-summary">
        <div className="score-circle">
          <div className="score-percentage">{percentage}%</div>
          <div className="score-fraction">{score}/{total}</div>
        </div>
        <div className="score-details">
          <h3 className={`performance-title ${isPassingScore ? 'passing' : 'needs-improvement'}`}>
            {isPassingScore ? '🎉 Congratulations!' : '💪 Keep Learning!'}
          </h3>
          <p className="performance-message">{getPerformanceMessage()}</p>
          <div className="score-meta">
            <span className="meta-item">
              <strong>Date Taken:</strong> {date ? new Date(date).toLocaleString() : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Results Breakdown */}
      <div className="results-section">
        <div className="section-header">
          <h2 className="section-title">Detailed Results</h2>
          <span className="questions-count">{quiz.questions?.length || 0} Questions</span>
        </div>

        <div className="questions-results">
          {Array.isArray(quiz.questions) && quiz.questions.map((q, i) => {
            const given = findGivenForQuestion(q, i, answers);
            let correct = false;

            if (q.type === "mcq") {
              if (given !== undefined && String(given) === String(q.answer)) correct = true;
            } else if (q.type === "tf") {
              if (given !== undefined && String(given) === String(q.answer)) correct = true;
            } else if (q.type === "text" && q.answer) {
              if (given !== undefined && String(given).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) correct = true;
            }

            // For display: show MCQ option text if given is an index
            const displayGiven = (() => {
              if (given === undefined || given === null || given === "") return "(No answer provided)";
              if (q.type === "mcq") {
                const idx = Number(given);
                if (!Number.isNaN(idx) && Array.isArray(q.options) && q.options[idx] !== undefined) {
                  return q.options[idx];
                }
                return String(given);
              }
              return String(given);
            })();

            const displayCorrect = (() => {
              if (q.type === "mcq") {
                const idx = Number(q.answer);
                if (!Number.isNaN(idx) && Array.isArray(q.options) && q.options[idx] !== undefined) {
                  return q.options[idx];
                }
                return q.answer ?? "(No correct answer set)";
              }
              return q.answer ?? "(No correct answer set)";
            })();

            const key = q.clientId || q.id || q._id || `q-${i}`;

            return (
              <div key={key} className={`question-result ${correct ? 'correct' : 'incorrect'}`}>
                <div className="question-header">
                  <div className="question-meta">
                    <span className="question-number">Question {i + 1}</span>
                    <span className={`question-status ${correct ? 'status-correct' : 'status-incorrect'}`}>
                      {correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                </div>
                
                <div className="question-text">{q.text}</div>
                
                <div className="answer-comparison">
                  <div className="answer-row">
                    <span className="answer-label">Your Answer:</span>
                    <span className={`answer-value ${correct ? 'answer-correct' : 'answer-wrong'}`}>
                      {displayGiven}
                    </span>
                  </div>
                  {!correct && (
                    <div className="answer-row">
                      <span className="answer-label">Correct Answer:</span>
                      <span className="answer-value answer-correct">
                        {displayCorrect}
                      </span>
                    </div>
                  )}
                </div>

                {q.type === "text" && !correct && (
                  <div className="answer-note">
                    Note: Text answers are checked for exact match (case-insensitive)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <Link to={`/quiz/${id}`} className="btn-secondary">
          ↻ Retake Quiz
        </Link>
        <Link to="/" className="btn-primary">
          ← Back to All Quizzes
        </Link>
      </div>
    </div>
  );
}