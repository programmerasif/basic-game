# 🎮 Multi-Level Game Challenge

An exciting multi-level arcade game built with React, TypeScript, and Tailwind CSS. Progress through three unique gaming experiences: Whack-a-Mole, Maze Adventure, and the Classic Snake Game!

## 🚀 Live Demo

**Play Now:** [https://hit-the-hade.vercel.app/](https://hit-the-hade.vercel.app/)

## ✨ Features

### 🎯 Three Unique Levels

1. **Level 1: Whack-a-Mole** 🔨

   - Click the appearing moles as fast as you can
   - Score 10 points to advance to the next level
   - Test your reaction speed and accuracy

2. **Level 2: Maze Adventure** 🏰

   - Navigate through a procedurally generated maze
   - Collect items (💰 🍎 🏠 ⭐ 💎) scattered throughout
   - Reach 20 points or find the castle to progress
   - Full collision detection - avoid walls!

3. **Level 3: Snake Game** 🐍
   - Classic snake gameplay with modern design
   - Eat food to grow and increase your score
   - Avoid walls and your own tail
   - Reach 30 points to complete all levels!

### 🎮 Controls

#### Desktop

- **Arrow Keys** or **WASD** for movement
- **Mouse Click** for Whack-a-Mole

#### Mobile

- **On-screen Touch Buttons** for directional control
- **Tap** for Whack-a-Mole
- Fully responsive across all devices

### 🌟 Game Features

- ✅ **Progressive Difficulty**: Each level presents a unique challenge
- 🎨 **Modern UI**: Beautiful gradient designs and smooth animations
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop
- 🎯 **Score Tracking**: Persistent score across all levels
- 🔄 **Level Restart**: Try again without losing progress
- 🏠 **Start from Beginning**: Reset entire game anytime
- 💾 **State Management**: Seamless level transitions

## 🛠️ Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Vite** - Build Tool
- **ESLint** - Code Quality

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/programmerasif/basic-game.git

# Navigate to project directory
cd hit-the-hade

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

## 🎯 How to Play

1. **Start the Game**: Click "Start Adventure" on the welcome screen
2. **Level 1**: Click moles to score 10 points
3. **Level 2**: Navigate the maze using arrow keys/WASD or touch controls
4. **Level 3**: Control the snake, eat food, and reach 30 total points
5. **Win**: Complete all three levels to see the victory screen!

## 📂 Project Structure

```
src/
├── components/
│   ├── GameManager.tsx      # Main game flow controller
│   ├── WhackAMoleLevel.tsx  # Level 1 component
│   ├── MazeLevel.tsx        # Level 2 component
│   ├── MazeGrid.tsx         # Maze rendering & logic
│   ├── Player.tsx           # Player character
│   ├── SnakeLevel.tsx       # Level 3 component
│   ├── SnakeBoard.tsx       # Snake game logic
│   └── MobileControls.tsx   # Touch controls
├── App.tsx                  # Root component
└── main.tsx                 # Entry point
```

## 🎨 Design Highlights

- **Gradient Backgrounds**: Eye-catching color schemes
- **Smooth Animations**: Pulse effects and transitions
- **Emoji Graphics**: Fun and accessible visual elements
- **Glassmorphism**: Modern backdrop blur effects
- **Responsive Layout**: Adapts to all screen sizes

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🐛 Bug Fixes & Improvements

- ✅ Wall collision detection in Maze level
- ✅ Mobile and keyboard controls work simultaneously
- ✅ Snake level restarts correctly without resetting progress
- ✅ Fully responsive UI on all devices
- ✅ Enhanced congratulations screens

## 📝 License

This project is open source and available for educational purposes.


---

⭐ **Enjoy the game!** Feel free to star this repository if you like it!
