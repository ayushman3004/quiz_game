import { Server as SocketIOServer, Socket } from 'socket.io';
import redisClient from '../config/redis';
import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { Match } from '../models/Match';
import { MatchResult } from '../models/MatchResult';
import { User } from '../models/User';
import { ScoringService } from '../services/scoringService';
import { MatchmakingService, QueuedPlayer } from '../services/matchmakingService';
import { verifyToken, TokenPayload } from '../utils/token';
import { GameState, MatchMode, SCORING_RULES, SOCKET_EVENTS, LEVEL_CONFIG } from '../constants';
import { Types } from 'mongoose';

interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

interface RoomPlayer {
  userId: string;
  socketId: string;
  displayName: string;
  avatarUrl: string;
  score: number;
  streak: number;
  isReady: boolean;
  isConnected: boolean;
  isHost: boolean;
  correctCount: number;
  wrongCount: number;
  totalTimeMs: number;
}

interface ActiveRoom {
  roomCode: string;
  quizId: string;
  hostId: string;
  mode: MatchMode;
  status: GameState;
  currentQIndex: number;
  totalQuestions: number;
  qStartedAt: number;
  qEndsAt: number;
  timerHandle?: NodeJS.Timeout;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{ id: string; text: string }>;
    correctOptionId: string;
    explanation: string;
    durationSec: number;
  }>;
  players: Map<string, RoomPlayer>;
  answersForCurrentQ: Map<string, { optionId: string; timeTakenMs: number; isCorrect: boolean; points: number }>;
}

const activeRooms = new Map<string, ActiveRoom>();
const userToRoomMap = new Map<string, string>(); // userId -> roomCode

