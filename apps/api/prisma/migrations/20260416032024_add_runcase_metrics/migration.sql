PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RunCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "errorType" TEXT NOT NULL DEFAULT 'NONE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "latencyMs" INTEGER,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "totalTokens" INTEGER,
    "costUsd" REAL,
    "renderedPrompt" TEXT,
    "modelOutput" TEXT,
    "errorMessage" TEXT,
    "runId" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    CONSTRAINT "RunCase_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvaluationRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RunCase_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RunCase" ("createdAt", "errorMessage", "finishedAt", "id", "modelOutput", "renderedPrompt", "runId", "sampleId", "startedAt", "status", "updatedAt") SELECT "createdAt", "errorMessage", "finishedAt", "id", "modelOutput", "renderedPrompt", "runId", "sampleId", "startedAt", "status", "updatedAt" FROM "RunCase";
DROP TABLE "RunCase";
ALTER TABLE "new_RunCase" RENAME TO "RunCase";
CREATE INDEX "RunCase_runId_idx" ON "RunCase"("runId");
CREATE INDEX "RunCase_sampleId_idx" ON "RunCase"("sampleId");
CREATE INDEX "RunCase_status_idx" ON "RunCase"("status");
CREATE INDEX "RunCase_errorType_idx" ON "RunCase"("errorType");
CREATE UNIQUE INDEX "RunCase_runId_sampleId_key" ON "RunCase"("runId", "sampleId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
