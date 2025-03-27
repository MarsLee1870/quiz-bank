import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./HomePage"
import GrammarFilterPage from "./pages/grammar/GrammarFilterPage"
import GrammarQuestionSelectPage from "./pages/grammar/GrammarQuestionSelectPage"
import VocabularySearchPage from "./pages/vocabulary/VocabularySearchPage"
import VocabularyAIGenerator from "./pages/vocabularyAI/VocabularyAIGenerator"
import Layout from "./components/Layout"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/grammar" element={<Layout><GrammarFilterPage /></Layout>} />
        <Route path="/grammar/questions" element={<Layout><GrammarQuestionSelectPage /></Layout>} />
        <Route path="/vocabulary" element={<Layout><VocabularySearchPage /></Layout>} />
        <Route path="/vocabulary/ai" element={<Layout><VocabularyAIGenerator /></Layout>} />
      </Routes>
    </Router>
  )
}
