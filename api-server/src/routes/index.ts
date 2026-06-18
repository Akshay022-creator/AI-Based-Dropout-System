import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profilesRouter from "./profiles";
import academicsRouter from "./academics";
import timetablesRouter from "./timetables";
import resourcesRouter from "./resources";
import grievancesRouter from "./grievances";
import dashboardRouter from "./dashboard";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";
import attendanceRouter from "./attendance";
import scholarshipRouter from "./scholarship";
import alertsRouter from "./alerts";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profiles", profilesRouter);
router.use("/academics", academicsRouter);
router.use("/timetables", timetablesRouter);
router.use("/resources", resourcesRouter);
router.use("/grievances", grievancesRouter);
router.use("/dashboard", dashboardRouter);
router.use("/proctor-messages", messagesRouter);
router.use("/notifications", notificationsRouter);
router.use("/attendance", attendanceRouter);
router.use("/scholarship", scholarshipRouter);
router.use("/alerts", alertsRouter);
router.use("/admin", adminRouter);

export default router;
