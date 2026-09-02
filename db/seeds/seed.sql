-- seed.sql
-- Production seed data for yarrwin.online
-- Admin credentials are set via /api/admin/setup (PBKDF2 hashed)

-- ===== Categories =====
INSERT OR IGNORE INTO categories (id, name, slug, description, seo_title, meta_description, status)
VALUES
(1, 'Lottery Results', 'lottery-results', 'Latest lottery results, draw schedules and winning numbers.', 'Lottery Results — Latest Draw Results & Winning Numbers', 'Check the latest lottery results, draw schedules and winning numbers from around the world.', 'active'),
(2, 'Gaming Guides', 'gaming-guides', 'Expert guides and tips for online gaming enthusiasts.', 'Gaming Guides — Expert Tips & Strategies', 'Master online gaming with our expert guides, tips and strategies for popular games.', 'active'),
(3, 'Winner Stories', 'winner-stories', 'Inspiring stories from real lottery and gaming winners.', 'Winner Stories — Real People, Real Wins', 'Read inspiring stories from real lottery and gaming winners who changed their lives.', 'active');

-- ===== Published Posts =====
INSERT OR IGNORE INTO posts (id, title, slug, excerpt, content, category_id, author_id, status, published_at, seo_title, meta_description)
VALUES
(1,
  'How to Check Your Lottery Numbers Online',
  'how-to-check-lottery-numbers-online',
  'A step-by-step guide to verifying your lottery numbers and claiming your prize.',
  '<h2>Introduction</h2><p>Checking your lottery numbers has never been easier. With online platforms, you can verify your tickets instantly from anywhere in the world.</p><h2>Step 1: Choose a Trusted Platform</h2><p>Always use official lottery websites or verified platforms like Yarrwin to check your numbers. This ensures accuracy and security.</p><h2>Step 2: Enter Your Numbers</h2><p>Input your ticket numbers into the verification tool. The system will automatically compare them against the latest draw results.</p><h2>Step 3: Check for Prizes</h2><p>If your numbers match, congratulations! Follow the platform instructions to claim your prize. Most platforms provide clear guidance on the claiming process.</p><h2>Tips for Staying Safe</h2><p>Never share your ticket details with untrusted parties. Use secure, encrypted connections when checking numbers online.</p>',
  1, 1, 'published', datetime('now'),
  'How to Check Your Lottery Numbers Online — Step by Step Guide',
  'Learn how to verify your lottery numbers online quickly and securely with our step-by-step guide.'
),
(2,
  'Top 5 Online Gaming Strategies for Beginners',
  'top-5-online-gaming-strategies-beginners',
  'Essential strategies to improve your online gaming performance from day one.',
  '<h2>Why Strategy Matters</h2><p>Online gaming is not just about luck — having a solid strategy can significantly improve your chances of winning and make the experience more enjoyable.</p><h2>Strategy 1: Start Small</h2><p>Begin with lower stakes games to learn the mechanics without risking too much. This builds confidence and understanding.</p><h2>Strategy 2: Learn the Rules</h2><p>Every game has unique rules and odds. Understanding them gives you a competitive edge over players who rely purely on chance.</p><h2>Strategy 3: Manage Your Bankroll</h2><p>Set a budget before you start playing and stick to it. Smart bankroll management is the foundation of long-term success.</p><h2>Strategy 4: Take Breaks</h2><p>Regular breaks help maintain focus and prevent emotional decisions. Step away when you need to recharge.</p><h2>Strategy 5: Learn from Others</h2><p>Watch experienced players, read guides, and join communities to accelerate your learning curve.</p>',
  2, 1, 'published', datetime('now'),
  'Top 5 Online Gaming Strategies for Beginners — Win More',
  'Discover essential online gaming strategies for beginners to improve your performance and enjoy smarter play.'
),
(3,
  'Understanding Lottery Odds and Probability',
  'understanding-lottery-odds-probability',
  'A clear explanation of how lottery odds work and what they mean for players.',
  '<h2>Introduction</h2><p>Understanding lottery odds helps you make informed decisions about which games to play and what to expect.</p><h2>How Odds Are Calculated</h2><p>Lottery odds are determined by the total number of possible combinations. For example, in a 6/49 lottery, the odds of winning the jackpot are approximately 1 in 13.9 million.</p><h2>What This Means for Players</h2><p>While the odds of winning a jackpot are slim, many lotteries offer multiple prize tiers with better odds. Understanding the full prize structure helps set realistic expectations.</p>',
  1, 1, 'draft', NULL,
  '', ''
);

-- ===== Settings =====
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('site_name', 'Yarrwin'),
  ('site_url', 'https://yarrwin.online'),
  ('site_tagline', 'Online Gaming & Lottery Results'),
  ('default_seo_title', 'Yarrwin — Online Gaming & Lottery Results Platform'),
  ('default_meta_description', 'Check lottery results, discover gaming strategies, and read winner stories on Yarrwin — your trusted online gaming and lottery platform.'),
  ('default_og_image', '/og/default.png'),
  ('posts_per_page', '12'),
  ('timezone', 'Asia/Kolkata');
