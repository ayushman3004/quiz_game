"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = exports.LEVEL_CONFIG = exports.SCORING_RULES = exports.QuizVisibility = exports.QuestionType = exports.ExamCategory = exports.QuizDifficulty = exports.MatchMode = exports.GameState = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["QUIZ_MASTER"] = "QUIZ_MASTER";
    UserRole["MODERATOR"] = "MODERATOR";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var GameState;
(function (GameState) {
    GameState["WAITING"] = "WAITING";
    GameState["STARTING"] = "STARTING";
    GameState["QUESTION_ACTIVE"] = "QUESTION_ACTIVE";
    GameState["QUESTION_ENDED"] = "QUESTION_ENDED";
    GameState["SCORE_CALCULATION"] = "SCORE_CALCULATION";
    GameState["LEADERBOARD"] = "LEADERBOARD";
    GameState["NEXT_QUESTION"] = "NEXT_QUESTION";
    GameState["FINISHED"] = "FINISHED";
    GameState["ABANDONED"] = "ABANDONED";
})(GameState || (exports.GameState = GameState = {}));
var MatchMode;
(function (MatchMode) {
    MatchMode["QUICK_MATCH"] = "QUICK_MATCH";
    MatchMode["ONE_V_ONE"] = "1V1";
    MatchMode["MULTIPLAYER"] = "MULTIPLAYER";
    MatchMode["PRIVATE_ROOM"] = "PRIVATE_ROOM";
    MatchMode["EXAM_ARENA"] = "EXAM_ARENA";
})(MatchMode || (exports.MatchMode = MatchMode = {}));
var QuizDifficulty;
(function (QuizDifficulty) {
    QuizDifficulty["EASY"] = "EASY";
    QuizDifficulty["MEDIUM"] = "MEDIUM";
    QuizDifficulty["HARD"] = "HARD";
    QuizDifficulty["EXPERT"] = "EXPERT";
})(QuizDifficulty || (exports.QuizDifficulty = QuizDifficulty = {}));
var ExamCategory;
(function (ExamCategory) {
    ExamCategory["GENERAL"] = "GENERAL";
    ExamCategory["ECONOMICS"] = "ECONOMICS";
    ExamCategory["GATE"] = "GATE";
    ExamCategory["SSC"] = "SSC";
    ExamCategory["UPSC"] = "UPSC";
    ExamCategory["BANKING"] = "BANKING";
    ExamCategory["RAILWAYS"] = "RAILWAYS";
    ExamCategory["CUSTOM"] = "CUSTOM";
})(ExamCategory || (exports.ExamCategory = ExamCategory = {}));
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
    QuestionType["TRUE_FALSE"] = "TRUE_FALSE";
    QuestionType["MULTIPLE_CORRECT"] = "MULTIPLE_CORRECT";
    QuestionType["NUMERICAL"] = "NUMERICAL";
    QuestionType["IMAGE_BASED"] = "IMAGE_BASED";
    QuestionType["AUDIO_BASED"] = "AUDIO_BASED";
    QuestionType["MATCH_FOLLOWING"] = "MATCH_FOLLOWING";
    QuestionType["SEQUENCE"] = "SEQUENCE";
    QuestionType["ASSERTION_REASON"] = "ASSERTION_REASON";
    QuestionType["CASE_BASED"] = "CASE_BASED";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
var QuizVisibility;
(function (QuizVisibility) {
    QuizVisibility["PUBLIC"] = "PUBLIC";
    QuizVisibility["FRIENDS"] = "FRIENDS";
    QuizVisibility["CLUB"] = "CLUB";
    QuizVisibility["PRIVATE"] = "PRIVATE";
})(QuizVisibility || (exports.QuizVisibility = QuizVisibility = {}));
exports.SCORING_RULES = {
    BASE_POINTS: 100,
    MAX_SPEED_BONUS: 50,
    MAX_STREAK_BONUS: 25,
    STREAK_POINT_STEP: 5,
    WRONG_ANSWER_POINTS: 0,
    COUNTDOWN_START_SEC: 3,
    DEFAULT_QUESTION_TIME_SEC: 15,
    RECONNECT_GRACE_PERIOD_SEC: 30,
    // Tiered speed bonus from PRD Section 15.2
    SPEED_TIERS: [
        { maxSec: 2, bonus: 80 },
        { maxSec: 4, bonus: 60 },
        { maxSec: 6, bonus: 40 },
        { maxSec: 8, bonus: 20 },
        { maxSec: 10, bonus: 10 },
    ],
    // Difficulty multipliers from PRD Section 15.3
    DIFFICULTY_MULTIPLIER: {
        EASY: 1.0,
        MEDIUM: 1.25,
        HARD: 1.5,
        EXPERT: 2.0,
    },
    // Streak bonuses from PRD Section 15.4
    STREAK_PERCENT_BONUS: {
        3: 0.05,
        5: 0.10,
        10: 0.15,
    },
};
exports.LEVEL_CONFIG = {
    BASE_XP: 100,
    EXPONENT: 1.5,
    calculateLevel: (xp) => {
        if (xp <= 0)
            return 1;
        return Math.floor(Math.pow(xp / 100, 1 / 1.5)) + 1;
    },
    xpForNextLevel: (currentLevel) => {
        return Math.round(100 * Math.pow(currentLevel, 1.5));
    },
};
exports.SOCKET_EVENTS = {
    // Client -> Server
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    PLAYER_READY: 'player_ready',
    START_GAME: 'start_game',
    SUBMIT_ANSWER: 'submit_answer',
    REQUEST_REMATCH: 'request_rematch',
    MATCHMAKING_QUEUE: 'matchmaking_queue',
    MATCHMAKING_CANCEL: 'matchmaking_cancel',
    // Server -> Client
    ROOM_UPDATED: 'room_updated',
    MATCHMAKING_FOUND: 'matchmaking_found',
    GAME_STARTED: 'game_started',
    QUESTION_STARTED: 'question_started',
    QUESTION_ENDED: 'question_ended',
    SCORE_UPDATED: 'score_updated',
    LEADERBOARD_UPDATED: 'leaderboard_updated',
    GAME_FINISHED: 'game_finished',
    PLAYER_JOINED: 'player_joined',
    PLAYER_LEFT: 'player_left',
    PLAYER_DISCONNECTED: 'player_disconnected',
    PLAYER_RECONNECTED: 'player_reconnected',
    ERROR_EVENT: 'error_event',
};
