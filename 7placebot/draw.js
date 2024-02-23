// Colors hashmap
const colors = new Map([
    ["#000000", "black"],
    ["#0F5AA6", "blue"],
    ["#00CCC0", "aqua"],
    ["#FFB470", "tan"],
    ["#9C6927", "brown"],
    ["#BE0039", "red"],
    ["#FF4500", "orange"],
    ["#FFA800", "sun"],
    ["#FDD636", "yellow"],
    ["#7EED56", "lime"],
    ["#219200", "green"],
    ["#811E9F", "purple"],
    ["#FD90DA", "pink"],
    ["#D4D7D9", "light_gray"],
    ["#898D90", "gray"],
    ["#FFFFFF", "white"],
    ["#CB3234", "pure_red"],
    ["#A18594", "pastel_violet"],
    ["#015D52", "opal_green"],
    ["#ED760E", "yellow_orange"]
]);



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
        throw new Error('Error getting pixel info');
    }
    const pixelInfo = await response.json();
    return pixelInfo;
    
}


// Check if the pixel is already placed and if we can place a pixel at the given coordinates
async function canPlace(x, y) {
    const pixelInfo = await getPixelInfo(x + offset_x, y + offset_y);
    const color = colorsMatrix[y-1][x-1];
    if (!colors.has(color.toUpperCase())) {
        console.log("Couleur non reconnue : ", color);
        return false;
    }
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
    var ignore = 0;
    for (var i = 1; i <  Math.min(height+1, dimm - offset_y+1) ; i++) {
        for (var j = 1; j < Math.min(width+1, dimm - offset_x+1); j++) {
            try {
                if (colors.has(colorsMatrix[i-1][j-1].toUpperCase())) {
                    if (currentMatrix[offset_y + i][offset_x + j].toUpperCase() !== colorsMatrix[i-1][j-1].toUpperCase()) {
                        diff.push({i, j});
                    }
                } else {
                    ignore++;
                }
            }
            catch (e) {
                console.log("i : ", i, "j : ", j);
            }
        }
    }
    const perCent = 100 - (diff.length / (height * width - ignore)) * 100;
    console.log("Pourcentage : ", perCent);
    return diff;
}

// Draw the picture
async function draw() {
    console.log('Drawing...');
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
                console.log("drawing finished");
                break;
            }
            const coords = diff[Math.floor(Math.random()*diff.length)];
            const x = coords.j;
            const y = coords.i;
            console.log("Coords : x =", x, ", y =", y);
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
            console.error('Error:', error.message);
        }       
    }
}

// Convert a color to a string
function colorAssociation(color) {
    var colorString = colors.get(color.toUpperCase());
    return colorString;
}

// Coords of the top left corner of the picture
// this point will be the (0, 0) point of the matrix
// (1, 1) will be the point at the right of the top left corner
const offset_x = OFFSET_X; 
const offset_y = OFFSET_Y;

// Matrix representing the picture to draw
const colorsMatrix = MATRIX_TO_DRAW;
const height = colorsMatrix.length;
const width = colorsMatrix[0].length;
// Default size of the map
var dimm = 50;

const cooldown = 17000; // In milliseconds

// Start drawing in 3 seconds
setTimeout(draw, 3000);

