# Visualization of Prim's Algorithm (TangLat)

A small web tool that builds a weighted graph on an HTML canvas, runs **Prim's algorithm** on it, and draws the resulting **Minimum Spanning Tree (MST)** with its total distance. CPE101 course project.

## Features

- Generate any number of vertices, placed evenly on a circle
- Add edges with a weight in meters; the second vertex moves so the line length matches the weight
- Drag vertices to rearrange the graph
- Calculate the MST: its edges are drawn in green and the total distance is shown
- Undo after generating vertices or adding an edge

The MST is drawn in one step, not edge by edge. The graph must be connected for the calculation to work.

## Tech stack

- HTML, CSS and plain JavaScript (no libraries or build step)
- HTML Canvas API for drawing

## Run it

Open `index.html` in a browser.

## Developer

**Kulachart Parnduangkeaw**, Computer Engineering student · [GitHub](https://github.com/KhaNomThai)
