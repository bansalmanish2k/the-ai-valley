import React, { useState } from 'react';

const GRID_SIZE = 15; 

function App() {
  const [grid, setGrid] = useState(
    Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('Empty'))
  );
  const [mode, setMode] = useState('Start'); 
  const [algorithm, setAlgorithm] = useState('astar'); 
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState(null);

  const getEndNodeCoords = () => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 'End') return { r, c };
      }
    }
    return null;
  };

  const endNode = getEndNodeCoords();

  const getHeuristic = (r, c) => {
    if (!endNode) return '';
    if (algorithm !== 'bestfirst' && algorithm !== 'astar') return ''; 
    return Math.abs(r - endNode.r) + Math.abs(c - endNode.c);
  };

  const handleCellClick = (row, col) => {
    if (isRunning) return; 
    const newGrid = [...grid];
    newGrid[row] = [...newGrid[row]];
    
    if (newGrid[row][col] === mode) {
      newGrid[row][col] = 'Empty';
    } else {
      newGrid[row][col] = mode;
    }
    setGrid(newGrid);
    
    const node = document.getElementById(`node-${row}-${col}`);
    if(node) node.innerHTML = ''; 
  };

  const getCellColor = (type) => {
    if (type === 'Start') return '#10b981'; // Neon Emerald
    if (type === 'End') return '#f43f5e';   // Neon Rose
    if (type === 'Wall') return '#334155';  // Dark Slate Wall
    return '#1e293b';                       // Empty Dark Cell
  };

  const runAlgorithm = async () => {
    clearPath();
    setStats(null);
    setIsRunning(true);
    
    try {
      const endpoint = `http://127.0.0.1:8000/api/${algorithm}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grid })
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        setIsRunning(false);
        return;
      }

      const { visited, path, stats: backendStats } = data;

      for (let i = 0; i < visited.length; i++) {
        setTimeout(() => {
          const visitedNode = visited[i];
          const r = visitedNode[0], c = visitedNode[1], val1 = visitedNode[2], g_cost = visitedNode[3], h_cost = visitedNode[4];
          const node = document.getElementById(`node-${r}-${c}`);
          
          if(node) {
            node.style.backgroundColor = '#0ea5e9'; // Neon Cyan
            node.style.boxShadow = '0 0 12px rgba(14, 165, 233, 0.6)';
            node.style.transform = 'scale(1.1)';
            node.style.color = '#ffffff'; 
            node.style.zIndex = '5';
            
            if (g_cost !== undefined && h_cost !== undefined) {
                node.innerHTML = `
                    <div style="position: absolute; top: 2px; left: 4px; font-size: 9px; opacity: 0.8;">${g_cost}</div>
                    <div style="position: absolute; top: 2px; right: 4px; font-size: 9px; opacity: 0.8;">${h_cost}</div>
                    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; font-size: 14px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${val1}</div>
                `;
            } else if (val1 !== undefined && val1 !== "") {
                node.innerText = val1;
            }

            setTimeout(() => {
                node.style.transform = 'scale(1)';
                node.style.zIndex = '1';
                node.style.backgroundColor = '#0369a1'; // Darker cyan when settled
                node.style.boxShadow = 'none';
            }, 200);
          }
        }, 30 * i); 
      }

      setTimeout(() => {
        for (let i = 0; i < path.length; i++) {
          setTimeout(() => {
            const [r, c] = path[i];
            const node = document.getElementById(`node-${r}-${c}`);
            if(node) {
              node.style.backgroundColor = '#eab308'; // Glowing Gold
              node.style.boxShadow = '0 0 20px rgba(234, 179, 8, 0.8), inset 0 0 10px rgba(255,255,255,0.5)';
              node.style.color = '#422006'; 
              node.style.transform = 'scale(1.05)';
              node.style.zIndex = '10';
              node.style.borderRadius = '8px'; // Make the path rounder
            }
          }, 40 * i);
        }
        
        setTimeout(() => {
            setIsRunning(false);
            setStats(backendStats);
        }, 40 * path.length);
        
      }, 30 * visited.length);

    } catch (error) {
      alert("Error connecting to Python backend.");
      setIsRunning(false);
    }
  };

  const clearPath = () => {
    if (isRunning) return;
    setStats(null);
    for(let r=0; r<GRID_SIZE; r++){
        for(let c=0; c<GRID_SIZE; c++){
            const node = document.getElementById(`node-${r}-${c}`);
            if(node) {
                node.style.backgroundColor = getCellColor(grid[r][c]);
                node.style.boxShadow = 'none';
                node.style.transform = 'scale(1)';
                node.style.color = '#334155'; // Dark text for faint background numbers
                node.style.borderRadius = '6px';
                
                if (grid[r][c] === 'Empty') {
                    node.innerHTML = getHeuristic(r, c);
                } else {
                    node.innerHTML = '';
                }
            }
        }
    }
  };

  const clearGrid = () => {
    if (isRunning) return;
    setStats(null);
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('Empty')));
    for(let r=0; r<GRID_SIZE; r++){
        for(let c=0; c<GRID_SIZE; c++){
            const node = document.getElementById(`node-${r}-${c}`);
            if(node) {
                node.style.backgroundColor = '#1e293b';
                node.style.boxShadow = 'none';
                node.style.transform = 'scale(1)';
                node.style.borderRadius = '6px';
                node.innerHTML = ''; 
            }
        }
    }
  };

  const styles = {
    // DARK THEME BACKGROUND
    container: { display: 'flex', height: '100vh', backgroundColor: '#0f172a', backgroundImage: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 70%)', fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#f8fafc' },
    
    // GLASSMORPHISM SIDEBAR
    sidebar: { width: '340px', backgroundColor: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(16px)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 10, overflowY: 'auto', boxShadow: '10px 0 30px rgba(0,0,0,0.5)' },
    
    main: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' },
    title: { margin: '0 0 5px 0', color: '#f8fafc', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(255,255,255,0.1)' },
    subtitle: { margin: '0', color: '#94a3b8', fontSize: '14px', letterSpacing: '0.5px', textTransform: 'uppercase' },
    sectionLabel: { fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' },
    buttonGrp: { display: 'flex', flexDirection: 'column', gap: '10px' },
    
    // PREMIUM BUTTONS
    drawBtn: (isActive, color) => ({ 
      padding: '14px 16px', borderRadius: '12px', 
      border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.1)'}`, 
      backgroundColor: isActive ? `${color}20` : 'rgba(15, 23, 42, 0.5)', 
      color: isActive ? color : '#cbd5e1', 
      fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
      display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px',
      boxShadow: isActive ? `0 0 15px ${color}30` : 'none'
    }),
    
    colorDot: (color) => ({ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 8px ${color}` }),
    
    select: { padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', color: '#f8fafc', backgroundColor: 'rgba(15, 23, 42, 0.8)', outline: 'none', cursor: 'pointer', width: '100%', appearance: 'none', fontWeight: '500' },
    
    // GLOWING ACTION BUTTON
    actionBtn: { padding: '16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', fontWeight: '700', fontSize: '16px', letterSpacing: '0.5px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)', transition: 'all 0.2s', marginTop: 'auto', textTransform: 'uppercase' },
    
    clearBtn: { padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#94a3b8', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
    
    // FLOATING GRID BOARD
    gridContainer: { backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '24px', borderRadius: '24px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)' },
    gridRow: { display: 'flex' },
    
    // SLEEK CELLS
    cell: { 
      width: '42px', height: '42px', 
      border: '1px solid rgba(255,255,255,0.03)', borderRadius: '6px', margin: '2px', 
      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
      position: 'relative', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      fontSize: '12px', fontWeight: 'bold', 
      color: '#334155', // Faint background numbers
      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
    },
    
    // PREMIUM STATS
    statBox: { backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    statLabel: { color: '#94a3b8', fontSize: '13px', fontWeight: '500' },
    statValue: { color: '#38bdf8', fontSize: '18px', fontWeight: '800', textShadow: '0 0 10px rgba(56, 189, 248, 0.3)' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div>
          <h1 style={styles.title}>The AI Valley</h1>
          <p style={styles.subtitle}>Algorithm Visualizer</p>
        </div>

        <div>
          <div style={styles.sectionLabel}>Algorithm Engine</div>
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} style={styles.select} disabled={isRunning}>
            <option value="astar">A* Search (Optimal)</option>
            <option value="bestfirst">Best-First Search (Greedy)</option>
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
            <option value="hillclimbing">Hill Climbing (Local Max)</option>
          </select>
        </div>

        <div>
          <div style={styles.sectionLabel}>Map Controls</div>
          <div style={styles.buttonGrp}>
            <button onClick={() => setMode('Start')} style={styles.drawBtn(mode === 'Start', '#10b981')} disabled={isRunning}>
              <div style={styles.colorDot('#10b981')}></div> Origin Node
            </button>
            <button onClick={() => setMode('End')} style={styles.drawBtn(mode === 'End', '#f43f5e')} disabled={isRunning}>
              <div style={styles.colorDot('#f43f5e')}></div> Target Node
            </button>
            <button onClick={() => setMode('Wall')} style={styles.drawBtn(mode === 'Wall', '#94a3b8')} disabled={isRunning}>
              <div style={styles.colorDot('#94a3b8')}></div> Draw Obstacles
            </button>
          </div>
        </div>

        {stats && (
          <div>
            <div style={styles.sectionLabel}>Telemetry</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={styles.statBox}><span style={styles.statLabel}>Nodes Explored</span><span style={styles.statValue}>{stats.visited_count}</span></div>
              <div style={styles.statBox}><span style={styles.statLabel}>Path Length</span><span style={styles.statValue} style={{...styles.statValue, color: '#eab308'}}>{stats.path_length === 0 ? 'No Path' : stats.path_length}</span></div>
              <div style={styles.statBox}><span style={styles.statLabel}>Execution Time</span><span style={styles.statValue} style={{...styles.statValue, color: '#10b981'}}>{stats.time_ms} ms</span></div>
            </div>
          </div>
        )}

        <button 
          onClick={runAlgorithm} 
          style={{...styles.actionBtn, opacity: isRunning ? 0.7 : 1, cursor: isRunning ? 'wait' : 'pointer', marginTop: stats ? '10px' : 'auto'}} 
          disabled={isRunning}
        >
          {isRunning ? 'Computing...' : 'Initialize Search'}
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={clearPath} style={{...styles.clearBtn, flex: 1}} disabled={isRunning}>Wipe Path</button>
          <button onClick={clearGrid} style={{...styles.clearBtn, flex: 1, color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.2)'}} disabled={isRunning}>Reset Grid</button>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.gridContainer}>
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} style={styles.gridRow}>
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  id={`node-${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  style={{...styles.cell, backgroundColor: getCellColor(cell)}}
                >
                  {cell === 'Empty' ? getHeuristic(rowIndex, colIndex) : ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
