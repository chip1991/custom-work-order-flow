-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "processId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" TEXT DEFAULT '{}',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Service_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT,
    "processId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assigneeId" TEXT,
    "formData" TEXT DEFAULT '{}',
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ticket_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodeKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "input" TEXT DEFAULT '{}',
    "output" TEXT DEFAULT '{}',
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TicketTask_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "taskId" TEXT,
    "userId" TEXT,
    "level" TEXT NOT NULL DEFAULT 'info',
    "action" TEXT,
    "message" TEXT NOT NULL,
    "meta" TEXT DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TicketLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "TicketTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TicketLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Service_processId_idx" ON "Service"("processId");

-- CreateIndex
CREATE INDEX "Service_createdById_idx" ON "Service"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Service_processId_name_key" ON "Service"("processId", "name");

-- CreateIndex
CREATE INDEX "Ticket_processId_idx" ON "Ticket"("processId");

-- CreateIndex
CREATE INDEX "Ticket_serviceId_idx" ON "Ticket"("serviceId");

-- CreateIndex
CREATE INDEX "Ticket_createdById_idx" ON "Ticket"("createdById");

-- CreateIndex
CREATE INDEX "Ticket_assigneeId_idx" ON "Ticket"("assigneeId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNo_key" ON "Ticket"("ticketNo");

-- CreateIndex
CREATE INDEX "TicketTask_ticketId_idx" ON "TicketTask"("ticketId");

-- CreateIndex
CREATE INDEX "TicketTask_nodeKey_idx" ON "TicketTask"("nodeKey");

-- CreateIndex
CREATE INDEX "TicketTask_status_idx" ON "TicketTask"("status");

-- CreateIndex
CREATE INDEX "TicketLog_ticketId_idx" ON "TicketLog"("ticketId");

-- CreateIndex
CREATE INDEX "TicketLog_taskId_idx" ON "TicketLog"("taskId");

-- CreateIndex
CREATE INDEX "TicketLog_userId_idx" ON "TicketLog"("userId");

-- CreateIndex
CREATE INDEX "TicketLog_createdAt_idx" ON "TicketLog"("createdAt");
