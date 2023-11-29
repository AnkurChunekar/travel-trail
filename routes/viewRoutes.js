const express = require("express");

// internal
const viewController = require("../controllers/viewController");

const router = express.Router();

router.get("/", viewController.getOverview);
router.get("/tour/:slug", viewController.getTour);
router.get("/login", viewController.userLogin);

module.exports = router;
