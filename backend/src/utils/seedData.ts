import { Quiz } from '../models/Quiz';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { ExamCategory, QuizDifficulty, QuizVisibility, UserRole, QuestionType } from '../constants';
import bcrypt from 'bcryptjs';

export const seedInitialData = async () => {
  try {
    console.log('🧹 Purging old test quizzes and questions from MongoDB...');
    await Quiz.deleteMany({});
    await Question.deleteMany({});

    console.log('🌱 Seeding QuizVerse database with complete curriculum, competitive ring, and creators...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('quizverse123', salt);

    // 1. Ensure Admin & Quiz Masters Exist
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: 'admin@quizverse.io',
        passwordHash,
        displayName: 'QuizVerse Admin',
        role: UserRole.ADMIN,
        level: 25,
        xp: 32000,
        coins: 5000,
        rating: 2100,
        currentStreak: 21,
        longestStreak: 45,
        stats: {
          gamesPlayed: 342,
          gamesWon: 218,
          totalQuestionsAnswered: 6842,
          correctAnswers: 5747,
          avgResponseTimeMs: 2400,
        },
      });
    }

    // Quiz Master 1: Dr. Ramesh Gupta (Economics & UPSC)
    let creatorDrRamesh = await User.findOne({ username: 'dr_ramesh_gupta' });
    if (!creatorDrRamesh) {
      creatorDrRamesh = await User.create({
        username: 'dr_ramesh_gupta',
        email: 'dr.ramesh@quizverse.io',
        passwordHash,
        displayName: 'Dr. Ramesh Gupta',
        role: UserRole.QUIZ_MASTER,
        bio: 'Senior Economist, Civil Services Mentor & Author. Specializes in Macroeconomics, Banking, and Fiscal Policy.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=RameshGupta',
        followersCount: 8420,
        followingCount: 42,
        publishedQuizzesCount: 42,
        creatorRating: 4.8,
        level: 30,
        xp: 48500,
        coins: 8400,
        rating: 2250,
      });
    }

    // Quiz Master 2: Prof. Ananya Sharma (Computer Science & Algorithms)
    let creatorProfAnanya = await User.findOne({ username: 'prof_ananya' });
    if (!creatorProfAnanya) {
      creatorProfAnanya = await User.create({
        username: 'prof_ananya',
        email: 'ananya.sharma@quizverse.io',
        passwordHash,
        displayName: 'Prof. Ananya Sharma',
        role: UserRole.QUIZ_MASTER,
        bio: 'Competitive Programmer & CS Professor. Research in Graph Theory, Distributed Algorithms & System Design.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=AnanyaSharma',
        followersCount: 12100,
        followingCount: 38,
        publishedQuizzesCount: 36,
        creatorRating: 4.9,
        level: 28,
        xp: 42000,
        coins: 7200,
        rating: 2180,
      });
    }

    // Quiz Master 3: QuizMaster Vikrant (Trivia Champion & Pop Culture)
    let creatorVikrant = await User.findOne({ username: 'quizmaster_vikrant' });
    if (!creatorVikrant) {
      creatorVikrant = await User.create({
        username: 'quizmaster_vikrant',
        email: 'vikrant.trivia@quizverse.io',
        passwordHash,
        displayName: 'QuizMaster Vikrant',
        role: UserRole.QUIZ_MASTER,
        bio: 'National Trivia Champion, Quiz Show Host & Polymath. Creating the fastest, sharpest general knowledge drills.',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=VikrantMaster',
        followersCount: 16800,
        followingCount: 65,
        publishedQuizzesCount: 58,
        creatorRating: 4.85,
        level: 35,
        xp: 68000,
        coins: 14500,
        rating: 2340,
      });
    }

    // =========================================================================
    // SECTION A: ECONOMICS JOURNEY CURRICULUM (PRD Section 22 & Section 13)
    // Structure: Demand & Supply -> Market Structures -> National Income -> Money & Banking -> Monetary Policy -> Fiscal Policy
    // =========================================================================

    // Topic 1: Demand & Supply
    const qDemandSupply = await Quiz.create({
      title: 'Economics: Demand & Supply Fundamentals',
      slug: 'economics-demand-supply',
      description: 'Master demand curves, supply elasticity, equilibrium prices, and market shifts.',
      category: 'Economics',
      subCategory: 'Demand & Supply',
      subjectId: 'economics',
      topicId: 'demand-supply',
      examType: ExamCategory.ECONOMICS,
      difficulty: QuizDifficulty.EASY,
      timePerQuestionSec: 15,
      questionCount: 4,
      creatorId: creatorDrRamesh._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 1280,
      likesCount: 640,
      rating: 4.9,
      tags: ['economics', 'demand', 'supply', 'microeconomics', 'journey'],
    });

    await Question.insertMany([
      {
        quizId: qDemandSupply._id,
        questionText: 'According to the Law of Demand, assuming ceteris paribus (all other factors constant), what happens when the price of a good decreases?',
        options: [
          { id: 'A', text: 'Demand curve shifts to the left' },
          { id: 'B', text: 'Quantity demanded increases' },
          { id: 'C', text: 'Supply quantity increases' },
          { id: 'D', text: 'Total market demand decreases' },
        ],
        correctOptionId: 'B',
        explanation: 'The law of demand states that inverse relationship exists between price and quantity demanded. A price drop causes an expansion/increase along the curve in quantity demanded.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 1,
        tags: ['economics', 'law-of-demand'],
      },
      {
        quizId: qDemandSupply._id,
        questionText: 'Which of the following will cause an outward (rightward) shift in the demand curve for a normal good?',
        options: [
          { id: 'A', text: 'A rise in the price of a complementary good' },
          { id: 'B', text: 'A drop in the price of a substitute good' },
          { id: 'C', text: 'An increase in consumer disposable income' },
          { id: 'D', text: 'An increase in the production tax on the good' },
        ],
        correctOptionId: 'C',
        explanation: 'For a normal good, an increase in consumer income enhances purchasing power, causing the entire demand curve to shift outwards to the right.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 2,
        tags: ['economics', 'demand-shift'],
      },
      {
        quizId: qDemandSupply._id,
        questionText: 'When the price elasticity of demand is perfectly inelastic (Ed = 0), what is the shape of the demand curve?',
        options: [
          { id: 'A', text: 'Horizontal line parallel to the X-axis' },
          { id: 'B', text: 'Vertical line parallel to the Y-axis' },
          { id: 'C', text: 'Rectangular hyperbola' },
          { id: 'D', text: 'Upward sloping 45-degree curve' },
        ],
        correctOptionId: 'B',
        explanation: 'When demand is completely unresponsive to price changes (like emergency medicines), quantity remains constant regardless of price, yielding a vertical demand curve.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 3,
        tags: ['economics', 'elasticity'],
      },
      {
        quizId: qDemandSupply._id,
        questionText: 'If a market experiences a binding price ceiling set below the equilibrium price, what is the inevitable outcome?',
        options: [
          { id: 'A', text: 'Market surplus of goods' },
          { id: 'B', text: 'Shortage of goods (Excess Demand)' },
          { id: 'C', text: 'Equilibrium quantity increases' },
          { id: 'D', text: 'Producers earn higher profits' },
        ],
        correctOptionId: 'B',
        explanation: 'A price ceiling below market equilibrium prevents price from rising to clear the market, causing quantity demanded to exceed quantity supplied, resulting in a persistent shortage.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 4,
        tags: ['economics', 'market-equilibrium'],
      },
    ]);

    // Topic 2: Market Structures
    const qMarketStructures = await Quiz.create({
      title: 'Economics: Market Structures & Competition',
      slug: 'economics-market-structures',
      description: 'Differentiate between perfect competition, monopoly, monopolistic competition, and oligopoly.',
      category: 'Economics',
      subCategory: 'Market Structures',
      subjectId: 'economics',
      topicId: 'market-structures',
      examType: ExamCategory.ECONOMICS,
      difficulty: QuizDifficulty.MEDIUM,
      timePerQuestionSec: 15,
      questionCount: 4,
      creatorId: creatorDrRamesh._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 1140,
      likesCount: 520,
      rating: 4.85,
      tags: ['economics', 'monopoly', 'oligopoly', 'competition', 'journey'],
    });

    await Question.insertMany([
      {
        quizId: qMarketStructures._id,
        questionText: 'Under conditions of long-run equilibrium in a Perfectly Competitive market, firms earn:',
        options: [
          { id: 'A', text: 'Supernormal economic profit' },
          { id: 'B', text: 'Zero economic profit (Normal Profit)' },
          { id: 'C', text: 'Monopoly rent' },
          { id: 'D', text: 'Negative accounting profit' },
        ],
        correctOptionId: 'B',
        explanation: 'Free entry and exit of firms guarantees that any economic profit is competed away until price equals minimum Average Total Cost (P = ATC = MC), yielding normal profits.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 1,
        tags: ['economics', 'perfect-competition'],
      },
      {
        quizId: qMarketStructures._id,
        questionText: 'A market dominated by a small number of large interdependent firms (e.g. telecommunications or civil aircraft) is called an:',
        options: [
          { id: 'A', text: 'Monopoly' },
          { id: 'B', text: 'Oligopoly' },
          { id: 'C', text: 'Monopsony' },
          { id: 'D', text: 'Perfect Duopsony' },
        ],
        correctOptionId: 'B',
        explanation: 'An oligopoly is characterized by high barriers to entry and mutual interdependence among a handful of dominant sellers, frequently studied through game theory.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 2,
        tags: ['economics', 'oligopoly'],
      },
      {
        quizId: qMarketStructures._id,
        questionText: 'The kinked demand curve model in oligopoly theory was proposed to explain which phenomenon?',
        options: [
          { id: 'A', text: 'Frequent price wars' },
          { id: 'B', text: 'Price rigidity / stickiness' },
          { id: 'C', text: 'Product diversification' },
          { id: 'D', text: 'Zero marginal costs' },
        ],
        correctOptionId: 'B',
        explanation: 'Paul Sweezy proposed the kinked demand curve to explain price rigidity: competitors match price cuts but ignore price hikes, causing a discontinuity in marginal revenue.',
        difficulty: QuizDifficulty.HARD,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 3,
        tags: ['economics', 'sweezy-model'],
      },
      {
        quizId: qMarketStructures._id,
        questionText: 'First-degree (perfect) price discrimination occurs when a monopolist:',
        options: [
          { id: 'A', text: 'Charges different prices in geographically separated markets' },
          { id: 'B', text: 'Charges each buyer the maximum price they are willing to pay' },
          { id: 'C', text: 'Gives quantity discounts to bulk buyers' },
          { id: 'D', text: 'Charges peak and off-peak tariffs' },
        ],
        correctOptionId: 'B',
        explanation: 'In first-degree price discrimination, the monopolist captures 100% of consumer surplus by selling each unit at the exact reservation price of the consumer.',
        difficulty: QuizDifficulty.HARD,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 4,
        tags: ['economics', 'price-discrimination'],
      },
    ]);

    // Topic 3: National Income
    const qNationalIncome = await Quiz.create({
      title: 'Economics: National Income Accounting',
      slug: 'economics-national-income',
      description: 'GDP, GNP, NNP at factor cost, real vs nominal growth, and the circular flow of income.',
      category: 'Economics',
      subCategory: 'National Income',
      subjectId: 'economics',
      topicId: 'national-income',
      examType: ExamCategory.ECONOMICS,
      difficulty: QuizDifficulty.MEDIUM,
      timePerQuestionSec: 15,
      questionCount: 4,
      creatorId: creatorDrRamesh._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 1350,
      likesCount: 680,
      rating: 4.88,
      tags: ['economics', 'gdp', 'macroeconomics', 'national-income', 'journey'],
    });

    await Question.insertMany([
      {
        quizId: qNationalIncome._id,
        questionText: 'Which aggregate is officially regarded as "National Income" in standard macroeconomic accounting?',
        options: [
          { id: 'A', text: 'Gross Domestic Product at Market Price (GDP_MP)' },
          { id: 'B', text: 'Net National Product at Factor Cost (NNP_FC)' },
          { id: 'C', text: 'Gross National Disposable Income (GNDI)' },
          { id: 'D', text: 'Personal Disposable Income (PDI)' },
        ],
        correctOptionId: 'B',
        explanation: 'National Income (NI) is defined as NNP at Factor Cost (NNP_FC = GNP at market price - Depreciation - Net Indirect Taxes).',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 1,
        tags: ['economics', 'national-income'],
      },
      {
        quizId: qNationalIncome._id,
        questionText: 'Why are transfer payments (e.g., universal pensions, scholarships, unemployment subsidies) excluded from GDP calculations?',
        options: [
          { id: 'A', text: 'They are paid out by the government' },
          { id: 'B', text: 'They do not correspond to any current productive output or service' },
          { id: 'C', text: 'They are subject to double taxation' },
          { id: 'D', text: 'They only affect capital account transactions' },
        ],
        correctOptionId: 'B',
        explanation: 'Transfer payments represent unilateral wealth redistribution without any corresponding exchange of newly produced goods or services, so including them would distort production metrics.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 2,
        tags: ['economics', 'gdp-rules'],
      },
      {
        quizId: qNationalIncome._id,
        questionText: 'What metric is obtained by dividing Nominal GDP by Real GDP and multiplying by 100?',
        options: [
          { id: 'A', text: 'Consumer Price Index (CPI)' },
          { id: 'B', text: 'Wholesale Price Index (WPI)' },
          { id: 'C', text: 'GDP Deflator' },
          { id: 'D', text: 'Purchasing Power Parity (PPP) Ratio' },
        ],
        correctOptionId: 'C',
        explanation: 'The GDP Deflator measures the level of prices of all new, domestically produced, final goods and services in an economy: GDP Deflator = (Nominal GDP / Real GDP) * 100.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 3,
        tags: ['economics', 'gdp-deflator'],
      },
      {
        quizId: qNationalIncome._id,
        questionText: 'The Gini Coefficient is the standard economic measurement used to evaluate:',
        options: [
          { id: 'A', text: 'Rate of currency depreciation' },
          { id: 'B', text: 'Income or wealth inequality across a population' },
          { id: 'C', text: 'Export-to-import trade imbalance' },
          { id: 'D', text: 'Tax collection efficiency' },
        ],
        correctOptionId: 'B',
        explanation: 'The Gini coefficient ranges from 0 (perfect equality) to 1 (maximal inequality), calculated derived from the area under the Lorenz curve.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 4,
        tags: ['economics', 'gini-coefficient'],
      },
    ]);

    // Topic 4: Money & Banking
    const qMoneyBanking = await Quiz.create({
      title: 'Economics: Money & Banking Systems',
      slug: 'economics-money-banking',
      description: 'Monetary aggregates (M0-M3), fractional reserve banking, central bank functions, and the money multiplier.',
      category: 'Economics',
      subCategory: 'Money & Banking',
      subjectId: 'economics',
      topicId: 'money-banking',
      examType: ExamCategory.ECONOMICS,
      difficulty: QuizDifficulty.MEDIUM,
      timePerQuestionSec: 15,
      questionCount: 4,
      creatorId: creatorDrRamesh._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 1520,
      likesCount: 790,
      rating: 4.92,
      tags: ['economics', 'banking', 'money', 'rbi', 'journey'],
    });

    await Question.insertMany([
      {
        quizId: qMoneyBanking._id,
        questionText: 'In Indian monetary statistics, which monetary aggregate is formally classified as "Broad Money"?',
        options: [
          { id: 'A', text: 'M1' },
          { id: 'B', text: 'M2' },
          { id: 'C', text: 'M3' },
          { id: 'D', text: 'M0' },
        ],
        correctOptionId: 'C',
        explanation: 'M3 is broad money, consisting of Currency with public + Demand deposits with banking system + Time deposits with banking system + Other deposits with RBI.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 1,
        tags: ['economics', 'money-supply'],
      },
      {
        quizId: qMoneyBanking._id,
        questionText: 'If the central bank mandates a Cash Reserve Ratio (CRR) of 10%, what is the theoretical maximum money multiplier (assuming no currency leakage)?',
        options: [
          { id: 'A', text: '5' },
          { id: 'B', text: '10' },
          { id: 'C', text: '20' },
          { id: 'D', text: '100' },
        ],
        correctOptionId: 'B',
        explanation: 'Money Multiplier = 1 / Reserve Ratio = 1 / 0.10 = 10. A deposit of $1,000 can generate up to $10,000 in the banking system.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 2,
        tags: ['economics', 'multiplier'],
      },
      {
        quizId: qMoneyBanking._id,
        questionText: 'What is High-Powered Money (Reserve Money or M0)?',
        options: [
          { id: 'A', text: 'Currency in circulation + Bankers deposits with RBI + Other deposits with RBI' },
          { id: 'B', text: 'Commercial bank shares held by public' },
          { id: 'C', text: 'Foreign exchange reserves only' },
          { id: 'D', text: 'Mutual fund assets in India' },
        ],
        correctOptionId: 'A',
        explanation: 'Reserve Money (M0) is the total monetary liability of the Reserve Bank of India, serving as the financial base over which the credit pyramid is constructed.',
        difficulty: QuizDifficulty.HARD,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 3,
        tags: ['economics', 'm0'],
      },
      {
        quizId: qMoneyBanking._id,
        questionText: 'The Statutory Liquidity Ratio (SLR) requires commercial banks to maintain a specified percentage of their Net Demand and Time Liabilities (NDTL) in the form of:',
        options: [
          { id: 'A', text: 'Unencumbered approved securities (like G-Secs), gold, or cash' },
          { id: 'B', text: 'Cryptocurrency and foreign equities' },
          { id: 'C', text: 'Corporate bonds only' },
          { id: 'D', text: 'Real estate mortgages' },
        ],
        correctOptionId: 'A',
        explanation: 'Under Section 24 of the Banking Regulation Act, banks must maintain SLR in liquid approved sovereign assets like central & state government securities, gold, or cash.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 4,
        tags: ['economics', 'slr'],
      },
    ]);

    // Topic 5: Monetary Policy (CONTAINS EXACT PRD QUESTION FROM SECTION 13.1)
    const qMonetaryPolicy = await Quiz.create({
      title: 'Economics: Monetary Policy & Central Banking',
      slug: 'economics-monetary-policy',
      description: 'Repo rate, reverse repo, MPC mandate, inflation targeting, and transmission mechanisms.',
      category: 'Economics',
      subCategory: 'Monetary Policy',
      subjectId: 'economics',
      topicId: 'monetary-policy',
      examType: ExamCategory.ECONOMICS,
      difficulty: QuizDifficulty.HARD,
      timePerQuestionSec: 20,
      questionCount: 4,
      creatorId: creatorDrRamesh._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      featured: true,
      playCount: 2840,
      likesCount: 1620,
      rating: 4.95,
      tags: ['economics', 'monetary-policy', 'rbi', 'upsc', 'journey'],
    });

    await Question.insertMany([
      {
        // >>> EXACT QUESTION SPECIFIED IN USER PRD SECTION 13.1 <<<
        quizId: qMonetaryPolicy._id,
        questionText: 'Which institution controls monetary policy in India?',
        options: [
          { id: 'A', text: 'SEBI' },
          { id: 'B', text: 'RBI' },
          { id: 'C', text: 'NITI Aayog' },
          { id: 'D', text: 'Ministry of Finance' },
        ],
        correctOptionId: 'B',
        explanation: 'The Reserve Bank of India (RBI) controls monetary policy in India through the Monetary Policy Committee (MPC), mandated under the RBI Act to maintain price stability with a 4% (+/- 2%) inflation target.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 1,
        tags: ['economics', 'rbi', 'monetary-policy', 'prd-spec'],
      },
      {
        quizId: qMonetaryPolicy._id,
        questionText: 'The rate at which the Reserve Bank of India lends short-term liquidity to commercial banks against pledged government collateral is known as the:',
        options: [
          { id: 'A', text: 'Reverse Repo Rate' },
          { id: 'B', text: 'Repo Rate (Repurchase Option)' },
          { id: 'C', text: 'Bank Rate' },
          { id: 'D', text: 'Marginal Standing Facility' },
        ],
        correctOptionId: 'B',
        explanation: 'The Repo Rate is the primary policy rate used by the RBI to inject liquidity and set the benchmark borrowing cost in the banking system.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 2,
        tags: ['economics', 'repo-rate'],
      },
      {
        quizId: qMonetaryPolicy._id,
        questionText: 'When the RBI sells government securities in the open market (Open Market Operations - OMO), what is the direct impact on system liquidity?',
        options: [
          { id: 'A', text: 'System liquidity expands significantly' },
          { id: 'B', text: 'System liquidity contracts as cash is sucked out of banks' },
          { id: 'C', text: 'Commercial bank lending rates fall immediately' },
          { id: 'D', text: 'Currency in circulation doubles' },
        ],
        correctOptionId: 'B',
        explanation: 'When RBI sells bonds, commercial banks and institutional buyers pay cash to RBI, which drains excess liquidity out of the monetary system to curb inflation.',
        difficulty: QuizDifficulty.HARD,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 3,
        tags: ['economics', 'omo'],
      },
      {
        quizId: qMonetaryPolicy._id,
        questionText: 'How many members comprise the Monetary Policy Committee (MPC) in India, and what is its voting constitution?',
        options: [
          { id: 'A', text: '5 members: all from the Ministry of Finance' },
          { id: 'B', text: '6 members: 3 from RBI and 3 external members appointed by Central Government' },
          { id: 'C', text: '10 members: 5 public and 5 private banking representatives' },
          { id: 'D', text: '4 members: chaired by the Union Finance Minister' },
        ],
        correctOptionId: 'B',
        explanation: 'Under Section 45ZB of the amended RBI Act, the MPC consists of 6 members: the RBI Governor (Chairperson), Deputy Governor in charge of monetary policy, one RBI officer, and 3 external experts appointed by the Union Government. The Governor holds a casting vote in case of ties.',
        difficulty: QuizDifficulty.HARD,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 4,
        tags: ['economics', 'mpc-constitution'],
      },
    ]);

    // Topic 6: Fiscal Policy
    const qFiscalPolicy = await Quiz.create({
      title: 'Economics: Fiscal Policy & Public Finance',
      slug: 'economics-fiscal-policy',
      description: 'Union budget components, fiscal deficit, revenue deficit, FRBM Act, and taxation principles.',
      category: 'Economics',
      subCategory: 'Fiscal Policy',
      subjectId: 'economics',
      topicId: 'fiscal-policy',
      examType: ExamCategory.ECONOMICS,
      difficulty: QuizDifficulty.HARD,
      timePerQuestionSec: 20,
      questionCount: 4,
      creatorId: creatorDrRamesh._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 1640,
      likesCount: 880,
      rating: 4.87,
      tags: ['economics', 'fiscal-policy', 'budget', 'deficit', 'journey'],
    });

    await Question.insertMany([
      {
        quizId: qFiscalPolicy._id,
        questionText: 'Primary Deficit in public budget accounting is formally calculated as:',
        options: [
          { id: 'A', text: 'Revenue Deficit - Capital Expenditure' },
          { id: 'B', text: 'Fiscal Deficit - Net Interest Payments' },
          { id: 'C', text: 'Total Receipts - Non-debt Capital Receipts' },
          { id: 'D', text: 'Monetized Deficit - External Borrowings' },
        ],
        correctOptionId: 'B',
        explanation: 'Primary Deficit = Fiscal Deficit - Interest Payments. It indicates the government borrowing requirements excluding the legacy burden of past debt service.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 1,
        tags: ['economics', 'primary-deficit'],
      },
      {
        quizId: qFiscalPolicy._id,
        questionText: 'Receipts from the strategic disinvestment of Public Sector Undertakings (PSUs) are classified under which budget head?',
        options: [
          { id: 'A', text: 'Tax Revenue Receipts' },
          { id: 'B', text: 'Non-Tax Revenue Receipts' },
          { id: 'C', text: 'Non-Debt Capital Receipts' },
          { id: 'D', text: 'Debt Creating Capital Receipts' },
        ],
        correctOptionId: 'C',
        explanation: 'Disinvestment proceeds reduce sovereign assets rather than creating a repayment liability; therefore they are categorized as Non-Debt Capital Receipts.',
        difficulty: QuizDifficulty.HARD,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 2,
        tags: ['economics', 'disinvestment'],
      },
      {
        quizId: qFiscalPolicy._id,
        questionText: 'What is the primary target objective of the Fiscal Responsibility and Budget Management (FRBM) Act?',
        options: [
          { id: 'A', text: 'Elimination of personal income tax' },
          { id: 'B', text: 'Ensuring fiscal discipline and prudent debt management' },
          { id: 'C', text: 'Privatizing commercial public sector banks' },
          { id: 'D', text: 'Fixing constant exchange rates with US Dollar' },
        ],
        correctOptionId: 'B',
        explanation: 'The FRBM Act enacted in 2003 mandates progressive reductions in fiscal and revenue deficits to ensure long-term macroeconomic stability and intergenerational equity.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 3,
        tags: ['economics', 'frbm-act'],
      },
      {
        quizId: qFiscalPolicy._id,
        questionText: 'A progressive tax structure is defined as one where:',
        options: [
          { id: 'A', text: 'Tax rate remains identical across all income brackets' },
          { id: 'B', text: 'Tax rate increases as taxable base or income increases' },
          { id: 'C', text: 'Lower-income earners pay a higher proportion of their income' },
          { id: 'D', text: 'Only corporations are taxed' },
        ],
        correctOptionId: 'B',
        explanation: 'Progressive taxation adheres to the vertical equity principle: taxpayers with greater ability to pay contribute a higher percentage of their income in taxes.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 4,
        tags: ['economics', 'progressive-tax'],
      },
    ]);

    // =========================================================================
    // SECTION B: GATE COMPUTER SCIENCE & ENGINEERING
    // =========================================================================

    const qGateDSA = await Quiz.create({
      title: 'GATE CS: Data Structures & Algorithms Drill',
      slug: 'gate-cs',
      description: 'Master time complexity, trees, heaps, and graph algorithms.',
      category: 'Computer Science',
      subCategory: 'Data Structures & Algorithms',
      subjectId: 'gate-cs',
      topicId: 'dsa',
      examType: ExamCategory.GATE,
      difficulty: QuizDifficulty.HARD,
      timePerQuestionSec: 20,
      questionCount: 4,
      creatorId: creatorProfAnanya._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 1420,
      likesCount: 880,
      rating: 4.9,
      tags: ['gate', 'dsa', 'algorithms', 'trees', 'graphs'],
    });

    await Question.insertMany([
      {
        quizId: qGateDSA._id,
        questionText: 'What is the worst-case time complexity of searching in a Red-Black Tree with N nodes?',
        options: [
          { id: 'A', text: 'O(1)' },
          { id: 'B', text: 'O(log N)' },
          { id: 'C', text: 'O(N)' },
          { id: 'D', text: 'O(N log N)' },
        ],
        correctOptionId: 'B',
        explanation: 'Because a Red-Black Tree maintains a height of at most 2 * log2(N + 1), lookup is guaranteed O(log N) in the worst case.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 1,
        tags: ['gate', 'trees'],
      },
      {
        quizId: qGateDSA._id,
        questionText: 'Which algorithm finds all-pairs shortest paths in a directed graph with negative edge weights (assuming no negative cycles)?',
        options: [
          { id: 'A', text: 'Dijkstra Algorithm' },
          { id: 'B', text: 'Floyd-Warshall Algorithm' },
          { id: 'C', text: 'Kruskal Algorithm' },
          { id: 'D', text: 'Prim Algorithm' },
        ],
        correctOptionId: 'B',
        explanation: 'Floyd-Warshall handles negative edge weights using dynamic programming with O(V^3) time complexity.',
        difficulty: QuizDifficulty.HARD,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 2,
        tags: ['gate', 'graphs'],
      },
      {
        quizId: qGateDSA._id,
        questionText: 'What is the recurrence relation for Merge Sort on an array of size N?',
        options: [
          { id: 'A', text: 'T(N) = 2T(N/2) + O(N)' },
          { id: 'B', text: 'T(N) = T(N-1) + O(1)' },
          { id: 'C', text: 'T(N) = 2T(N/2) + O(1)' },
          { id: 'D', text: 'T(N) = T(N/2) + O(N)' },
        ],
        correctOptionId: 'A',
        explanation: 'Merge sort divides the array into 2 halves (2T(N/2)) and merges them in linear time (O(N)). By Master Theorem, it resolves to O(N log N).',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 3,
        tags: ['gate', 'dsa'],
      },
      {
        quizId: qGateDSA._id,
        questionText: 'What data structure is typically used to implement Breadth-First Search (BFS)?',
        options: [
          { id: 'A', text: 'Stack' },
          { id: 'B', text: 'Priority Queue' },
          { id: 'C', text: 'Queue (FIFO)' },
          { id: 'D', text: 'Binary Heap' },
        ],
        correctOptionId: 'C',
        explanation: 'BFS explores vertices level by level, requiring a First-In-First-Out (FIFO) Queue.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 4,
        tags: ['gate', 'bfs'],
      },
    ]);

    // GATE Topic 2: Operating Systems
    const qGateOS = await Quiz.create({
      title: 'GATE CS: Operating Systems & Concurrency',
      slug: 'gate-os',
      description: 'Process scheduling, deadlocks, semaphores, paging, and virtual memory.',
      category: 'Computer Science',
      subCategory: 'Operating Systems',
      subjectId: 'gate-cs',
      topicId: 'os',
      examType: ExamCategory.GATE,
      difficulty: QuizDifficulty.HARD,
      timePerQuestionSec: 20,
      questionCount: 4,
      creatorId: creatorProfAnanya._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 1120,
      likesCount: 610,
      rating: 4.86,
      tags: ['gate', 'os', 'deadlocks', 'paging'],
    });

    await Question.insertMany([
      {
        quizId: qGateOS._id,
        questionText: 'Which algorithm is employed by operating systems for deadlock avoidance in multi-resource environments?',
        options: [
          { id: 'A', text: 'Round Robin algorithm' },
          { id: 'B', text: "Banker's Algorithm" },
          { id: 'C', text: 'Peterson algorithm' },
          { id: 'D', text: "Dijkstra's shortest path" },
        ],
        correctOptionId: 'B',
        explanation: "Dijkstra's Banker's Algorithm tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources.",
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 1,
        tags: ['gate', 'os'],
      },
      {
        quizId: qGateOS._id,
        questionText: "Belady's Anomaly describes the phenomenon where increasing page frames leads to more page faults under which page replacement policy?",
        options: [
          { id: 'A', text: 'Least Recently Used (LRU)' },
          { id: 'B', text: 'First-In-First-Out (FIFO)' },
          { id: 'C', text: 'Optimal (OPT)' },
          { id: 'D', text: 'Most Recently Used (MRU)' },
        ],
        correctOptionId: 'B',
        explanation: "Belady's anomaly occurs in FIFO because it does not belong to the stack family of page replacement algorithms (such as LRU and OPT).",
        difficulty: QuizDifficulty.HARD,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 2,
        tags: ['gate', 'os', 'paging'],
      },
      {
        quizId: qGateOS._id,
        questionText: 'What is the purpose of the Translation Lookaside Buffer (TLB)?',
        options: [
          { id: 'A', text: 'Hardware cache for virtual-to-physical address translations' },
          { id: 'B', text: 'Secondary storage for discarded pages' },
          { id: 'C', text: 'Inter-process message broker' },
          { id: 'D', text: 'Disk scheduling optimizer' },
        ],
        correctOptionId: 'A',
        explanation: 'TLB is a fast associative hardware cache that speeds up virtual-to-physical address translation by avoiding multiple page table memory lookups.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 3,
        tags: ['gate', 'os', 'tlb'],
      },
      {
        quizId: qGateOS._id,
        questionText: 'A counting semaphore S is initialized to 7. Then 12 wait (P) operations and 8 signal (V) operations are completed. What is the final value of S?',
        options: [
          { id: 'A', text: '1' },
          { id: 'B', text: '3' },
          { id: 'C', text: '5' },
          { id: 'D', text: '7' },
        ],
        correctOptionId: 'B',
        explanation: 'Initial = 7. After 12 wait operations: 7 - 12 = -5. After 8 signal operations: -5 + 8 = 3.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 4,
        tags: ['gate', 'os', 'semaphores'],
      },
    ]);

    // =========================================================================
    // SECTION C: SSC CGL QUANTITATIVE APTITUDE
    // =========================================================================

    const qSscMath = await Quiz.create({
      title: 'SSC CGL: Rapid Quantitative Math',
      slug: 'ssc-math',
      description: 'Lightning speed practice for ratios, percentages, and profit & loss.',
      category: 'Quantitative Aptitude',
      subCategory: 'Arithmetic',
      subjectId: 'ssc-cgl',
      topicId: 'arithmetic',
      examType: ExamCategory.SSC,
      difficulty: QuizDifficulty.MEDIUM,
      timePerQuestionSec: 15,
      questionCount: 4,
      creatorId: admin._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 2300,
      likesCount: 1100,
      rating: 4.88,
      tags: ['ssc', 'math', 'cgl', 'speed-test', 'journey'],
    });

    await Question.insertMany([
      {
        quizId: qSscMath._id,
        questionText: 'If an item is bought for $80 and sold for $100, what is the profit percentage?',
        options: [
          { id: 'A', text: '20%' },
          { id: 'B', text: '25%' },
          { id: 'C', text: '15%' },
          { id: 'D', text: '30%' },
        ],
        correctOptionId: 'B',
        explanation: 'Profit = 100 - 80 = 20. Profit % = (20 / 80) * 100 = 25%.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 1,
        tags: ['ssc', 'profit-loss'],
      },
      {
        quizId: qSscMath._id,
        questionText: 'What is the compound interest on $1,000 for 2 years at 10% per annum compounded annually?',
        options: [
          { id: 'A', text: '$200' },
          { id: 'B', text: '$210' },
          { id: 'C', text: '$220' },
          { id: 'D', text: '$150' },
        ],
        correctOptionId: 'B',
        explanation: 'Amount = 1000 * (1.1)^2 = 1210. Compound Interest = 1210 - 1000 = $210.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 2,
        tags: ['ssc', 'compound-interest'],
      },
      {
        quizId: qSscMath._id,
        questionText: 'Two trains running in opposite directions cross each other. What is their relative speed?',
        options: [
          { id: 'A', text: 'Difference of their speeds' },
          { id: 'B', text: 'Sum of their speeds' },
          { id: 'C', text: 'Product of their speeds' },
          { id: 'D', text: 'Geometric mean of their speeds' },
        ],
        correctOptionId: 'B',
        explanation: 'When moving towards each other in opposite directions, relative speed is the sum of both speeds (S1 + S2).',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 3,
        tags: ['ssc', 'relative-speed'],
      },
      {
        quizId: qSscMath._id,
        questionText: 'A can complete a project in 12 days and B can complete it in 24 days. Working together, in how many days will they finish?',
        options: [
          { id: 'A', text: '6 days' },
          { id: 'B', text: '8 days' },
          { id: 'C', text: '10 days' },
          { id: 'D', text: '18 days' },
        ],
        correctOptionId: 'B',
        explanation: 'Combined rate = 1/12 + 1/24 = 3/24 = 1/8. Total time = 8 days.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 4,
        tags: ['ssc', 'time-work'],
      },
    ]);

    // =========================================================================
    // SECTION D: UPSC CIVIL SERVICES - POLITY & CONSTITUTION
    // =========================================================================

    const qUpscPolity = await Quiz.create({
      title: 'UPSC Prelims: Indian Polity & Constitution',
      slug: 'upsc-polity',
      description: 'Fundamental rights, directive principles, and parliamentary procedure.',
      category: 'Indian Polity',
      subCategory: 'Polity',
      subjectId: 'upsc-gs',
      topicId: 'polity',
      examType: ExamCategory.UPSC,
      difficulty: QuizDifficulty.HARD,
      timePerQuestionSec: 20,
      questionCount: 4,
      creatorId: creatorDrRamesh._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 1950,
      likesCount: 940,
      rating: 4.91,
      tags: ['upsc', 'polity', 'constitution', 'prelims', 'journey'],
    });

    await Question.insertMany([
      {
        quizId: qUpscPolity._id,
        questionText: 'Which Article of the Indian Constitution guarantees the Right to Constitutional Remedies?',
        options: [
          { id: 'A', text: 'Article 19' },
          { id: 'B', text: 'Article 21' },
          { id: 'C', text: 'Article 32' },
          { id: 'D', text: 'Article 44' },
        ],
        correctOptionId: 'C',
        explanation: 'Dr. B.R. Ambedkar termed Article 32 the "heart and soul of the Constitution", allowing citizens to move the Supreme Court to enforce fundamental rights.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 1,
        tags: ['upsc', 'article-32'],
      },
      {
        quizId: qUpscPolity._id,
        questionText: 'The concept of "Judicial Review" in the Indian Constitution is borrowed from which country?',
        options: [
          { id: 'A', text: 'United States' },
          { id: 'B', text: 'United Kingdom' },
          { id: 'C', text: 'Ireland' },
          { id: 'D', text: 'Canada' },
        ],
        correctOptionId: 'A',
        explanation: 'Judicial Review and independence of the judiciary were inspired by the United States Constitution.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 2,
        tags: ['upsc', 'judicial-review'],
      },
      {
        quizId: qUpscPolity._id,
        questionText: 'Which schedule of the Indian Constitution contains provisions regarding the disqualification of members on grounds of defection?',
        options: [
          { id: 'A', text: '7th Schedule' },
          { id: 'B', text: '8th Schedule' },
          { id: 'C', text: '10th Schedule' },
          { id: 'D', text: '12th Schedule' },
        ],
        correctOptionId: 'C',
        explanation: 'The 10th Schedule (Anti-Defection Law) was added by the 52nd Constitutional Amendment Act of 1985.',
        difficulty: QuizDifficulty.HARD,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 3,
        tags: ['upsc', 'anti-defection'],
      },
      {
        quizId: qUpscPolity._id,
        questionText: 'Under the 42nd Constitutional Amendment Act of 1976, which words were added to the Preamble?',
        options: [
          { id: 'A', text: 'Socialist, Secular, Integrity' },
          { id: 'B', text: 'Democratic, Republic, Sovereign' },
          { id: 'C', text: 'Justice, Liberty, Equality' },
          { id: 'D', text: 'Fraternity, Dignity, Unity' },
        ],
        correctOptionId: 'A',
        explanation: 'The 42nd Amendment of 1976 amended the Preamble to insert the words "Socialist", "Secular", and "Integrity".',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 20,
        order: 4,
        tags: ['upsc', 'preamble'],
      },
    ]);

    // =========================================================================
    // SECTION E: DAILY CHALLENGE (Home Dashboard Daily Quiz - PRD Section 8)
    // =========================================================================

    const qDaily = await Quiz.create({
      title: 'Daily Challenge: Polymath Knowledge Sprint',
      slug: 'daily',
      description: 'Exclusive 5-question multi-discipline drill with 2x XP and Coin bonuses.',
      category: 'General Knowledge',
      subCategory: 'Daily Sprint',
      examType: ExamCategory.GENERAL,
      difficulty: QuizDifficulty.MEDIUM,
      timePerQuestionSec: 15,
      questionCount: 5,
      creatorId: creatorVikrant._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      isDailyChallenge: true,
      featured: true,
      playCount: 4890,
      likesCount: 2310,
      rating: 4.96,
      tags: ['daily', 'challenge', 'sprint', 'bonus-xp'],
    });

    await Question.insertMany([
      {
        quizId: qDaily._id,
        questionText: 'What is the SI unit of electric potential difference?',
        options: [
          { id: 'A', text: 'Ampere' },
          { id: 'B', text: 'Volt' },
          { id: 'C', text: 'Ohm' },
          { id: 'D', text: 'Watt' },
        ],
        correctOptionId: 'B',
        explanation: 'The Volt (V) is the SI unit of electric potential and electromotive force, defined as one joule of energy per coulomb of charge.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 1,
        tags: ['daily', 'science'],
      },
      {
        quizId: qDaily._id,
        questionText: 'Which economic theory argues that aggregate demand primarily determines overall economic activity, especially during recessions?',
        options: [
          { id: 'A', text: 'Keynesian Economics' },
          { id: 'B', text: 'Classical Economics' },
          { id: 'C', text: 'Austrian Economics' },
          { id: 'D', text: 'Supply-Side Economics' },
        ],
        correctOptionId: 'A',
        explanation: 'John Maynard Keynes argued in 1936 that active government fiscal intervention is essential during economic downturns because prices and wages are sticky.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 2,
        tags: ['daily', 'economics'],
      },
      {
        quizId: qDaily._id,
        questionText: 'Which planet in our solar system has the highest density?',
        options: [
          { id: 'A', text: 'Earth' },
          { id: 'B', text: 'Jupiter' },
          { id: 'C', text: 'Mercury' },
          { id: 'D', text: 'Saturn' },
        ],
        correctOptionId: 'A',
        explanation: 'Earth has an average density of 5.51 g/cm³, making it the densest planet in the solar system, largely due to its metallic core.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 3,
        tags: ['daily', 'astronomy'],
      },
      {
        quizId: qDaily._id,
        questionText: 'In computer science, what algorithmic technique does Dijkstra shortest path algorithm utilize?',
        options: [
          { id: 'A', text: 'Divide and Conquer' },
          { id: 'B', text: 'Greedy Strategy' },
          { id: 'C', text: 'Backtracking' },
          { id: 'D', text: 'Genetic Optimization' },
        ],
        correctOptionId: 'B',
        explanation: "Dijkstra's algorithm selects the locally optimal choice (the vertex with minimum tentative distance) at each step, representing a canonical greedy approach.",
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 4,
        tags: ['daily', 'algorithms'],
      },
      {
        quizId: qDaily._id,
        questionText: 'Which sea is situated between Jordan, Israel, and the West Bank, famous for hypersalinity?',
        options: [
          { id: 'A', text: 'Red Sea' },
          { id: 'B', text: 'Dead Sea' },
          { id: 'C', text: 'Caspian Sea' },
          { id: 'D', text: 'Black Sea' },
        ],
        correctOptionId: 'B',
        explanation: 'The Dead Sea is a landlocked salt lake whose surface and shores are 430.5 meters below sea level, Earths lowest land elevation.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 5,
        tags: ['daily', 'geography'],
      },
    ]);

    // =========================================================================
    // SECTION F: THE RING (ESPORTS QUICK MATCH & 1V1 COMPETITIVE ARENA)
    // =========================================================================

    const qQuickMatch = await Quiz.create({
      title: 'The Ring: Rapid Esports Match',
      slug: 'quick-match',
      description: 'Ultra-fast 10-second adrenaline trivia for competitive rating and ELO progression.',
      category: 'General Knowledge',
      subCategory: 'Esports Arena',
      examType: ExamCategory.GENERAL,
      difficulty: QuizDifficulty.MEDIUM,
      timePerQuestionSec: 10,
      questionCount: 5,
      creatorId: creatorVikrant._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      featured: true,
      playCount: 5600,
      likesCount: 3100,
      rating: 4.93,
      tags: ['the-ring', 'quick-match', 'multiplayer', 'esports', 'speed'],
    });

    await Question.insertMany([
      {
        quizId: qQuickMatch._id,
        questionText: 'What is the chemical symbol for Tungsten?',
        options: [
          { id: 'A', text: 'Tn' },
          { id: 'B', text: 'W' },
          { id: 'C', text: 'Tg' },
          { id: 'D', text: 'Tu' },
        ],
        correctOptionId: 'B',
        explanation: 'Tungsten is symbolized as W from its German mineral name Wolfram.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 10,
        order: 1,
        tags: ['speed', 'chemistry'],
      },
      {
        quizId: qQuickMatch._id,
        questionText: 'Which country is known as the "Land of the Midnight Sun"?',
        options: [
          { id: 'A', text: 'Norway' },
          { id: 'B', text: 'Japan' },
          { id: 'C', text: 'Iceland' },
          { id: 'D', text: 'Canada' },
        ],
        correctOptionId: 'A',
        explanation: 'Norway experiences continuous daylight during summer months above the Arctic Circle.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 10,
        order: 2,
        tags: ['speed', 'geography'],
      },
      {
        quizId: qQuickMatch._id,
        questionText: 'What year did Tim Berners-Lee invent the World Wide Web?',
        options: [
          { id: 'A', text: '1983' },
          { id: 'B', text: '1989' },
          { id: 'C', text: '1995' },
          { id: 'D', text: '2001' },
        ],
        correctOptionId: 'B',
        explanation: 'Tim Berners-Lee wrote the proposal for what would become the World Wide Web in March 1989 at CERN.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 10,
        order: 3,
        tags: ['speed', 'tech'],
      },
      {
        quizId: qQuickMatch._id,
        questionText: 'Which human organ consumes roughly 20% of the body’s total oxygen and calories despite weighing only ~2% of body mass?',
        options: [
          { id: 'A', text: 'Liver' },
          { id: 'B', text: 'Brain' },
          { id: 'C', text: 'Heart' },
          { id: 'D', text: 'Kidneys' },
        ],
        correctOptionId: 'B',
        explanation: 'The human brain is an intensely metabolic organ requiring constant glucose and oxygen supply.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 10,
        order: 4,
        tags: ['speed', 'biology'],
      },
      {
        quizId: qQuickMatch._id,
        questionText: 'In financial markets, a "Bull Market" refers to a condition where:',
        options: [
          { id: 'A', text: 'Stock prices are plunging rapidly' },
          { id: 'B', text: 'Asset prices are rising or expected to rise' },
          { id: 'C', text: 'Interest rates are strictly negative' },
          { id: 'D', text: 'Commodity trading is suspended' },
        ],
        correctOptionId: 'B',
        explanation: 'A bull market is characterized by rising prices, investor confidence, and economic optimism.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 10,
        order: 5,
        tags: ['speed', 'finance'],
      },
    ]);

    // =========================================================================
    // SECTION G: CASUAL & ENTERTAINMENT (PRD Section 3.1)
    // =========================================================================

    const qPopCulture = await Quiz.create({
      title: 'Pop Culture & Cinema Blitz',
      slug: 'pop-culture',
      description: 'Test your knowledge on blockbuster cinema, music legends, and iconic pop culture moments.',
      category: 'General Knowledge',
      subCategory: 'Entertainment',
      examType: ExamCategory.GENERAL,
      difficulty: QuizDifficulty.EASY,
      timePerQuestionSec: 15,
      questionCount: 4,
      creatorId: creatorVikrant._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 3200,
      likesCount: 1940,
      rating: 4.89,
      tags: ['pop-culture', 'cinema', 'music', 'entertainment'],
    });

    await Question.insertMany([
      {
        quizId: qPopCulture._id,
        questionText: 'Which film won the Academy Award for Best Picture in 2020, becoming the first non-English language film to do so?',
        options: [
          { id: 'A', text: '1917' },
          { id: 'B', text: 'Parasite' },
          { id: 'C', text: 'Roma' },
          { id: 'D', text: 'The Irishman' },
        ],
        correctOptionId: 'B',
        explanation: 'Bong Joon-ho’s South Korean masterpiece Parasite won 4 Oscars including Best Picture in 2020.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 1,
        tags: ['cinema', 'oscars'],
      },
      {
        quizId: qPopCulture._id,
        questionText: 'Who holds the all-time record for the most Grammy Awards won by an artist in history?',
        options: [
          { id: 'A', text: 'Michael Jackson' },
          { id: 'B', text: 'Beyoncé' },
          { id: 'C', text: 'Stevie Wonder' },
          { id: 'D', text: 'Taylor Swift' },
        ],
        correctOptionId: 'B',
        explanation: 'Beyoncé has won 32 Grammy Awards, breaking Georg Solti’s long-standing record.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 2,
        tags: ['music', 'grammys'],
      },
      {
        quizId: qPopCulture._id,
        questionText: 'In the Marvel Cinematic Universe, what is the fictional metal vibranium primarily sourced from?',
        options: [
          { id: 'A', text: 'Asgard' },
          { id: 'B', text: 'Wakanda' },
          { id: 'C', text: 'Sokovia' },
          { id: 'D', text: 'Xandar' },
        ],
        correctOptionId: 'B',
        explanation: 'Wakanda sits upon a massive meteorite rich in the sound-absorbent alien metal Vibranium.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 3,
        tags: ['cinema', 'marvel'],
      },
      {
        quizId: qPopCulture._id,
        questionText: 'Which legendary author wrote the epic fantasy series "A Song of Ice and Fire"?',
        options: [
          { id: 'A', text: 'J.R.R. Tolkien' },
          { id: 'B', text: 'George R.R. Martin' },
          { id: 'C', text: 'Brandon Sanderson' },
          { id: 'D', text: 'Neil Gaiman' },
        ],
        correctOptionId: 'B',
        explanation: 'George R.R. Martin is the author of A Song of Ice and Fire, adapted by HBO into Game of Thrones.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 4,
        tags: ['pop-culture', 'literature'],
      },
    ]);

    // =========================================================================
    // SECTION H: BANKING & FINANCIAL AWARENESS
    // =========================================================================

    const qBanking = await Quiz.create({
      title: 'Banking & Insurance: Financial Awareness',
      slug: 'banking-awareness',
      description: 'IBPS PO & Clerk special: financial markets, digital banking, and regulatory guidelines.',
      category: 'Banking',
      subCategory: 'Financial Awareness',
      examType: ExamCategory.BANKING,
      difficulty: QuizDifficulty.MEDIUM,
      timePerQuestionSec: 15,
      questionCount: 4,
      creatorId: creatorDrRamesh._id,
      visibility: QuizVisibility.PUBLIC,
      isApproved: true,
      playCount: 1870,
      likesCount: 920,
      rating: 4.88,
      tags: ['banking', 'ibps', 'finance', 'awareness'],
    });

    await Question.insertMany([
      {
        quizId: qBanking._id,
        questionText: 'What does the acronym IFSC stand for in the Indian banking system?',
        options: [
          { id: 'A', text: 'Indian Financial System Code' },
          { id: 'B', text: 'International Funds Settlement Code' },
          { id: 'C', text: 'Interbank Fund Switching Channel' },
          { id: 'D', text: 'Integrated Fiscal Security Certificate' },
        ],
        correctOptionId: 'A',
        explanation: 'IFSC is an 11-character alphanumeric code used for NEFT, RTGS, and IMPS electronic money transfers in India.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 1,
        tags: ['banking', 'ifsc'],
      },
      {
        quizId: qBanking._id,
        questionText: 'Which regulatory authority oversees and regulates the insurance sector in India?',
        options: [
          { id: 'A', text: 'SEBI' },
          { id: 'B', text: 'IRDAI' },
          { id: 'C', text: 'RBI' },
          { id: 'D', text: 'PFRDA' },
        ],
        correctOptionId: 'B',
        explanation: 'The Insurance Regulatory and Development Authority of India (IRDAI) is the statutory body regulating the insurance and reinsurance industry.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 2,
        tags: ['banking', 'irdai'],
      },
      {
        quizId: qBanking._id,
        questionText: 'Under the Deposit Insurance and Credit Guarantee Corporation (DICGC) scheme, bank deposits are insured up to what maximum amount per depositor per bank?',
        options: [
          { id: 'A', text: '₹1 Lakh' },
          { id: 'B', text: '₹5 Lakh' },
          { id: 'C', text: '₹10 Lakh' },
          { id: 'D', text: '₹25 Lakh' },
        ],
        correctOptionId: 'B',
        explanation: 'DICGC (a wholly-owned subsidiary of RBI) covers principal and interest up to a maximum of ₹5 Lakh per depositor per bank.',
        difficulty: QuizDifficulty.MEDIUM,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 3,
        tags: ['banking', 'dicgc'],
      },
      {
        quizId: qBanking._id,
        questionText: 'Unified Payments Interface (UPI) was developed by which organization in India?',
        options: [
          { id: 'A', text: 'State Bank of India (SBI)' },
          { id: 'B', text: 'National Payments Corporation of India (NPCI)' },
          { id: 'C', text: 'Ministry of Electronics and IT (MeitY)' },
          { id: 'D', text: 'NASSCOM' },
        ],
        correctOptionId: 'B',
        explanation: 'NPCI, an initiative of RBI and Indian Banks Association (IBA), developed and launched UPI in 2016.',
        difficulty: QuizDifficulty.EASY,
        questionType: QuestionType.MULTIPLE_CHOICE,
        durationSec: 15,
        order: 4,
        tags: ['banking', 'upi'],
      },
    ]);

    const totalQuizzesCount = await Quiz.countDocuments();
    const totalQuestionsCount = await Question.countDocuments();
    console.log(`✅ Seed complete! Total Quizzes: ${totalQuizzesCount}, Total Questions: ${totalQuestionsCount}`);
  } catch (err) {
    console.error('Seed error:', err);
  }
};
