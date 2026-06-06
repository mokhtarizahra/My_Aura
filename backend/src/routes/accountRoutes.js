import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import { deactivateAccount,
         reactivateAccount, deleteAccount } from "../controllers/accountController.js";

const router = express.Router();

router.put("/deactivate", protect , deactivateAccount);
router.put("/reactivate", protect , reactivateAccount);
router.delete("/", protect , deleteAccount);

export default router;
