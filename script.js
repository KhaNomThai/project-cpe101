const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const mstDistanceElement = document.getElementById('mstDistance');

let vertices = [];
let edges = [];
let history = [];
const meterToPixelRatio = 20; // 1 meter = 20 pixels
const minVertexDistance = 50; // Minimum distance between vertices in pixels to avoid overlap

let isDragging = false;
let draggingVertex = null;
let selectedEdge = null;

function saveState() {
    history.push({
        vertices: JSON.parse(JSON.stringify(vertices)),
        edges: JSON.parse(JSON.stringify(edges))
    });
}

function restoreState() {
    if (history.length > 0) {
        const lastState = history.pop();
        vertices = lastState.vertices;
        edges = lastState.edges;
        drawGraph();
    } else {
        alert("No more actions to undo.");
    }
}

function generateVertices() {
    saveState(); // Save current state before making changes

    const vertexCount = parseInt(document.getElementById('vertexCountInput').value);
    vertices = [];
    edges = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    if (isNaN(vertexCount) || vertexCount <= 0) {
        alert("Please enter a valid number of vertices.");
        return;
    }

    // คำนวณการเลื่อนตำแหน่งให้ตรงกลาง
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50; // ระยะรัศมีที่ vertices จะถูกวางไว้รอบๆ กลาง

    // สร้าง vertices กระจายตามวงกลมรอบๆ กลาง canvas
    for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        vertices.push({
            x,
            y
        });
    }

    drawGraph();
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // ล้าง canvas

    ctx.font = '16px Arial'; // ขนาดตัวอักษรที่ใหญ่ขึ้น

    // วาด vertices
    vertices.forEach((v, index) => {
        ctx.beginPath();
        ctx.arc(v.x, v.y, 6, 0, Math.PI * 2); // ลดขนาดจุด vertex ให้เล็กลง (radius = 6)
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
        ctx.fillText(index + 1, v.x + 10, v.y + 10); // แสดงเลขของ vertex เริ่มต้นจาก 1
    });

    // วาด edges
    edges.forEach(edge => {
        const [from, to, weight] = edge;
        const fromVertex = vertices[from];
        const toVertex = vertices[to];

        ctx.beginPath();
        ctx.moveTo(fromVertex.x, fromVertex.y);
        ctx.lineTo(toVertex.x, toVertex.y);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        // แสดงน้ำหนักของเส้นเป็นเมตร
        const midX = (fromVertex.x + toVertex.x) / 2;
        const midY = (fromVertex.y + toVertex.y) / 2;
        ctx.fillText(weight.toFixed(2) + "m", midX, midY);
    });
}

// ฟังก์ชันคำนวณระยะห่างระหว่าง vertices ในพิกเซล
function calculateDistanceInPixels(fromVertex, toVertex) {
    const dx = toVertex.x - fromVertex.x;
    const dy = toVertex.y - fromVertex.y;
    return Math.sqrt(dx * dx + dy * dy); // ระยะทางในพิกเซล
}

// คำนวณระยะห่างระหว่าง vertices และแปลงเป็นเมตร
function calculateDistance(fromVertex, toVertex) {
    const distanceInPixels = calculateDistanceInPixels(fromVertex, toVertex);
    return distanceInPixels / meterToPixelRatio; // แปลงเป็นเมตร
}

// เพิ่ม edge พร้อมปรับระยะห่างของ vertices ให้สัมพันธ์กับ weight (ระยะทางในเมตร)
function addEdge() {
    saveState(); // Save current state before making changes

    const from = parseInt(document.getElementById('fromInput').value) - 1; // ลด 1 เพื่อให้เข้ากับดัชนี
    const to = parseInt(document.getElementById('toInput').value) - 1; // ลด 1 เพื่อให้เข้ากับดัชนี
    const weight = parseFloat(document.getElementById('weightInput').value);

    if (isNaN(from) || isNaN(to) || from >= vertices.length || to >= vertices.length) {
        alert("Please enter valid vertex indices.");
        return;
    }

    if (isNaN(weight) || weight <= 0) {
        alert("Please enter a valid weight (distance in meters).");
        return;
    }

    // คำนวณระยะทางตามน้ำหนักที่ป้อนมา (weight) แล้วปรับพิกัดของ vertex ที่เชื่อม
    adjustVerticesPosition(from, to, weight);

    edges.push([from, to, weight]);
    drawGraph();
}

// ปรับตำแหน่งของ vertices ให้สัมพันธ์กับระยะห่าง (weight)
function adjustVerticesPosition(from, to, weight) {
    const fromVertex = vertices[from];
    const toVertex = vertices[to];

    const currentDistance = calculateDistance(fromVertex, toVertex);
    const targetDistanceInPixels = weight * meterToPixelRatio; // ระยะทางเป้าหมายในพิกเซล

    // ปรับตำแหน่งของ vertex "to" ให้ระยะห่างตาม weight ที่กำหนด
    const scalingFactor = targetDistanceInPixels / calculateDistanceInPixels(fromVertex, toVertex);

    const dx = toVertex.x - fromVertex.x;
    const dy = toVertex.y - fromVertex.y;

    toVertex.x = fromVertex.x + dx * scalingFactor;
    toVertex.y = fromVertex.y + dy * scalingFactor;
}

// ลาก vertices
function dragVertex(event) {
    if (!isDragging || draggingVertex === null) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    draggingVertex.x = mouseX;
    draggingVertex.y = mouseY;
    drawGraph();
}

// เริ่มลาก
canvas.addEventListener('mousedown', event => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    vertices.forEach((v, index) => {
        const distance = Math.sqrt((v.x - mouseX) ** 2 + (v.y - mouseY) ** 2);
        if (distance < 10) { // ตรวจสอบว่าคลิกในรัศมีของ vertex
            isDragging = true;
            draggingVertex = v;
        }
    });
});

// เลิกลาก
canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggingVertex = null;
});

// ตรวจจับการเลื่อนเมาส์ระหว่างลาก
canvas.addEventListener('mousemove', dragVertex);

// Prim's algorithm implementation
function primMST() {
    const mstEdges = [];
    const selected = Array(vertices.length).fill(false);
    const startingVertex = 0; // เริ่มจาก vertex แรก
    selected[startingVertex] = true;
    let totalDistance = 0;

    while (mstEdges.length < vertices.length - 1) {
        let minWeight = Infinity;
        let u = -1,
            v = -1;

        edges.forEach(([from, to, weight]) => {
            if (selected[from] && !selected[to] && weight < minWeight) {
                minWeight = weight;
                u = from;
                v = to;
            } else if (selected[to] && !selected[from] && weight < minWeight) {
                minWeight = weight;
                u = to;
                v = from;
            }
        });

        mstEdges.push([u, v, minWeight]);
        totalDistance += minWeight; // เพิ่มระยะทางไปยังผลรวม
        selected[v] = true;
    }

    return {
        mstEdges,
        totalDistance
    };
}

function drawMST(mstEdges) {
    mstEdges.forEach(edge => {
        const [from, to, weight] = edge;
        const fromVertex = vertices[from];
        const toVertex = vertices[to];

        ctx.beginPath();
        ctx.moveTo(fromVertex.x, fromVertex.y);
        ctx.lineTo(toVertex.x, toVertex.y);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.closePath();
    });
}

function calculateMST() {
    const {
        mstEdges,
        totalDistance
    } = primMST();
    drawMST(mstEdges);
    mstDistanceElement.textContent = totalDistance.toFixed(2); // แสดงผลระยะทางทั้งหมด
}

function undo() {
    restoreState(); // Restore last saved state
}