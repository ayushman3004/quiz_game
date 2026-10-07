import { useState, useEffect } from 'react';
import { Users, BookOpen, Award, Radio, CheckCircle, Ban, RefreshCw } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeUsersToday: number;
  totalQuizzes: number;
  totalQuestions: number;
  totalMatches: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'quizzes'>('overview');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 12450,
    activeUsersToday: 3120,
    totalQuizzes: 48,
    totalQuestions: 420,
    totalMatches: 8930,
  });
  const [users, setUsers] = useState<any[]>([
    { id: '1', username: 'ayushman', email: 'ayushman@example.com', displayName: 'Ayushman', role: 'ADMIN', level: 18, xp: 14200, rating: 1750, isBanned: false },
    { id: '2', username: 'rahul_sharma', email: 'rahul@example.com', displayName: 'Rahul S.', role: 'USER', level: 12, xp: 8400, rating: 1480, isBanned: false },
    { id: '3', username: 'simran_k', email: 'simran@example.com', displayName: 'Simran', role: 'QUIZ_MASTER', level: 15, xp: 11200, rating: 1610, isBanned: false },
    { id: '4', username: 'spammer_99', email: 'bot@spam.io', displayName: 'Spammer99', role: 'USER', level: 1, xp: 50, rating: 900, isBanned: true },
  ]);
  const [quizzes, setQuizzes] = useState<any[]>([
    { id: 'q1', title: 'GATE CS: Data Structures & Algorithms Drill', category: 'GATE', questionsCount: 4, difficulty: 'HARD', isApproved: true, plays: 142 },
    { id: 'q2', title: 'SSC CGL: Rapid Quantitative Math', category: 'SSC', questionsCount: 3, difficulty: 'MEDIUM', isApproved: true, plays: 230 },
    { id: 'q3', title: 'UPSC Prelims: Indian Polity & Constitution', category: 'UPSC', questionsCount: 3, difficulty: 'HARD', isApproved: true, plays: 195 },
    { id: 'q4', title: 'Python Async & Concurrency Deep Dive', category: 'Custom', questionsCount: 5, difficulty: 'MEDIUM', isApproved: false, plays: 12 },
  ]);

  useEffect(() => {
    // Fetch live stats from backend
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {});

    // Fetch live quizzes from MongoDB database
    fetch('/api/quizzes?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.quizzes) {
          setQuizzes(
            data.quizzes.map((q: any) => ({
              id: q._id,
              title: q.title,
              category: q.category,
              questionsCount: q.questionCount || 4,
              difficulty: q.difficulty,
              isApproved: q.isApproved,
              plays: q.playCount,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const toggleBan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isBanned: !u.isBanned } : u))
    );
  };

  const approveQuiz = (quizId: string) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, isApproved: true } : q))
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0B0E14' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, backgroundColor: '#151B26', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingLeft: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#F8FAFC' }}>QuizApp</h1>
            <p style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>Admin Console</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              backgroundColor: activeTab === 'overview' ? '#7C3AED' : 'transparent',
              color: activeTab === 'overview' ? '#FFF' : '#94A3B8',
              fontWeight: 600,
              fontSize: 14,
              textAlign: 'left',
            }}
          >
            <Radio size={18} /> Overview & Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              backgroundColor: activeTab === 'users' ? '#7C3AED' : 'transparent',
              color: activeTab === 'users' ? '#FFF' : '#94A3B8',
              fontWeight: 600,
              fontSize: 14,
              textAlign: 'left',
            }}
          >
            <Users size={18} /> User Management
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              backgroundColor: activeTab === 'quizzes' ? '#7C3AED' : 'transparent',
              color: activeTab === 'quizzes' ? '#FFF' : '#94A3B8',
              fontWeight: 600,
              fontSize: 14,
              textAlign: 'left',
            }}
          >
            <BookOpen size={18} /> Quiz Moderation
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: 16, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>Server: Online (5001)</span>
          </div>
          <p style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Socket.IO & Redis Active</p>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>System Overview</h2>
                <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 4 }}>Live telemetry and platform metrics</p>
              </div>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: 10,
                  backgroundColor: '#1E293B',
                  color: '#F8FAFC',
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Total Registered</span>
                  <Users size={18} color="#7C3AED" />
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12, color: '#F8FAFC' }}>{stats.totalUsers.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: '#10B981', marginTop: 6 }}>↑ +14% this month</div>
              </div>

              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Active Today</span>
                  <Radio size={18} color="#06B6D4" />
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12, color: '#F8FAFC' }}>{stats.activeUsersToday.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: '#06B6D4', marginTop: 6 }}>● Live concurrent players</div>
              </div>

              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Matches Completed</span>
                  <Award size={18} color="#F59E0B" />
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12, color: '#F8FAFC' }}>{stats.totalMatches.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: '#F59E0B', marginTop: 6 }}>Average duration: 1.8 min</div>
              </div>

              <div className="glass-panel" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94A3B8' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Quizzes in Catalog</span>
                  <BookOpen size={18} color="#10B981" />
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12, color: '#F8FAFC' }}>{stats.totalQuizzes}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>{stats.totalQuestions} questions indexed</div>
              </div>
            </div>

            {/* Quick Activity Table */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#F8FAFC' }}>Recent High-Stakes Matches</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#64748B', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ paddingBottom: 12 }}>ROOM</th>
                    <th style={{ paddingBottom: 12 }}>CATEGORY</th>
                    <th style={{ paddingBottom: 12 }}>WINNER</th>
                    <th style={{ paddingBottom: 12 }}>POINTS</th>
                    <th style={{ paddingBottom: 12 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                    <td style={{ padding: '14px 0', fontFamily: 'monospace', color: '#06B6D4' }}>GATE99</td>
                    <td>GATE Computer Science</td>
                    <td>Ayushman (Lvl 18)</td>
                    <td style={{ color: '#10B981', fontWeight: 600 }}>820 pts</td>
                    <td><span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 11 }}>COMPLETED</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                    <td style={{ padding: '14px 0', fontFamily: 'monospace', color: '#06B6D4' }}>SSC012</td>
                    <td>Quantitative Aptitude</td>
                    <td>Rahul S. (Lvl 12)</td>
                    <td style={{ color: '#10B981', fontWeight: 600 }}>790 pts</td>
                    <td><span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 11 }}>COMPLETED</span></td>
                  </tr>
                  <tr style={{ fontSize: 13 }}>
                    <td style={{ padding: '14px 0', fontFamily: 'monospace', color: '#06B6D4' }}>UPSC77</td>
                    <td>Indian Polity</td>
                    <td>Simran (Lvl 15)</td>
                    <td style={{ color: '#10B981', fontWeight: 600 }}>850 pts</td>
                    <td><span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 11 }}>COMPLETED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>User Management</h2>
              <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 4 }}>Inspect user accounts, adjust roles, and apply suspensions</p>
            </div>

            <div className="glass-panel" style={{ padding: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#64748B', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ paddingBottom: 12 }}>USER</th>
                    <th style={{ paddingBottom: 12 }}>ROLE</th>
                    <th style={{ paddingBottom: 12 }}>LEVEL / XP</th>
                    <th style={{ paddingBottom: 12 }}>RATING</th>
                    <th style={{ paddingBottom: 12 }}>STATUS</th>
                    <th style={{ paddingBottom: 12, textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                      <td style={{ padding: '14px 0' }}>
                        <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{u.displayName}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>@{u.username} • {u.email}</div>
                      </td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(124,58,237,0.15)', color: '#A78BFA', fontSize: 11, fontWeight: 600 }}>
                          {u.role}
                        </span>
                      </td>
                      <td>Lvl {u.level} ({u.xp.toLocaleString()} XP)</td>
                      <td style={{ fontWeight: 600, color: '#06B6D4' }}>{u.rating}</td>
                      <td>
                        {u.isBanned ? (
                          <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 11 }}>BANNED</span>
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 11 }}>ACTIVE</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => toggleBan(u.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            backgroundColor: u.isBanned ? '#10B981' : '#EF4444',
                            color: '#FFF',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {u.isBanned ? <CheckCircle size={12} /> : <Ban size={12} />}
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F8FAFC' }}>Quiz Moderation</h2>
              <p style={{ color: '#94A3B8', fontSize: 14, marginTop: 4 }}>Approve community & AI generated quizzes</p>
            </div>

            <div className="glass-panel" style={{ padding: 24 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#64748B', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ paddingBottom: 12 }}>TITLE</th>
                    <th style={{ paddingBottom: 12 }}>CATEGORY</th>
                    <th style={{ paddingBottom: 12 }}>DIFFICULTY</th>
                    <th style={{ paddingBottom: 12 }}>PLAYS</th>
                    <th style={{ paddingBottom: 12 }}>STATUS</th>
                    <th style={{ paddingBottom: 12, textAlign: 'right' }}>MODERATION</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((q) => (
                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                      <td style={{ padding: '14px 0', fontWeight: 600, color: '#F8FAFC' }}>
                        {q.title}
                        <div style={{ fontSize: 12, color: '#64748B', fontWeight: 400 }}>{q.questionsCount} questions</div>
                      </td>
                      <td>{q.category}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: q.difficulty === 'HARD' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                          color: q.difficulty === 'HARD' ? '#EF4444' : '#F59E0B'
                        }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td>{q.plays}</td>
                      <td>
                        {q.isApproved ? (
                          <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: 11 }}>APPROVED</span>
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: 6, backgroundColor: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontSize: 11 }}>PENDING REVIEW</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!q.isApproved && (
                          <button
                            onClick={() => approveQuiz(q.id)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 8,
                              backgroundColor: '#10B981',
                              color: '#FFF',
                              fontSize: 12,
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
