import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import GrammarFilterPage from "./pages/grammar/GrammarFilterPage";
import GrammarQuestionSelectPage from "./pages/grammar/GrammarQuestionSelectPage";
import VocabularySearchPage from "./pages/vocabulary/VocabularySearchPage";
import VocabularyAIGenerator from "./pages/vocabularyAI/VocabularyAIGenerator";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/grammar" element={<GrammarFilterPage />} />
        <Route path="/grammar/questions" element={<GrammarQuestionSelectPage />} />
        <Route path="/vocabulary" element={<VocabularySearchPage />} />
        <Route path="/vocabulary/ai" element={<VocabularyAIGenerator />} />
      </Routes>
    </Router>
  );
}
