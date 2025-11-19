import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadQuizzes } from "../../utils/storage";
import envConfig from "../../config/envConfig";
import "./QuizTakeList.css";

export default function QuizTakeList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setLoading(true);
        const data = await loadQuizzes();
        setQuizzes(data);
      } catch (error) {
        console.error("Failed to load quizzes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (questionCount) => {
    if (questionCount <= 5) return "#10b981"; // Easy - green
    if (questionCount <= 10) return "#f59e0b"; // Medium - amber
    return "#ef4444"; // Hard - red
  };

  const getDifficultyText = (questionCount) => {
    if (questionCount <= 5) return "Beginner";
    if (questionCount <= 10) return "Intermediate";
    return "Advanced";
  };

  if (loading) {
    return (
      <div className="quiz-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-list-container">
      {/* Header Section */}
      <div className="quiz-list-header">
        <div className="header-content">
          <h1 className="page-title">Available Quizzes</h1>
          <p className="page-subtitle">Test your knowledge with our curated collection of quizzes</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-number">{quizzes.length}</div>
            <div className="stat-label">Total Quizzes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {quizzes.reduce((total, quiz) => total + (quiz.questions?.length || 0), 0)}
            </div>
            <div className="stat-label">Total Questions</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>
        <div className="filter-info">
          Showing {filteredQuizzes.length} of {quizzes.length} quizzes
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="quizzes-grid">
        {filteredQuizzes.map(quiz => (
          <div key={quiz._id} className="quiz-card">
            <div className="quiz-card-header">
              <div className="quiz-meta">
                <span 
                  className="difficulty-badge"
                  style={{ 
                    backgroundColor: getDifficultyColor(quiz.questions?.length || 0) 
                  }}
                >
                  {getDifficultyText(quiz.questions?.length || 0)}
                </span>
                <span className="question-count">
                  {quiz.questions?.length || 0} questions
                </span>
              </div>
              <div className="quiz-type-indicator">
                {quiz.questions?.some(q => q.type === 'mcq') && <span className="type-tag">MCQ</span>}
                {quiz.questions?.some(q => q.type === 'tf') && <span className="type-tag">True/False</span>}
                {quiz.questions?.some(q => q.type === 'text') && <span className="type-tag">Text</span>}
              </div>
            </div>

            <div className="quiz-card-body">
              <h3 className="quiz-title">{quiz.title}</h3>
              {quiz.description && (
                <p className="quiz-description">{quiz.description}</p>
              )}
              
              <div className="quiz-stats">
                <div className="stat">
                  <span className="stat-value">
                    {Math.floor((quiz.questions?.length || 0) * 1.5)}
                  </span>
                  <span className="stat-label">min estimate</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {quiz.questions?.filter(q => q.type === 'mcq').length || 0}
                  </span>
                  <span className="stat-label">MCQ</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {quiz.questions?.filter(q => q.type === 'tf').length || 0}
                  </span>
                  <span className="stat-label">True/False</span>
                </div>
              </div>
            </div>

            <div className="quiz-card-footer">
              <Link to={`/quiz/${quiz._id}`} className="quiz-action-btn">
                <span className="btn-icon">🎯</span>
                Start Quiz
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuizzes.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3 className="empty-title">
            {searchTerm ? "No matching quizzes found" : "No quizzes available"}
          </h3>
          <p className="empty-description">
            {searchTerm 
              ? "Try adjusting your search terms or browse all quizzes"
              : `Admin can create quizzes at ${envConfig.ADMIN_PATH || "/admin"}`
            }
          </p>
          {searchTerm && (
            <button 
              className="btn-secondary"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="actions-info">
          <h4>Ready to challenge yourself?</h4>
          <p>Select a quiz above to get started</p>
        </div>
        <div className="action-buttons">
          <Link to={envConfig.ADMIN_PATH || "/admin"} className="btn-outline">
            🛠️ Create Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}