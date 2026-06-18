import { Router } from "express";
import twilio from "twilio";
import { db, profilesTable, subjectRecordsTable, parentStudentTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error("Twilio credentials not configured");
  return twilio(sid, token);
}

function getBaseUrl(req: any): string {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) return `https://${domains.split(",")[0]}`;
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  if (devDomain) return `https://${devDomain}`;
  return `${req.protocol}://${req.get("host")}`;
}

// TwiML for the main English message with IVR
// NOTE: Twilio has NO free built-in TTS for Kannada (neither alice nor Polly support kn-IN).
// The Google Neural TTS add-on is required. So the IVR offers English + Hindi only.
// Kannada is delivered via WhatsApp (which uses text directly — no TTS needed).
// Twilio fetches TwiML via POST by default from calls.create() — must accept both GET and POST
router.all("/twiml", (req, res) => {
  res.setHeader("Content-Type", "text/xml");
  const studentName = String(req.query.studentName ?? "the student");
  const usn = String(req.query.usn ?? "");
  const branch = String(req.query.branch ?? "Computer Science");
  const base = getBaseUrl(req);

  // Build URLs — encode & as &amp; for XML attribute safety
  const qs = `studentName=${encodeURIComponent(studentName)}&amp;usn=${encodeURIComponent(usn)}&amp;branch=${encodeURIComponent(branch)}`;
  const langUrl = `${base}/api/alerts/twiml/language?${qs}`;
  const repeatUrl = `${base}/api/alerts/twiml?${qs}`;

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="${langUrl}" method="POST" timeout="12">
    <Say language="en-IN" voice="Polly.Aditi">
      Greetings from R N S Institute of Technology, Bengaluru.
      This is an automated notification for the parents of ${studentName},
      from the ${branch} department.
      Your child's current classroom attendance has dropped below 75 percent,
      and internal assessment marks are below 60 percent.
      Please take immediate corrective measures.
      If this situation continues, you will be formally summoned to the college
      for a mandatory meeting with the branch proctor and Head of Department.
      For this message in Hindi, press 1.
      To repeat this message in English, press 0.
    </Say>
  </Gather>
  <Redirect method="GET">${repeatUrl}</Redirect>
</Response>`);
});

// TwiML digit handler — Twilio POSTs here when user presses a key
router.post("/twiml/language", (req, res) => {
  res.setHeader("Content-Type", "text/xml");
  const digit = String(req.body?.Digits ?? req.query?.Digits ?? "");
  const studentName = String(req.query.studentName ?? "the student");
  const usn = String(req.query.usn ?? "");
  const branch = String(req.query.branch ?? "Computer Science");
  const base = getBaseUrl(req);
  const qs = `studentName=${encodeURIComponent(studentName)}&amp;usn=${encodeURIComponent(usn)}&amp;branch=${encodeURIComponent(branch)}`;
  const repeatUrl = `${base}/api/alerts/twiml?${qs}`;

  if (digit === "1") {
    // Hindi — Polly.Aditi fully supports hi-IN
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">
    आर एन एस इंस्टीट्यूट ऑफ टेक्नोलॉजी, बेंगलुरु की ओर से अभिवादन।
    ${studentName} के माता-पिता को यह स्वचालित सूचना है।
    आपके बच्चे की कक्षा में उपस्थिति 75 प्रतिशत से कम है,
    और आंतरिक मूल्यांकन के अंक 60 प्रतिशत से कम हैं।
    कृपया तत्काल सुधारात्मक कदम उठाएं।
    यदि यह स्थिति जारी रही, तो आपको कॉलेज बुलाया जाएगा
    और शैक्षिक परामर्श शुरू किया जाएगा।
    आपको व्हाट्सऐप पर कन्नड़ में भी यह संदेश भेजा गया है।
    धन्यवाद।
  </Say>
  <Hangup/>
</Response>`);
  } else if (digit === "0") {
    // Repeat English
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect method="GET">${repeatUrl}</Redirect>
</Response>`);
  } else {
    // Any other key — thank and hang up
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="en-IN" voice="Polly.Aditi">
    Thank you for listening. A detailed message with Kannada and Hindi text has been sent to your WhatsApp. Goodbye.
  </Say>
  <Hangup/>
</Response>`);
  }
});

