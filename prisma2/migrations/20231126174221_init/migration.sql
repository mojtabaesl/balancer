-- CreateTable
CREATE TABLE "Cdn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "apiToken" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "MiddleDomain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "dailyTrafficLimit" INTEGER NOT NULL DEFAULT 0,
    "dailyTraffic" INTEGER NOT NULL DEFAULT 0,
    "balancerId" INTEGER,
    CONSTRAINT "MiddleDomain_balancerId_fkey" FOREIGN KEY ("balancerId") REFERENCES "Balancer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RootDomain" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "balancerId" INTEGER,
    CONSTRAINT "RootDomain_balancerId_fkey" FOREIGN KEY ("balancerId") REFERENCES "Balancer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Balancer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cdnId" INTEGER,
    CONSTRAINT "Balancer_cdnId_fkey" FOREIGN KEY ("cdnId") REFERENCES "Cdn" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cdn_email_key" ON "Cdn"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cdn_apiToken_key" ON "Cdn"("apiToken");

-- CreateIndex
CREATE UNIQUE INDEX "MiddleDomain_name_key" ON "MiddleDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RootDomain_name_key" ON "RootDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Balancer_name_key" ON "Balancer"("name");
