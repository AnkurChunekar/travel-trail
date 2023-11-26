const express = require("express");

// internal
const viewController = require("../controllers/viewController");

const router = express.Router();

router.get("/", viewController.getOverview);
router.get("/tour", viewController.getTour);

module.exports = router;
