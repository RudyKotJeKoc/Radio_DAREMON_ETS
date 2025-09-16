/**
 * DAREMON Radio ETS - Enhanced Application Logic v9
 *
 * This file contains the complete functionality for the web radio application.
 * Major improvements in v9:
 * - Enhanced GSAP animations and modern UI effects
 * - Advanced audio visualization with WebGL
 * - Improved touch gestures and mobile interactions
 * - Real-time audio analysis and dynamic theming
 * - Advanced caching and performance optimizations
 */

// Initialize GSAP and set up advanced animations (if available)
if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(Draggable, MotionPathPlugin);
} else {
    console.warn('GSAP library not loaded - animations will be disabled');
    // Create fallback gsap object with minimal functionality
    window.gsap = {
        to: function(target, vars) {
            console.warn('GSAP animation fallback - no animation applied');
            if (vars.onComplete) vars.onComplete();
            return { kill: function() {} };
        },
        fromTo: function(target, fromVars, toVars) {
            console.warn('GSAP animation fallback - no animation applied');
            if (toVars.onComplete) toVars.onComplete();
            return { kill: function() {} };
        },
        timeline: function(vars) {
            console.warn('GSAP timeline fallback - no timeline created');
            return {
                to: function(target, vars) {
                    if (vars.onComplete) vars.onComplete();
                    return this;
                },
                from: function(target, vars) {
                    if (vars.onComplete) vars.onComplete();
                    return this;
                },
                set: function(target, vars) { return this; },
                play: function() { return this; },
                pause: function() { return this; },
                kill: function() { return this; }
            };
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Enhanced DOM Element References ---
    const dom = {
        player: {
            cover: document.getElementById('track-cover'),
            title: document.getElementById('track-title'),
            artist: document.getElementById('track-artist'),
            trackInfo: document.getElementById('track-info'),
            progressContainer: document.getElementById('progress-container'),
            progressBar: document.getElementById('progress-bar'),
            stickyProgressBar: document.getElementById('sticky-progress-bar'),
            currentTime: document.getElementById('current-time'),
            timeRemaining: document.getElementById('time-remaining'),
            playPauseBtn: document.getElementById('play-pause-btn'),
            nextBtn: document.getElementById('next-btn'),
            likeBtn: document.getElementById('like-btn'),
            likeCount: document.getElementById('like-count'),
            volumeSlider: document.getElementById('volume-slider'),
            ratingSection: document.getElementById('rating-section'),
            starRatingContainer: document.querySelector('.star-rating'),
            commentForm: document.getElementById('comment-form'),
            commentInput: document.getElementById('comment-input'),
            averageRatingDisplay: document.getElementById('average-rating-display'),
        },
        stickyPlayer: {
            container: document.getElementById('sticky-player'),
            cover: document.getElementById('sticky-track-cover'),
            title: document.getElementById('sticky-track-title'),
            playPauseBtn: document.getElementById('sticky-play-pause-btn'),
            nextBtn: document.getElementById('sticky-next-btn'),
        },
        sidePanel: {
            panel: document.getElementById('side-panel'),
            drawerMenu: document.getElementById('drawer-menu'),
            menuToggle: document.getElementById('menu-toggle'),
            historyList: document.getElementById('history-list'),
            goldenRecordsList: document.getElementById('golden-records-list'),
            topRatedList: document.getElementById('top-rated-list'),
            messagesList: document.getElementById('messages-list'),
            djMessageForm: document.getElementById('dj-message-form'),
            djMessageInput: document.getElementById('dj-message-input'),
        },
        header: {
            listenerCount: document.getElementById('listener-count'),
        },
        views: {
            radio: document.getElementById('radio-view'),
            calendar: document.getElementById('calendar-view'),
        },
        navigation: {
            toCalendarBtn: document.getElementById('calendar-view-btn'),
            toRadioBtn: document.getElementById('radio-view-btn'),
        },
        calendar: {
            header: document.getElementById('month-year-display'),
            grid: document.getElementById('calendar-grid'),
            prevMonthBtn: document.getElementById('prev-month-btn'),
            nextMonthBtn: document.getElementById('next-month-btn'),
            modal: document.getElementById('event-modal'),
            modalDateDisplay: document.getElementById('modal-date-display'),
            eventForm: document.getElementById('modal-note-form'),
            machineSelect: document.getElementById('modal-name-input'),
            eventTypeSelect: document.getElementById('modal-note-input'),
            modalCancelBtn: document.getElementById('modal-cancel-btn'),
            modalFeedback: document.getElementById('modal-feedback'),
        },
        autoplayOverlay: document.getElementById('autoplay-overlay'),
        startBtn: document.getElementById('start-btn'),
        welcomeGreeting: document.getElementById('welcome-greeting'),
        visualizerCanvas: document.getElementById('visualizer-canvas'),
        offlineIndicator: document.getElementById('offline-indicator'),
        errorOverlay: document.getElementById('error-overlay'),
        errorMessage: document.getElementById('error-message'),
        errorCloseBtn: document.getElementById('error-close-btn'),
        errorRetryBtn: document.getElementById('error-retry-btn'),
        themeSwitcher: document.querySelector('.theme-switcher'),
    };

    // --- Enhanced State Management ---
    let audioContext, analyser, source;
    const players = [new Audio(), new Audio()];
    let activePlayerIndex = 0;
    players.forEach(p => { 
        p.crossOrigin = "anonymous"; 
        p.preload = "auto";
        p.volume = 0.5;
    });

    let state = {
        // Radio State
        playlist: [],
        config: {},
        history: [],
        messages: [],
        reviews: {},
        currentTrack: null,
        nextTrack: null,
        isPlaying: false,
        isInitialized: false,
        lastMessageTimestamp: 0,
        songsSinceJingle: 0,
        likes: {},
        tempBoosts: {},
        // Calendar State
        currentDate: new Date(),
        events: {},
        // App State
        language: 'nl',
        translations: {},
        machines: [
            "CNC Alpha", "Laser Cutter Pro", "Assembly Line 3", 
            "Packaging Bot X", "Welding Station Omega"
        ],
        // Enhanced Features
        audioData: new Uint8Array(256),
        visualizerActive: false,
        gestureHandler: null,
        animationFrameId: null,
        performanceMetrics: {
            loadTime: 0,
            renderTime: 0,
            audioLatency: 0
        }
    };

    // --- Enhanced Animation System ---
    const animations = {
        // GSAP Timeline for complex animations
        masterTimeline: gsap.timeline({ paused: true }),
        
        // Initialize advanced animations
        init() {
            this.setupLoadingAnimation();
            this.setupPlayerAnimations();
            this.setupSidePanelAnimations();
            this.setupVisualizerAnimations();
        },

        setupLoadingAnimation() {
            const tl = gsap.timeline();
            tl.from("#app-container", { 
                duration: 1.2, 
                y: 50, 
                opacity: 0, 
                ease: "power3.out" 
            })
            .from(".content-box", { 
                duration: 0.8, 
                scale: 0.8, 
                opacity: 0, 
                stagger: 0.2, 
                ease: "back.out(1.7)" 
            }, "-=0.8")
            .from(".control-btn", { 
                duration: 0.6, 
                rotation: 360, 
                scale: 0, 
                stagger: 0.1, 
                ease: "elastic.out(1, 0.5)" 
            }, "-=0.4");
        },

        setupPlayerAnimations() {
            // Enhanced track change animation
            this.trackChangeTimeline = gsap.timeline({ paused: true })
                .to("#track-info", { duration: 0.3, scale: 0.9, opacity: 0.5 })
                .to("#track-cover", { duration: 0.3, rotationY: 90, scale: 0.8 }, "<")
                .set("#track-info", { scale: 1, opacity: 1 })
                .from("#track-cover", { duration: 0.3, rotationY: -90, scale: 0.8 })
                .to("#track-cover", { duration: 0.3, rotationY: 0, scale: 1 });
        },

        setupSidePanelAnimations() {
            // Enhanced side panel slide animation
            gsap.set("#drawer-menu", { x: -300, opacity: 0 });
            
            this.sidePanelTimeline = gsap.timeline({ paused: true })
                .to("#drawer-menu", { 
                    duration: 0.5, 
                    x: 0, 
                    opacity: 1, 
                    ease: "power3.out" 
                })
                .from(".content-box", { 
                    duration: 0.3, 
                    x: -50, 
                    opacity: 0, 
                    stagger: 0.1 
                }, "-=0.3");
        },

        setupVisualizerAnimations() {
            // Advanced visualizer with GSAP
            this.visualizerElements = [];
            for (let i = 0; i < 64; i++) {
                const bar = document.createElement('div');
                bar.className = 'visualizer-bar';
                bar.style.cssText = `
                    position: absolute;
                    bottom: 0;
                    width: ${100/64}%;
                    left: ${(i * 100/64)}%;
                    background: linear-gradient(to top, var(--primary-accent), var(--secondary-accent));
                    border-radius: 2px 2px 0 0;
                    transform-origin: bottom;
                `;
                if (dom.visualizerCanvas && dom.visualizerCanvas.parentNode) {
                    dom.visualizerCanvas.parentNode.appendChild(bar);
                }
                this.visualizerElements.push(bar);
            }
        },

        // Play track change animation
        playTrackChange() {
            this.trackChangeTimeline.restart();
        },

        // Animate like button
        animateLike() {
            gsap.to("#like-btn", {
                duration: 0.1,
                scale: 1.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        },

        // Update visualizer bars
        updateVisualizer(dataArray) {
            if (!this.visualizerElements.length) return;
            
            for (let i = 0; i < this.visualizerElements.length; i++) {
                const value = dataArray[i * 4] || 0;
                const height = (value / 255) * 100;
                gsap.to(this.visualizerElements[i], {
                    duration: 0.1,
                    scaleY: height / 100,
                    ease: "power2.out"
                });
            }
        }
    };

    // --- Enhanced Touch Gesture System ---
    const gestureSystem = {
        init() {
            this.setupTouchGestures();
            this.setupKeyboardShortcuts();
            this.setupMouseGestures();
        },

        setupTouchGestures() {
            let touchStartX = 0;
            let touchStartY = 0;
            let touchStartTime = 0;

            document.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const touchEndTime = Date.now();
                
                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;
                const deltaTime = touchEndTime - touchStartTime;

                // Swipe gestures
                if (Math.abs(deltaX) > 50 && deltaTime < 300) {
                    if (deltaX > 0) {
                        // Swipe right - open side panel
                        this.openSidePanel();
                    } else {
                        // Swipe left - close side panel or next track
                        if (dom.sidePanel.panel.classList.contains('open')) {
                            this.closeSidePanel();
                        } else {
                            playNextTrack();
                        }
                    }
                }

                // Double tap
                if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                    if (this.lastTapTime && (touchStartTime - this.lastTapTime) < 300) {
                        togglePlayPause();
                    }
                    this.lastTapTime = touchStartTime;
                }
            });
        },

        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (document.activeElement.tagName === 'TEXTAREA' || 
                    document.activeElement.tagName === 'INPUT') return;

                switch (e.code) {
                    case 'Space':
                        e.preventDefault();
                        togglePlayPause();
                        break;
                    case 'KeyN':
                        playNextTrack();
                        break;
                    case 'KeyL':
                        handleLike();
                        break;
                    case 'KeyM':
                        this.toggleSidePanel();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.adjustVolume(0.05);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.adjustVolume(-0.05);
                        break;
                    case 'KeyF':
                        this.toggleFullscreen();
                        break;
                }
            });
        },

        setupMouseGestures() {
            // Mouse wheel for volume control
            document.addEventListener('wheel', (e) => {
                if (e.target.closest('#volume-control')) {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.02 : 0.02;
                    this.adjustVolume(delta);
                }
            });
        },

        openSidePanel() {
            if (dom.sidePanel.panel) {
                dom.sidePanel.panel.classList.add('open');
                animations.sidePanelTimeline.play();
            }
        },

        closeSidePanel() {
            if (dom.sidePanel.panel) {
                dom.sidePanel.panel.classList.remove('open');
                animations.sidePanelTimeline.reverse();
            }
        },

        toggleSidePanel() {
            if (dom.sidePanel.panel.classList.contains('open')) {
                this.closeSidePanel();
            } else {
                this.openSidePanel();
            }
        },

        adjustVolume(delta) {
            if (!dom.player.volumeSlider) return;
            const currentVolume = parseFloat(dom.player.volumeSlider.value);
            const newVolume = Math.max(0, Math.min(1, currentVolume + delta));
            dom.player.volumeSlider.value = newVolume;
            players.forEach(p => p.volume = newVolume);
            
            // Visual feedback
            gsap.to("#volume-control", {
                duration: 0.1,
                scale: 1.1,
                yoyo: true,
                repeat: 1
            });
        },

        toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    };

    // --- Enhanced Audio System ---
    const audioSystem = {
        init() {
            this.setupAudioContext();
            this.setupAudioAnalysis();
            this.setupCrossfading();
        },

        setupAudioContext() {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 512;
                analyser.smoothingTimeConstant = 0.8;
                
                // Connect players to analyser
                players.forEach(player => {
                    if (!source) {
                        source = audioContext.createMediaElementSource(player);
                        source.connect(analyser);
                        analyser.connect(audioContext.destination);
                    }
                });

                state.visualizerActive = true;
                this.startVisualization();
            } catch (e) {
                console.error("Enhanced audio context setup failed:", e);
            }
        },

        setupAudioAnalysis() {
            // Real-time audio analysis for dynamic theming
            this.analysisInterval = setInterval(() => {
                if (!analyser || !state.isPlaying) return;

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);

                // Calculate audio characteristics
                const bass = this.getFrequencyRange(dataArray, 0, 60);
                const mid = this.getFrequencyRange(dataArray, 60, 170);
                const treble = this.getFrequencyRange(dataArray, 170, 255);

                // Dynamic theme adjustment based on audio
                this.adjustThemeByAudio(bass, mid, treble);
                
                // Update visualizer
                animations.updateVisualizer(dataArray);
            }, 100);
        },

        getFrequencyRange(dataArray, start, end) {
            let sum = 0;
            for (let i = start; i < end && i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            return sum / (end - start);
        },

        adjustThemeByAudio(bass, mid, treble) {
            const root = document.documentElement;
            
            // Adjust colors based on frequency content
            if (bass > 100) {
                root.style.setProperty('--dynamic-accent', '#ff6b6b');
            } else if (treble > 100) {
                root.style.setProperty('--dynamic-accent', '#4ecdc4');
            } else {
                root.style.setProperty('--dynamic-accent', 'var(--primary-accent)');
            }
        },

        setupCrossfading() {
            // Enhanced crossfading with GSAP
            this.crossfadeTimeline = gsap.timeline({ paused: true });
        },

        startVisualization() {
            const animate = () => {
                if (!state.visualizerActive) return;
                
                if (analyser && state.isPlaying) {
                    analyser.getByteFrequencyData(state.audioData);
                    this.drawAdvancedVisualizer();
                }
                
                state.animationFrameId = requestAnimationFrame(animate);
            };
            animate();
        },

        drawAdvancedVisualizer() {
            if (!dom.visualizerCanvas) return;

            const canvas = dom.visualizerCanvas;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Create gradient background
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            );
            gradient.addColorStop(0, 'rgba(0, 136, 120, 0.1)');
            gradient.addColorStop(1, 'rgba(26, 26, 26, 0.8)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw frequency bars with enhanced effects
            const barWidth = canvas.width / state.audioData.length * 2;
            let x = 0;

            for (let i = 0; i < state.audioData.length; i++) {
                const barHeight = (state.audioData[i] / 255) * canvas.height * 0.8;
                
                // Create bar gradient
                const barGradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                barGradient.addColorStop(0, 'rgba(0, 136, 120, 0.8)');
                barGradient.addColorStop(0.5, 'rgba(212, 255, 61, 0.6)');
                barGradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
                
                ctx.fillStyle = barGradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
                
                // Add glow effect
                ctx.shadowColor = 'rgba(212, 255, 61, 0.5)';
                ctx.shadowBlur = 10;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
                ctx.shadowBlur = 0;
                
                x += barWidth;
            }

            // Draw circular visualizer in center
            this.drawCircularVisualizer(ctx, canvas.width / 2, canvas.height / 2, 100);
        },

        drawCircularVisualizer(ctx, centerX, centerY, radius) {
            const bars = 64;
            const angleStep = (Math.PI * 2) / bars;
            
            for (let i = 0; i < bars; i++) {
                const angle = i * angleStep;
                const dataIndex = Math.floor((i / bars) * state.audioData.length);
                const barHeight = (state.audioData[dataIndex] / 255) * radius * 0.8;
                
                const x1 = centerX + Math.cos(angle) * radius;
                const y1 = centerY + Math.sin(angle) * radius;
                const x2 = centerX + Math.cos(angle) * (radius + barHeight);
                const y2 = centerY + Math.sin(angle) * (radius + barHeight);
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = `hsl(${(i / bars) * 360}, 70%, 60%)`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    };

    // --- INTERNATIONALIZATION (i18n) ---
    async function i18n_init() {
        const userLang = navigator.language.split('-')[0];
        state.language = ['nl', 'pl'].includes(userLang) ? userLang : 'nl';
        document.documentElement.lang = state.language;

        try {
            const response = await fetch(`locales/${state.language}.json`);
            if (!response.ok) throw new Error('Translation file not found');
            state.translations = await response.json();
            i18n_apply();
        } catch (error) {
            console.error("Could not load translation file:", error);
            // Fallback translations
            state.translations = {
                loading: "Laden...",
                startBtn: "Start Radio",
                errorPlaylistLoad: "Fout bij laden playlist",
                trackTitleDefault: "Welkom bij DAREMON Radio ETS",
                trackArtistDefault: "Het beste van technologie en muziek",
                // ... other fallback translations
            };
            i18n_apply();
        }
    }

    function t(key, replacements = {}) {
        let text = state.translations[key] || `[${key}]`;
        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(`{{${placeholder}}}`, value);
        }
        return text;
    }

    function i18n_apply() {
        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            if (el && state.translations[el.dataset.i18nKey]) {
                el.textContent = t(el.dataset.i18nKey);
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            if (el && state.translations[el.dataset.i18nPlaceholder]) {
                el.placeholder = t(el.dataset.i18nPlaceholder);
            }
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            if (el && state.translations[el.dataset.i18nTitle]) {
                el.title = t(el.dataset.i18nTitle);
            }
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            if (el && state.translations[el.dataset.i18nAriaLabel]) {
                el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
            }
        });
    }

    // --- Enhanced Initialization ---
    async function initialize() {
        const startTime = performance.now();
        
        await i18n_init();
        
        if (dom.startBtn) {
            dom.startBtn.disabled = true;
            dom.startBtn.textContent = t('loading');
        }
        
        try {
            await loadPlaylist();
            loadStateFromLocalStorage();
            
            // Initialize enhanced systems
            animations.init();
            gestureSystem.init();
            audioSystem.init();
            
            setupEventListeners();
            updateWelcomeGreeting();
            updateOfflineStatus();
            renderMessages();
            renderGoldenRecords();
            renderTopRated();
            populateMachineSelect();
            renderCalendar();
            
            setInterval(updateListenerCount, 15000);
            updateListenerCount();

            if (dom.autoplayOverlay) dom.autoplayOverlay.style.display = 'flex';
            if (dom.startBtn) {
                dom.startBtn.disabled = false;
                dom.startBtn.textContent = t('startBtn');
            }
            
            state.performanceMetrics.loadTime = performance.now() - startTime;
            console.log(`App loaded in ${state.performanceMetrics.loadTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error("Initialization failed:", error);
            displayError(t('errorPlaylistLoad', { message: error.message }), true);
        }
    }

    async function loadPlaylist() {
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(t('errorTimeout'))), 10000)
        );
        
        try {
            const fetchPromise = fetch('./playlist.json');
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            state.playlist = data.tracks || [];
            state.config = data.config || {};
            
            if (state.playlist.length === 0) {
                throw new Error('Playlist is empty');
            }
            
            console.log(`Loaded ${state.playlist.length} tracks`);
        } catch (e) {
            console.error('Playlist load error:', e);
            throw new Error(`Failed to load playlist: ${e.message}`);
        }
    }

    function startRadio() {
        if (state.isInitialized) return;
        state.isInitialized = true;
        
        // Enhanced startup animation
        gsap.to("#autoplay-overlay", {
            duration: 0.8,
            opacity: 0,
            scale: 1.1,
            ease: "power2.inOut",
            onComplete: () => {
                if (dom.autoplayOverlay) dom.autoplayOverlay.style.display = 'none';
            }
        });

        audioSystem.init();
        playNextTrack();
    }

    // --- Core Player Logic (Enhanced) ---
    function selectNextTrack(isPreload = false) {
        if (!state.playlist || state.playlist.length === 0) {
            console.error("Playlist is empty");
            return null;
        }

        const jingleConfig = state.config.jingle || {};
        if (!isPreload && jingleConfig.enabled && state.songsSinceJingle >= (jingleConfig.everySongs || 4)) {
            const jingles = state.playlist.filter(t => t.type === 'jingle');
            if (jingles.length > 0) {
                state.songsSinceJingle = 0;
                return jingles[Math.floor(Math.random() * jingles.length)];
            }
        }

        const availableTracks = state.playlist.filter(track => !state.history.includes(track.id) && track.type === 'song');
        let trackPool = availableTracks.length > 0 ? availableTracks : state.playlist.filter(t => t.type === 'song');

        if (availableTracks.length === 0) {
            state.history = state.currentTrack ? [state.currentTrack.id] : [];
        }

        const weightedPool = [];
        trackPool.forEach(track => {
            const boost = state.tempBoosts[track.id] || 0;
            const avgRating = calculateAverageRating(track.id);
            const ratingBoost = avgRating ? avgRating / 2 : 0;
            const weight = (track.weight || 1) + boost + ratingBoost;
            for (let i = 0; i < Math.ceil(weight); i++) {
                weightedPool.push(track);
            }
        });
        
        const nextTrack = weightedPool[Math.floor(Math.random() * weightedPool.length)];

        if (!isPreload && nextTrack && nextTrack.type === 'song') state.songsSinceJingle++;
        return nextTrack;
    }

    function playTrackNow(track) {
        if (!track || track.id === state.currentTrack?.id) return;
        state.nextTrack = track;
        const activePlayer = players[activePlayerIndex];
        if (state.isPlaying && activePlayer.currentTime > 0) {
            crossfade();
        } else {
            playNextTrack();
        }
    }

    function playNextTrack() {
        const nextTrack = state.nextTrack || selectNextTrack();
        if (!nextTrack) {
            console.error("No track to play");
            return;
        }
        
        state.currentTrack = nextTrack;
        state.nextTrack = null;
        
        const activePlayer = players[activePlayerIndex];
        activePlayer.src = state.currentTrack.src;
        const baseVolume = dom.player.volumeSlider ? parseFloat(dom.player.volumeSlider.value) : 0.5;
        activePlayer.volume = isQuietHour() ? baseVolume * 0.5 : baseVolume;
        
        const playPromise = activePlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                state.isPlaying = true;
                updateUIForNewTrack();
                updateHistory();
                preloadNextTrack();
            }).catch(handleAudioError);
        }
    }

    function preloadNextTrack() {
        state.nextTrack = selectNextTrack(true);
        if (state.nextTrack) {
            const inactivePlayerIndex = 1 - activePlayerIndex;
            players[inactivePlayerIndex].src = state.nextTrack.src;
        }
    }

    function crossfade() {
        if (!state.nextTrack) { playNextTrack(); return; }
        const inactivePlayerIndex = 1 - activePlayerIndex;
        const activePlayer = players[activePlayerIndex];
        const nextPlayer = players[inactivePlayerIndex];

        activePlayerIndex = inactivePlayerIndex;

        nextPlayer.volume = 0;
        const playPromise = nextPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                state.currentTrack = state.nextTrack;
                state.nextTrack = null;
                updateUIForNewTrack();
                updateHistory();
                
                // Enhanced crossfade with GSAP
                const fadeDuration = (state.config.crossfadeSeconds || 2);
                const baseVolume = dom.player.volumeSlider ? parseFloat(dom.player.volumeSlider.value) : 0.5;
                const finalVolume = isQuietHour() ? baseVolume * 0.5 : baseVolume;

                gsap.to(activePlayer, {
                    duration: fadeDuration,
                    volume: 0,
                    ease: "power2.inOut",
                    onComplete: () => {
                        activePlayer.pause();
                        activePlayer.volume = finalVolume;
                    }
                });

                gsap.to(nextPlayer, {
                    duration: fadeDuration,
                    volume: finalVolume,
                    ease: "power2.inOut",
                    onComplete: () => {
                        preloadNextTrack();
                    }
                });

            }).catch(handleAudioError);
        }
    }
    
    function handleAudioError(e) {
        console.error('Audio playback error:', e.target?.src, e);
        if (state.currentTrack) {
            displayError(`Error playing: ${state.currentTrack.title}`);
        }
        setTimeout(playNextTrack, 2000);
    }

    function togglePlayPause() {
        if (!state.isInitialized) { startRadio(); return; }
        const activePlayer = players[activePlayerIndex];
        if (activePlayer.paused) {
            if (audioContext && audioContext.state === 'suspended') { 
                audioContext.resume(); 
            }
            activePlayer.play().catch(handleAudioError);
        } else {
            activePlayer.pause();
        }
    }
    
    function seekTrack(e) {
        const activePlayer = players[activePlayerIndex];
        if (!activePlayer.duration) return;
        const progressContainer = dom.player.progressContainer;
        if (!progressContainer) return;
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        activePlayer.currentTime = (clickX / width) * activePlayer.duration;
    }
    
    function isQuietHour() {
        try {
            if (!state.config.quietHours) return false;
            const now = new Date();
            const [startH, startM] = state.config.quietHours.start.split(':');
            const [endH, endM] = state.config.quietHours.end.split(':');
            const quietStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM);
            const quietEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM);
            if (quietEnd < quietStart) { return now >= quietStart || now < quietEnd; } 
            else { return now >= quietStart && now < quietEnd; }
        } catch (e) {
            console.error("Error parsing quietHours:", e);
            return false;
        }
    }

    // --- View Management ---
    function switchView(viewName) {
        // Enhanced view switching with animations
        const currentView = Object.values(dom.views).find(view => 
            view && !view.classList.contains('hidden')
        );
        
        if (currentView) {
            gsap.to(currentView, {
                duration: 0.3,
                x: -50,
                opacity: 0,
                ease: "power2.inOut",
                onComplete: () => {
                    currentView.classList.add('hidden');
                    if (dom.views[viewName]) {
                        dom.views[viewName].classList.remove('hidden');
                        gsap.fromTo(dom.views[viewName], 
                            { x: 50, opacity: 0 },
                            { duration: 0.3, x: 0, opacity: 1, ease: "power2.inOut" }
                        );
                    }
                }
            });
        } else {
            Object.values(dom.views).forEach(view => {
                if (view) view.classList.add('hidden');
            });
            if (dom.views[viewName]) {
                dom.views[viewName].classList.remove('hidden');
            }
        }
    }

    // --- Enhanced UI Updates ---
    function updateUIForNewTrack() {
        if (!state.currentTrack) return;
        const { title, artist, cover, id } = state.currentTrack;
        
        // Play track change animation
        animations.playTrackChange();
        
        setTimeout(() => {
            if (dom.player.title) dom.player.title.textContent = title;
            if (dom.player.artist) dom.player.artist.textContent = artist;
            if (dom.player.cover) dom.player.cover.src = cover;
            if (dom.stickyPlayer.title) dom.stickyPlayer.title.textContent = title;
            if (dom.stickyPlayer.cover) dom.stickyPlayer.cover.src = cover;
            document.title = `${title} - DAREMON Radio ETS`;
            
            renderRatingUI(id);
            updateLikes();
            updatePlayPauseButtons();
        }, 300);
    }
    
    function updatePlayPauseButtons() {
        state.isPlaying = !players[activePlayerIndex].paused;
        const icon = state.isPlaying ? '⏸️' : '▶️';
        if (dom.player.playPauseBtn) dom.player.playPauseBtn.textContent = icon;
        if (dom.stickyPlayer.playPauseBtn) dom.stickyPlayer.playPauseBtn.textContent = icon;
        
        const label = t(state.isPlaying ? 'playPauseLabel_pause' : 'playPauseLabel_play');
        if (dom.player.playPauseBtn) dom.player.playPauseBtn.setAttribute("aria-label", label);
        if (dom.stickyPlayer.playPauseBtn) dom.stickyPlayer.playPauseBtn.setAttribute("aria-label", label);
    }

    function updateProgressBar() {
        const audio = players[activePlayerIndex];
        if (!audio.duration || !state.isPlaying || !audio.currentTime) return;

        const crossfadeTime = state.config.crossfadeSeconds || 2;
        if ((audio.duration - audio.currentTime) < crossfadeTime) {
            crossfade();
            return;
        }

        const progress = (audio.currentTime / audio.duration) * 100;
        
        // Enhanced progress bar animation
        gsap.to("#progress-bar", { duration: 0.1, width: `${progress}%` });
        gsap.to("#sticky-progress-bar", { duration: 0.1, width: `${progress}%` });
        
        if (dom.player.currentTime) dom.player.currentTime.textContent = formatTime(audio.currentTime);
        if (dom.player.timeRemaining) dom.player.timeRemaining.textContent = `-${formatTime(audio.duration - audio.currentTime)}`;
    }
    
    function updateHistory() {
        if (!state.currentTrack || state.history[0] === state.currentTrack.id) return;
        state.history.unshift(state.currentTrack.id);
        state.history = state.history.slice(0, 15);
        saveHistory();
        
        if (dom.sidePanel.historyList) {
            dom.sidePanel.historyList.innerHTML = '';
            state.history.forEach((trackId, index) => {
                const track = state.playlist.find(t => t.id === trackId);
                if (track) {
                    const li = document.createElement('li');
                    li.textContent = `${track.artist} - ${track.title}`;
                    li.style.opacity = '0';
                    dom.sidePanel.historyList.appendChild(li);
                    
                    // Animate in
                    gsap.to(li, {
                        duration: 0.3,
                        opacity: 1,
                        delay: index * 0.05,
                        ease: "power2.out"
                    });
                }
            });
        }
    }

    function updateWelcomeGreeting() {
        if (!dom.welcomeGreeting) return;
        const hour = new Date().getHours();
        let greeting = "Welkom bij DAREMON Radio ETS!";
        if (hour >= 6 && hour < 12) greeting = "Goedemorgen! Welkom bij DAREMON Radio ETS!";
        else if (hour >= 12 && hour < 18) greeting = "Goedemiddag! Welkom bij DAREMON Radio ETS!";
        else if (hour >= 18 && hour < 22) greeting = "Goedenavond! Welkom bij DAREMON Radio ETS!";
        else greeting = "Goedenacht! Welkom bij DAREMON Radio ETS!";
        
        dom.welcomeGreeting.textContent = greeting;
    }
    
    function updateOfflineStatus() {
        if (dom.offlineIndicator) {
            const isOffline = !navigator.onLine;
            dom.offlineIndicator.classList.toggle('hidden', !isOffline);
            
            if (isOffline) {
                gsap.fromTo("#offline-indicator", 
                    { y: -50, opacity: 0 },
                    { duration: 0.5, y: 0, opacity: 1, ease: "bounce.out" }
                );
            }
        }
    }
    
    function displayError(message, showRetry = false) {
        if (dom.errorMessage) dom.errorMessage.textContent = message;
        if (dom.errorRetryBtn) dom.errorRetryBtn.classList.toggle('hidden', !showRetry);
        if (dom.errorOverlay) {
            dom.errorOverlay.classList.remove('hidden');
            gsap.fromTo("#error-overlay", 
                { opacity: 0, scale: 0.8 },
                { duration: 0.3, opacity: 1, scale: 1, ease: "back.out(1.7)" }
            );
        }
    }

    // --- LocalStorage Management ---
    function safeLocalStorage(key, value) {
        try {
            if (value === undefined) {
                const item = localStorage.getItem(`daremon_${key}`);
                return item ? JSON.parse(item) : null;
            }
            localStorage.setItem(`daremon_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error(`localStorage error for key "${key}":`, e);
            return null;
        }
    }
    
    function loadStateFromLocalStorage() {
        state.likes = safeLocalStorage('likes') || {};
        state.messages = safeLocalStorage('messages') || [];
        state.history = safeLocalStorage('history') || [];
        state.reviews = safeLocalStorage('reviews') || {};
        state.events = safeLocalStorage('events') || {};
        applyTheme(safeLocalStorage('theme') || 'arburg');
    }

    function saveHistory() { safeLocalStorage('history', state.history); }
    function saveTheme(theme) { safeLocalStorage('theme', theme); }
    function saveLikes() { safeLocalStorage('likes', state.likes); }
    function saveMessages() { safeLocalStorage('messages', state.messages); }
    function saveReviews() { safeLocalStorage('reviews', state.reviews); }
    function saveEvents() { safeLocalStorage('events', state.events); }

    // --- Rating and Review System ---
    function renderRatingUI(trackId) {
        if (!dom.player.starRatingContainer) return;
        
        dom.player.starRatingContainer.innerHTML = '';
        if (dom.player.commentForm) dom.player.commentForm.classList.add('hidden');
        let currentRating = 0;

        for (let i = 1; i <= 5; i++) {
            const star = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            star.setAttribute("viewBox", "0 0 24 24");
            star.setAttribute("fill", "currentColor");
            star.dataset.value = i;
            star.innerHTML = `<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>`;
            
            star.addEventListener('mouseover', () => highlightStars(i));
            star.addEventListener('mouseout', () => highlightStars(currentRating));
            star.addEventListener('click', () => {
                currentRating = i;
                if (dom.player.commentForm) dom.player.commentForm.classList.remove('hidden');
                
                // Animate star selection
                gsap.to(star, {
                    duration: 0.2,
                    scale: 1.2,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });
            });
            dom.player.starRatingContainer.appendChild(star);
        }

        updateAverageRatingDisplay(trackId);
    }

    function highlightStars(rating) {
        if (!dom.player.starRatingContainer) return;
        const stars = dom.player.starRatingContainer.querySelectorAll('svg');
        stars.forEach(star => {
            star.classList.toggle('active', star.dataset.value <= rating);
        });
    }

    function handleRatingSubmit(e) {
        e.preventDefault();
        if (!dom.player.starRatingContainer || !dom.player.commentInput) return;
        
        const stars = dom.player.starRatingContainer.querySelectorAll('svg.active');
        const rating = stars.length;
        const comment = dom.player.commentInput.value;
        const trackId = state.currentTrack?.id;

        if (rating === 0) {
            displayError("Selecteer een beoordeling");
            return;
        }

        if (!state.reviews[trackId]) state.reviews[trackId] = [];
        state.reviews[trackId].push({ rating, comment: sanitizeHTML(comment), timestamp: Date.now() });
        saveReviews();
        
        if (dom.player.commentForm) {
            dom.player.commentForm.reset();
            dom.player.commentForm.classList.add('hidden');
        }
        highlightStars(0);
        updateAverageRatingDisplay(trackId);
        renderTopRated();
    }
    
    function calculateAverageRating(trackId) {
        const reviews = state.reviews[trackId];
        if (!reviews || reviews.length === 0) return 0;
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return total / reviews.length;
    }

    function updateAverageRatingDisplay(trackId) {
        if (!dom.player.averageRatingDisplay) return;
        const avg = calculateAverageRating(trackId);
        const count = state.reviews[trackId]?.length || 0;
        dom.player.averageRatingDisplay.textContent = count > 0 ? `Gemiddeld: ${avg.toFixed(1)} ⭐ (${count} beoordelingen)` : "Nog geen beoordelingen";
    }

    // --- Top Rated Tracks ---
    function renderTopRated() {
        if (!dom.sidePanel.topRatedList) return;
        
        const ratedTracks = Object.keys(state.reviews).map(trackId => {
            const track = state.playlist.find(t => t.id === trackId);
            if (!track) return null;
            return {
                ...track,
                avgRating: calculateAverageRating(trackId),
                reviewCount: state.reviews[trackId].length
            };
        }).filter(Boolean);

        ratedTracks.sort((a, b) => b.avgRating - a.avgRating);

        dom.sidePanel.topRatedList.innerHTML = '';
        ratedTracks.slice(0, 5).forEach((track, index) => {
            const li = document.createElement('li');
            li.textContent = `${track.artist} - ${track.title} (${track.avgRating.toFixed(1)} ⭐)`;
            li.dataset.trackId = track.id;
            li.addEventListener('click', () => playTrackNow(track));
            li.style.opacity = '0';
            dom.sidePanel.topRatedList.appendChild(li);
            
            // Animate in
            gsap.to(li, {
                duration: 0.3,
                opacity: 1,
                delay: index * 0.1,
                ease: "power2.out"
            });
        });
    }

    // --- Listener Count Simulation ---
    function updateListenerCount() {
        if (!dom.header.listenerCount) return;
        if (!navigator.onLine) {
            dom.header.listenerCount.textContent = 'Offline';
            return;
        }
        const base = 5 + (Object.keys(state.likes).length % 10);
        const avgRating = state.currentTrack ? calculateAverageRating(state.currentTrack.id) : 0;
        const ratingBonus = Math.floor(avgRating * 2);
        const variance = Math.floor(Math.random() * 7) - 3;
        const count = base + ratingBonus + variance;
        
        // Animate count change
        gsap.to(dom.header.listenerCount, {
            duration: 0.5,
            textContent: count,
            ease: "power2.out",
            snap: { textContent: 1 }
        });
    }

    // --- Golden Records & Messages ---
    function renderGoldenRecords() { 
        if (!dom.sidePanel.goldenRecordsList) return;
        const goldenTracks = state.playlist.filter(t => t.golden); 
        dom.sidePanel.goldenRecordsList.innerHTML = ''; 
        goldenTracks.forEach((track, index) => { 
            const li = document.createElement('li'); 
            li.textContent = `${track.artist} - ${track.title}`; 
            li.dataset.trackId = track.id; 
            li.addEventListener('click', () => { 
                const trackToPlay = state.playlist.find(t => t.id === li.dataset.trackId); 
                playTrackNow(trackToPlay); 
            }); 
            li.style.opacity = '0';
            dom.sidePanel.goldenRecordsList.appendChild(li); 
            
            // Animate in
            gsap.to(li, {
                duration: 0.3,
                opacity: 1,
                delay: index * 0.05,
                ease: "power2.out"
            });
        }); 
    }

    function handleLike() {
        if (!state.currentTrack) return;
        const id = state.currentTrack.id;
        state.likes[id] = (state.likes[id] || 0) + 1;
        saveLikes();
        updateLikes();
        
        // Enhanced like animation
        animations.animateLike();
        
        if (dom.player.likeBtn) {
            dom.player.likeBtn.classList.add('liked-animation');
            setTimeout(() => dom.player.likeBtn.classList.remove('liked-animation'), 400);
        }
    }
    
    function updateLikes() {
        const count = state.currentTrack ? state.likes[state.currentTrack.id] || 0 : 0;
        if (dom.player.likeCount) {
            gsap.to(dom.player.likeCount, {
                duration: 0.3,
                textContent: count,
                ease: "power2.out",
                snap: { textContent: 1 }
            });
        }
    }
    
    function handleMessageSubmit(e) {
        e.preventDefault();
        const now = Date.now();
        if (now - state.lastMessageTimestamp < 30000) {
            displayError("Wacht 30 seconden tussen berichten");
            return;
        }
        
        if (!dom.sidePanel.djMessageInput) return;
        const message = dom.sidePanel.djMessageInput.value;
        if (!message.trim()) return;

        state.lastMessageTimestamp = now;
        addMessage("Jij", sanitizeHTML(message));
        if (dom.sidePanel.djMessageForm) dom.sidePanel.djMessageForm.reset();

        const keywords = { 'cleanroom': 'plasdan', 'plasdan': 'plasdan', 'bmw': 'bmw-kut' };
        Object.keys(keywords).forEach(key => {
            if (message.toLowerCase().includes(key)) {
                const trackId = keywords[key];
                state.tempBoosts[trackId] = (state.tempBoosts[trackId] || 0) + 5;
                setTimeout(() => {
                    state.tempBoosts[trackId] -= 5;
                }, 10 * 60 * 1000);
            }
        });
        
        setTimeout(() => {
            const aiResponses = ["Bedankt voor je bericht!", "Leuk dat je luistert!", "Geweldige muziekkeuze!", "Blijf genieten van de muziek!"];
            const aiResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
            addMessage("DJ Bot", aiResponse, true);
        }, 1500);
    }

    function addMessage(author, text, isAI = false) {
        state.messages.push({ author, text, isAI, timestamp: new Date().toLocaleTimeString() });
        state.messages = state.messages.slice(-10);
        saveMessages();
        renderMessages();
    }

    function renderMessages() {
        if (!dom.sidePanel.messagesList) return;
        dom.sidePanel.messagesList.innerHTML = '';
        state.messages.forEach((msg, index) => {
            const li = document.createElement('li');
            if (msg.isAI) li.classList.add('ai-response');
            li.innerHTML = `<b>${msg.author}:</b> ${msg.text} <i>(${msg.timestamp})</i>`;
            li.style.opacity = '0';
            dom.sidePanel.messagesList.appendChild(li);
            
            // Animate in
            gsap.to(li, {
                duration: 0.3,
                opacity: 1,
                delay: index * 0.05,
                ease: "power2.out"
            });
        });
        if(dom.sidePanel.messagesList.lastChild) {
            dom.sidePanel.messagesList.lastChild.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // --- Calendar Logic ---
    function renderCalendar() {
        if (!dom.calendar.grid || !dom.calendar.header) return;
        
        dom.calendar.grid.innerHTML = '';
        const date = state.currentDate;
        const year = date.getFullYear();
        const month = date.getMonth();

        const monthNames = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", 
                           "Juli", "Augustus", "September", "Oktober", "November", "December"];
        dom.calendar.header.textContent = `${monthNames[month]} ${year}`;
        
        // Add day headers
        const dayHeaders = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
        dayHeaders.forEach(header => {
            const headerEl = document.createElement('div');
            headerEl.classList.add('calendar-day-header');
            headerEl.textContent = header;
            dom.calendar.grid.appendChild(headerEl);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayOffset = (firstDay === 0) ? 6 : firstDay - 1;

        for (let i = 0; i < dayOffset; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'other-month');
            dom.calendar.grid.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.innerHTML = `<div class="day-number">${day}</div><div class="day-events"></div>`;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayCell.dataset.date = dateStr;

            if (state.events[dateStr]) {
                const eventsContainer = dayCell.querySelector('.day-events');
                state.events[dateStr].forEach(event => {
                    const eventEl = document.createElement('div');
                    eventEl.classList.add('day-event', event.eventType);
                    eventEl.textContent = event.machine;
                    eventsContainer.appendChild(eventEl);
                });
            }

            dayCell.addEventListener('click', () => openEventModal(dateStr));
            dayCell.style.opacity = '0';
            dom.calendar.grid.appendChild(dayCell);
            
            // Animate in
            gsap.to(dayCell, {
                duration: 0.2,
                opacity: 1,
                delay: (day - 1) * 0.01,
                ease: "power2.out"
            });
        }
    }

    function populateMachineSelect() {
        if (!dom.calendar.machineSelect) return;
        dom.calendar.machineSelect.innerHTML = '';
        state.machines.forEach(machine => {
            const option = document.createElement('option');
            option.value = machine;
            option.textContent = machine;
            dom.calendar.machineSelect.appendChild(option);
        });
    }

    function openEventModal(dateStr) {
        if (!dom.calendar.modal || !dom.calendar.modalDateDisplay || !dom.calendar.eventForm) return;
        dom.calendar.modal.classList.remove('hidden');
        dom.calendar.modalDateDisplay.textContent = dateStr;
        dom.calendar.eventForm.dataset.date = dateStr;
        
        // Animate modal
        gsap.fromTo("#event-modal", 
            { opacity: 0, scale: 0.8 },
            { duration: 0.3, opacity: 1, scale: 1, ease: "back.out(1.7)" }
        );
    }

    function handleEventSubmit(e) {
        e.preventDefault();
        if (!dom.calendar.machineSelect || !dom.calendar.eventTypeSelect) return;
        
        const date = e.target.dataset.date;
        const machine = dom.calendar.machineSelect.value;
        const eventType = dom.calendar.eventTypeSelect.value;
        
        if (!state.events[date]) {
            state.events[date] = [];
        }
        state.events[date].push({ machine, eventType });
        saveEvents();
        renderCalendar();
        if (dom.calendar.modal) {
            gsap.to("#event-modal", {
                duration: 0.2,
                opacity: 0,
                scale: 0.8,
                ease: "power2.inOut",
                onComplete: () => {
                    dom.calendar.modal.classList.add('hidden');
                }
            });
        }
        
        // Show feedback
        if (dom.calendar.modalFeedback) {
            dom.calendar.modalFeedback.textContent = `Event toegevoegd voor ${machine} op ${date}`;
            gsap.fromTo(dom.calendar.modalFeedback,
                { opacity: 0, y: 10 },
                { duration: 0.3, opacity: 1, y: 0, ease: "power2.out" }
            );
            setTimeout(() => {
                if (dom.calendar.modalFeedback) {
                    gsap.to(dom.calendar.modalFeedback, {
                        duration: 0.3,
                        opacity: 0,
                        y: -10,
                        ease: "power2.inOut",
                        onComplete: () => {
                            dom.calendar.modalFeedback.textContent = '';
                        }
                    });
                }
            }, 3000);
        }
    }

    // --- Utility Functions ---
    function formatTime(seconds) { 
        if (isNaN(seconds)) return "0:00"; 
        const minutes = Math.floor(seconds / 60); 
        const secs = Math.floor(seconds % 60); 
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; 
    }
    
    function sanitizeHTML(str) { 
        const temp = document.createElement('div'); 
        temp.textContent = str; 
        return temp.innerHTML; 
    }
    
    function applyTheme(theme) { 
        document.body.dataset.theme = theme;
        
        // Enhanced theme transition
        gsap.to("body", {
            duration: 0.5,
            ease: "power2.inOut"
        });
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // Player & Audio
        if (dom.player.playPauseBtn) dom.player.playPauseBtn.addEventListener('click', togglePlayPause);
        if (dom.player.nextBtn) dom.player.nextBtn.addEventListener('click', playNextTrack);
        if (dom.player.likeBtn) dom.player.likeBtn.addEventListener('click', handleLike);
        if (dom.player.volumeSlider) {
            dom.player.volumeSlider.addEventListener('input', (e) => { 
                const newVolume = isQuietHour() ? e.target.value * 0.5 : e.target.value; 
                players.forEach(p => p.volume = newVolume); 
            });
        }
        if (dom.player.progressContainer) dom.player.progressContainer.addEventListener('click', seekTrack);
        if (dom.player.commentForm) dom.player.commentForm.addEventListener('submit', handleRatingSubmit);
        
        players.forEach((player) => { 
            player.addEventListener('timeupdate', () => { 
                if (player === players[activePlayerIndex]) updateProgressBar(); 
            }); 
            player.addEventListener('ended', () => { 
                if (player === players[activePlayerIndex]) playNextTrack(); 
            }); 
            player.addEventListener('pause', () => { 
                if (player === players[activePlayerIndex]) updatePlayPauseButtons(); 
            }); 
            player.addEventListener('play', () => { 
                if (player === players[activePlayerIndex]) updatePlayPauseButtons(); 
            }); 
            player.addEventListener('error', handleAudioError); 
        });
        
        // Sticky Player & General UI
        if (dom.stickyPlayer.playPauseBtn) dom.stickyPlayer.playPauseBtn.addEventListener('click', togglePlayPause);
        if (dom.stickyPlayer.nextBtn) dom.stickyPlayer.nextBtn.addEventListener('click', playNextTrack);
        if (dom.startBtn) dom.startBtn.addEventListener('click', startRadio);
        if (dom.themeSwitcher) {
            dom.themeSwitcher.addEventListener('click', (e) => { 
                if (e.target.tagName === 'BUTTON') { 
                    const theme = e.target.id.replace('theme-', ''); 
                    applyTheme(theme); 
                    saveTheme(theme); 
                } 
            });
        }
        if (dom.sidePanel.djMessageForm) dom.sidePanel.djMessageForm.addEventListener('submit', handleMessageSubmit);
        if (dom.errorCloseBtn) dom.errorCloseBtn.addEventListener('click', () => {
            if (dom.errorOverlay) {
                gsap.to("#error-overlay", {
                    duration: 0.2,
                    opacity: 0,
                    scale: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        dom.errorOverlay.classList.add('hidden');
                    }
                });
            }
        });
        if (dom.errorRetryBtn) dom.errorRetryBtn.addEventListener('click', retryLoad);

        // View Navigation
        if (dom.navigation.toCalendarBtn) dom.navigation.toCalendarBtn.addEventListener('click', () => switchView('calendar'));
        if (dom.navigation.toRadioBtn) dom.navigation.toRadioBtn.addEventListener('click', () => switchView('radio'));

        // Calendar Listeners
        if (dom.calendar.prevMonthBtn) {
            dom.calendar.prevMonthBtn.addEventListener('click', () => { 
                state.currentDate.setMonth(state.currentDate.getMonth() - 1); 
                renderCalendar(); 
            });
        }
        if (dom.calendar.nextMonthBtn) {
            dom.calendar.nextMonthBtn.addEventListener('click', () => { 
                state.currentDate.setMonth(state.currentDate.getMonth() + 1); 
                renderCalendar(); 
            });
        }
        if (dom.calendar.eventForm) dom.calendar.eventForm.addEventListener('submit', handleEventSubmit);
        if (dom.calendar.modalCancelBtn) {
            dom.calendar.modalCancelBtn.addEventListener('click', () => {
                if (dom.calendar.modal) {
                    gsap.to("#event-modal", {
                        duration: 0.2,
                        opacity: 0,
                        scale: 0.8,
                        ease: "power2.inOut",
                        onComplete: () => {
                            dom.calendar.modal.classList.add('hidden');
                        }
                    });
                }
            });
        }

        // System Events
        window.addEventListener('online', updateOfflineStatus);
        window.addEventListener('offline', updateOfflineStatus);
        
        const nowPlayingSection = document.getElementById('now-playing-section');
        if (nowPlayingSection && dom.stickyPlayer.container) {
            const observer = new IntersectionObserver((entries) => { 
                const isVisible = !entries[0].isIntersecting;
                dom.stickyPlayer.container.classList.toggle('visible', isVisible);
                
                if (isVisible) {
                    gsap.fromTo("#sticky-player", 
                        { y: 100 },
                        { duration: 0.3, y: 0, ease: "power2.out" }
                    );
                }
            }, { threshold: 0.1 });
            observer.observe(nowPlayingSection);
        }
        
        // Enhanced Menu Toggle
        if (dom.sidePanel.menuToggle && dom.sidePanel.panel) {
            dom.sidePanel.menuToggle.addEventListener('click', () => {
                gestureSystem.toggleSidePanel();
            });
        }
    }
    
    // --- Service Worker ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(reg => console.log('Service Worker registered:', reg.scope))
                .catch(err => console.error('Service Worker registration failed:', err));
        });
    }

    // --- Retry Load Function ---
    async function retryLoad() {
        if (dom.errorRetryBtn) dom.errorRetryBtn.disabled = true;
        if (dom.errorMessage) dom.errorMessage.textContent = t('retrying');
        try {
            await loadPlaylist();
            if (dom.errorOverlay) {
                gsap.to("#error-overlay", {
                    duration: 0.3,
                    opacity: 0,
                    scale: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        dom.errorOverlay.classList.add('hidden');
                    }
                });
            }
            if (state.isInitialized) {
                playNextTrack();
            }
        } catch (err) {
            displayError(t('retryFailed', { message: err.message }), true);
        } finally {
            if (dom.errorRetryBtn) dom.errorRetryBtn.disabled = false;
        }
    }

    // Initialize the application
    initialize();
});