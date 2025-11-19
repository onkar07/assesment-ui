import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById } from "../../utils/storage";
import "./TakeQuiz.css";

function makeQid(q, quizId, index) {
  return q.clientId || q.id || q._id || `${quizId || "local"}-q-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const q = await getQuizById(id);
        if (!q) {
          alert("Quiz not found");
          navigate("/");
          return;
        }

        const normalizedQuestions = (q.questions || []).map((qq, i) => {
          const qid = makeQid(qq, q._id, i);
          return { ...qq, __qid: qid };
        });

        setQuiz({ ...q, questions: normalizedQuestions });
        setAnswers({});
      } catch (e) {
        console.error(e);
        alert("Failed to load quiz");
        navigate("/");
      }
    }
    load();
  }, [id, navigate]);

  useEffect(() => {
    if (quiz && quiz.questions) {
      const answeredCount = Object.keys(answers).length;
      const totalQuestions = quiz.questions.length;
      setProgress(Math.round((answeredCount / totalQuestions) * 100));
    }
  }, [answers, quiz]);

  function setAnswer(qid, value) {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  }

  function nextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  }

  function prevQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }

  function submit() {
    if (!quiz) return;

    const results = { 
      quizId: quiz._id, 
      date: new Date().toISOString(), 
      answers 
    };

    let correct = 0;
    quiz.questions.forEach((q) => {
      const given = answers[q.__qid];
      if (q.type === "mcq") {
        if (given !== undefined && String(given) === String(q.answer)) correct++;
      } else if (q.type === "tf") {
        if (given !== undefined && String(given) === String(q.answer)) correct++;
      } else if (q.type === "text") {
        if (q.answer && given && String(given).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) correct++;
      }
    });

    results.score = correct;
    results.total = quiz.questions.length;

    sessionStorage.setItem("last_result_" + quiz._id, JSON.stringify(results));
    navigate(`/result/${quiz._id}`);
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const isAnswered = answers[currentQ?.__qid] !== undefined;

  return (
    <div className="quiz-container">
      {/* Header */}
      <div className="quiz-header">
        <div className="breadcrumb">
          <span onClick={() => navigate("/")} className="breadcrumb-link">Quizzes</span>
          <span className="breadcrumb-separator">/</span>
          <span>Taking Quiz</span>
        </div>
        <h1 className="quiz-title">{quiz.title}</h1>
        <p className="quiz-subtitle">Test your knowledge with this quiz</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-text">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="progress-percentage">{progress}% Complete</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <div className="question-header">
          <div className="question-meta">
            <span className="question-number">Question {currentQuestion + 1}</span>
            <span className={`question-type ${currentQ.type}`}>
              {currentQ.type.toUpperCase()}
            </span>
          </div>
          <div className="question-count">
            {currentQuestion + 1}/{totalQuestions}
          </div>
        </div>

        <div className="question-content">
          <h3 className="question-text">{currentQ.text}</h3>

          {/* Multiple Choice */}
          {currentQ.type === "mcq" && (
            <div className="options-container">
              {Array.isArray(currentQ.options) && currentQ.options.map((opt, idx) => (
                <label 
                  key={idx} 
                  className={`option-label ${
                    String(answers[currentQ.__qid]) === String(idx) ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQ.__qid}
                    value={idx}
                    checked={String(answers[currentQ.__qid]) === String(idx)}
                    onChange={() => setAnswer(currentQ.__qid, idx)}
                    className="option-input"
                  />
                  <span className="option-marker"></span>
                  <span className="option-text">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* True/False */}
          {currentQ.type === "tf" && (
            <div className="options-container tf-options">
              <label className={`option-label ${answers[currentQ.__qid] === "True" ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={currentQ.__qid}
                  checked={answers[currentQ.__qid] === "True"}
                  onChange={() => setAnswer(currentQ.__qid, "True")}
                  className="option-input"
                />
                <span className="option-marker"></span>
                <span className="option-text">True</span>
              </label>
              <label className={`option-label ${answers[currentQ.__qid] === "False" ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={currentQ.__qid}
                  checked={answers[currentQ.__qid] === "False"}
                  onChange={() => setAnswer(currentQ.__qid, "False")}
                  className="option-input"
                />
                <span className="option-marker"></span>
                <span className="option-text">False</span>
              </label>
            </div>
          )}

          {/* Text Answer */}
          {currentQ.type === "text" && (
            <div className="text-answer-container">
              <textarea
                placeholder="Type your answer here..."
                value={answers[currentQ.__qid] || ""}
                onChange={e => setAnswer(currentQ.__qid, e.target.value)}
                className="text-answer-input"
                rows={4}
              />
              <div className="text-hint">
                Provide a detailed answer in your own words
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-navigation">
        <button 
          className="btn-secondary"
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
        >
          ← Previous
        </button>

        <div className="navigation-center">
          <span className="answered-status">
            {isAnswered ? "✓ Answered" : "○ Unanswered"}
          </span>
        </div>

        {!isLastQuestion ? (
          <button 
            className="btn-primary"
            onClick={nextQuestion}
          >
            Next →
          </button>
        ) : (
          <button 
            className="btn-submit"
            onClick={submit}
          >
            🎯 Submit Quiz
          </button>
        )}
      </div>

      {/* Quick Navigation Dots */}
      <div className="question-dots">
        {quiz.questions.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentQuestion ? 'active' : ''} ${
              answers[quiz.questions[index].__qid] !== undefined ? 'answered' : ''
            }`}
            onClick={() => setCurrentQuestion(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}