/**
 * PANDA BIRTHDAY ADVENTURE
 * Core Configuration and Engine
 */

// =========================================
// 1. CONFIGURATION
// =========================================
const birthdayConfig = {
    friendName: "Bestie", // Replace with actual name
    yourName: "Your Friend",   // Replace with your name

    // Target date for the countdown. Format: YYYY-MM-DDTHH:MM:SS
    // Example: "2026-12-01T00:00:00"
    birthdayDate: "2026-12-01T00:00:00",

    music: {
        enabled: true,
        file: "assets/music/birthday.mp3" // Ensure this file exists or use fallback logic
    },

    messages: {
        intro: "I have something important to tell you...",
        final: `Happy Birthday, [NAME].\n\nThank you for being one of the people who makes life more fun, more chaotic, and a lot more memorable.\n\nHere's to more stupid conversations, random adventures, inside jokes, and memories.\n\nStay exactly as wonderfully ridiculous as you are.`
    },

    personalQuestions: [
        "Do you remember when we first became friends?",
        "Do you remember our stupidest conversation?",
        "Do you remember that one completely unnecessary adventure?",
        "Would you do it all again?"
    ]
};

// Add as many friendship questions here as you want!
// They will automatically generate new scenes in the game.
const questions = [
    {
        id: "q_identity",
        question: "Are you actually the birthday person?",
        options: [
            "Obviously.",
            "Maybe...",
            "Who wants to know?",
            "I'm the panda."
        ],
        reactions: {
            "Obviously.": "Correct. Excellent confidence.",
            "Maybe...": "Suspicious...",
            "Who wants to know?": "ME.",
            "I'm the panda.": "Nice try."
        },
        correctOption: "Obviously." // Used if we want a specific path, otherwise any answers proceeds
    },
    {
        id: "q_best_friend",
        question: "Who is the better best friend?",
        options: ["Me", "You", "Both", "The pandas"],
        reactions: {
            "Me": "Bold claim. But acceptable.",
            "You": "Aww, you shouldn't have. (But true)",
            "Both": "Diplomatic. I like it.",
            "The pandas": "Wait... THIS WEBSITE IS ABOUT YOU."
        }
    },
    {
        id: "q_chaos",
        question: "Who is more likely to cause unnecessary chaos?",
        options: ["You", "Me", "Both of us", "Absolutely nobody"],
        reactions: {
            "You": "Hey! ...fair.",
            "Me": "At least you admit it.",
            "Both of us": "Scientific evidence confirms this.",
            "Absolutely nobody": "Lies."
        }
    }
    // Add more friendship questions here
];

const memories = [
    {
        image: "assets/photos/placeholder1.jpg",
        date: "Sometime in the past",
        title: "That one time",
        caption: "Remember when we did that thing? Yeah, that was wild."
    },
    {
        image: "assets/photos/placeholder2.jpg",
        date: "Another time",
        title: "The incident",
        caption: "We don't talk about this one."
    }
];

// =========================================
// 2. STATE & STORAGE MANAGEMENT
// =========================================
const STORAGE_KEY = 'pandaBirthdayState';

let state = {
    currentScene: 0,
    musicEnabled: false,
    completedInteractions: []
};

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateProgress();
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Simple validation
            if (typeof parsed.currentScene === 'number') {
                state = parsed;
            }
        } catch(e) {
            console.error("Error parsing saved state", e);
        }
    }
}

function resetState() {
    localStorage.removeItem(STORAGE_KEY);
    state = {
        currentScene: 0,
        musicEnabled: false,
        completedInteractions: []
    };
    location.reload();
}

// =========================================
// 3. ENGINE & UTILS
// =========================================

// Total number of scenes (will be updated dynamically)
let totalScenes = 1;

function updateProgress() {
    const progressFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    if (!progressFill || !progressText) return;

    // Avoid divide by zero
    const max = Math.max(1, totalScenes - 1);
    const pct = Math.min(100, Math.round((state.currentScene / max) * 100));

    progressFill.style.width = `${pct}%`;
    progressText.innerText = `🐼 Chapter ${state.currentScene + 1}`;
}

// Helper for waiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Scene Management Engine
let scenes = [];

/**
 * Registers a new scene in the game.
 * @param {string} id - Unique identifier
 * @param {function} renderFn - Function that returns HTML string or DOM element
 * @param {function} onEnter - Function called when scene is shown
 * @param {function} onLeave - Function called before scene is hidden
 */
function registerScene(id, renderFn, onEnter = null, onLeave = null) {
    scenes.push({ id, renderFn, onEnter, onLeave });
    totalScenes = scenes.length;
}

/**
 * Renders and transitions to a specific scene index.
 */
async function goToScene(index) {
    if (index < 0 || index >= scenes.length) return;

    const container = document.getElementById('game-container');
    const oldSceneObj = scenes[state.currentScene];
    const newSceneObj = scenes[index];

    // If there is an existing scene rendered, fade it out
    const currentElem = container.querySelector('.scene.active');
    if (currentElem) {
        if (oldSceneObj && oldSceneObj.onLeave) {
            await oldSceneObj.onLeave(currentElem);
        }
        currentElem.classList.remove('active');
        await sleep(800); // Wait for CSS transition (0.8s)
        container.innerHTML = '';
    }

    // Render new scene
    const sceneHTML = newSceneObj.renderFn();

    // Create wrapper
    const sceneWrapper = document.createElement('div');
    sceneWrapper.className = 'scene';
    sceneWrapper.id = `scene-${newSceneObj.id}`;

    if (typeof sceneHTML === 'string') {
        sceneWrapper.innerHTML = sceneHTML;
    } else {
        sceneWrapper.appendChild(sceneHTML);
    }

    container.appendChild(sceneWrapper);

    // Force reflow
    void sceneWrapper.offsetWidth;

    // Fade in
    sceneWrapper.classList.add('active');

    // Update State
    state.currentScene = index;
    saveState();

    // Show UI logic
    togglePersistentUI(index);

    if (newSceneObj.onEnter) {
        await newSceneObj.onEnter(sceneWrapper);
    }
}

