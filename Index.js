let canvas = document.getElementById("main-canvas");
var pageWidth, pageHeight;
let ctx = canvas.getContext('2d');
let curHighlight = [];
let closed = [];
let childless = [];
let mousex, mousey;
let togglePath = 0;
let showingPath = false;
let blinking = false;
let blinkingColor = "white";
let lastNode = [];
let start = [];
let target = [];
let clicks = 0;
let graph = [];
let amtH = 75;
let amtV = 50;
function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    pageWidth = canvas.width;
    pageHeight = canvas.height;
    let nodeWidth = pageWidth / amtH;
    let nodeHeight = pageHeight / amtV;
    let x = 0, y = 0;
    for(let i=0; i<amtV; i++) {
        let row = [];
        x = 0;
        for(let j=0; j<amtH; j++) {
            let isNull = false;
            if(Math.random() < 0.1) {
                isNull = true;
            }
            let node = new Node(x - 10, y, nodeWidth, nodeHeight, isNull);
            row.push(node);
            x += nodeWidth;
        }
        y += nodeHeight;
        graph.push(row);
    }
}

function calcDist(idx1, idx2) {
    let xdiff = graph[idx1[0]][idx1[1]].x - graph[idx2[0]][idx2[1]].x;
    let ydiff = graph[idx1[0]][idx1[1]].y - graph[idx2[0]][idx2[1]].y;
    return Math.sqrt(xdiff*xdiff + ydiff*ydiff);
}

function compareArrays(a, b) {
    if(a.length != b.length) return false;
    for(let i=0; i<a.length; i++) {
        if(a[i] != b[i]) return false;
    }
    return true;
}

function reset() {
    for(let i=0; i<amtV; i++) {
        for(let j=0; j<amtH; j++) {
            if(graph[i][j].isNull) {
                graph[i][j].color = "black";
            } else {
                graph[i][j].color = "blue";
            }
            graph[i][j].clicked = false;
            graph[i][j].parent = [];
            graph[i][j].gcost = 0;
            graph[i][j].fcost = 0;
            graph[i][j].hcost = 0;
        }
    }
    blinking = false;
    showingPath = false;
}

function resetColors() {
    for(let i=0; i<amtV; i++) {
        for(let j=0; j<amtH; j++) {
            let tmp = [i, j];
            if(compareArrays(tmp, start) || compareArrays(tmp, target)) continue;
            if(graph[i][j].isNull) {
                graph[i][j].color = "black";
            } else {
                graph[i][j].color = "blue";
            }
        }
    }
}

function revealStraightPath(cur) {
    while(!compareArrays(cur, start)) {
        console.log(cur);
        graph[cur[0]][cur[1]].color = "white";
        cur = graph[cur[0]][cur[1]].parent;
    }
}

function revealWholePath(closed) {
    for(let i=0; i<closed.length; i++) {
        if(compareArrays(closed[i], start)) continue;
        graph[closed[i][0]][closed[i][1]].color = "white";
    }
}

