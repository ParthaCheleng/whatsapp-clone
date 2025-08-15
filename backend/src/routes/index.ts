// backend/src/routes/index.ts
import { Router } from "express";
import conversations from "./conversations";
import messages from "./messages";

const router = Router();

router.use("/conversations", conversations);
router.use("/messages", messages);

export default router;