/**
 * Advances to the next scene.
 */
function nextScene() {
    goToScene(state.currentScene + 1);
}

function togglePersistentUI(index) {
    const pContainer = document.getElementById('progress-container');
    const rBtn = document.getElementById('btn-restart-global');
    const aBtn = document.getElementById('audio-controls');

    // Hide UI on first scene (Intro) and final scenes
    if (index === 0) {
        pContainer.classList.add('hidden');
        rBtn.classList.add('hidden');
    } else {
        pContainer.classList.remove('hidden');
        rBtn.classList.remove('hidden');
    }

    // Audio controls show up after intro (handled in intro logic, but keep here just in case)
    if (index > 0 && state.musicEnabled) {
        aBtn.classList.remove('hidden');
    }
}

// Audio Engine
let bgMusic = null;

function initAudio() {
    if (!birthdayConfig.music.enabled) return;

    bgMusic = new Audio(birthdayConfig.music.file);
    bgMusic.loop = true;
    bgMusic.volume = 0.5;

    const audioBtn = document.getElementById('btn-toggle-music');

    // Set initial UI state based on loaded state
    audioBtn.innerText = state.musicEnabled ? '🎵' : '🔇';

    // We can't auto-play here due to browser restrictions until user interacts.
    // The play logic is triggered in the "Music Opt-in" scene.

    audioBtn.addEventListener('click', () => {
        state.musicEnabled = !state.musicEnabled;
        audioBtn.innerText = state.musicEnabled ? '🎵' : '🔇';
        saveState();

        if (state.musicEnabled) {
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
        } else {
            bgMusic.pause();
        }
    });
}

// Global sound effect helper
function playSound(type) {
    if (!state.musicEnabled) return;
    // In a full implementation, you would load these files.
    // For now, we simulate with a very short Web Audio API beep
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'pop') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'bump') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
        }
    } catch(e) {}
}

// =========================================
// 4. SCENES REGISTRATION
// =========================================

// Helper for typewriter effect
async function typeWriter(element, text, speed = 50) {
    element.innerHTML = '';
    element.classList.remove('hidden');
    element.classList.add('visible');

    // Add text line by line / word by word
    // This is a simple implementation; we can refine for more complex HTML
    for(let i = 0; i < text.length; i++) {
        element.innerHTML += text.charAt(i);
        await sleep(speed);
    }
}

// Helper to create a panda emoji element
function createPanda(classes = []) {
    const panda = document.createElement('div');
    panda.className = 'panda-emoji ' + classes.join(' ');
    panda.innerText = '🐼';
    return panda;
}

// SCENE 0: Intro (Opening Scene)
registerScene(
    'intro',
    () => `
        <div id="intro-text" class="text-reveal" style="font-size: 2rem; margin-bottom: 2rem; text-align: center; min-height: 100px;"></div>
        <div id="intro-panda-container" class="hidden" style="margin-bottom: 2rem;"></div>
        <button id="btn-start-mission" class="btn hidden">START THE MISSION 🐼</button>
    `,
    async (container) => {
        const textEl = container.querySelector('#intro-text');
        const pandaContainer = container.querySelector('#intro-panda-container');
        const btnStart = container.querySelector('#btn-start-mission');

        await sleep(1000);
        await typeWriter(textEl, "Hey...", 100);
        await sleep(1000);
        await typeWriter(textEl, "Hey... you.", 100);
        await sleep(1000);
        await typeWriter(textEl, "YES. YOU.", 80);

        await sleep(500);

        const peekingPanda = createPanda(['slide-up']);
        pandaContainer.appendChild(peekingPanda);
        pandaContainer.classList.remove('hidden');

        await sleep(1500);
        await typeWriter(textEl, "Don't pretend you don't see me.", 50);

        await sleep(2000);
        await typeWriter(textEl, "We have a very important mission today.", 50);

        await sleep(1500);

        // Typo correction sequence
        textEl.innerHTML = `<h3>PANADA BIRTHDAY MISSION</h3>`;
        await sleep(1500);
        textEl.innerHTML = `<h3><del>PANADA</del> PANDA BIRTHDAY MISSION</h3>`;

        await sleep(1000);
        btnStart.classList.remove('hidden');
        btnStart.classList.add('visible');

        btnStart.addEventListener('click', () => {
            peekingPanda.classList.add('shake');
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 500);

            // Go to Music Opt-in
            setTimeout(() => nextScene(), 1000);
        });
    }
);

// SCENE 1: Music Activation
registerScene(
    'music_opt_in',
    () => `
        <div class="panel">
            <h2>Should we turn on the birthday soundtrack?</h2>
            <div style="display: flex; gap: 20px; justify-content: center; margin-top: 30px;">
                <button id="btn-music-yes" class="btn">YES 🎵</button>
                <button id="btn-music-no" class="btn">NO 🤫</button>
            </div>
        </div>
    `,
    (container) => {
        document.body.classList.add('theme-light'); // Transition to light theme

        const btnYes = container.querySelector('#btn-music-yes');
        const btnNo = container.querySelector('#btn-music-no');
        const audioBtn = document.getElementById('audio-controls');
        const audioToggleBtn = document.getElementById('btn-toggle-music');

        const handleChoice = (enableMusic) => {
            state.musicEnabled = enableMusic;
            if (enableMusic) {
                audioBtn.classList.remove('hidden');
                audioToggleBtn.innerText = '🎵';
                if (bgMusic) {
                    bgMusic.play().catch(e => console.log("Audio play failed:", e));
                }
            }
            saveState();
            nextScene();
        };

        btnYes.addEventListener('click', () => handleChoice(true));
        btnNo.addEventListener('click', () => handleChoice(false));
    }
);

