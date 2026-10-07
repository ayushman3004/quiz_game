"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tournamentController_1 = require("../controllers/tournamentController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', tournamentController_1.getTournaments);
router.post('/:id/register', auth_1.authenticate, tournamentController_1.registerForTournament);
exports.default = router;
