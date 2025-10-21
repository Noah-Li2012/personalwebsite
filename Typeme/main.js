// TypeMaster Pro - Main JavaScript File
// Advanced WPM Typing Test with Real-time Feedback

class TypingTest {
    constructor() {
        this.isActive = false;
        this.isPaused = false;
        this.startTime = null;
        this.timer = null;
        this.timeLeft = 60;
        this.totalTime = 60;
        this.correctChars = 0;
        this.totalChars = 0;
        this.errors = 0;
        this.currentPosition = 0;
        this.currentWPM = 0;
        this.accuracy = 100;
        this.soundEnabled = true;
        this.audioContext = null;
        this.audioBuffers = {};
        
        // Sample texts for different categories and difficulties
        this.sampleTexts = {
            easy: {
                general: [
                    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet.",
                    "Practice makes perfect when learning to type. Start slowly and focus on accuracy first.",
                    "Technology has changed how we communicate and work every single day in modern life."
                ],
                technology: [
                    "Computers and smartphones have become essential tools in our daily lives and work.",
                    "The internet connects people from all around the world in seconds and minutes.",
                    "Software development requires patience, practice, and continuous learning every day."
                ]
            },
            medium: {
                general: [
                    "The art of touch typing involves developing muscle memory through consistent practice and dedication. Professional typists can achieve speeds exceeding one hundred words per minute with proper technique and training.",
                    "In today's digital age, typing skills are essential for productivity and communication. Whether writing emails, creating documents, or coding software, fast and accurate typing provides significant advantages in the workplace.",
                    "Learning to type properly requires patience and systematic practice. Focus on finger placement, posture, and rhythm rather than speed. Speed will naturally improve as accuracy and muscle memory develop over time."
                ],
                technology: [
                    "Modern programming languages emphasize readability and maintainability through clean syntax and comprehensive documentation. Developers must balance functionality with code elegance to create sustainable software solutions.",
                    "Artificial intelligence and machine learning are transforming industries by automating complex tasks and providing data-driven insights. These technologies require skilled professionals who understand both theory and practical implementation.",
                    "Cybersecurity has become increasingly critical as digital threats evolve and multiply. Organizations must implement robust security measures, regular audits, and employee training to protect sensitive data and maintain operational integrity."
                ],
                literature: [
                    "Literature reflects humanity's deepest thoughts, emotions, and experiences through carefully crafted narratives and poetic expressions. Great works transcend time and culture, offering insights into the human condition that remain relevant across generations.",
                    "The evolution of literary styles mirrors societal changes and cultural shifts throughout history. From classical epics to modern experimental fiction, each era produces distinctive voices that capture the spirit of their time while contributing to the ongoing dialogue of human creativity.",
                    "Reading diverse literary works expands our understanding of different perspectives and experiences. Through fiction, poetry, and drama, we encounter characters and situations that challenge our assumptions and broaden our empathy for others."
                ],
                business: [
                    "Effective business communication requires clarity, conciseness, and consideration for the audience's needs and expectations. Professional correspondence should convey information efficiently while maintaining appropriate tone and etiquette.",
                    "Strategic planning involves setting clear objectives, analyzing market conditions, and allocating resources effectively to achieve sustainable competitive advantage. Successful organizations balance short-term performance with long-term vision and adaptability.",
                    "Leadership in modern organizations demands emotional intelligence, technical competence, and the ability to inspire and motivate teams. Effective leaders create environments where individuals can contribute their best work while pursuing collective goals."
                ]
            },
            hard: {
                general: [
                    "The phenomenon of neuroplasticity demonstrates that the human brain possesses remarkable capacity for adaptation and reorganization throughout the lifespan, challenging previously held beliefs about fixed cognitive abilities and developmental limitations in adult learning and skill acquisition processes.",
                    "Contemporary research in cognitive psychology reveals that deliberate practice, characterized by focused attention, immediate feedback, and systematic progression through increasingly challenging tasks, produces superior learning outcomes compared to mere repetition or casual engagement with complex skills such as musical performance or athletic competition.",
                    "The intersection of technology and education continues to evolve rapidly, with adaptive learning systems, virtual reality simulations, and artificial intelligence tutors creating personalized educational experiences that adjust to individual learning styles, pace preferences, and knowledge gaps in real-time."
                ],
                technology: [
                    "Quantum computing represents a paradigm shift in computational methodology, leveraging quantum mechanical principles such as superposition and entanglement to process information in ways that transcend classical binary limitations, potentially revolutionizing fields including cryptography, drug discovery, and complex system optimization through exponential computational advantages.",
                    "The implementation of blockchain technology extends far beyond cryptocurrency applications, enabling decentralized verification systems, smart contracts, and distributed ledger technologies that promise to transform supply chain management, digital identity verification, and peer-to-peer transaction systems across numerous industries and use cases.",
                    "Edge computing architectures distribute computational resources strategically between centralized cloud infrastructure and localized processing nodes, optimizing latency-sensitive applications, reducing bandwidth requirements, and enabling real-time data processing for Internet of Things devices, autonomous vehicles, and immersive augmented reality experiences."
                ]
            }
        };
        
        this.currentText = '';
        this.userStats = this.loadStats();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeParticles();
        this.initializeTypedText();
        this.loadRandomText();
        this.updateStatsDisplay();
        this.preloadAudio();
        this.setupOrbTool();
        this.updateGoalTracker();
        
        // Initialize character splitting for animation
        if (typeof Splitting !== 'undefined') {
            Splitting();
        }
    }
    
