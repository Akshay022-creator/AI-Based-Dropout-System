import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.email, email))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  (req.session as any).userId = user.id;

  const { passwordHash, ...safeUser } = user;
  return res.json({ user: safeUser, message: "Login successful" });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

router.get("/me", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const [user] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, userId))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const { passwordHash, ...safeUser } = user;
  return res.json(safeUser);
});

export default router;
