# Panda Birthday Adventure 🐼

A magical, interactive, and slightly chaotic birthday website built for a best friend.

## ⚙️ How to Customize

1. **Open `script.js`**
2. At the very top, you will find the `birthdayConfig` object.
3. Update the following fields:
   * `friendName` (The birthday person's name)
   * `yourName` (Your name)
   * `birthdayDate` (The target date for the countdown. e.g., "2026-12-01T00:00:00")
   * `messages.final` (Your personal final message)

### Images and Memories
The game uses placeholder text or emojis for photos right now. To use your actual photos:
1. Place your `.jpg` or `.png` files inside `assets/photos/`.
2. Scroll down in `script.js` to the `memories` array.
3. Update the `image` path to point to your new file (e.g., `"assets/photos/my-photo.jpg"`).
4. Update the `date`, `title`, and `caption` for each memory!

### Questions
Scroll down in `script.js` to the `questions` array. You can freely edit the questions, options, and the panda's funny reactions!

### Audio
If you want background music:
1. Place an MP3 file into `assets/music/` and name it `birthday.mp3`.
2. Ensure `birthdayConfig.music.enabled` is set to `true`.
*(Note: Browsers restrict autoplay, so the user must opt-in via the prompt in Scene 2).*

## 🚀 How to Run

Because the game uses JavaScript ES6 and local storage, you cannot simply double-click `index.html` (you will get a CORS error). You need a local server.

If you have Python installed, open your terminal in this folder and run:
\`\`\`bash
python3 -m http.server 8000
\`\`\`
Then open \`http://localhost:8000\` in your browser!

### 🧪 Debugging the Countdown
Don't want to wait until 2026 to see the final scene?
When you reach the countdown screen, hover/click the **bottom right corner** of the screen. There is a hidden invisible button there that skips the countdown!
