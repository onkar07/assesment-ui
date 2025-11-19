import React, { useState } from "react";
import "./QuizForm.css";

function DefaultQuestion() {
  return { id: Date.now(), type: "mcq", text: "", options: ["", ""], answer: null };
}

export default function QuizForm({ quiz, onSave, onCancel }) {
  const [title, setTitle] = useState(quiz.title || "");
  const [questions, setQuestions] = useState(quiz.questions && quiz.questions.length ? quiz.questions : []);

  function addQuestion(type = "mcq") {
    const q = {
      id: Date.now() + Math.random(),
      type,
      text: "",
      options: type === "mcq" ? ["", ""] : type === "tf" ? ["True", "False"] : [],
      answer: type === "tf" ? "True" : null
    };
    setQuestions(prev => [...prev, q]);
  }

  function updateQuestion(id, patch) {
    setQuestions(prev => prev.map(q => 
      String(q.id) === String(id) ? { ...q, ...patch } : q
    ));
  }

  function removeQuestion(id) {
    setQuestions(prev => prev.filter(q => String(q.id) !== String(id)));
  }

  function addOption(qid) {
    setQuestions(prev => prev.map(q => 
      String(q.id) === String(qid) 
        ? { ...q, options: [...q.options, ""] }
        : q
    ));
  }

  function setOptionText(qid, idx, text) {
    setQuestions(prev => prev.map(q => {
      if (String(q.id) === String(qid)) {
        const newOptions = [...q.options];
        newOptions[idx] = text;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  }

  function removeOption(qid, idx) {
    setQuestions(prev => prev.map(q => {
      if (String(q.id) === String(qid)) {
        const newOptions = q.options.filter((_, i) => i !== idx);
        let newAnswer = q.answer;
        if (q.answer === idx) {
          newAnswer = null;
        } else if (q.answer > idx) {
          newAnswer = q.answer - 1;
        }
        return { ...q, options: newOptions, answer: newAnswer };
      }
      return q;
    }));
  }

  function save() {
    if (!title.trim()) { 
      alert("Please enter a quiz title"); 
      return; 
    }
    if (questions.length === 0) { 
      if(!confirm("No questions added. Create empty quiz?")) return; 
    }
    
    const clean = {
      id: quiz.id,
      title: title.trim(),
      questions: questions.map(q => {
        const out = { ...q };
        if (out.type === "text") {
          out.answer = out.answer || "";
        }
        if (out.type === "mcq") {
          out.options = out.options.filter(Boolean);
        }
        return out;
      })
    };
    onSave(clean);
  }

  return (
    <div className="quiz-form">
      <div className="form-header">
        <h3 className="form-title">{quiz.title ? "Edit Quiz" : "Create New Quiz"}</h3>
        <p className="form-subtitle">Add questions and configure your quiz</p>
      </div>

      <div className="form-section">
        <div className="field-group">
          <label className="field-label">Quiz Title</label>
          <input 
            className="text-input"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Enter quiz title..." 
          />
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h4 className="section-title">Questions</h4>
          <span className="question-count">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="question-actions">
          <button className="btn-secondary" onClick={() => addQuestion("mcq")}>
            <span className="btn-icon">⊕</span>
            Multiple Choice
          </button>
          <button className="btn-secondary" onClick={() => addQuestion("tf")}>
            <span className="btn-icon">⊖</span>
            True/False
          </button>
          <button className="btn-secondary" onClick={() => addQuestion("text")}>
            <span className="btn-icon">📝</span>
            Text Answer
          </button>
        </div>

        <div className="questions-list">
          {questions.map((q, idx) => (
            <div key={q.id} className="question-card">
              <div className="question-header">
                <div className="question-info">
                  <span className="question-number">Q{idx + 1}</span>
                  <span className={`question-type ${q.type}`}>{q.type.toUpperCase()}</span>
                </div>
                <button 
                  className="btn-danger"
                  onClick={() => removeQuestion(q.id)}
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="field-group">
                <label className="field-label">Question Text</label>
                <input 
                  className="text-input"
                  value={q.text} 
                  onChange={e => updateQuestion(q.id, { text: e.target.value })} 
                  placeholder="Enter your question here..."
                />
              </div>

              {q.type === "mcq" && (
                <div className="options-section">
                  <label className="field-label">Answer Options</label>
                  <div className="options-list">
                    {q.options.map((opt, i) => (
                      <div key={i} className="option-item">
                        <div className="option-input-group">
                          <input 
                            className="text-input"
                            value={opt} 
                            onChange={e => setOptionText(q.id, i, e.target.value)} 
                            placeholder={`Option ${i + 1}...`} 
                          />
                          <button 
                            className="btn-remove-option"
                            onClick={() => removeOption(q.id, i)}
                            disabled={q.options.length <= 2}
                          >
                            ×
                          </button>
                        </div>
                        <label className="radio-label">
                          <input 
                            type="radio" 
                            name={"correct-"+q.id} 
                            checked={q.answer === i} 
                            onChange={() => updateQuestion(q.id, { answer: i })} 
                          />
                          <span className="radio-custom"></span>
                          Correct Answer
                        </label>
                      </div>
                    ))}
                  </div>
                  <button className="btn-outline" onClick={() => addOption(q.id)}>
                    + Add Option
                  </button>
                </div>
              )}

              {q.type === "tf" && (
                <div className="field-group">
                  <label className="field-label">Correct Answer</label>
                  <select 
                    className="select-input"
                    value={q.answer || "True"} 
                    onChange={e => updateQuestion(q.id, { answer: e.target.value })}
                  >
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}

              {q.type === "text" && (
                <div className="field-group">
                  <label className="field-label">Sample Correct Answer</label>
                  <span className="field-hint">Optional - used for auto-checking</span>
                  <input 
                    className="text-input"
                    value={q.answer || ""} 
                    onChange={e => updateQuestion(q.id, { answer: e.target.value })} 
                    placeholder="Enter acceptable answer..." 
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p className="empty-text">No questions added yet</p>
            <p className="empty-subtext">Click the buttons above to add your first question</p>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={save}>
          💾 Save Quiz
        </button>
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}