// DYNAMIC QUESTIONS GENERATION
// This loop automatically generates a scene for every question in the `questions` array.
questions.forEach((qData, index) => {
    registerScene(
        `dynamic_question_${index}`,
        () => `
            <div class="panel" style="position: relative; overflow: hidden;">
                ${index === 0 ? '<h3 style="opacity: 0.7">Before we continue... Security check required.</h3><div style="font-size: 4rem; margin: 20px 0;">🐼🕶️</div>' : '<div style="font-size: 3rem; margin-bottom: 20px;">🐼❓</div>'}
                <h2 id="q-text">${qData.question}</h2>
                <div id="q-options" style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
                    ${qData.options.map((opt) => `<button class="btn opt-btn" data-opt="${opt.replace(/"/g, '&quot;')}">${opt}</button>`).join('')}
                </div>
                <div id="q-reaction" class="hidden" style="margin-top: 20px; font-weight: bold; font-size: 1.2rem; color: var(--color-primary); position: relative; z-index: 10;"></div>

                ${index === 0 ? '<div id="status-text" class="hidden" style="margin-top: 20px; font-weight: bold; color: green; font-size: 1.5rem;"></div>' : ''}

                <div id="offended-panda" class="hidden" style="font-size: 3rem; margin-top: 10px; transform: scaleX(-1);">🐼</div>

                <div id="chaos-pandas" class="hidden" style="position: absolute; bottom: -50px; left: 0; width: 100%; height: 100px; display: flex; justify-content: center; gap: 20px; font-size: 3rem;">
                    <div class="chaos-p1">🐼</div>
                    <div class="chaos-p2">🐼</div>
                </div>
            </div>
        `,
        (container) => {
            const btns = container.querySelectorAll('.opt-btn');
            const reactionEl = container.querySelector('#q-reaction');
            const optionsContainer = container.querySelector('#q-options');
            const statusEl = container.querySelector('#status-text');
            const offendedPanda = container.querySelector('#offended-panda');
            const chaosPandas = container.querySelector('#chaos-pandas');

            btns.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    playSound('pop');
                    const answer = e.target.getAttribute('data-opt');
                    btns.forEach(b => b.style.pointerEvents = 'none');

                    optionsContainer.classList.add('hidden');
                    reactionEl.innerText = qData.reactions[answer] || "Interesting...";
                    reactionEl.classList.remove('hidden');

                    // Specific Hardcoded animations for the first three questions
                    if (index === 0) {
                        await sleep(2000);
                        statusEl.innerText = "SECURITY LEVEL: ACCEPTED ✅";
                        statusEl.classList.remove('hidden');
                        await sleep(2000);
                    } else if (index === 1 && answer === "The pandas") {
                        offendedPanda.classList.remove('hidden');
                        offendedPanda.style.transition = "transform 2s ease";
                        setTimeout(() => offendedPanda.style.transform = "translateX(200px) scaleX(-1)", 50);
                        await sleep(3000);
                    } else if (index === 2 && answer === "Both of us") {
                        chaosPandas.classList.remove('hidden');
                        chaosPandas.style.bottom = "20px";
                        chaosPandas.style.transition = "bottom 0.5s ease";
                        const p1 = chaosPandas.querySelector('.chaos-p1');
                        const p2 = chaosPandas.querySelector('.chaos-p2');
                        await sleep(500);
                        p1.classList.add('shake');
                        p2.classList.add('shake');
                        await sleep(1000);
                        p1.style.transition = "transform 1s ease";
                        p1.style.transform = "rotate(90deg) translate(20px, 20px)"; // Falls over
                        p2.style.transition = "transform 1s ease";
                        p2.style.transform = "translateX(200px)"; // Runs away
                        await sleep(2000);
                    } else {
                        // Default animation for any other dynamic questions added by the user
                        await sleep(500);
                        const rPanda = createPanda(['slide-up']);
                        container.querySelector('.panel').appendChild(rPanda);
                        await sleep(2000);
                    }

                    nextScene();
                });
            });
        }
    );
});


// SCENE 5: Turn on the lights
registerScene(
    'turn_on_lights',
    () => `
        <div id="dark-room" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 20;">
            <div id="lights-text" class="text-reveal" style="color: white; font-size: 1.5rem; margin-bottom: 2rem; text-align: center; z-index: 21;"></div>
            <div id="panda-silhouette" style="font-size: 3rem; filter: brightness(0); opacity: 0.5; z-index: 21; transition: all 1s;">🐼</div>

            <button id="btn-lights-on" class="btn hidden" style="margin-top: 40px; z-index: 21; background: #333; color: white; border: 1px solid #555;">TURN ON THE LIGHTS 💡</button>
        </div>

        <div id="bright-room" class="hidden" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10;">
            <h1 id="bright-text" style="font-size: 3rem; color: var(--color-text-dark);"></h1>
            <div id="party-pandas" style="display: flex; gap: 20px; font-size: 4rem; margin-top: 20px;"></div>
        </div>
    `,
    async (container) => {
        const darkRoom = container.querySelector('#dark-room');
        const brightRoom = container.querySelector('#bright-room');
        const textEl = container.querySelector('#lights-text');
        const pandaSil = container.querySelector('#panda-silhouette');
        const btnLights = container.querySelector('#btn-lights-on');
        const brightText = container.querySelector('#bright-text');
        const partyPandas = container.querySelector('#party-pandas');

        await sleep(1000);
        await typeWriter(textEl, "Wait...", 60);
        await sleep(1000);
        await typeWriter(textEl, "Why is it so dark?", 60);

        await sleep(1000);
        pandaSil.classList.add('shake');
        // Bump sound effect simulation
        await sleep(500);

        await typeWriter(textEl, "Can you help?", 60);

        await sleep(500);
        btnLights.classList.remove('hidden');
        btnLights.classList.add('visible');

        btnLights.addEventListener('click', async () => {
            // Light switch interaction
            btnLights.style.transform = "translateY(5px)";
            await sleep(200);

            darkRoom.style.transition = "opacity 1.5s ease";
            darkRoom.style.opacity = "0";

            brightRoom.classList.remove('hidden');
            document.body.classList.add('theme-light');

            // Add party pandas
            for(let i=0; i<3; i++) {
                const p = createPanda(['slide-up']);
                p.style.animationDelay = `${i * 0.2}s`;
                partyPandas.appendChild(p);
            }

            await sleep(1500);
            darkRoom.classList.add('hidden');

            await typeWriter(brightText, "MUCH BETTER.", 80);
            await sleep(2000);
            await typeWriter(brightText, "But we're still missing something...", 60);

            await sleep(2000);
            nextScene();
        });
    }
);

// SCENE 6: Find the Hidden Panda
registerScene(
    'hidden_panda',
    () => `
        <div class="panel" style="max-width: 800px;">
            <h2>One panda is hiding. Find it.</h2>
            <h3 id="hint-text" style="color: var(--color-primary); height: 30px;"></h3>

            <div id="room-container" style="position: relative; width: 100%; height: 300px; background: rgba(0,0,0,0.05); border-radius: var(--border-radius-md); margin-top: 20px; overflow: hidden;">
                <!-- Decorative non-target objects -->
                <div class="clickable-obj" data-type="cake" style="position: absolute; bottom: 20px; left: 10%; font-size: 3rem; cursor: pointer;">🎂</div>
                <div class="clickable-obj" data-type="balloon" style="position: absolute; top: 20px; right: 20%; font-size: 3rem; cursor: pointer;">🎈</div>
                <div class="clickable-obj" data-type="bamboo" style="position: absolute; bottom: 10px; right: 10%; font-size: 3rem; cursor: pointer;">🎋</div>
                <div class="clickable-obj" data-type="gift" style="position: absolute; bottom: 30px; left: 40%; font-size: 3rem; cursor: pointer;">🎁</div>
                <div class="clickable-obj" data-type="decoy_panda" style="position: absolute; bottom: 20px; left: 60%; font-size: 3rem; cursor: pointer;">🐼</div>

                <!-- Target Panda -->
                <div id="target-panda" class="clickable-obj" data-type="target" style="position: absolute; top: 40px; left: 20%; font-size: 1.5rem; opacity: 0.8; cursor: pointer; transform: rotate(-20deg);">🐼</div>
            </div>
        </div>
    `,
    (container) => {
        const objs = container.querySelectorAll('.clickable-obj');
        const hintText = container.querySelector('#hint-text');

        objs.forEach(obj => {
            obj.addEventListener('click', async (e) => {
                const type = e.target.getAttribute('data-type');

                // Small bounce effect on click
                e.target.style.transform = e.target.style.transform + " scale(0.9)";
                setTimeout(() => e.target.style.transform = e.target.style.transform.replace(" scale(0.9)", ""), 150);

                if (type === 'target') {
                    hintText.innerText = "THERE YOU ARE!";
                    hintText.style.color = "green";

                    e.target.style.transition = "all 0.5s ease";
                    e.target.style.fontSize = "5rem";
                    e.target.style.opacity = "1";
                    e.target.style.transform = "rotate(0deg) scale(1.2)";
                    e.target.style.zIndex = "100";

                    objs.forEach(o => o.style.pointerEvents = 'none');

                    await sleep(2500);
                    nextScene();
                } else {
                    const reactions = {
                        "cake": "Good choice, but that's cake.",
                        "balloon": "That's... definitely a balloon.",
                        "bamboo": "Suspiciously empty bamboo.",
                        "gift": "Nice, but no panda.",
                        "decoy_panda": "That's just a regular panda."
                    };
                    hintText.innerText = reactions[type];
                }
            });
        });
    }
);

// SCENE 7: Feed the Panda
registerScene(
    'feed_panda',
    () => `
        <div class="panel">
            <h2>FEED THE PANDA</h2>
            <div id="feed-status" style="font-weight: bold; color: var(--color-primary); height: 30px; margin-bottom: 10px;"></div>

            <!-- Progress Bar -->
            <div style="width: 100%; height: 20px; background: #eee; border-radius: 10px; overflow: hidden; margin-bottom: 30px;">
                <div id="hunger-bar" style="width: 0%; height: 100%; background: var(--color-secondary); transition: width 0.3s ease;"></div>
            </div>

            <div id="hungry-panda" style="font-size: 5rem; cursor: pointer; display: inline-block; transition: transform 0.2s;">🐼</div>

            <div style="margin-top: 30px;">
                <button id="btn-feed" class="btn" style="background: var(--color-secondary); color: #333;">GIVE BAMBOO 🎋</button>
            </div>
        </div>
    `,
    (container) => {
        const btnFeed = container.querySelector('#btn-feed');
        const hungerBar = container.querySelector('#hunger-bar');
        const hungryPanda = container.querySelector('#hungry-panda');
        const status = container.querySelector('#feed-status');

        let feeds = 0;
        const maxFeeds = 5;

        btnFeed.addEventListener('click', async () => {
            if (feeds >= maxFeeds) return;

            feeds++;
            hungerBar.style.width = `${(feeds / maxFeeds) * 100}%`;

            // Animation
            hungryPanda.style.transform = "scale(1.1)";
            hungryPanda.innerText = "🐼🌿";

            setTimeout(() => {
                hungryPanda.style.transform = "scale(1)";
                hungryPanda.innerText = "🐼";
            }, 200);

            if (feeds === maxFeeds) {
                btnFeed.classList.add('hidden');
                status.innerText = "Achievement unlocked: PANDA FED 🐼";
                status.style.color = "green";

                hungryPanda.classList.add('shake');

                await sleep(2500);
                nextScene();
            }
        });
    }
);

// SCENE 8: Birthday Cake
registerScene(
    'birthday_cake',
    () => `
        <div class="panel" style="position: relative;">
            <h2 id="cake-status">The cake needs candles.</h2>

            <div id="cake-container" style="position: relative; width: 200px; height: 150px; margin: 40px auto; display: flex; justify-content: center; align-items: flex-end;">
                <!-- Base Cake -->
                <div style="font-size: 8rem; line-height: 1; z-index: 5;">🎂</div>
                <!-- Candles Container -->
                <div id="candles" style="position: absolute; top: -10px; width: 100px; height: 50px; display: flex; justify-content: space-around; align-items: flex-end; z-index: 10;"></div>
            </div>

            <button id="btn-add-candle" class="btn">ADD CANDLE 🕯️</button>
            <button id="btn-blow-candles" class="btn hidden" style="background: var(--color-primary); color: white;">BLOW THE CANDLES 💨</button>
        </div>
    `,
    (container) => {
        const btnAdd = container.querySelector('#btn-add-candle');
        const btnBlow = container.querySelector('#btn-blow-candles');
        const candlesContainer = container.querySelector('#candles');
        const status = container.querySelector('#cake-status');

        let candlesCount = 0;
        const maxCandles = 5;

        btnAdd.addEventListener('click', async () => {
            if (candlesCount >= maxCandles) return;

            candlesCount++;

            const candle = document.createElement('div');
            candle.innerText = '🕯️';
            candle.style.fontSize = '2rem';
            candle.className = 'slide-up';
            candlesContainer.appendChild(candle);

            if (candlesCount === maxCandles) {
                btnAdd.classList.add('hidden');
                status.innerText = "Perfect. Now make a wish.";
                await sleep(500);
                btnBlow.classList.remove('hidden');
                btnBlow.classList.add('visible', 'shake');
            }
        });

        btnBlow.addEventListener('click', async () => {
            btnBlow.classList.add('hidden');

            // "Blow out" effect
            const candles = candlesContainer.querySelectorAll('div');
            candles.forEach(c => {
                c.innerText = '🥢'; // Turn candle to burnt stick
                c.style.opacity = '0.5';
            });

            // Smoke effect (simple simulation)
            status.innerText = "YAY!";
            document.body.classList.remove('theme-light'); // slight darken
            await sleep(500);

            // Firework Simulation
            for(let i=0; i<5; i++) {
                setTimeout(() => {
                    document.body.style.backgroundColor = i % 2 === 0 ? "#ffb7b2" : "#e2f0cb";
                }, i * 300);
            }

            setTimeout(() => {
                document.body.style.backgroundColor = ""; // Reset
                document.body.classList.add('theme-light');
                nextScene();
            }, 2000);
        });
    }
);

// SCENE 9: Random Panda Chaos
registerScene(
    'panda_chaos',
    () => `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 10;">
            <div id="chaos-layer" style="position: relative; width: 100%; height: 100%;"></div>
        </div>
        <div class="panel" style="z-index: 20; position: relative;">
            <h2 id="chaos-text" class="text-reveal" style="min-height: 80px;"></h2>
        </div>
    `,
    async (container) => {
        const textEl = container.querySelector('#chaos-text');
        const chaosLayer = container.querySelector('#chaos-layer');

        // Spawn chaotic pandas
        const chaoticPandas = [
            { text: '🐼🎂', anim: 'slideRight 3s linear infinite' },
            { text: '🐼🎈', anim: 'floatUp 4s ease-in forwards', left: '20%' },
            { text: '🐼💤', anim: 'none', left: '10%', bottom: '10%' },
            { text: '🐼🏃', anim: 'slideLeft 2s linear infinite', top: '40%' },
            { text: '🐼🎋', anim: 'shake 1s infinite', right: '10%', bottom: '20%' },
            { text: '🐼', sign: 'WE DID IT.', anim: 'slideRight 5s linear infinite', top: '70%' },
            { text: '🐼🔄', anim: 'spin 2s linear infinite', left: '50%', top: '20%' },
            { text: '🐼💥', anim: 'fall 1s ease-in forwards', left: '70%', top: '-50px' }
        ];

        chaoticPandas.forEach(pData => {
            const p = document.createElement('div');
            p.style.position = 'absolute';
            p.style.fontSize = '3rem';
            if(pData.left) p.style.left = pData.left;
            if(pData.right) p.style.right = pData.right;
            if(pData.top) p.style.top = pData.top;
            if(pData.bottom) p.style.bottom = pData.bottom;

            if(pData.sign) {
                p.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center;">
                    <div style="background:white; border:1px solid black; padding:2px 5px; font-size:0.8rem; border-radius:4px;">${pData.sign}</div>
                    <div>${pData.text}</div>
                </div>`;
            } else {
                p.innerText = pData.text;
            }

            p.style.animation = pData.anim;
            chaosLayer.appendChild(p);
        });

        await sleep(2000);
        await typeWriter(textEl, "We hired professional birthday planners.", 50);

        await sleep(3000);
        await typeWriter(textEl, "They clearly weren't professionals.", 50);

        // Add one more falling panda for comedic effect
        await sleep(1000);
        const oopsPanda = document.createElement('div');
        oopsPanda.innerText = '🐼🎂';
        oopsPanda.style.position = 'absolute';
        oopsPanda.style.fontSize = '4rem';
        oopsPanda.style.left = '40%';
        oopsPanda.style.top = '-100px';
        oopsPanda.style.animation = 'fall 0.8s ease-in forwards';
        chaosLayer.appendChild(oopsPanda);

        await sleep(4000);
        nextScene();
    }
);

