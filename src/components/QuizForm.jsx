import React, { useState } from "react";

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
    setQuestions(prev => prev.map(q => (String(q.id) === String(id) ? { ...q, ...patch } : q)));
  }

  function removeQuestion(id) {
    setQuestions(prev => prev.filter(q => String(q.id) !== String(id)));
  }

  function addOption(qid) {
    updateQuestion(qid, { options: [...questions.find(q => q.id === qid).options, ""] });
  }

  function setOptionText(qid, idx, text) {
    const q = questions.find(q => q.id === qid);
    const newOpts = q.options.slice();
    newOpts[idx] = text;
    updateQuestion(qid, { options: newOpts });
  }

  function save() {
    // basic validation
    if (!title.trim()) { alert("Enter quiz title"); return; }
    if (questions.length === 0) { if(!confirm("No questions added. Create empty quiz?")) return; }
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
    <div>
      <h3>{quiz.title ? "Edit Quiz" : "New Quiz"}</h3>
      <div className="field">
        <label>Quiz Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter title" />
      </div>

      <div className="card">
        <div style={{display:"flex", gap:8}}>
          <button onClick={() => addQuestion("mcq")}>Add MCQ</button>
          <button onClick={() => addQuestion("tf")}>Add True/False</button>
          <button onClick={() => addQuestion("text")}>Add Text</button>
        </div>

        <div style={{marginTop:12}}>
          {questions.map((q, idx) => (
            <div key={q.id} className="question">
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <strong>Q{idx + 1} — {q.type.toUpperCase()}</strong>
                <div>
                  <button onClick={() => removeQuestion(q.id)} className="btn-danger">Delete</button>
                </div>
              </div>

              <div className="field">
                <label>Question text</label>
                <input value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })} />
              </div>

              {q.type === "mcq" && (
                <>
                  <label>Options</label>
                  <div className="answers-list">
                    {q.options.map((opt, i) => (
                      <div key={i} style={{display:"flex", gap:8, marginBottom:6}}>
                        <input value={opt} onChange={e => setOptionText(q.id, i, e.target.value)} placeholder={`Option ${i+1}`} />
                        <label className="small">Correct?
                          <input type="radio" name={"correct-"+q.id} checked={q.answer === i} onChange={() => updateQuestion(q.id, { answer: i })} />
                        </label>
                      </div>
                    ))}
                    <button onClick={() => addOption(q.id)}>Add option</button>
                  </div>
                </>
              )}

              {q.type === "tf" && (
                <div className="field">
                  <label>Answer</label>
                  <select value={q.answer || "True"} onChange={e => updateQuestion(q.id, { answer: e.target.value })}>
                    <option>True</option>
                    <option>False</option>
                  </select>
                </div>
              )}

              {q.type === "text" && (
                <div className="field">
                  <label>Sample Correct Answer (optional, used for auto-check)</label>
                  <input value={q.answer || ""} onChange={e => updateQuestion(q.id, { answer: e.target.value })} placeholder="Acceptable text answer" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:12}}>
        <button onClick={save}>Save Quiz</button>
        <button onClick={onCancel} style={{marginLeft:8}}>Cancel</button>
      </div>
    </div>
  );
}
