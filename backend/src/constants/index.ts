export enum UserRole {
  USER = 'USER',
  QUIZ_MASTER = 'QUIZ_MASTER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export enum GameState {
  WAITING = 'WAITING',
  STARTING = 'STARTING',
  QUESTION_ACTIVE = 'QUESTION_ACTIVE',
  QUESTION_ENDED = 'QUESTION_ENDED',
  SCORE_CALCULATION = 'SCORE_CALCULATION',
  LEADERBOARD = 'LEADERBOARD',
  NEXT_QUESTION = 'NEXT_QUESTION',
  FINISHED = 'FINISHED',
  ABANDONED = 'ABANDONED',
}

export enum MatchMode {
  QUICK_MATCH = 'QUICK_MATCH',
  ONE_V_ONE = '1V1',
  MULTIPLAYER = 'MULTIPLAYER',
  PRIVATE_ROOM = 'PRIVATE_ROOM',
  EXAM_ARENA = 'EXAM_ARENA',
}

export enum QuizDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum ExamCategory {
  GENERAL = 'GENERAL',
  ECONOMICS = 'ECONOMICS',
  GATE = 'GATE',
  SSC = 'SSC',
  UPSC = 'UPSC',
  BANKING = 'BANKING',
  RAILWAYS = 'RAILWAYS',
  CUSTOM = 'CUSTOM',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  MULTIPLE_CORRECT = 'MULTIPLE_CORRECT',
  NUMERICAL = 'NUMERICAL',
  IMAGE_BASED = 'IMAGE_BASED',
  AUDIO_BASED = 'AUDIO_BASED',
  MATCH_FOLLOWING = 'MATCH_FOLLOWING',
  SEQUENCE = 'SEQUENCE',
  ASSERTION_REASON = 'ASSERTION_REASON',
  CASE_BASED = 'CASE_BASED',
}

export enum QuizVisibility {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  CLUB = 'CLUB',
  PRIVATE = 'PRIVATE',
}

export const SCORING_RULES = {
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

export const LEVEL_CONFIG = {
  BASE_XP: 100,
  EXPONENT: 1.5,
  calculateLevel: (xp: number): number => {
    if (xp <= 0) return 1;
    return Math.floor(Math.pow(xp / 100, 1 / 1.5)) + 1;
  },
  xpForNextLevel: (currentLevel: number): number => {
    return Math.round(100 * Math.pow(currentLevel, 1.5));
  },
};

export const SOCKET_EVENTS = {
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