// SCENE 10: Memory Lock
registerScene(
    'memory_lock',
    () => `
        <div class="panel">
            <h2 id="lock-text" class="text-reveal" style="min-height: 80px;"></h2>
            <div id="lock-box" style="font-size: 5rem; margin: 30px 0; transition: transform 0.3s; cursor: pointer;">🔐</div>
            <button id="btn-open-memory" class="btn hidden">OPEN THE MEMORY 🔓</button>
        </div>
    `,
    async (container) => {
        const textEl = container.querySelector('#lock-text');
        const lockBox = container.querySelector('#lock-box');
        const btnOpen = container.querySelector('#btn-open-memory');

        await sleep(1000);
        await typeWriter(textEl, "Okay... No more chaos. Probably.", 50);
        await sleep(1500);
        await typeWriter(textEl, "I saved something here.", 50);

        await sleep(500);
        btnOpen.classList.remove('hidden');
        btnOpen.classList.add('visible');

        btnOpen.addEventListener('click', async () => {
            lockBox.classList.add('shake');
            await sleep(500);
            lockBox.innerText = '🔓✨';
            lockBox.style.transform = 'scale(1.2)';
            btnOpen.classList.add('hidden');

            await sleep(1500);
            nextScene();
        });
    }
);

// SCENE 11: Memory Carousel
registerScene(
    'memory_carousel',
    () => `
        <div class="panel" style="max-width: 800px; position: relative;">
            <div id="carousel-container" style="display: flex; flex-direction: column; align-items: center; min-height: 400px;">
                <div id="memory-image-container" style="width: 100%; height: 250px; background: #ddd; border-radius: 10px; margin-bottom: 20px; overflow: hidden; position: relative; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <!-- Placeholder or actual image -->
                    <div id="mem-img" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #666; background-size: cover; background-position: center;"></div>
                </div>
                <h3 id="mem-title" style="margin-bottom: 5px; color: var(--color-primary);"></h3>
                <div id="mem-date" style="font-size: 0.9rem; opacity: 0.7; margin-bottom: 15px;"></div>
                <p id="mem-caption" style="font-style: italic;"></p>

                <div style="display: flex; gap: 20px; margin-top: auto; padding-top: 20px;">
                    <button id="btn-mem-prev" class="btn" style="padding: 10px 20px;">◀</button>
                    <button id="btn-mem-next" class="btn" style="padding: 10px 20px;">▶</button>
                </div>
            </div>
            <!-- Decorative Panda -->
            <div style="position: absolute; bottom: -30px; right: -20px; font-size: 4rem;">🐼📸</div>
        </div>
    `,
    (container) => {
        let currentMem = 0;

        const imgEl = container.querySelector('#mem-img');
        const titleEl = container.querySelector('#mem-title');
        const dateEl = container.querySelector('#mem-date');
        const captionEl = container.querySelector('#mem-caption');
        const btnPrev = container.querySelector('#btn-mem-prev');
        const btnNext = container.querySelector('#btn-mem-next');

        const loadMemory = (index) => {
            const mem = memories[index];
            imgEl.style.backgroundImage = `url('${mem.image}')`;
            imgEl.innerText = mem.image.includes('placeholder') ? "Image: " + mem.image : "";
            titleEl.innerText = mem.title;
            dateEl.innerText = mem.date;
            captionEl.innerText = "\"" + mem.caption + "\"";

            // Animation reset
            const memContainer = container.querySelector('#memory-image-container');
            memContainer.classList.remove('slide-up');
            void memContainer.offsetWidth;
            memContainer.classList.add('slide-up');
        };

        btnPrev.addEventListener('click', () => {
            if (currentMem > 0) {
                currentMem--;
                loadMemory(currentMem);
            }
        });

        btnNext.addEventListener('click', () => {
            if (currentMem < memories.length - 1) {
                currentMem++;
                loadMemory(currentMem);
            } else {
                nextScene(); // Move on if at end
            }
        });

        // Keyboard navigation
        const handleKey = (e) => {
            if (state.currentScene !== scenes.findIndex(s => s.id === 'memory_carousel')) return;
            if (e.key === 'ArrowLeft') btnPrev.click();
            if (e.key === 'ArrowRight') btnNext.click();
        };
        document.addEventListener('keydown', handleKey);

        // Cleanup listener on leave
        scenes[state.currentScene].onLeave = () => {
            document.removeEventListener('keydown', handleKey);
        };

        loadMemory(0);
    }
);

