// Add content scripts to the page
var scriptElement = document.createElement('script');

// We will use a fonction of the page to place pixels
scriptElement.src = '/assets/index.js';https:

document.body.appendChild(scriptElement);

// Random integer between min and max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Place a pixel at the given coordinates with the given color
function place(x, y, color) {
    zt.emit('placePixel', {
                coord_x: x,
                coord_y: y,
                color: color,
                isSticked: false
            });
}

function generateMatrix(data) {
    const matrix = [];
    const { map, width } = data;
    
    // Initialize the matrix with empty cells
    for (let i = 0; i < width+1; i++) {
        matrix.push(new Array(width).fill(null));
    }
    
    // Fill the matrix with colors based on the map data
    map.forEach(item => {
        const { coord_x, coord_y, color } = item;
        if (coord_x < width+1 && coord_y < width+1) {
            matrix[coord_y][coord_x] = color;
        }
    });
    dimm = width;
    return matrix;
}



// Get the information of a pixel at the given coordinates
async function getPixelInfo(coord_x, coord_y) {
    
    const response = await fetch(`https://place.inpt.fr/api/v1/pixel?coord_x=${coord_x}&coord_y=${coord_y}`);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des informations du pixel');
    }
    const pixelInfo = await response.json();
    return pixelInfo;
    
}


// Check if the pixel is already placed and if we can place a pixel at the given coordinates
async function canPlace(x, y) {
    const pixelInfo = await getPixelInfo(x + offset_x, y + offset_y);
    const color = colorsMatrix[y-1][x-1];
    return pixelInfo && !pixelInfo.isSticked && pixelInfo.color.toUpperCase() !== color.toUpperCase();
}


// Get all the pixels on the canvas
async function getAllPixels() {
    const response = await fetch('https://place.inpt.fr/api/v1/user/game/map');
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des pixels');
    }
    const pixels = await response.json();
    return pixels;
}

// Calculate the difference between the current matrix and the colors matrix
async function caclDiff(currentMatrix) {
    var diff = [];
    for (var i = 1; i <  Math.min(height+1, dimm - offset_y+1) ; i++) {
        for (var j = 1; j < Math.min(width+1, dimm - offset_x+1); j++) {
            try {
                if (currentMatrix[offset_y + i][offset_x + j].toUpperCase() !== colorsMatrix[i-1][j-1].toUpperCase()) {
                    diff.push({i, j});
                }
            }
            catch (e) {
                console.log("i : ", i, "j : ", j);
            }
        }
    }
    const perCent = 100 - (diff.length / (height * width)) * 100;
    console.log("Pourcentage : ", perCent);
    return diff;
}

// Draw the picture
async function draw() {
    console.log('Démarrage du dessin...');
    var i = 0;
    slowstart = 100;
    while (true) {
        i++;
        // Get Random coordinates to place a pixel
        //const x = getRandomInt(1, width);
        //const y = getRandomInt(1, height);
        //console.log("Coordonnées : x =", x, ", y =", y);
        try {
        
            const currentMatrix = generateMatrix(await getAllPixels());

            //console.log(currentMatrix);
            const diff = await caclDiff(currentMatrix);
            if (diff.length == 0) {
                console.log("Dessin terminé");
                break;
            }
            const coords = diff[Math.floor(Math.random()*diff.length)];
            const x = coords.j;
            const y = coords.i;
            console.log("Coordonnées : x =", x, ", y =", y);
            // Place a pixel if we can/need to
            if (canPlace(x, y) || i > 100) {
                slowstart = 100;
                i = 0;
                var color = colorAssociation(colorsMatrix[y-1][x-1]);
                await place(x + offset_x, y + offset_y, color);
                console.log(`Placed a pixel at x=${x + offset_x}, y=${y + offset_y} with color ${color}`);
                
                // Wait between 2 placements
                await new Promise(resolve => setTimeout(resolve, cooldown));
            }

        } catch (error) {
            console.log('Erreur:', error.message);
        }       
    }
}

// Convert a color to a string
function colorAssociation(color) {
    switch (color.toUpperCase()) {
        case "#000000":
            return "black";
        case "#0F5AA6":
            return "blue";
        case "#00CCC0":
            return "aqua";
        case "#FFB470":
            return "tan";
        case "#9C6927":
            return "brown";
        case "#BE0039":
            return "red";
        case "#FF4500":
            return "orange";
        case "#FFA800":
            return "sun";
        case "#FDD636":
            return "yellow";
        case "#7EED56":
            return "lime";
        case "#219200":
            return "green";
        case "#811E9F":
            return "purple";
        case "#FD90DA":
            return "pink";
        case "#D4D7D9":
            return "light_gray";
        case "#898D90":
            return "gray";
        case "#FFFFFF":
            return "white";
        case "#CB3234":
            return "pure_red";
        case "#A18594":
            return "pastel_violet";
        case "#015D52":
            return "opal_green";
        case "#ED760E":
            return "yellow_orange";
        default:
            return "unknown";
    }
}

// Coords of the top left corner of the picture
// this point will be the (0, 0) point of the matrix
// (1, 1) will be the point at the right of the top left corner
const offset_x = 0; 
const offset_y = 19;

// Matrix representing the picture to draw
const colorsMatrix = [
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000"],
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#000000"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#000000", "#000000"], 
    ["#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#000000", "#00CCC0", "#000000"], 
    ["#0F5AA6", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#00CCC0", "#00CCC0", "#000000"], 
    ["#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6"], 
    ["#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6"], 
    ["#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6"], 
    ["#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6"], 
    ["#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6"], 
    ["#0F5AA6", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#000000", "#000000", "#000000", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#00CCC0", "#000000", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#00CCC0", "#000000", "#000000", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6"], 
    ["#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#000000", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6", "#0F5AA6"]
    ];
const height = colorsMatrix.length;
const width = colorsMatrix[0].length;
var dimm = 50;
console.log(colorsMatrix);

const cooldown = 27000; // In milliseconds

// Start drawing in 3 seconds
setTimeout(draw, 3000);

