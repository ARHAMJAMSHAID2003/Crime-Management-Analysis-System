const express = require("express");
const {
  getAllSuspects,
  getSuspect,
  addSuspect,
  updateSuspectHandler,
  deleteSuspectHandler,
  arrestSuspect,
} = require("../controllers/suspectController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Officer only routes
router.get("/suspects", authMiddleware, requireOfficer, getAllSuspects);
router.get("/suspects/:id", authMiddleware, requireOfficer, getSuspect);
router.post("/suspects", authMiddleware, requireOfficer, addSuspect);
router.put("/suspects/:id", authMiddleware, requireOfficer, updateSuspectHandler);
router.delete("/suspects/:id", authMiddleware, requireOfficer, deleteSuspectHandler);
router.post("/suspects/:id/arrest", authMiddleware, requireOfficer, arrestSuspect);

module.exports = router;