// SCENE 12: Personal Questions
registerScene(
    'personal_questions',
    () => `
        <div class="panel">
            <div id="pq-panda" style="font-size: 4rem; margin-bottom: 20px;">🐼❤️</div>
            <h2 id="pq-text" class="text-reveal" style="min-height: 80px; transition: opacity 0.5s;"></h2>
            <div id="pq-options" class="hidden" style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;"></div>
        </div>
    `,
    async (container) => {
        const textEl = container.querySelector('#pq-text');
        const optionsEl = container.querySelector('#pq-options');
        const pandaEl = container.querySelector('#pq-panda');

        const questionsList = birthdayConfig.personalQuestions;

        for (let i = 0; i < questionsList.length; i++) {
            textEl.classList.remove('visible');
            await sleep(500);

            textEl.innerText = questionsList[i];
            textEl.classList.add('visible');

            if (i === questionsList.length - 1) {
                // Final question
                await sleep(1000);
                optionsEl.innerHTML = `<button id="btn-pq-yes" class="btn" style="background: var(--color-primary); color: white; font-size: 1.5rem;">YES ❤️</button>`;
                optionsEl.classList.remove('hidden');
                optionsEl.classList.add('visible');

                pandaEl.classList.add('shake');

                return new Promise((resolve) => {
                    container.querySelector('#btn-pq-yes').addEventListener('click', async () => {
                        optionsEl.classList.add('hidden');
                        textEl.classList.remove('visible');
                        await sleep(1000);
                        nextScene();
                        resolve();
                    });
                });
            } else {
                await sleep(4000); // Wait between questions
            }
        }
    }
);