function astar() {
    let path = [];
    let open = [[start[0],start[1]]];
    lastNode = [];
    closed = [];
    childless = [];
    let foundPath = false;
    graph[start[0]][start[1]].gcost = 0;
    graph[start[0]][start[1]].fcost = calcDist(start, target);
    graph[start[0]][start[1]].hcost = graph[start[0]][start[1]].fcost;
    graph[start[0]][start[1]].parent = [];
    while(open.length > 0) {
        let cur = [];
        let idx = 0;
        let val = Infinity;
        for(let i=0; i<open.length; i++) {
            let row = open[i][0];
            let col = open[i][1];
            if(graph[row][col].fcost < val) {
                idx = i;
                cur = open[i];
                val = graph[row][col].fcost;
            }
        }

        if(open.length == 0) break;
        if(lastNode.length == 0) {
            lastNode = cur;
        } else if(graph[lastNode[0]][lastNode[1]].hcost > graph[cur[0]][cur[1]].hcost) {
            lastNode = cur;
        }

        if(compareArrays(cur, target)) {
            console.log("found path");
            foundPath = true;
            if(togglePath == 0) {
                revealStraightPath(graph[cur[0]][cur[1]].parent);
            } else {
                revealWholePath(closed);
            }
            showingPath = true;
            break;
        }

        open.splice(idx, 1);
        let children = [];
        if(cur[0] > 0) {
            // above
            let child = [cur[0] - 1, cur[1]];
            if(!graph[child[0]][child[1]].isNull && !compareArrays(child, graph[cur[0]][cur[1]].parent)) {
                children.push(child);
            }
        }
        if(cur[0] < amtV - 1) {
            // below
            let child = [cur[0] + 1, cur[1]];
            if(!graph[child[0]][child[1]].isNull && !compareArrays(child, graph[cur[0]][cur[1]].parent)) {
                children.push(child);
            }
        }
        if(cur[1] > 0) {
            // left
            let child = [cur[0], cur[1] - 1];
            if(!graph[child[0]][child[1]].isNull && !compareArrays(child, graph[cur[0]][cur[1]].parent)) {
                children.push(child);
            }
        }
        if(cur[1] < amtH - 1) {
            // right
            let child = [cur[0], cur[1] + 1];
            if(!graph[child[0]][child[1]].isNull && !compareArrays(child, graph[cur[0]][cur[1]].parent)) {
                children.push(child);
            }
        }
        for(let i=0; i<children.length; i++) {
            let inClosed = false;
            for(let j=0; j<closed.length; j++) {
                if(compareArrays(closed[j], children[i])) {
                    inClosed = true;
                    break;
                }
            }
            if(inClosed) continue;

            let inOpen = false;
            let parent = graph[children[i][0]][children[i][1]].parent
            if(parent.length == 0) {
                graph[children[i][0]][children[i][1]].parent = cur;
            } else {
                if(graph[parent[0]][parent[1]].fcost > graph[cur[0]][cur[1]].fcost) {
                    graph[children[i][0]][children[i][1]].parent = cur;
                }
            }
            let gcost = graph[cur[0]][cur[1]].gcost + calcDist(cur, children[i]);
            let hcost = calcDist(children[i], target);
            graph[children[i][0]][children[i][1]].gcost = gcost;
            graph[children[i][0]][children[i][1]].hcost = hcost;
            graph[children[i][0]][children[i][1]].fcost = gcost + hcost;

            let j;
            for(j=0; j<open.length; j++) {
                if(compareArrays(open[j], children[i])) {
                    inOpen = true;
                    break;
                }
            }

            if(!inOpen) {
                open.push(children[i]);
            }
        }
        closed.push(cur);
    }

    if(!foundPath) {
        console.log("No path found");
        blinking = true;
        showingPath = true;
        if(togglePath == 0) {
            revealStraightPath(lastNode);
        } else {
            revealWholePath(childless);
        }
    }
    clicks = 0;
}

function blink() {
    if(blinkingColor == "white") {
        blinkingColor = "orange";
    } else {
        blinkingColor = "white";
    }
    if(togglePath == 0) {
        let cur = lastNode;
        graph[cur[0]][cur[1]].color = blinkingColor;
    } else {
        for(let i=0; i<childless.length; i++) {
            if(compareArrays(childless[i], start)) continue;
            graph[childless[i][0]][childless[i][1]].color = blinkingColor;
        }
    }
}

function render() {
    for(let i=0; i<amtV; i++) {
        for(let j=0; j<amtH; j++) {
            graph[i][j].render(ctx);
        }
    }
    if(blinking) blink();
}

document.addEventListener("mousedown", function(e) {
    if(showingPath) return;
    if(clicks >= 2) return;
    let row = curHighlight[0];
    let col = curHighlight[1];
    if(clicks == 0) {
        graph[row][col].color = "green";
        start = [row, col];
    } else if(clicks == 1) {
        graph[row][col].color = "red";
        target = [row, col];
    }
    clicks++;
    graph[row][col].clicked = true;
    if(clicks >= 2) astar();
});

document.addEventListener("keypress", function(e) {
    if(e.key == "n") {
        if(showingPath) return;
        for(let i=0; i<amtV; i++) {
            for(let j=0; j<amtH; j++) {
                if(mousex >= graph[i][j].x && mousex < graph[i][j].x + graph[i][j].w && 
                    mousey >= graph[i][j].y && mousey < graph[i][j].y + graph[i][j].h && !graph[i][j].isNull) {
                        // Make null
                        graph[i][j].isNull = true;
                        graph[i][j].color = "black";
                        return;
                }
            }
        }
    }
    if(e.key == "r") {
        reset();
        clicks = 0;
    }
    if(e.key == "t") {
        togglePath ^= 1;
        if(showingPath) {
            resetColors();
            if(togglePath == 0) {
                revealStraightPath(graph[lastNode[0]][lastNode[1]].parent);
            } else {
                revealWholePath(closed);
                if(blinking) {
                    revealWholePath(childless);
                }
            }
        }
    }
});

document.addEventListener("mousemove", function(e) {
    if(showingPath) return;
    mousex = e.clientX;
    mousey = e.clientY;
    for(let i=0; i<amtV; i++) {
        for(let j=0; j<amtH; j++) {
            if(graph[i][j].clicked) continue;
            if(mousex >= graph[i][j].x && mousex < graph[i][j].x + graph[i][j].w && 
                mousey >= graph[i][j].y && mousey < graph[i][j].y + graph[i][j].h && !graph[i][j].isNull) {
                    // Highlight
                    graph[i][j].color = "yellow";
                    curHighlight = [i, j];
            }
            else {
                if(graph[i][j].isNull) {
                    graph[i][j].color = "black";
                } else {
                    graph[i][j].color = "blue";
                }
            }
        }
    }
});

init();

setInterval(render, 10);