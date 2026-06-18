import { Router, type Request, type Response } from "express";
import { db, profilesTable, academicsTable, parentStudentTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

export interface ParentAlert {
  id: string;
  studentId: number;
  studentName: string;
  type: "attendance_critical" | "attendance_warning" | "sgpa_critical" | "sgpa_warning";
  message: string;
  severity: "critical" | "warning";
  value: number;
  threshold: number;
  timestamp: string;
}

async function getAlertsForParent(parentId: number): Promise<ParentAlert[]> {
  const links = await db.select().from(parentStudentTable).where(eq(parentStudentTable.parentId, parentId));
  const alerts: ParentAlert[] = [];

  for (const link of links) {
    const [childProfile] = await db
      .select({ id: profilesTable.id, name: profilesTable.name })
      .from(profilesTable)
      .where(eq(profilesTable.id, link.studentId))
      .limit(1);

    const [academics] = await db
      .select()
      .from(academicsTable)
      .where(eq(academicsTable.studentId, link.studentId))
      .limit(1);

    if (!childProfile || !academics) continue;

    const att = Number(academics.overallAttendance);
    const sgpa = Number(academics.sgpa);
    const now = new Date().toISOString();

    if (att < 75) {
      alerts.push({
        id: `att-crit-${link.studentId}`,
        studentId: link.studentId,
        studentName: childProfile.name,
        type: "attendance_critical",
        message: `${childProfile.name}'s attendance is ${att.toFixed(1)}% — below 75%. Immediate action required.`,
        severity: "critical",
        value: att,
        threshold: 75,
        timestamp: now,
      });
    } else if (att < 85) {
      alerts.push({
        id: `att-warn-${link.studentId}`,
        studentId: link.studentId,
        studentName: childProfile.name,
        type: "attendance_warning",
        message: `${childProfile.name}'s attendance is ${att.toFixed(1)}% — below the 85% safe threshold.`,
        severity: "warning",
        value: att,
        threshold: 85,
        timestamp: now,
      });
    }

    if (sgpa < 5) {
      alerts.push({
        id: `sgpa-crit-${link.studentId}`,
        studentId: link.studentId,
        studentName: childProfile.name,
        type: "sgpa_critical",
        message: `${childProfile.name}'s SGPA is ${sgpa.toFixed(2)} — below 5.0. Academic support needed.`,
        severity: "critical",
        value: sgpa,
        threshold: 5,
        timestamp: now,
      });
    } else if (sgpa < 7) {
      alerts.push({
        id: `sgpa-warn-${link.studentId}`,
        studentId: link.studentId,
        studentName: childProfile.name,
        type: "sgpa_warning",
        message: `${childProfile.name}'s SGPA is ${sgpa.toFixed(2)} — below 7.0. Consider extra support.`,
        severity: "warning",
        value: sgpa,
        threshold: 7,
        timestamp: now,
      });
    }
  }

  return alerts;
}

// REST endpoint: get current alerts snapshot
router.get("/", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const [profile] = await db
    .select({ role: profilesTable.role })
    .from(profilesTable)
    .where(eq(profilesTable.id, userId))
    .limit(1);

  if (!profile || profile.role !== "parent") {
    return res.status(403).json({ error: "Parent access only" });
  }

  const alerts = await getAlertsForParent(userId);
  return res.json({ alerts });
});

// Active SSE connections: parentId → set of response objects
const sseClients = new Map<number, Set<Response>>();

// Broadcast updated alerts to a specific parent
async function broadcastToParent(parentId: number) {
  const clients = sseClients.get(parentId);
  if (!clients || clients.size === 0) return;

  try {
    const alerts = await getAlertsForParent(parentId);
    const payload = `data: ${JSON.stringify({ alerts, timestamp: new Date().toISOString() })}\n\n`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch {
        clients.delete(client);
      }
    }
  } catch {
    // swallow DB errors — stream will retry on next tick
  }
}

// Global poll: every 30 seconds, push updates to all connected parents
setInterval(() => {
  for (const parentId of sseClients.keys()) {
    broadcastToParent(parentId);
  }
}, 30_000);

// SSE stream endpoint
router.get("/stream", async (req: Request, res: Response) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    res.status(401).end();
    return;
  }

  const [profile] = await db
    .select({ role: profilesTable.role })
    .from(profilesTable)
    .where(eq(profilesTable.id, userId))
    .limit(1);

  if (!profile || profile.role !== "parent") {
    res.status(403).end();
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Register client
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId)!.add(res);

  // Send initial alert payload immediately
  try {
    const alerts = await getAlertsForParent(userId);
    res.write(`data: ${JSON.stringify({ alerts, timestamp: new Date().toISOString() })}\n\n`);
  } catch {
    res.write(`data: ${JSON.stringify({ alerts: [], timestamp: new Date().toISOString() })}\n\n`);
  }

  // Send a keep-alive comment every 15 seconds
  const keepAlive = setInterval(() => {
    try {
      res.write(": keep-alive\n\n");
    } catch {
      clearInterval(keepAlive);
    }
  }, 15_000);

  // Clean up on disconnect
  req.on("close", () => {
    clearInterval(keepAlive);
    const clients = sseClients.get(userId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) sseClients.delete(userId);
    }
  });
});

export default router;
