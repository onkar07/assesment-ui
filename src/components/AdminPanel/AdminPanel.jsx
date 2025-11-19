import React, { useState, useEffect } from "react";
import QuizForm from "../QuizForm/QuizForm.jsx";
import QuizListAdmin from "../QuizListAdmin/QuizListAdmin.jsx";
import { loadQuizzes, upsertQuiz, deleteQuiz } from "../../utils/storage";
import "./AdminPanel.css"; // We'll create this CSS file

export default function AdminPanel() {
  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const qs = await loadQuizzes();
        setQuizzes(qs);
      } catch (e) {
        console.error(e);
        // alert("Failed to load quizzes");
      }
    }
    load();
  }, [quizzes]);

  async function handleSave(quiz) {
  try {
    const saved = await upsertQuiz(quiz);
    // reload list (simple)
    const qs = await loadQuizzes();
    setQuizzes(qs);
    setEditingQuiz(null);
  } catch (err) {
    console.error(err);
    alert("Save failed: " + err.message);
  }
}

  function handleDelete(id) {
    deleteQuiz(id);
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2 className="admin-title">Quiz Admin Panel</h2>
        <p className="admin-subtitle">Manage your quizzes and questions</p>
      </div>

      <div className="admin-content">
        <div className="admin-actions">
          <button 
            className="btn-primary"
            onClick={() => setEditingQuiz({ id: Date.now(), title: "", questions: [] })}
          >
            <span className="btn-icon">+</span>
            Create New Quiz
          </button>
        </div>

        {editingQuiz && (
          <div className="editing-section">
            <QuizForm 
              quiz={editingQuiz} 
              onCancel={() => setEditingQuiz(null)} 
              onSave={handleSave} 
            />
          </div>
        )}

        <div className="quizzes-section">
          <QuizListAdmin 
            quizzes={quizzes} 
            onEdit={q => setEditingQuiz(q)} 
            onDelete={q => {
              console.log("On delete : ",q)
              handleDelete(q)
            }} 
          />
        </div>
      </div>
    </div>
  );
}