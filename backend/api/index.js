const app = require('../dist/server').default;

module.exports = (req, res) => {
  const url = req.url ? req.url.split('?')[0] : '';
  if (url === '' || url === '/' || url === '/api' || url === '/api/') {
    return res.status(200).json({
      status: 'healthy',
      name: 'QuizVerse API',
      message: 'QuizVerse Cloud Backend is live and running!',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        quizzes: '/api/quizzes',
        tournaments: '/api/tournaments',
        creators: '/api/quizzes/creators',
        auth: '/api/auth'
      }
    });
  }
  return app(req, res);
};