// SCENE 13: Personal Message
registerScene(
    'personal_message',
    () => `
        <div class="panel" style="text-align: left; max-width: 700px;">
            <div style="text-align: center; font-size: 3rem; margin-bottom: 20px;">🐼🎁</div>
            <div id="pm-text" style="font-size: 1.2rem; line-height: 1.6; white-space: pre-wrap; opacity: 0; transition: opacity 2s;"></div>
            <div style="text-align: center; margin-top: 30px;">
                <button id="btn-continue-final" class="btn hidden">CONTINUE</button>
            </div>
        </div>
    `,
    async (container) => {
        const textEl = container.querySelector('#pm-text');
        const btnCont = container.querySelector('#btn-continue-final');

        // Prepare final message by replacing placeholders
        let finalMsg = birthdayConfig.messages.final.replace('[NAME]', birthdayConfig.friendName);

        await sleep(1000);

        // Fade in message text block entirely (typewriter might be too slow for long paragraphs)
        textEl.innerText = finalMsg;
        textEl.style.opacity = '1';

        await sleep(5000); // Give them time to read a bit before showing button
        btnCont.classList.remove('hidden');
        btnCont.classList.add('visible');

        btnCont.addEventListener('click', () => {
            nextScene();
        });
    }
);

// SCENE 14: Countdown
registerScene(
    'countdown',
    () => `
        <div class="panel" style="background: var(--color-bg-dark); color: white; border: none; box-shadow: 0 0 50px rgba(255,255,255,0.1);">
            <h2 style="color: var(--color-accent); letter-spacing: 2px;">THE FINAL SURPRISE</h2>
            <h4 style="opacity: 0.8; margin-bottom: 30px;">The pandas are preparing something...</h4>

            <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 30px; font-family: monospace; font-size: 2rem;">
                <div class="cd-box"><div id="cd-days">00</div><div style="font-size: 0.8rem; font-family: var(--font-main);">DAYS</div></div>
                <div class="cd-box"><div id="cd-hours">00</div><div style="font-size: 0.8rem; font-family: var(--font-main);">HOURS</div></div>
                <div class="cd-box"><div id="cd-mins">00</div><div style="font-size: 0.8rem; font-family: var(--font-main);">MINUTES</div></div>
                <div class="cd-box"><div id="cd-secs">00</div><div style="font-size: 0.8rem; font-family: var(--font-main);">SECONDS</div></div>
            </div>

            <div id="countdown-panda" style="font-size: 3rem; margin-top: 20px;">🐼⌚</div>
            <div id="countdown-panda-text" style="font-style: italic; opacity: 0.7; height: 20px; margin-top: 10px;"></div>

            <!-- Hidden Debug Button -->
            <button id="btn-debug-skip" style="opacity: 0; position: absolute; bottom: 0; right: 0; width: 50px; height: 50px; cursor: pointer; border:none; background:transparent;" title="Skip Countdown (Debug)"></button>
        </div>
    `,
    (container) => {
        document.body.classList.remove('theme-light'); // Back to dark theme

        const dEl = container.querySelector('#cd-days');
        const hEl = container.querySelector('#cd-hours');
        const mEl = container.querySelector('#cd-mins');
        const sEl = container.querySelector('#cd-secs');
        const pText = container.querySelector('#countdown-panda-text');
        const btnDebug = container.querySelector('#btn-debug-skip');

        const targetDate = new Date(birthdayConfig.birthdayDate).getTime();
        let interval;

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance <= 0) {
                clearInterval(interval);
                dEl.innerText = "00"; hEl.innerText = "00"; mEl.innerText = "00"; sEl.innerText = "00";

                setTimeout(() => nextScene(), 2000);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            dEl.innerText = String(days).padStart(2, '0');
            hEl.innerText = String(hours).padStart(2, '0');
            mEl.innerText = String(minutes).padStart(2, '0');
            sEl.innerText = String(seconds).padStart(2, '0');

            // Random panda text
            if (seconds % 15 === 0) {
                const phrases = ["Still waiting...", "How long does a birthday take?", "Are we there yet?", "I should have brought more bamboo."];
                pText.innerText = phrases[Math.floor(Math.random() * phrases.length)];
            }
        };

        interval = setInterval(updateTimer, 1000);
        updateTimer();

        // Debug skip
        btnDebug.addEventListener('click', () => {
            clearInterval(interval);
            nextScene();
        });

        scenes[state.currentScene].onLeave = () => clearInterval(interval);
    }
);

