-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "siteName" TEXT NOT NULL DEFAULT 'Report System',
    "adminEmail" TEXT,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "announcementActive" BOOLEAN NOT NULL DEFAULT false,
    "announcementText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
