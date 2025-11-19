# assesment-ui
Quiz System Documentation
Frontend Documentation
# Quiz Management System — Frontend (React)

This is the **React frontend** for the Quiz Management System.  
Features include:

- Public quiz listing
- User name input before quiz start
- Quiz taking (MCQ / True-False / Text)
- Result calculation
- Result display
- Admin panel for creating, editing, and deleting quizzes
- Fully connected to Node.js + MongoDB backend

---

## 🚀 Tech Stack
- **React 18**
- **React Router DOM 6**
- **Fetch API** (custom wrapper)
- **Vite** or **CRA** supported
- **CSS** modules

---

## 📁 Project Structure

src/
├── components/
│   ├── AdminPanel.js
│   ├── QuizForm.js
│   ├── QuizListAdmin.js
│   ├── QuizTakeList.js
│   ├── TakeQuiz.js
│   ├── ResultView.js
├── utils/
│   └── storage.js
├── config/
│   └── envConfig.js
├── styles.css
├── App.js
└── main.jsx

---

## 🔧 Environment Variables
(Vite)
VITE_API_URL=http://localhost:4000/api
VITE_SITE_TITLE=Quiz App
VITE_ADMIN_PATH=/admin

(CRA)
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_SITE_TITLE=Quiz App
REACT_APP_ADMIN_PATH=/admin

---

## ▶️ Run Frontend
npm install  
npm run dev

---