// Trigger a voice call
router.post("/call", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { studentId, phone } = req.body as { studentId: number; phone: string };
  if (!studentId || !phone) return res.status(400).json({ error: "studentId and phone required" });

  try {
    const client = getTwilioClient();
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) return res.status(500).json({ error: "TWILIO_PHONE_NUMBER not configured" });

    const [student] = await db.select().from(profilesTable).where(eq(profilesTable.id, studentId));
    if (!student) return res.status(404).json({ error: "Student not found" });

    const base = getBaseUrl(req);
    const twimlUrl = `${base}/api/alerts/twiml?studentName=${encodeURIComponent(student.name)}&usn=${encodeURIComponent(student.usn ?? "")}&branch=${encodeURIComponent(student.branch ?? "Computer Science")}`;
    const toNumber = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

    const call = await client.calls.create({ url: twimlUrl, to: toNumber, from });
    return res.json({ success: true, callSid: call.sid, message: `Call initiated to ${toNumber}` });
  } catch (err: any) {
    req.log.error({ err }, "Failed to initiate call");
    return res.status(500).json({ error: err.message ?? "Failed to initiate call" });
  }
});

// Bulk calls — trigger calls to multiple targets at once
router.post("/call/bulk", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { targets } = req.body as { targets: { studentId: number; phone: string; label: string }[] };
  if (!targets?.length) return res.status(400).json({ error: "targets array required" });

  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) return res.status(500).json({ error: "TWILIO_PHONE_NUMBER not configured" });
  const base = getBaseUrl(req);

  const results = await Promise.allSettled(
    targets.map(async ({ studentId, phone, label }) => {
      const [student] = await db.select().from(profilesTable).where(eq(profilesTable.id, studentId));
      if (!student) throw new Error(`Student ${studentId} not found`);
      const twimlUrl = `${base}/api/alerts/twiml?studentName=${encodeURIComponent(student.name)}&usn=${encodeURIComponent(student.usn ?? "")}&branch=${encodeURIComponent(student.branch ?? "Computer Science")}`;
      const toNumber = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
      const call = await client.calls.create({ url: twimlUrl, to: toNumber, from });
      return { label, phone: toNumber, callSid: call.sid };
    })
  );

  const successes = results.filter((r) => r.status === "fulfilled").map((r) => (r as any).value);
  const failures = results.filter((r) => r.status === "rejected").map((r) => ({ error: (r as any).reason?.message }));
  return res.json({ successes, failures, total: targets.length });
});

// Send WhatsApp alert message
router.post("/whatsapp", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { studentId, phone, parentName, attendance, avgMarks } = req.body as {
    studentId: number; phone: string; parentName?: string; attendance?: number; avgMarks?: number;
  };
  if (!studentId || !phone) return res.status(400).json({ error: "studentId and phone required" });

  try {
    const client = getTwilioClient();
    const rawFrom = process.env.TWILIO_WHATSAPP_FROM ?? "+14155238886";
    const fromClean = rawFrom.replace(/^whatsapp:/i, "").replace(/\s/g, "");
    const from = `whatsapp:${fromClean.startsWith("+") ? fromClean : `+${fromClean}`}`;

    const [student] = await db.select().from(profilesTable).where(eq(profilesTable.id, studentId));
    if (!student) return res.status(404).json({ error: "Student not found" });

    const attStr = attendance != null ? `${attendance.toFixed(1)}%` : "< 75%";
    const marksStr = avgMarks != null ? `${avgMarks.toFixed(1)}%` : "< 60%";
    const pName = parentName ?? "Parent/Guardian";
    const toNumber = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

    const messageBody = buildWhatsAppMessage(pName, student.name, student.usn ?? "N/A", attStr, marksStr);
    const message = await client.messages.create({ from, to: `whatsapp:${toNumber}`, body: messageBody });
    return res.json({ success: true, messageSid: message.sid, message: `WhatsApp sent to ${toNumber}` });
  } catch (err: any) {
    req.log.error({ err }, "Failed to send WhatsApp");
    return res.status(500).json({ error: err.message ?? "Failed to send WhatsApp" });
  }
});

// Bulk WhatsApp
router.post("/whatsapp/bulk", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { targets } = req.body as {
    targets: { studentId: number; phone: string; parentName?: string; attendance?: number; avgMarks?: number; label: string }[];
  };
  if (!targets?.length) return res.status(400).json({ error: "targets array required" });

  const client = getTwilioClient();
  const rawFrom = process.env.TWILIO_WHATSAPP_FROM ?? "+14155238886";
  const fromClean = rawFrom.replace(/^whatsapp:/i, "").replace(/\s/g, "");
  const from = `whatsapp:${fromClean.startsWith("+") ? fromClean : `+${fromClean}`}`;

  const results = await Promise.allSettled(
    targets.map(async ({ studentId, phone, parentName, attendance, avgMarks, label }) => {
      const [student] = await db.select().from(profilesTable).where(eq(profilesTable.id, studentId));
      if (!student) throw new Error(`Student ${studentId} not found`);
      const attStr = attendance != null ? `${attendance.toFixed(1)}%` : "< 75%";
      const marksStr = avgMarks != null ? `${avgMarks.toFixed(1)}%` : "< 60%";
      const toNumber = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
      const body = buildWhatsAppMessage(parentName ?? "Parent/Guardian", student.name, student.usn ?? "N/A", attStr, marksStr);
      const msg = await client.messages.create({ from, to: `whatsapp:${toNumber}`, body });
      return { label, phone: toNumber, messageSid: msg.sid };
    })
  );

  const successes = results.filter((r) => r.status === "fulfilled").map((r) => (r as any).value);
  const failures = results.filter((r) => r.status === "rejected").map((r) => ({ error: (r as any).reason?.message }));
  return res.json({ successes, failures, total: targets.length });
});