    setupEventListeners() {
        // Test control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startTest());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseTest());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetTest());
        document.getElementById('startTestBtn').addEventListener('click', () => this.startTest());
        document.getElementById('viewStatsBtn').addEventListener('click', () => window.location.href = 'statistics.html');
        
        // Typing input
        const typingInput = document.getElementById('typingInput');
        typingInput.addEventListener('input', (e) => this.handleTyping(e));
        typingInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Settings and options
        document.getElementById('testDuration').addEventListener('change', (e) => this.setDuration(parseInt(e.target.value)));
        document.getElementById('difficultyLevel').addEventListener('change', () => this.loadRandomText());
        document.getElementById('textCategory').addEventListener('change', () => this.loadRandomText());
        document.getElementById('resetErrorsBtn').addEventListener('click', () => this.resetErrors());
        
        // Orb tool menu
        document.getElementById('floatingOrb').addEventListener('click', () => this.toggleOrbMenu());
        document.getElementById('toggleSound').addEventListener('click', () => this.toggleSound());
        document.getElementById('customTextBtn').addEventListener('click', () => this.showCustomTextDialog());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#floatingOrb')) {
                this.hideOrbMenu();
            }
        });
    }
    
    initializeParticles() {
        // P5.js particle system for hero background
        new p5((p) => {
            let particles = [];
            
            p.setup = () => {
                const canvas = p.createCanvas(window.innerWidth, 400);
                canvas.parent('particleCanvas');
                
                // Create particles
                for (let i = 0; i < 50; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        size: p.random(2, 6),
                        speedX: p.random(-0.5, 0.5),
                        speedY: p.random(-0.5, 0.5),
                        opacity: p.random(0.3, 0.8)
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Update and draw particles
                particles.forEach(particle => {
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                    
                    // Draw particle
                    p.fill(255, 255, 255, particle.opacity * 255);
                    p.noStroke();
                    p.ellipse(particle.x, particle.y, particle.size);
                });
            };
            
            p.windowResized = () => {
                p.resizeCanvas(window.innerWidth, 400);
            };
        });
    }
    
    initializeTypedText() {
        if (typeof Typed !== 'undefined') {
            new Typed('#typed-text', {
                strings: [
                    'Master Your Typing Speed',
                    'Improve Your WPM Score',
                    'Track Your Progress Daily',
                    'Achieve Typing Excellence'
                ],
                typeSpeed: 60,
                backSpeed: 40,
                backDelay: 2000,
                loop: true,
                showCursor: true,
                cursorChar: '|'
            });
        }
    }
    
    preloadAudio() {
        // Create audio context for sound effects
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            this.audioContext = new (AudioContext || webkitAudioContext)();
        }
        
        // For demo purposes, we'll use Web Audio API to generate simple sounds
        this.generateAudioBuffers();
    }
    
    generateAudioBuffers() {
        if (!this.audioContext) return;
        
        // Generate keypress sound
        this.audioBuffers.keypress = this.createTone(800, 0.1);
        this.audioBuffers.error = this.createTone(200, 0.2);
        this.audioBuffers.success = this.createTone(1000, 0.3);
    }
    
    createTone(frequency, duration) {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode, duration };
    }
    
    playSound(type) {
        if (!this.soundEnabled || !this.audioBuffers[type]) return;
        
        try {
            const buffer = this.audioBuffers[type];
            if (buffer.oscillator) {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.frequency.value = buffer.oscillator.frequency.value;
                osc.type = buffer.oscillator.type;
                
                gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + buffer.duration);
                
                osc.start(this.audioContext.currentTime);
                osc.stop(this.audioContext.currentTime + buffer.duration);
            }
        } catch (error) {
            console.log('Audio playback failed:', error);
        }
    }
    
    setupOrbTool() {
        const orb = document.getElementById('floatingOrb');
        const eyes = orb.querySelectorAll('.orb-pupil');
        
        // Make eyes follow cursor
        document.addEventListener('mousemove', (e) => {
            if (!orb.matches(':hover')) return;
            
            const rect = orb.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const distance = Math.min(3, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 20);
            
            eyes.forEach(eye => {
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                eye.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
        
        // Blinking animation
        setInterval(() => {
            if (Math.random() < 0.3) {
                eyes.forEach(eye => {
                    eye.style.transform = 'scaleY(0.1)';
                    setTimeout(() => {
                        eye.style.transform = 'scaleY(1)';
                    }, 150);
                });
            }
        }, 3000);
    }
    
    toggleOrbMenu() {
        const menu = document.getElementById('orbMenu');
        menu.classList.toggle('active');
    }
    
    hideOrbMenu() {
        const menu = document.getElementById('orbMenu');
        menu.classList.remove('active');
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const status = document.getElementById('soundStatus');
        status.textContent = this.soundEnabled ? 'ON' : 'OFF';
        
        // Play test sound
        if (this.soundEnabled) {
            this.playSound('keypress');
        }
    }
    
    showCustomTextDialog() {
        const customText = prompt('Enter your custom text for practice:');
        if (customText && customText.trim().length > 0) {
            this.currentText = customText.trim();
            this.displaySampleText();
            this.resetTest();
        }
    }
    
    loadRandomText() {
        const difficulty = document.getElementById('difficultyLevel').value;
        const category = document.getElementById('textCategory').value;
        
        const texts = this.sampleTexts[difficulty] && this.sampleTexts[difficulty][category] 
            ? this.sampleTexts[difficulty][category] 
            : this.sampleTexts.medium.general;
        
        this.currentText = texts[Math.floor(Math.random() * texts.length)];
        this.displaySampleText();
    }
    
    displaySampleText() {
        const sampleTextElement = document.getElementById('sampleText');
        sampleTextElement.innerHTML = this.currentText
            .split('')
            .map((char, index) => `<span class="character" data-index="${index}">${char}</span>`)
            .join('');
    }
    
    setDuration(seconds) {
        this.totalTime = seconds;
        this.timeLeft = seconds;
        this.updateTimerDisplay();
        
        if (!this.isActive) {
            document.getElementById('timerDisplay').textContent = this.formatTime(seconds);
        }
    }
    
    startTest() {
        if (this.isPaused) {
            this.resumeTest();
            return;
        }
        
        this.isActive = true;
        this.startTime = Date.now();
        this.currentPosition = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.errors = 0;
        this.currentWPM = 0;
        this.accuracy = 100;
        
        document.getElementById('typingInput').disabled = false;
        document.getElementById('typingInput').focus();
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        this.startTimer();
        this.updateDisplay();
        this.hideEncouragement();
        
        // Animate start
        anime({
            targets: '.typing-area',
            scale: [0.98, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
    }
    
    pauseTest() {
        this.isPaused = true;
        this.isActive = false;
        clearInterval(this.timer);
        
        document.getElementById('typingInput').disabled = true;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('startBtn').textContent = 'Resume';
    }
    
    resumeTest() {
        this.isPaused = false;
        this.isActive = true;
        
        document.getElementById('typingInput').disabled = false;
        document.getElementById('typingInput').focus();
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('startBtn').textContent = 'Start Test';
        
        this.startTimer();
    }
    
    resetTest() {
        this.isActive = false;
        this.isPaused = false;
        clearInterval(this.timer);
        
        this.currentPosition = 0;
        this.correctChars = 0;
        this.totalChars = 0;
        this.errors = 0;
        this.currentWPM = 0;
        this.accuracy = 100;
        this.timeLeft = this.totalTime;
        
        document.getElementById('typingInput').value = '';
        document.getElementById('typingInput').disabled = true;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('startBtn').textContent = 'Start Test';
        
        this.displaySampleText();
        this.updateDisplay();
        this.updateTimerDisplay();
        this.hideEncouragement();
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateTimerDisplay();
            } else {
                this.endTest();
            }
        }, 1000);
    }
    
    endTest() {
        this.isActive = false;
        clearInterval(this.timer);
        
        document.getElementById('typingInput').disabled = true;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('startBtn').textContent = 'Start New Test';
        
        // Save results
        this.saveTestResult();
        this.checkAchievements();
        this.showEncouragement();
        
        // Celebration animation
        anime({
            targets: '.metric-card',
            scale: [1, 1.05, 1],
            duration: 600,
            delay: anime.stagger(100),
            easing: 'easeInOutQuad'
        });
        
        this.playSound('success');
    }
    
    handleTyping(event) {
        if (!this.isActive) return;
        
        const input = event.target.value;
        const inputLength = input.length;
        
        // Update total characters
        this.totalChars = inputLength;
        
        // Calculate correct characters
        this.correctChars = 0;
        this.errors = 0;
        
        for (let i = 0; i < inputLength; i++) {
            if (i < this.currentText.length) {
                if (input[i] === this.currentText[i]) {
                    this.correctChars++;
                } else {
                    this.errors++;
                }
            }
        }
        
        // Update current position and display
        this.currentPosition = inputLength;
        this.updateCharacterDisplay(input);
        this.calculateMetrics();
        this.updateDisplay();
        
        // Play typing sound
        this.playSound('keypress');
        
        // Check if test is completed
        if (inputLength >= this.currentText.length) {
            this.endTest();
        }
    }
    
    handleKeyDown(event) {
        if (!this.isActive) return;
        
        // Prevent backspace beyond the current text
        if (event.key === 'Backspace') {
            const input = event.target.value;
            if (input.length === 0) {
                event.preventDefault();
                return;
            }
            
            // Check if we're at an error position
            const cursorPos = event.target.selectionStart;
            if (cursorPos > 0 && input[cursorPos - 1] !== this.currentText[cursorPos - 1]) {
                this.playSound('error');
            }
        }
        
        // Play error sound for incorrect characters
        const input = event.target.value;
        const cursorPos = event.target.selectionStart;
        
        if (event.key.length === 1 && cursorPos < this.currentText.length) {
            if (event.key !== this.currentText[cursorPos]) {
                this.playSound('error');
                
                // Add visual feedback for error
                anime({
                    targets: '#typingInput',
                    borderColor: ['#ef4444', '#e5e7eb'],
                    duration: 500,
                    easing: 'easeOutQuad'
                });
            }
        }
    }
    
    updateCharacterDisplay(input) {
        const characters = document.querySelectorAll('.character');
        
        characters.forEach((char, index) => {
            char.classList.remove('correct', 'incorrect', 'current');
            
            if (index < input.length) {
                if (input[index] === this.currentText[index]) {
                    char.classList.add('correct');
                } else {
                    char.classList.add('incorrect');
                }
            } else if (index === input.length) {
                char.classList.add('current');
            }
        });
    }
    
    calculateMetrics() {
        // Calculate WPM (Words Per Minute)
        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
        const wordsTyped = this.correctChars / 5; // Average word length is 5 characters
        this.currentWPM = timeElapsed > 0 ? Math.round(wordsTyped / timeElapsed) : 0;
        
        // Calculate accuracy
        this.accuracy = this.totalChars > 0 ? Math.round((this.correctChars / this.totalChars) * 100) : 100;
        
        // Update progress ring
        this.updateProgressRing();
    }
    
    updateProgressRing() {
        const progressRing = document.getElementById('wpmProgress');
        const goalWPM = parseInt(document.getElementById('dailyGoal').textContent);
        const progress = Math.min(this.currentWPM / goalWPM, 1);
        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (progress * circumference);
        
        progressRing.style.strokeDashoffset = offset;
    }
    
    updateDisplay() {
        document.getElementById('currentWPM').textContent = this.currentWPM;
        document.getElementById('accuracy').textContent = `${this.accuracy}%`;
        document.getElementById('errorCount').textContent = this.errors;
        document.getElementById('correctChars').textContent = this.correctChars;
        document.getElementById('totalChars').textContent = this.totalChars;
    }
    
    updateTimerDisplay() {
        document.getElementById('timerDisplay').textContent = this.formatTime(this.timeLeft);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    resetErrors() {
        this.errors = 0;
        this.updateDisplay();
        this.playSound('keypress');
    }
    
    saveTestResult() {
        const result = {
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now(),
            wpm: this.currentWPM,
            accuracy: this.accuracy,
            errors: this.errors,
            duration: this.totalTime - this.timeLeft,
            difficulty: document.getElementById('difficultyLevel').value,
            category: document.getElementById('textCategory').value
        };
        
        if (!this.userStats.dailyStats[result.date]) {
            this.userStats.dailyStats[result.date] = {
                tests: [],
                bestWPM: 0,
                averageWPM: 0,
                totalTests: 0
            };
        }
        
        this.userStats.dailyStats[result.date].tests.push(result);
        this.userStats.dailyStats[result.date].totalTests++;
        
        // Update best WPM
        if (this.currentWPM > this.userStats.dailyStats[result.date].bestWPM) {
            this.userStats.dailyStats[result.date].bestWPM = this.currentWPM;
        }
        
        // Update overall best WPM
        if (this.currentWPM > this.userStats.bestWPM) {
            this.userStats.bestWPM = this.currentWPM;
        }
        
        // Calculate daily average
        const dailyTests = this.userStats.dailyStats[result.date].tests;
        const totalWPM = dailyTests.reduce((sum, test) => sum + test.wpm, 0);
        this.userStats.dailyStats[result.date].averageWPM = Math.round(totalWPM / dailyTests.length);
        
        // Update streak
        this.updateStreak();
        
        this.saveStats();
        this.updateStatsDisplay();
    }
    
    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        if (this.userStats.dailyStats[today] && this.userStats.dailyStats[today].tests.length > 0) {
            if (this.userStats.lastActiveDate === yesterday || this.userStats.lastActiveDate === today) {
                if (this.userStats.lastActiveDate !== today) {
                    this.userStats.currentStreak++;
                }
            } else {
                this.userStats.currentStreak = 1;
            }
            this.userStats.lastActiveDate = today;
        }
    }
    
    checkAchievements() {
        const achievements = [];
        
        // Speed achievements
        if (this.currentWPM >= 40 && !this.userStats.achievements.includes('speed_40')) {
            achievements.push({ id: 'speed_40', title: 'Speed Demon', description: 'Reached 40 WPM!' });
        }
        if (this.currentWPM >= 60 && !this.userStats.achievements.includes('speed_60')) {
            achievements.push({ id: 'speed_60', title: 'Lightning Fingers', description: 'Reached 60 WPM!' });
        }
        if (this.currentWPM >= 80 && !this.userStats.achievements.includes('speed_80')) {
            achievements.push({ id: 'speed_80', title: 'Typing Master', description: 'Reached 80 WPM!' });
        }
        
        // Accuracy achievements
        if (this.accuracy >= 95 && !this.userStats.achievements.includes('accuracy_95')) {
            achievements.push({ id: 'accuracy_95', title: 'Precision Typist', description: 'Achieved 95% accuracy!' });
        }
        if (this.accuracy >= 98 && !this.userStats.achievements.includes('accuracy_98')) {
            achievements.push({ id: 'accuracy_98', title: 'Perfectionist', description: 'Achieved 98% accuracy!' });
        }
        
        // Streak achievements
        if (this.userStats.currentStreak >= 7 && !this.userStats.achievements.includes('streak_7')) {
            achievements.push({ id: 'streak_7', title: 'Week Warrior', description: '7-day typing streak!' });
        }
        if (this.userStats.currentStreak >= 30 && !this.userStats.achievements.includes('streak_30')) {
            achievements.push({ id: 'streak_30', title: 'Monthly Master', description: '30-day typing streak!' });
        }
        
        // Show achievement notifications
        achievements.forEach(achievement => {
            this.userStats.achievements.push(achievement.id);
            this.showAchievementNotification(achievement);
        });
        
        if (achievements.length > 0) {
            this.saveStats();
        }
    }
    
    showAchievementNotification(achievement) {
        const notification = document.getElementById('achievementNotification');
        const text = document.getElementById('achievementText');
        
        text.textContent = achievement.description;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
    
    showEncouragement() {
        const messages = [
            "Great job! Keep practicing to improve even more!",
            "Excellent typing! You're getting faster every day!",
            "Fantastic work! Your accuracy is impressive!",
            "Well done! Consistency is key to mastery!",
            "Amazing progress! You're becoming a typing master!",
            "Outstanding performance! Keep up the great work!",
            "Superb typing! Your skills are really developing!",
            "Excellent effort! Practice makes perfect!"
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('encouragementText').textContent = message;
        document.getElementById('encouragementMessage').classList.add('show');
        
        setTimeout(() => {
            this.hideEncouragement();
        }, 5000);
    }
    
    hideEncouragement() {
        document.getElementById('encouragementMessage').classList.remove('show');
    }
    
    updateStatsDisplay() {
        const today = new Date().toISOString().split('T')[0];
        const todayStats = this.userStats.dailyStats[today] || { tests: [], bestWPM: 0, averageWPM: 0 };
        
        // Update daily stats
        document.getElementById('dailyTests').textContent = todayStats.tests.length;
        document.getElementById('dailyAvgWPM').textContent = todayStats.averageWPM;
        document.getElementById('dailyBestWPM').textContent = todayStats.bestWPM;
        
        // Update weekly stats (simplified)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        let weeklyTests = 0;
        let weeklyTotalWPM = 0;
        
        Object.keys(this.userStats.dailyStats).forEach(date => {
            if (new Date(date) >= weekAgo) {
                weeklyTests += this.userStats.dailyStats[date].tests.length;
                weeklyTotalWPM += this.userStats.dailyStats[date].tests.reduce((sum, test) => sum + test.wpm, 0);
            }
        });
        
        const weeklyAvgWPM = weeklyTests > 0 ? Math.round(weeklyTotalWPM / weeklyTests) : 0;
        
        document.getElementById('weeklyTests').textContent = weeklyTests;
        document.getElementById('weeklyAvgWPM').textContent = weeklyAvgWPM;
        
        // Update achievement badges
        this.updateAchievementBadges();
    }
    
    updateAchievementBadges() {
        const badgeContainer = document.getElementById('achievementBadges');
        badgeContainer.innerHTML = '';
        
        const badgeIcons = {
            speed_40: '🚀',
            speed_60: '⚡',
            speed_80: '🔥',
            accuracy_95: '🎯',
            accuracy_98: '💎',
            streak_7: '🗓️',
            streak_30: '🏆'
        };
        
        this.userStats.achievements.forEach(achievementId => {
            const badge = document.createElement('div');
            badge.className = 'w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm';
            badge.textContent = badgeIcons[achievementId] || '🏅';
            badge.title = achievementId.replace('_', ' ').toUpperCase();
            badgeContainer.appendChild(badge);
        });
    }
    
    updateGoalTracker() {
        document.getElementById('currentStreak').textContent = this.userStats.currentStreak;
        document.getElementById('bestWPM').textContent = this.userStats.bestWPM;
        
        const today = new Date().toISOString().split('T')[0];
        const todayStats = this.userStats.dailyStats[today];
        const testsCompleted = todayStats ? todayStats.tests.length : 0;
        
        document.getElementById('testsCompleted').textContent = testsCompleted;
    }
    
    loadStats() {
        const defaultStats = {
            dailyStats: {},
            bestWPM: 0,
            currentStreak: 0,
            lastActiveDate: null,
            achievements: [],
            dailyGoal: 50
        };
        
        try {
            const saved = localStorage.getItem('typingTestStats');
            return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
        } catch (error) {
            console.log('Error loading stats:', error);
            return defaultStats;
        }
    }
    
    saveStats() {
        try {
            localStorage.setItem('typingTestStats', JSON.stringify(this.userStats));
        } catch (error) {
            console.log('Error saving stats:', error);
        }
    }
}

// Initialize the typing test when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.typingTest = new TypingTest();
});

// Handle page visibility changes to pause timer when tab is not active
document.addEventListener('visibilitychange', () => {
    if (window.typingTest && document.hidden && window.typingTest.isActive) {
        window.typingTest.pauseTest();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + Enter to start test
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (window.typingTest) {
            window.typingTest.startTest();
        }
    }
    
    // Escape to pause/reset
    if (event.key === 'Escape') {
        if (window.typingTest && window.typingTest.isActive) {
            window.typingTest.pauseTest();
        }
    }
    
    // Ctrl/Cmd + R to reset (prevent default browser behavior)
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        if (window.typingTest) {
            event.preventDefault();
            window.typingTest.resetTest();
        }
    }
});
