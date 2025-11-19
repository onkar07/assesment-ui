import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import AdminPanel from "./components/AdminPanel";
import QuizTakeList from "./components/QuizTakeList";
import TakeQuiz from "./components/TakeQuiz";
import ResultView from "./components/ResultView";
import envConfig from "./config/envConfig";

export default function App() {
  const title = envConfig.SITE_TITLE || "Quiz App";
  return (
    <div className="container">
      {/* <header>
        <h1>{title}</h1>
        <nav>
          <Link to="/">Take a Quiz</Link>
          <Link to={envConfig.ADMIN_PATH || "/admin"}>Admin</Link>
        </nav>
      </header> */}

      <main>
        <Routes>
          <Route path="/" element={<QuizTakeList />} />
          <Route path="/quiz/:id" element={<TakeQuiz />} />
          <Route path="/result/:id" element={<ResultView />} />
          <Route path={envConfig.ADMIN_PATH || "/admin"} element={<AdminPanel />} />
        </Routes>
      </main>

      <footer>
        <small>Built with ❤️ — {title}</small>
      </footer>
    </div>
  );
}