function buildWhatsAppMessage(parentName: string, studentName: string, usn: string, attStr: string, marksStr: string): string {
  return `🚨 *RNSIT Student Alert* 🚨
Dear *${parentName}*,

📋 *Student Details:*
👤 Name       : *${studentName}*
🎓 USN         : *${usn}*
📅 Attendance : *${attStr}*  _(Required: 75%)_
📝 Avg CIE    : *${marksStr}*  _(Required: 60%)_

――――――――――――――――――――――――――――――

🇬🇧 *English:*
Your ward's attendance and/or grades are *below the required standard*. Immediate improvement is necessary. If attendance does not improve, you will be summoned to college and *educational counseling* will be initiated.

🟠 *ಕನ್ನಡ:*
ನಿಮ್ಮ ಮಗು *${studentName}* ರ ಹಾಜರಾತಿ *${attStr}* ಮತ್ತು ಸರಾಸರಿ ಅಂಕ *${marksStr}* ಆಗಿದ್ದು, ಇವು ಅಗತ್ಯ ಮಾನದಂಡಕ್ಕಿಂತ ಕಡಿಮೆ ಇವೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮಗು ನಿಯಮಿತವಾಗಿ ತರಗತಿಗೆ ಬರುವಂತೆ ನೋಡಿಕೊಳ್ಳಿ. ಹಾಜರಾತಿ ಸುಧಾರಿಸದಿದ್ದರೆ ನಿಮ್ಮನ್ನು ಕಾಲೇಜಿಗೆ ಕರೆಯಲಾಗುವುದು ಮತ್ತು ಶೈಕ್ಷಣಿಕ ಸಮಾಲೋಚನೆ ಪ್ರಾರಂಭಿಸಲಾಗುವುದು.

🔵 *हिंदी:*
आपके वार्ड *${studentName}* की उपस्थिति *${attStr}* है और औसत अंक *${marksStr}* हैं — जो आवश्यक मानक से कम हैं। कृपया सुनिश्चित करें कि आपका वार्ड नियमित रूप से कक्षाओं में उपस्थित रहे। यदि सुधार नहीं होता, तो आपको *कॉलेज बुलाया जाएगा* और शैक्षिक परामर्श शुरू किया जाएगा।

――――――――――――――――――――――――――――――
📞 *RNSIT Student Welfare Office*
🌐 R N S Institute of Technology, Bengaluru
_This is an automated system notification._`;
}

// Get at-risk students (< 75% attendance OR avg CIE < 60%)
router.get("/at-risk", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const [faculty] = await db.select().from(profilesTable).where(eq(profilesTable.id, userId));
  if (!faculty || faculty.role !== "faculty") return res.status(403).json({ error: "Faculty only" });

  const students = await db.select().from(profilesTable).where(eq(profilesTable.proctorId, userId));

  const atRisk = [];
  for (const student of students) {
    const subjects = await db.select().from(subjectRecordsTable).where(eq(subjectRecordsTable.studentId, student.id));
    if (subjects.length === 0) continue;

    const avgAttendance = subjects.reduce((s, r) => s + Number(r.attendance), 0) / subjects.length;
    const avgCie = subjects.reduce((s, r) => s + ((Number(r.cie1 ?? 0) + Number(r.cie2 ?? 0)) / 2), 0) / subjects.length;
    const avgCiePct = (avgCie / 20) * 100;

    if (avgAttendance < 75 || avgCiePct < 60) {
      const parentLinks = await db.select().from(parentStudentTable).where(eq(parentStudentTable.studentId, student.id));
      let parentInfo = null;
      if (parentLinks.length > 0) {
        const [parent] = await db.select().from(profilesTable).where(eq(profilesTable.id, parentLinks[0]!.parentId));
        if (parent) parentInfo = { id: parent.id, name: parent.name, phone: parent.phone };
      }

      atRisk.push({
        id: student.id, name: student.name, usn: student.usn, section: student.section,
        branch: student.branch, phone: student.phone, semester: student.semester,
        avgAttendance: Math.round(avgAttendance * 10) / 10,
        avgCiePct: Math.round(avgCiePct * 10) / 10,
        avgCie: Math.round(avgCie * 10) / 10,
        lowAttendance: avgAttendance < 75,
        lowMarks: avgCiePct < 60,
        parent: parentInfo,
      });
    }
  }

  return res.json(atRisk);
});

export default router;
