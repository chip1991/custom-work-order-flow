import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth";
import { AppLayout } from "./layout/AppLayout";
import { RequireAuth } from "./layout/RequireAuth";
import { ComparePage } from "./pages/compare/ComparePage";
import { DashboardPage } from "./pages/DashboardPage";
import { DatasetDetailPage } from "./pages/datasets/DatasetDetailPage";
import { DatasetFormPage } from "./pages/datasets/DatasetFormPage";
import { DatasetsListPage } from "./pages/datasets/DatasetsListPage";
import { SampleDetailPage } from "./pages/datasets/SampleDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { MetricDetailPage } from "./pages/metrics/MetricDetailPage";
import { MetricFormPage } from "./pages/metrics/MetricFormPage";
import { MetricsListPage } from "./pages/metrics/MetricsListPage";
import { ModelDetailPage } from "./pages/models/ModelDetailPage";
import { ModelFormPage } from "./pages/models/ModelFormPage";
import { ModelsListPage } from "./pages/models/ModelsListPage";
import { ModelVersionDetailPage } from "./pages/models/ModelVersionDetailPage";
import { ModelVersionFormPage } from "./pages/models/ModelVersionFormPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PlanDetailPage } from "./pages/plans/PlanDetailPage";
import { PlanFormPage } from "./pages/plans/PlanFormPage";
import { PlansListPage } from "./pages/plans/PlansListPage";
import { PromptTemplateDetailPage } from "./pages/promptTemplates/PromptTemplateDetailPage";
import { PromptTemplateFormPage } from "./pages/promptTemplates/PromptTemplateFormPage";
import { PromptTemplatesListPage } from "./pages/promptTemplates/PromptTemplatesListPage";
import { ProjectDetailPage } from "./pages/projects/ProjectDetailPage";
import { ProjectFormPage } from "./pages/projects/ProjectFormPage";
import { ProjectsListPage } from "./pages/projects/ProjectsListPage";
import { RunDetailPage } from "./pages/runs/RunDetailPage";
import { RunsListPage } from "./pages/runs/RunsListPage";
import WorkOrdersPage from "./pages/WorkOrders";
import WorkOrderFlowEditor from "./pages/WorkOrders/WorkOrderFlowEditor";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardPage />} />

            <Route path="projects" element={<ProjectsListPage />} />
            <Route path="projects/new" element={<ProjectFormPage mode="create" />} />
            <Route path="projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="projects/:projectId/edit" element={<ProjectFormPage mode="edit" />} />

            <Route path="projects/:projectId/models" element={<ModelsListPage />} />
            <Route path="projects/:projectId/models/new" element={<ModelFormPage mode="create" />} />
            <Route path="models/:modelId" element={<ModelDetailPage />} />
            <Route path="models/:modelId/edit" element={<ModelFormPage mode="edit" />} />
            <Route path="models/:modelId/versions/new" element={<ModelVersionFormPage mode="create" />} />
            <Route path="model-versions/:modelVersionId" element={<ModelVersionDetailPage />} />
            <Route path="model-versions/:modelVersionId/edit" element={<ModelVersionFormPage mode="edit" />} />

            <Route path="projects/:projectId/datasets" element={<DatasetsListPage />} />
            <Route path="projects/:projectId/datasets/new" element={<DatasetFormPage mode="create" />} />
            <Route path="datasets/:datasetId" element={<DatasetDetailPage />} />
            <Route path="datasets/:datasetId/edit" element={<DatasetFormPage mode="edit" />} />
            <Route path="samples/:sampleId" element={<SampleDetailPage />} />

            <Route path="projects/:projectId/prompt-templates" element={<PromptTemplatesListPage />} />
            <Route path="projects/:projectId/prompt-templates/new" element={<PromptTemplateFormPage mode="create" />} />
            <Route path="prompt-templates/:promptTemplateId" element={<PromptTemplateDetailPage />} />
            <Route path="prompt-templates/:promptTemplateId/edit" element={<PromptTemplateFormPage mode="edit" />} />

            <Route path="projects/:projectId/metrics" element={<MetricsListPage />} />
            <Route path="projects/:projectId/metrics/new" element={<MetricFormPage mode="create" />} />
            <Route path="metrics/:metricId" element={<MetricDetailPage />} />
            <Route path="metrics/:metricId/edit" element={<MetricFormPage mode="edit" />} />

            <Route path="projects/:projectId/plans" element={<PlansListPage />} />
            <Route path="projects/:projectId/plans/new" element={<PlanFormPage mode="create" />} />
            <Route path="plans/:planId" element={<PlanDetailPage />} />
            <Route path="plans/:planId/edit" element={<PlanFormPage mode="edit" />} />

            <Route path="runs" element={<RunsListPage />} />
            <Route path="runs/:runId" element={<RunDetailPage />} />

            <Route path="work-orders" element={<WorkOrdersPage />} />
            <Route path="work-orders/new" element={<WorkOrderFlowEditor />} />
            <Route path="work-orders/:id" element={<WorkOrderFlowEditor />} />
            <Route path="work-orders/:id/edit" element={<WorkOrderFlowEditor />} />

            <Route path="compare" element={<ComparePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