// SCENE 15: Cinematic Reveal & Celebration
registerScene(
    'final_celebration',
    () => `
        <div id="cinematic-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 50; background: black;">
            <div id="spotlight-panda" class="hidden" style="font-size: 5rem; text-shadow: 0 0 50px white; transition: all 2s;">🐼🎂</div>
            <h1 id="final-bday-text" class="hidden" style="color: white; font-size: 3rem; margin-top: 30px; text-align: center; text-shadow: 0 0 20px rgba(255,255,255,0.5);"></h1>
            <div id="completion-text" class="hidden" style="color: var(--color-primary); margin-top: 20px; font-weight: bold; letter-spacing: 2px;">YOU COMPLETED THE PANDA BIRTHDAY ADVENTURE.</div>
        </div>

        <!-- Post-cinematic celebration view -->
        <div id="celebration-view" class="hidden" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 40; background: var(--color-bg-light);">
            <div id="all-pandas" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
                <!-- Pandas injected via JS -->
            </div>
            <button id="btn-surprise" class="btn" style="position: absolute; bottom: 40px; z-index: 50; background: var(--color-primary); color: white;">ONE MORE SURPRISE 🎁</button>
        </div>
    `,
    async (container) => {
        const cinematic = container.querySelector('#cinematic-layer');
        const spotlightPanda = container.querySelector('#spotlight-panda');
        const finalBdayText = container.querySelector('#final-bday-text');
        const completionText = container.querySelector('#completion-text');

        const celebration = container.querySelector('#celebration-view');
        const allPandas = container.querySelector('#all-pandas');
        const btnSurprise = container.querySelector('#btn-surprise');

        // Hide UI
        document.getElementById('progress-container').classList.add('hidden');
        document.getElementById('btn-restart-global').classList.add('hidden');

        // Cinematic Sequence
        await sleep(1000);
        spotlightPanda.classList.remove('hidden');
        spotlightPanda.classList.add('slide-up');

        await sleep(2000);
        finalBdayText.innerHTML = `HAPPY BIRTHDAY, <br>${birthdayConfig.friendName.toUpperCase()} 🎂🐼❤️`;
        finalBdayText.classList.remove('hidden');
        finalBdayText.classList.add('slide-up');

        await sleep(2000);
        completionText.classList.remove('hidden');

        await sleep(4000);

        // Transition to celebration
        cinematic.style.transition = "opacity 2s ease";
        cinematic.style.opacity = "0";
        celebration.classList.remove('hidden');

        // Populate celebration pandas
        const pandaEmojis = ['🐼', '🐼🎈', '🐼🎉', '🐼🎂', '🐼✨', '🐼🎶'];
        for(let i=0; i<15; i++) {
            const p = document.createElement('div');
            p.innerText = pandaEmojis[Math.floor(Math.random() * pandaEmojis.length)];
            p.style.position = 'absolute';
            p.style.fontSize = Math.random() * 2 + 2 + 'rem';
            p.style.left = Math.random() * 90 + '%';
            p.style.top = Math.random() * 80 + '%';

            // Random realistic animations
            const anims = ['bounce', 'sway', 'float'];
            const anim = anims[Math.floor(Math.random() * anims.length)];

            // Give them random initial delays so they don't move in sync
            const delay = Math.random() * 2;

            if (anim === 'bounce') {
                p.style.animation = `bounce ${1 + Math.random()}s infinite alternate ease-in-out ${delay}s`;
            } else if (anim === 'sway') {
                p.style.animation = `naturalSway ${4 + Math.random() * 3}s infinite alternate ease-in-out ${delay}s`;
            } else {
                p.style.animation = `floatUp ${10 + Math.random() * 5}s infinite linear ${delay}s`;
            }

            allPandas.appendChild(p);
        }

        // The one sleeping panda
        const sleepingPanda = document.createElement('div');
        sleepingPanda.innerText = '🐼💤';
        sleepingPanda.style.position = 'absolute';
        sleepingPanda.style.bottom = '20px';
        sleepingPanda.style.right = '20px';
        sleepingPanda.style.fontSize = '3rem';
        allPandas.appendChild(sleepingPanda);

        const sleepText = document.createElement('div');
        sleepText.innerText = 'That panda has officially given up.';
        sleepText.style.position = 'absolute';
        sleepText.style.bottom = '10px';
        sleepText.style.right = '80px';
        sleepText.style.fontSize = '0.8rem';
        sleepText.style.opacity = '0.6';
        allPandas.appendChild(sleepText);

        setTimeout(() => cinematic.classList.add('hidden'), 2000);

        btnSurprise.addEventListener('click', () => {
            nextScene();
        });
    }
);

