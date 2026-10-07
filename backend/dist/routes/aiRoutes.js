"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/generate-quiz', auth_1.authenticate, aiController_1.generateAiQuiz);
exports.default = router;
