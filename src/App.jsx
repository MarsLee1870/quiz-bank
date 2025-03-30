import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./HomePage"
import GrammarFilterPage from "./pages/grammar/GrammarFilterPage"
import GrammarQuestionSelectPage from "./pages/grammar/GrammarQuestionSelectPage"
import VocabularySearchPage from "./pages/vocabulary/VocabularySearchPage"
import VocabularyAIGenerator from "./pages/vocabularyAI/VocabularyAIGenerator"
import ReadingTestGenerator from "./pages/readingAI/ReadingTestGenerator"
import Layout from "./components/Layout"
import VocabularyExportPage from "./pages/vocabulary/VocabularyExportPage";



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/grammar" element={<Layout><GrammarFilterPage /></Layout>} />
        <Route path="/grammar/questions" element={<Layout><GrammarQuestionSelectPage /></Layout>} />
        <Route path="/vocabulary" element={<Layout><VocabularySearchPage /></Layout>} />
        <Route path="/vocabulary/export" element={<Layout><VocabularyExportPage /></Layout>} />
        <Route path="/vocabulary/ai" element={<Layout><VocabularyAIGenerator /></Layout>} />
        <Route path="/readingAI" element={<Layout><ReadingTestGenerator /></Layout>} /> {/* ← 就是這行 */}
       </Routes>
    </Router>
  )
}
