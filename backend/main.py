from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import deque
import heapq
import itertools
import time 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

class GridRequest(BaseModel):
    grid: list

def manhattan(p1, p2):
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

def format_result(visited_order, clean_path, start_time):
    end_time = time.perf_counter()
    time_ms = round((end_time - start_time) * 1000, 2)
    return {
        "visited": visited_order, 
        "path": clean_path,
        "stats": {
            "visited_count": len(visited_order),
            "path_length": len(clean_path),
            "time_ms": time_ms
        }
    }

@app.post("/api/bfs")
def run_bfs(data: GridRequest):
    start_time = time.perf_counter()
    grid = data.grid
    rows, cols = len(grid), len(grid[0])
    start_node = end_node = None
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 'Start': start_node = (r, c)
            elif grid[r][c] == 'End': end_node = (r, c)
    if not start_node or not end_node: return {"error": "Please place both a Start and End node."}

    queue = deque([[start_node]])
    visited = set([start_node])
    visited_order = []
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while queue:
        path = queue.popleft()
        current = path[-1]
        
        if current != start_node and current != end_node:
            # BFS doesn't use heuristics, so we pass an empty string
            visited_order.append([current[0], current[1], ""])
            
        if current == end_node:
            clean_path = [node for node in path if node != start_node and node != end_node]
            return format_result(visited_order, clean_path, start_time)
            
        r, c = current
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] != 'Wall' and (nr, nc) not in visited:
                    visited.add((nr, nc))
                    new_path = list(path)
                    new_path.append((nr, nc))
                    queue.append(new_path)
    return format_result(visited_order, [], start_time)

@app.post("/api/dfs")
def run_dfs(data: GridRequest):
    start_time = time.perf_counter()
    grid = data.grid
    rows, cols = len(grid), len(grid[0])
    start_node = end_node = None
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 'Start': start_node = (r, c)
            elif grid[r][c] == 'End': end_node = (r, c)
    if not start_node or not end_node: return {"error": "Please place both a Start and End node."}

    stack = [[start_node]] 
    visited = set([start_node])
    visited_order = []
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while stack:
        path = stack.pop() 
        current = path[-1]
        
        if current != start_node and current != end_node:
            visited_order.append([current[0], current[1], ""])
            
        if current == end_node:
            clean_path = [node for node in path if node != start_node and node != end_node]
            return format_result(visited_order, clean_path, start_time)
            
        r, c = current
        for dr, dc in reversed(directions):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] != 'Wall' and (nr, nc) not in visited:
                    visited.add((nr, nc))
                    new_path = list(path)
                    new_path.append((nr, nc))
                    stack.append(new_path)
    return format_result(visited_order, [], start_time)

@app.post("/api/bestfirst")
def run_best_first(data: GridRequest):
    start_time = time.perf_counter()
    grid = data.grid
    rows, cols = len(grid), len(grid[0])
    start_node = end_node = None
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 'Start': start_node = (r, c)
            elif grid[r][c] == 'End': end_node = (r, c)
    if not start_node or not end_node: return {"error": "Please place both a Start and End node."}

    counter = itertools.count()
    queue = []
    heapq.heappush(queue, (0, next(counter), start_node, [start_node]))
    
    visited = set([start_node])
    visited_order = []
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while queue:
        # We capture the priority (h-cost) here!
        priority, _, current, path = heapq.heappop(queue)
        
        if current != start_node and current != end_node:
            # Send the h-cost to React
            visited_order.append([current[0], current[1], priority])
            
        if current == end_node:
            clean_path = [node for node in path if node != start_node and node != end_node]
            return format_result(visited_order, clean_path, start_time)
            
        r, c = current
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] != 'Wall' and (nr, nc) not in visited:
                    visited.add((nr, nc))
                    new_path = list(path)
                    new_path.append((nr, nc))
                    new_priority = manhattan((nr, nc), end_node)
                    heapq.heappush(queue, (new_priority, next(counter), (nr, nc), new_path))
    return format_result(visited_order, [], start_time)

@app.post("/api/astar")
def run_astar(data: GridRequest):
    start_time = time.perf_counter()
    grid = data.grid
    rows, cols = len(grid), len(grid[0])
    start_node = end_node = None
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 'Start': start_node = (r, c)
            elif grid[r][c] == 'End': end_node = (r, c)
    if not start_node or not end_node: return {"error": "Please place both a Start and End node."}

    counter = itertools.count()
    queue = []
    heapq.heappush(queue, (0, next(counter), start_node, [start_node]))
    g_costs = {start_node: 0}
    visited_order = []
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while queue:
        priority, _, current, path = heapq.heappop(queue)
        
        if current != start_node and current != end_node:
            # NEW: Calculate exactly what g, h, and f are for this specific block
            g = g_costs[current]
            h = manhattan(current, end_node)
            f = priority # Because f = g + h
            
            # Send ALL THREE numbers to React: [row, col, f, g, h]
            visited_order.append([current[0], current[1], f, g, h])
            
        if current == end_node:
            clean_path = [node for node in path if node != start_node and node != end_node]
            return format_result(visited_order, clean_path, start_time)
            
        r, c = current
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] != 'Wall':
                    new_cost = g_costs[current] + 1
                    if (nr, nc) not in g_costs or new_cost < g_costs[(nr, nc)]:
                        g_costs[(nr, nc)] = new_cost
                        new_path = list(path)
                        new_path.append((nr, nc))
                        new_priority = new_cost + manhattan((nr, nc), end_node)
                        heapq.heappush(queue, (new_priority, next(counter), (nr, nc), new_path))
    return format_result(visited_order, [], start_time)

@app.post("/api/hillclimbing")
def run_hill_climbing(data: GridRequest):
    start_time = time.perf_counter()
    grid = data.grid
    rows, cols = len(grid), len(grid[0])
    start_node = end_node = None
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 'Start': start_node = (r, c)
            elif grid[r][c] == 'End': end_node = (r, c)
    if not start_node or not end_node: return {"error": "Please place both a Start and End node."}

    current = start_node
    path = [current]
    visited_order = []
    visited = set([start_node])
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while current != end_node:
        r, c = current
        best_dist = manhattan(current, end_node) 
        
        if current != start_node:
            # Send the h-cost to React
            visited_order.append([current[0], current[1], best_dist])
            
        best_neighbor = None
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] != 'Wall' and (nr, nc) not in visited:
                    dist = manhattan((nr, nc), end_node)
                    if dist < best_dist:
                        best_dist = dist
                        best_neighbor = (nr, nc)
                        
        if best_neighbor is None:
            break 
            
        visited.add(best_neighbor)
        path.append(best_neighbor)
        current = best_neighbor

    if current == end_node:
        clean_path = [node for node in path if node != start_node and node != end_node]
        return format_result(visited_order, clean_path, start_time)
    else:
        return format_result(visited_order, [], start_time)