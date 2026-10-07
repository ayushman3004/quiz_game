"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const govtExamController_1 = require("../controllers/govtExamController");
const router = (0, express_1.Router)();
router.get('/categories', govtExamController_1.getExamCategories);
router.get('/:category/mock-tests', govtExamController_1.getExamMockTests);
exports.default = router;
