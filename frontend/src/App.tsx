import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Layout from "@/components/Layout";
import Models from "@/pages/Models";
import Agents from "@/pages/Agents";

import Datasets from "@/pages/Datasets";
import DatasetEditor from "@/pages/Datasets/Editor";

import EvaluationsList from "@/pages/Evaluations/List";
import EvaluationsCreate from "@/pages/Evaluations/Create";
import EvaluationsDetail from "@/pages/Evaluations/Detail";

import DocumentPage from "@/pages/Document";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Home />} />
        
        {/* Public Documents */}
        <Route path="/docs/:type" element={<DocumentPage />} />
        
        {/* Main Application Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/models" replace />} />
          <Route path="models" element={<Models />} />
          
          <Route path="datasets" element={<Datasets />} />
          <Route path="datasets/new" element={<DatasetEditor />} />
          <Route path="datasets/:id/edit" element={<DatasetEditor />} />
          
          <Route path="evaluations" element={<EvaluationsList />} />
          <Route path="evaluations/new" element={<EvaluationsCreate />} />
          <Route path="evaluations/:id" element={<EvaluationsDetail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
