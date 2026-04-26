const express = require("express");
const {
  getAllInvestigations,
  getInvestigation,
  addInvestigation,
  updateInvestigationHandler,
  linkCrime,
  deleteInvestigationHandler,
  assignInvestigation,
  getTeamHandler,
  addTeamMemberHandler,
  removeTeamMemberHandler,
} = require("../controllers/investigationController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Officer only routes
router.get("/investigations", authMiddleware, requireOfficer, getAllInvestigations);
router.get("/investigations/:id", authMiddleware, requireOfficer, getInvestigation);
router.post("/investigations", authMiddleware, requireOfficer, addInvestigation);
router.put("/investigations/:id", authMiddleware, requireOfficer, updateInvestigationHandler);
router.post("/investigations/:id/assign", authMiddleware, requireOfficer, assignInvestigation);
router.post("/investigations/:id/crimes", authMiddleware, requireOfficer, linkCrime);
router.get("/investigations/:id/team", authMiddleware, requireOfficer, getTeamHandler);
router.post("/investigations/:id/team", authMiddleware, requireOfficer, addTeamMemberHandler);
router.delete("/investigations/:id/team/:officerId", authMiddleware, requireOfficer, removeTeamMemberHandler);
router.delete("/investigations/:id", authMiddleware, requireOfficer, deleteInvestigationHandler);

module.exports = router;