// SCENE 16: One More Surprise (Secret ending)
registerScene(
    'secret_surprise',
    () => `
        <div class="panel" style="text-align: center;">
            <h2>The Final Secret</h2>
            <div style="font-size: 5rem; margin: 20px 0;">🐼💖</div>
            <p style="font-size: 1.2rem; line-height: 1.6; margin-bottom: 30px;">
                I didn't actually know how to end this.<br><br>
                So here is just another panda telling you that you are amazing.
            </p>
            <button id="btn-final-restart" class="btn">RESTART ADVENTURE 🔄</button>
        </div>
    `,
    (container) => {
        container.querySelector('#btn-final-restart').addEventListener('click', resetState);
    }
);

// =========================================
// 5. GLOBAL RANDOM PANDA EVENTS
// =========================================
function startGlobalPandaEvents() {
    const layer = document.getElementById('global-panda-layer');
    if (!layer) return;

    setInterval(() => {
        // Don't spawn if in intro, countdown, or final scenes to preserve mood
        if (state.currentScene < 2 || state.currentScene >= scenes.length - 3) return;

        // 50% chance to skip spawning
        if (Math.random() > 0.5) return;

        const p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.fontSize = '2.5rem';
        p.style.zIndex = '5';

        const events = [
            // Walk bottom
            () => { p.innerText = '🐼'; p.style.bottom = '10px'; p.style.left = '-50px'; p.style.animation = 'slideRight 10s linear forwards'; },
            // Fall top
            () => { p.innerText = '🐼'; p.style.top = '-50px'; p.style.left = Math.random()*80 + '%'; p.style.animation = 'fall 3s ease-in forwards'; },
            // Peek side
            () => { p.innerText = '🐼'; p.style.top = '50%'; p.style.right = '-20px'; p.style.transform = 'rotate(-90deg)'; p.style.animation = 'shake 3s forwards'; },
            // Steal balloon
            () => { p.innerText = '🐼🎈'; p.style.bottom = '-50px'; p.style.left = Math.random()*80 + '%'; p.style.animation = 'floatUp 8s linear forwards'; }
        ];

        events[Math.floor(Math.random() * events.length)]();
        layer.appendChild(p);

        // Cleanup after animation finishes
        setTimeout(() => p.remove(), 11000);

    }, 15000); // Check every 15 seconds
}


// =========================================
// 6. INITIALIZATION RUN
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    startGlobalPandaEvents();
    loadState();

    // Bind Restart
    const btnRestart = document.getElementById('btn-restart-global');
    if (btnRestart) {
        btnRestart.addEventListener('click', resetState);
    }

    initAudio();

    // Provide an empty initial scene so goToScene(0) has something to clear if needed,
    // but usually on load container is empty.

    // We will register scenes in the upcoming steps.
    // For now, we simulate starting the engine.
    setTimeout(() => {
        if (scenes.length > 0) {
            // Jump to saved scene, or 0 if start
            goToScene(state.currentScene);
        }
    }, 100);

    console.log("Panda Birthday Engine Initialized.");
});