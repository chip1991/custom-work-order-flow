-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Model_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT,
    "config" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "modelId" TEXT NOT NULL,
    CONSTRAINT "ModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiKey_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Dataset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sample" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "input" JSONB NOT NULL,
    "context" JSONB,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "datasetId" TEXT NOT NULL,
    CONSTRAINT "Sample_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "PromptTemplate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Metric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sampleMode" TEXT NOT NULL DEFAULT 'ALL',
    "sampleCount" INTEGER,
    "config" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    "modelVersionId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "promptTemplateId" TEXT NOT NULL,
    CONSTRAINT "EvaluationPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvaluationPlan_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "ModelVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvaluationPlan_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EvaluationPlan_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "PromptTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "errorMessage" TEXT,
    "planSnapshot" JSONB,
    "planId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "EvaluationRun_planId_fkey" FOREIGN KEY ("planId") REFERENCES "EvaluationPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvaluationRun_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RunCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "renderedPrompt" TEXT,
    "modelOutput" TEXT,
    "errorMessage" TEXT,
    "runId" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    CONSTRAINT "RunCase_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvaluationRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RunCase_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetricResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "metricId" TEXT NOT NULL,
    "runCaseId" TEXT NOT NULL,
    "score" REAL,
    "valueFloat" REAL,
    "valueText" TEXT,
    "valueJson" JSONB,
    CONSTRAINT "MetricResult_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MetricResult_runCaseId_fkey" FOREIGN KEY ("runCaseId") REFERENCES "RunCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationPlanMetric" (
    "planId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("planId", "metricId"),
    CONSTRAINT "EvaluationPlanMetric_planId_fkey" FOREIGN KEY ("planId") REFERENCES "EvaluationPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EvaluationPlanMetric_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_ownerId_name_key" ON "Project"("ownerId", "name");

-- CreateIndex
CREATE INDEX "Model_projectId_idx" ON "Model"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Model_projectId_name_key" ON "Model"("projectId", "name");

-- CreateIndex
CREATE INDEX "ModelVersion_modelId_idx" ON "ModelVersion"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelVersion_modelId_name_key" ON "ModelVersion"("modelId", "name");

-- CreateIndex
CREATE INDEX "ApiKey_userId_idx" ON "ApiKey"("userId");

-- CreateIndex
CREATE INDEX "ApiKey_projectId_idx" ON "ApiKey"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_userId_name_key" ON "ApiKey"("userId", "name");

-- CreateIndex
CREATE INDEX "Dataset_projectId_idx" ON "Dataset"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_projectId_name_key" ON "Dataset"("projectId", "name");

-- CreateIndex
CREATE INDEX "Sample_datasetId_idx" ON "Sample"("datasetId");

-- CreateIndex
CREATE INDEX "PromptTemplate_projectId_idx" ON "PromptTemplate"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_projectId_name_key" ON "PromptTemplate"("projectId", "name");

-- CreateIndex
CREATE INDEX "Metric_projectId_idx" ON "Metric"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Metric_projectId_name_key" ON "Metric"("projectId", "name");

-- CreateIndex
CREATE INDEX "EvaluationPlan_projectId_idx" ON "EvaluationPlan"("projectId");

-- CreateIndex
CREATE INDEX "EvaluationPlan_modelVersionId_idx" ON "EvaluationPlan"("modelVersionId");

-- CreateIndex
CREATE INDEX "EvaluationPlan_datasetId_idx" ON "EvaluationPlan"("datasetId");

-- CreateIndex
CREATE INDEX "EvaluationPlan_promptTemplateId_idx" ON "EvaluationPlan"("promptTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationPlan_projectId_name_key" ON "EvaluationPlan"("projectId", "name");

-- CreateIndex
CREATE INDEX "EvaluationRun_planId_idx" ON "EvaluationRun"("planId");

-- CreateIndex
CREATE INDEX "EvaluationRun_createdById_idx" ON "EvaluationRun"("createdById");

-- CreateIndex
CREATE INDEX "EvaluationRun_status_idx" ON "EvaluationRun"("status");

-- CreateIndex
CREATE INDEX "RunCase_runId_idx" ON "RunCase"("runId");

-- CreateIndex
CREATE INDEX "RunCase_sampleId_idx" ON "RunCase"("sampleId");

-- CreateIndex
CREATE INDEX "RunCase_status_idx" ON "RunCase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RunCase_runId_sampleId_key" ON "RunCase"("runId", "sampleId");

-- CreateIndex
CREATE INDEX "MetricResult_metricId_idx" ON "MetricResult"("metricId");

-- CreateIndex
CREATE INDEX "MetricResult_runCaseId_idx" ON "MetricResult"("runCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "MetricResult_metricId_runCaseId_key" ON "MetricResult"("metricId", "runCaseId");

-- CreateIndex
CREATE INDEX "EvaluationPlanMetric_metricId_idx" ON "EvaluationPlanMetric"("metricId");
