# 🌌 The AI Valley: Algorithm Visualizer Suite

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

A modern, full-stack web application designed to visualize and analyze core Artificial Intelligence pathfinding algorithms. Built with a React "Glassmorphism" frontend and a high-performance Python FastAPI backend.

## ✨ Features

* **Interactive Grid:** Draw walls, set start/end nodes, and watch algorithms navigate in real-time.
* **Premium UI:** Cyberpunk-inspired dark mode with neon glowing animations and translucent glassmorphism sidebars.
* **Algorithm Telemetry:** Live analytics calculating Nodes Explored, Final Path Length, and Execution Time (ms) to mathematically prove algorithm efficiency.
* **The "Mind" of A*:** The grid actively displays the $G$-cost, $H$-cost, and $F$-cost on every node during calculation, visually demonstrating the heuristic decision-making process.

## 🧠 Supported Algorithms

1. **A* Search (Optimal):** Uses the formula $f(n) = g(n) + h(n)$ to balance the actual cost of the path with a Manhattan distance heuristic. It guarantees the shortest path while exploring the fewest possible nodes.
2. **Greedy Best-First Search:** Purely heuristic-driven. It acts like a homing missile toward the target but can easily get trapped by concave obstacles.
3. **Breadth-First Search (BFS):** Uninformed search. Explores equally in all directions like a ripple in a pond. Guarantees the shortest path but wastes time exploring useless directions.
4. **Depth-First Search (DFS):** Uninformed search. Plunges deep down a single path until it hits a dead end, then backtracks. Does *not* guarantee the shortest path.
5. **Hill Climbing (Local Maximum Demo):** Optimization algorithm adapted for grid movement. Demonstrates the "Local Maximum" trap by permanently freezing when it encounters a U-shaped wall.

## 🚀 How to Run Locally

### Prerequisites
* Node.js installed
* Python 3.8+ installed

### 1. Start the Python Backend
Open a terminal in the root directory and run:
```bash
cd backend
python -m venv venv

# Activate Virtual Environment (Windows)
venv\Scripts\activate
# Activate Virtual Environment (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic

# Run the server
uvicorn main:app --reload