export const initializeGameSocket = (io: SocketIOServer) => {
  // Authentication middleware for socket connections
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      // Allow guest connections for exploration or throw
      socket.user = {
        userId: `guest_${socket.id.substring(0, 6)}`,
        role: 'USER' as any,
        email: 'guest@quiz.local',
      };
      return next();
    }

    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch {
      // Fallback guest user for seamless gameplay demo
      socket.user = {
        userId: `guest_${socket.id.substring(0, 6)}`,
        role: 'USER' as any,
        email: 'guest@quiz.local',
      };
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId || socket.id;

    // 1. Matchmaking Queue Request
    socket.on(SOCKET_EVENTS.MATCHMAKING_QUEUE, async (data: { category: string; difficulty: string }) => {
      try {
        const user = await User.findById(userId);
        const player: QueuedPlayer = {
          userId,
          socketId: socket.id,
          displayName: user?.displayName || `Player_${userId.substring(0, 4)}`,
          avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
          rating: user?.rating || 1200,
          category: data.category || 'General',
          difficulty: data.difficulty || 'MEDIUM',
          queuedAt: Date.now(),
        };

        await MatchmakingService.addToQueue(player);

        // Check if an opponent is waiting in the same category & difficulty
        const match = await MatchmakingService.findMatch(player.category, player.difficulty);
        if (match) {
          const [p1, p2] = match;
          const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

          // Find or pick a quiz matching category
          let quiz = await Quiz.findOne({
            category: { $regex: new RegExp(player.category, 'i') },
            isApproved: true,
          });

          if (!quiz) {
            quiz = await Quiz.findOne({ isApproved: true });
          }

          if (quiz) {
            const questions = await Question.find({ quizId: quiz._id }).limit(5);

            const room: ActiveRoom = {
              roomCode,
              quizId: quiz._id.toString(),
              hostId: p1.userId,
              mode: MatchMode.QUICK_MATCH,
              status: GameState.WAITING,
              currentQIndex: 0,
              totalQuestions: questions.length,
              qStartedAt: 0,
              qEndsAt: 0,
              questions: questions.map((q) => ({
                id: q._id.toString(),
                text: q.questionText,
                options: q.options,
                correctOptionId: q.correctOptionId,
                explanation: q.explanation,
                durationSec: q.durationSec || 15,
              })),
              players: new Map(),
              answersForCurrentQ: new Map(),
            };

            const roomP1: RoomPlayer = {
              userId: p1.userId,
              socketId: p1.socketId,
              displayName: p1.displayName,
              avatarUrl: p1.avatarUrl,
              score: 0,
              streak: 0,
              isReady: true,
              isConnected: true,
              isHost: true,
              correctCount: 0,
              wrongCount: 0,
              totalTimeMs: 0,
            };

            const roomP2: RoomPlayer = {
              userId: p2.userId,
              socketId: p2.socketId,
              displayName: p2.displayName,
              avatarUrl: p2.avatarUrl,
              score: 0,
              streak: 0,
              isReady: true,
              isConnected: true,
              isHost: false,
              correctCount: 0,
              wrongCount: 0,
              totalTimeMs: 0,
            };

            room.players.set(p1.userId, roomP1);
            room.players.set(p2.userId, roomP2);

            activeRooms.set(roomCode, room);
            userToRoomMap.set(p1.userId, roomCode);
            userToRoomMap.set(p2.userId, roomCode);

            // Join socket rooms
            io.sockets.sockets.get(p1.socketId)?.join(roomCode);
            io.sockets.sockets.get(p2.socketId)?.join(roomCode);

            // Notify both players
            io.to(p1.socketId).emit(SOCKET_EVENTS.MATCHMAKING_FOUND, { roomCode, opponent: roomP2 });
            io.to(p2.socketId).emit(SOCKET_EVENTS.MATCHMAKING_FOUND, { roomCode, opponent: roomP1 });

            broadcastRoomUpdate(io, roomCode);

            // Start countdown immediately for quick match
            setTimeout(() => {
              startGame(io, roomCode);
            }, 1500);
          }
        }
      } catch (err) {
        socket.emit(SOCKET_EVENTS.ERROR_EVENT, { message: 'Matchmaking error' });
      }
    });

    // 2. Cancel Matchmaking
    socket.on(SOCKET_EVENTS.MATCHMAKING_CANCEL, async () => {
      await MatchmakingService.removeFromAllQueues(userId);
    });

    // 3. Join / Create Private Room
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data: { roomCode: string; quizId?: string }) => {
      try {
        const { roomCode, quizId } = data;
        const normalizedCode = roomCode.toUpperCase();
        let room = activeRooms.get(normalizedCode);

        const user = await User.findById(userId);
        const displayName = user?.displayName || `Player_${userId.substring(0, 4)}`;
        const avatarUrl = user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`;

        if (!room) {
          // Create room as host
          let quizDoc = quizId ? await Quiz.findById(quizId) : await Quiz.findOne({ isApproved: true });
          if (!quizDoc) {
            quizDoc = await Quiz.findOne();
          }

          const questions = quizDoc ? await Question.find({ quizId: quizDoc._id }).limit(5) : [];

          room = {
            roomCode: normalizedCode,
            quizId: quizDoc?._id.toString() || '',
            hostId: userId,
            mode: MatchMode.PRIVATE_ROOM,
            status: GameState.WAITING,
            currentQIndex: 0,
            totalQuestions: questions.length,
            qStartedAt: 0,
            qEndsAt: 0,
            questions: questions.map((q) => ({
              id: q._id.toString(),
              text: q.questionText,
              options: q.options,
              correctOptionId: q.correctOptionId,
              explanation: q.explanation,
              durationSec: q.durationSec || 15,
            })),
            players: new Map(),
            answersForCurrentQ: new Map(),
          };

          activeRooms.set(normalizedCode, room);
        }

        socket.join(normalizedCode);
        userToRoomMap.set(userId, normalizedCode);

        // Check if player is reconnecting
        const existingPlayer = room.players.get(userId);
        if (existingPlayer) {
          existingPlayer.socketId = socket.id;
          existingPlayer.isConnected = true;
          io.to(normalizedCode).emit(SOCKET_EVENTS.PLAYER_RECONNECTED, { userId });
        } else {
          const newPlayer: RoomPlayer = {
            userId,
            socketId: socket.id,
            displayName,
            avatarUrl,
            score: 0,
            streak: 0,
            isReady: room.hostId === userId,
            isConnected: true,
            isHost: room.hostId === userId,
            correctCount: 0,
            wrongCount: 0,
            totalTimeMs: 0,
          };
          room.players.set(userId, newPlayer);
          io.to(normalizedCode).emit(SOCKET_EVENTS.PLAYER_JOINED, { player: newPlayer });
        }

        broadcastRoomUpdate(io, normalizedCode);

        // If game is active, send current question snapshot for reconnection
        if (room.status === GameState.QUESTION_ACTIVE && room.questions[room.currentQIndex]) {
          const currentQ = room.questions[room.currentQIndex];
          socket.emit(SOCKET_EVENTS.QUESTION_STARTED, {
            qIndex: room.currentQIndex,
            totalQuestions: room.totalQuestions,
            questionText: currentQ.text,
            options: currentQ.options,
            durationSec: currentQ.durationSec,
            startedAt: room.qStartedAt,
            endsAt: room.qEndsAt,
          });
        }
      } catch (err) {
        socket.emit(SOCKET_EVENTS.ERROR_EVENT, { message: 'Failed to join room' });
      }
    });

    // 4. Ready Status Toggle
    socket.on(SOCKET_EVENTS.PLAYER_READY, (data: { roomCode: string; isReady: boolean }) => {
      const room = activeRooms.get(data.roomCode.toUpperCase());
      if (room) {
        const player = room.players.get(userId);
        if (player) {
          player.isReady = data.isReady;
          broadcastRoomUpdate(io, room.roomCode);
        }
      }
    });

    // 5. Start Game (Host only)
    socket.on(SOCKET_EVENTS.START_GAME, (data: { roomCode: string }) => {
      const room = activeRooms.get(data.roomCode.toUpperCase());
      if (room && (room.hostId === userId || room.mode === MatchMode.QUICK_MATCH)) {
        startGame(io, room.roomCode);
      }
    });

    // 6. Submit Answer
    socket.on(
      SOCKET_EVENTS.SUBMIT_ANSWER,
      (data: { roomCode: string; questionIndex: number; optionId: string; timeTakenMs?: number }) => {
        const room = activeRooms.get(data.roomCode.toUpperCase());
        if (!room || room.status !== GameState.QUESTION_ACTIVE) return;
        if (room.currentQIndex !== data.questionIndex) return;

        const player = room.players.get(userId);
        if (!player) return;

        // Anti-cheat: Ensure player has not already submitted for this question
        if (room.answersForCurrentQ.has(userId)) return;

        const currentQ = room.questions[room.currentQIndex];
        if (!currentQ) return;

        const now = Date.now();
        const timeTakenMs = Math.max(100, now - room.qStartedAt);
        const isCorrect = currentQ.correctOptionId === data.optionId;

        const scoreCalc = ScoringService.calculateQuestionScore({
          isCorrect,
          timeTakenMs,
          totalQuestionTimeMs: currentQ.durationSec * 1000,
          currentStreak: player.streak,
        });

        player.score += scoreCalc.totalPoints;
        player.streak = scoreCalc.newStreak;
        if (isCorrect) {
          player.correctCount += 1;
        } else {
          player.wrongCount += 1;
        }
        player.totalTimeMs += timeTakenMs;

        room.answersForCurrentQ.set(userId, {
          optionId: data.optionId,
          timeTakenMs,
          isCorrect,
          points: scoreCalc.totalPoints,
        });

        // Broadcast individual score update
        io.to(room.roomCode).emit(SOCKET_EVENTS.SCORE_UPDATED, {
          userId,
          score: player.score,
          streak: player.streak,
          addedPoints: scoreCalc.totalPoints,
          isCorrect,
        });

        // If all connected players submitted, advance early
        const connectedCount = Array.from(room.players.values()).filter((p) => p.isConnected).length;
        if (room.answersForCurrentQ.size >= connectedCount) {
          if (room.timerHandle) clearTimeout(room.timerHandle);
          endQuestion(io, room.roomCode);
        }
      }
    );

    // 7. Disconnect Handler with Grace Period
    socket.on('disconnect', () => {
      const roomCode = userToRoomMap.get(userId);
      if (roomCode) {
        const room = activeRooms.get(roomCode);
        if (room) {
          const player = room.players.get(userId);
          if (player) {
            player.isConnected = false;
            io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_DISCONNECTED, {
              userId,
              gracePeriodSec: SCORING_RULES.RECONNECT_GRACE_PERIOD_SEC,
            });

            // If game hasn't started, remove player
            if (room.status === GameState.WAITING) {
              room.players.delete(userId);
              userToRoomMap.delete(userId);
              if (room.players.size === 0) {
                activeRooms.delete(roomCode);
              } else if (room.hostId === userId) {
                // Transfer host
                const nextHost = Array.from(room.players.values())[0];
                if (nextHost) {
                  room.hostId = nextHost.userId;
                  nextHost.isHost = true;
                }
                broadcastRoomUpdate(io, roomCode);
              }
            }
          }
        }
      }
      MatchmakingService.removeFromAllQueues(userId);
    });
  });
};

function broadcastRoomUpdate(io: SocketIOServer, roomCode: string) {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  io.to(roomCode).emit(SOCKET_EVENTS.ROOM_UPDATED, {
    roomCode: room.roomCode,
    hostId: room.hostId,
    status: room.status,
    totalQuestions: room.totalQuestions,
    players: Array.from(room.players.values()).map((p) => ({
      userId: p.userId,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      score: p.score,
      streak: p.streak,
      isReady: p.isReady,
      isHost: p.isHost,
      isConnected: p.isConnected,
    })),
  });
}

function startGame(io: SocketIOServer, roomCode: string) {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  room.status = GameState.STARTING;
  io.to(roomCode).emit(SOCKET_EVENTS.GAME_STARTED, {
    countdownSec: SCORING_RULES.COUNTDOWN_START_SEC,
    totalQuestions: room.totalQuestions,
  });

  setTimeout(() => {
    room.currentQIndex = 0;
    startQuestion(io, roomCode);
  }, SCORING_RULES.COUNTDOWN_START_SEC * 1000);
}

function startQuestion(io: SocketIOServer, roomCode: string) {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  const currentQ = room.questions[room.currentQIndex];
  if (!currentQ) {
    finishGame(io, roomCode);
    return;
  }

  room.status = GameState.QUESTION_ACTIVE;
  room.answersForCurrentQ.clear();
  room.qStartedAt = Date.now();
  room.qEndsAt = room.qStartedAt + currentQ.durationSec * 1000;

  // Redact correct option during question active phase
  io.to(roomCode).emit(SOCKET_EVENTS.QUESTION_STARTED, {
    qIndex: room.currentQIndex,
    totalQuestions: room.totalQuestions,
    questionText: currentQ.text,
    options: currentQ.options,
    durationSec: currentQ.durationSec,
    startedAt: room.qStartedAt,
    endsAt: room.qEndsAt,
  });

  room.timerHandle = setTimeout(() => {
    endQuestion(io, roomCode);
  }, currentQ.durationSec * 1000);
}

function endQuestion(io: SocketIOServer, roomCode: string) {
  const room = activeRooms.get(roomCode);
  if (!room || room.status !== GameState.QUESTION_ACTIVE) return;

  room.status = GameState.QUESTION_ENDED;
  const currentQ = room.questions[room.currentQIndex];

  // Broadcast correct answer reveal & breakdown
  io.to(roomCode).emit(SOCKET_EVENTS.QUESTION_ENDED, {
    qIndex: room.currentQIndex,
    correctOptionId: currentQ.correctOptionId,
    explanation: currentQ.explanation,
    answers: Array.from(room.answersForCurrentQ.entries()).map(([uId, ans]) => ({
      userId: uId,
      optionId: ans.optionId,
      isCorrect: ans.isCorrect,
      points: ans.points,
    })),
  });

  // Calculate live leaderboard ranking
  const sortedPlayers = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
  const leaderboard = sortedPlayers.map((p, idx) => ({
    rank: idx + 1,
    userId: p.userId,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    score: p.score,
    streak: p.streak,
  }));

  io.to(roomCode).emit(SOCKET_EVENTS.LEADERBOARD_UPDATED, leaderboard);

  // Advance to next question after 3.5 seconds
  setTimeout(() => {
    room.currentQIndex += 1;
    if (room.currentQIndex < room.totalQuestions) {
      startQuestion(io, roomCode);
    } else {
      finishGame(io, roomCode);
    }
  }, 3500);
}

async function finishGame(io: SocketIOServer, roomCode: string) {
  const room = activeRooms.get(roomCode);
  if (!room) return;

  room.status = GameState.FINISHED;

  const sortedPlayers = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
  const totalPlayers = sortedPlayers.length;

  const finalResults = [];

  for (let idx = 0; idx < sortedPlayers.length; idx++) {
    const player = sortedPlayers[idx];
    const rank = idx + 1;
    const accuracy = room.totalQuestions > 0 ? Math.round((player.correctCount / room.totalQuestions) * 100) : 0;
    const xpEarned = Math.round(player.score * 0.75) + (rank === 1 ? 100 : 25);
    const coinsEarned = Math.max(10, Math.round(player.score * 0.1));
    const ratingDelta = ScoringService.calculateRatingDelta(rank, totalPlayers);

    finalResults.push({
      rank,
      userId: player.userId,
      displayName: player.displayName,
      avatarUrl: player.avatarUrl,
      score: player.score,
      accuracy,
      correctCount: player.correctCount,
      wrongCount: player.wrongCount,
      xpEarned,
      coinsEarned,
      ratingDelta,
    });

    // Update player stats in MongoDB if real user ID
    if (Types.ObjectId.isValid(player.userId)) {
      try {
        const user = await User.findById(player.userId);
        if (user) {
          user.xp += xpEarned;
          user.coins += coinsEarned;
          user.rating += ratingDelta;
          user.level = LEVEL_CONFIG.calculateLevel(user.xp);
          user.stats.gamesPlayed += 1;
          if (rank === 1) user.stats.gamesWon += 1;
          user.stats.totalQuestionsAnswered += room.totalQuestions;
          user.stats.correctAnswers += player.correctCount;
          await user.save();

          // Save MatchResult document
          await MatchResult.create({
            matchId: new Types.ObjectId(),
            userId: user._id,
            quizId: new Types.ObjectId(room.quizId),
            score: player.score,
            rank,
            totalPlayers,
            accuracy,
            correctCount: player.correctCount,
            wrongCount: player.wrongCount,
            xpEarned,
            coinsEarned,
            ratingDelta,
          });
        }
      } catch (err) {
        console.error('Error persisting player result:', err);
      }
    }
  }

  io.to(roomCode).emit(SOCKET_EVENTS.GAME_FINISHED, {
    roomCode,
    results: finalResults,
  });

  // Clean up room after 10 minutes
  setTimeout(() => {
    activeRooms.delete(roomCode);
  }, 10 * 60 * 1000);
}
