import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Home from "@/pages/Home";
import Layout from "@/components/Layout";
import Models from "@/pages/Models";
import Agents from "@/pages/Agents";
import AgentEditor from "@/pages/Agents/Editor";

import Datasets from "@/pages/Datasets";
import DatasetEditor from "@/pages/Datasets/Editor";

import Processes from "@/pages/Processes";
import ProcessEditor from "@/pages/Processes/Editor";

import EvaluationsList from "@/pages/Evaluations/List";
import EvaluationsCreate from "@/pages/Evaluations/Create";
import EvaluationsDetail from "@/pages/Evaluations/Detail";

import DocumentPage from "@/pages/Document";
import ApiKeys from "@/pages/ApiKeys";
import Services from "@/pages/Services";
import Tickets from "@/pages/Tickets";
import TicketDetail from "@/pages/Tickets/Detail";
import Dispatch from "@/pages/Dispatch";
import Sla from "@/pages/Sla";
import Dashboard from "@/pages/Dashboard";
import Org from "@/pages/Org";
import Feedback from "@/pages/Feedback";

// 简单的鉴权组件，用于保护全屏路由
function AuthGuard() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Home />} />
        
        {/* Public Documents */}
        <Route path="/docs/:type" element={<DocumentPage />} />

        {/* 全屏私有路由 (无侧边栏) */}
        <Route element={<AuthGuard />}>
          <Route path="/agents/new" element={<AgentEditor />} />
          <Route path="/agents/:id/edit" element={<AgentEditor />} />
          <Route path="/processes/new" element={<ProcessEditor />} />
          <Route path="/processes/:id/edit" element={<ProcessEditor />} />
        </Route>
        
        {/* Main Application Layout (带侧边栏) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="models" element={<Models />} />
          <Route path="agents" element={<Agents />} />
          
          <Route path="processes" element={<Processes />} />
          <Route path="services" element={<Services />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="dispatch" element={<Dispatch />} />
          <Route path="sla" element={<Sla />} />
          <Route path="org" element={<Org />} />
          <Route path="feedback" element={<Feedback />} />
          
          <Route path="datasets" element={<Datasets />} />
          <Route path="datasets/new" element={<DatasetEditor />} />
          <Route path="datasets/:id/edit" element={<DatasetEditor />} />
          
          <Route path="evaluations" element={<EvaluationsList />} />
          <Route path="evaluations/new" element={<EvaluationsCreate />} />
          <Route path="evaluations/:id" element={<EvaluationsDetail />} />
          
          <Route path="api-keys" element={<ApiKeys />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
