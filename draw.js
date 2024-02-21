//colors hashmap
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
        throw new Error('Erreur lors de la récupération des informations du pixel');
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
    var colorString = colors.get(color.toUpperCase());
    return colorString;
}

const offset_x = 0
const offset_y = 0
const colorsMatrix = [['#fdd636', '#fdd636', '#fdd636', '#fdd636', '#fdd636', '#00ccc0', '#00ccc0', '#fdd636', '#fdd636', '#fdd636', '#00ccc0', '#fdd636', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#00ccc0'], ['#fdd636', '#fdd636', '#fdd636', '#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#9c6927', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#9c6927', '#000000'], ['#fdd636', '#fdd636', '#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#9c6927', '#9c6927', '#000000'], ['#fdd636', '#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#fdd636', '#00ccc0', '#00ccc0', '#000000', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#cb3234', '#cb3234', '#9c6927', '#ed760e', '#000000', '#000000', '#000000', '#000000', '#000000', '#9c6927', '#cb3234', '#cb3234', '#9c6927', '#000000'], ['#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#fdd636', '#00ccc0', '#000000', '#7eed56', '#000000', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#000000', '#7eed56', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#cb3234', '#cb3234', '#cb3234', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#cb3234', '#cb3234', '#cb3234', '#9c6927', '#000000'], ['#00ccc0', '#00ccc0', '#00ccc0', '#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#7eed56', '#7eed56', '#7eed56', '#000000', '#000000', '#000000', '#000000', '#000000', '#7eed56', '#7eed56', '#7eed56', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#cb3234', '#cb3234', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#cb3234', '#cb3234', '#9c6927', '#000000'], ['#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#7eed56', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#ed760e', '#ed760e', '#000000'], ['#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ed760e', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#000000', '#00ccc0'], ['#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#fdd636', '#00ccc0', '#00ccc0', '#000000', '#7eed56', '#7eed56', '#000000', '#ffa800', '#ffa800', '#fdd636', '#000000', '#7eed56', '#7eed56', '#000000', '#219200', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffb470', '#ffb470', '#000000', '#000000', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#000000', '#000000', '#ffb470', '#ed760e', '#000000', '#00ccc0'], ['#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#7eed56', '#7eed56', '#000000', '#ffa800', '#fdd636', '#fdd636', '#000000', '#7eed56', '#7eed56', '#000000', '#7eed56', '#219200', '#000000', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffb470', '#ffb470', '#ffffff', '#000000', '#ed760e', '#ed760e', '#ed760e', '#ffb470', '#ffffff', '#000000', '#ed760e', '#ed760e', '#000000', '#00ccc0'], ['#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#000000', '#fdd636', '#fdd636', '#fdd636', '#fdd636', '#000000', '#000000', '#000000', '#219200', '#7eed56', '#000000', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffb470', '#ffb470', '#ffb470', '#000000', '#000000', '#ed760e', '#000000', '#ed760e', '#ffb470', '#000000', '#000000', '#ffb470', '#ed760e', '#ed760e', '#000000'], ['#fdd636', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ff4500', '#ff4500', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#fdd636', '#fdd636', '#fdd636', '#fdd636', '#fdd636', '#fdd636', '#000000', '#7eed56', '#219200', '#000000', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffb470', '#000000', '#00ccc0', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ed760e', '#000000'], ['#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#000000', '#00ccc0', '#00ccc0', '#000000', '#000000', '#000000', '#fdd636', '#fdd636', '#fdd636', '#000000', '#000000', '#219200', '#000000', '#00ccc0', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffb470', '#ed760e', '#000000', '#00ccc0', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#ffffff', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#d4d7d9', '#000000', '#00ccc0'], ['#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ff4500', '#fd90da', '#fd90da', '#fd90da', '#ff4500', '#ff4500', '#000000', '#000000', '#000000', '#000000', '#7eed56', '#000000', '#fdd636', '#000000', '#7eed56', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#ed760e', '#000000', '#00ccc0', '#00ccc0', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#ffffff', '#ffffff', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#000000', '#00ccc0', '#00ccc0'], ['#00ccc0', '#00ccc0', '#000000', '#ff4500', '#ff4500', '#fd90da', '#fd90da', '#fd90da', '#fd90da', '#ff4500', '#ff4500', '#000000', '#000000', '#7eed56', '#7eed56', '#000000', '#000000', '#7eed56', '#7eed56', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#ed760e', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#d4d7d9', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0'], ['#00ccc0', '#00ccc0', '#000000', '#ff4500', '#ff4500', '#fd90da', '#fd90da', '#fd90da', '#fd90da', '#fd90da', '#ff4500', '#ff4500', '#ff4500', '#000000', '#000000', '#ffffff', '#000000', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffb470', '#ed760e', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#ed760e', '#ed760e', '#000000', '#00ccc0', '#000000', '#000000', '#ffb470', '#ed760e', '#ffffff', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0'], ['#00ccc0', '#00ccc0', '#000000', '#ff4500', '#fd90da', '#fd90da', '#fd90da', '#fd90da', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffb470', '#ed760e', '#ed760e', '#ed760e', '#ed760e', '#ed760e', '#ed760e', '#ed760e', '#000000', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#ffffff', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#ed760e', '#000000', '#00ccc0', '#00ccc0', '#00ccc0'], ['#00ccc0', '#00ccc0', '#000000', '#ff4500', '#fd90da', '#fd90da', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#ffb470', '#ffb470', '#ed760e', '#ed760e', '#ed760e', '#ed760e', '#000000', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#ffffff', '#ffffff', '#d4d7d9', '#d4d7d9', '#ed760e', '#000000', '#00ccc0', '#00ccc0', '#00ccc0'], ['#00ccc0', '#00ccc0', '#000000', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#000000', '#ffb470', '#ed760e', '#ed760e', '#ed760e', '#000000', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#ffffff', '#ffffff', '#ffffff', '#000000', '#ed760e', '#000000', '#00ccc0', '#00ccc0', '#00ccc0'], ['#00ccc0', '#00ccc0', '#000000', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#fd90da', '#fd90da', '#fd90da', '#ffffff', '#ffffff', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ffb470', '#ed760e', '#ffffff', '#ffffff', '#ffffff', '#ed760e', '#ed760e', '#000000', '#00ccc0', '#00ccc0', '#00ccc0'], ['#00ccc0', '#000000', '#ff4500', '#ff4500', '#ff4500', '#ff4500', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#fd90da', '#fd90da', '#fd90da', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffb470', '#ffb470', '#ed760e', '#000000', '#ffb470', '#000000', '#ffb470', '#ed760e', '#000000', '#ffffff', '#000000', '#ffb470', '#ed760e', '#000000', '#00ccc0', '#00ccc0', '#00ccc0'], ['#00ccc0', '#000000', '#bdbdbd', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#fd90da', '#fd90da', '#ffffff', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#ffb470', '#9c6927', '#9c6927', '#000000', '#000000', '#000000', '#9c6927', '#9c6927', '#000000', '#000000', '#000000', '#9c6927', '#9c6927', '#000000', '#00ccc0', '#00ccc0', '#00ccc0'], ['#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9c6927', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#fd90da', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#9c6927', '#000000', '#9c6927', '#000000', '#9c6927', '#9c6927', '#000000', '#00ccc0', '#000000', '#9c6927', '#9c6927', '#000000', '#00ccc0', '#00ccc0', '#00ccc0'], ['#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0'], ['#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9c6927', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#d4d7d9', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0'], ['#000000', '#ffffff', '#ffffff', '#fd90da', '#fd90da', '#fd90da', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#ffffff', '#000000', '#000000', '#ffffff', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#d4d7d9', '#000000', '#00ccc0', '#000000', '#000000', '#00ccc0', '#000000', '#00ccc0', '#000000', '#00ccc0', '#00ccc0', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0'], ['#000000', '#ffffff', '#ffffff', '#fd90da', '#fd90da', '#fd90da', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#00ccc0', '#000000', '#00ccc0', '#00ccc0', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0'], ['#000000', '#ffffff', '#ffffff', '#fd90da', '#fd90da', '#fd90da', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#ffffff', '#ffffff', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#9c6927', '#9c6927', '#9c6927', '#ffffff', '#ffffff', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#000000', '#000000', '#00ccc0', '#000000', '#00ccc0', '#000000', '#00ccc0', '#00ccc0', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#be003a', '#be0338', '#00ccc0', '#bf023b', '#bd033a', '#00ccc0', '#00ccc0'], ['#000000', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#000000', '#ffffff', '#000000', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#fd90da', '#fd90da', '#fd90da', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#000000', '#00ccc0', '#00ccc0', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#00ccc0', '#00ccc0', '#be0039', '#c83036', '#cb3236', '#bf0038', '#c83036', '#d6d7d9', '#be013b', '#00ccc0'], ['#000000', '#000000', '#898d90', '#898d90', '#898d90', '#898d90', '#bdbdbd', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#fd90da', '#898d90', '#898d90', '#898d90', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#000000', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#000000', '#00ccc0', '#bf013a', '#c83135', '#ca3334', '#c93236', '#cb3234', '#ca3234', '#be0339', '#00ccc0'], ['#000000', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#898d90', '#d4d7d9', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#d4d7d9', '#898d90', '#ffffff', '#ffffff', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#898d90', '#000000', '#000000', '#898d90', '#9c6927', '#000000', '#000000', '#00ccc0', '#bf013b', '#cb3136', '#c93235', '#cb3236', '#be0039', '#00ccc0', '#00ccc0'], ['#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#898d90', '#bdbdbd', '#bdbdbd', '#ffffff', '#bdbdbd', '#bdbdbd', '#bdbdbd', '#ffffff', '#ffffff', '#ffffff', '#bdbdbd', '#898d90', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#000000', '#000000', '#00ccc0', '#00ccc0', '#be0339', '#c93234', '#bc033a', '#00ccc0', '#00ccc0', '#00ccc0'], ['#000000', '#ffffff', '#ffffff', '#898d90', '#ffffff', '#898d90', '#ffffff', '#898d90', '#bdbdbd', '#bdbdbd', '#bdbdbd', '#bdbdbd', '#bdbdbd', '#bdbdbd', '#bdbdbd', '#bdbdbd', '#bdbdbd', '#bdbdbd', '#898d90', '#ffffff', '#898d90', '#d4d7d9', '#898d90', '#d4d7d9', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#9c6927', '#000000', '#000000', '#9c6927', '#9c6927', '#000000', '#000000', '#9c6927', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#bf0238', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0'], ['#000000', '#000000', '#757575', '#bdbdbd', '#898d90', '#bdbdbd', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#d4d7d9', '#d4d7d9', '#898d90', '#d4d7d9', '#898d90', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#000000', '#898d90', '#9c6927', '#d4d7d9', '#fd90da', '#fd90da', '#d4d7d9', '#9c6927', '#898d90', '#000000', '#000000', '#000000', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0', '#00ccc0'], ['#7eed56', '#fdd636', '#000000', '#000000', '#000000', '#000000', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#000000', '#000000', '#000000', '#000000', '#000000', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#000000', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#d4d7d9', '#000000', '#898d90', '#9c6927', '#898d90', '#000000', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636'], ['#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#000000', '#000000', '#d4d7d9', '#d4d7d9', '#000000', '#000000', '#9c6927', '#898d90', '#9c6927', '#898d90', '#9c6927', '#000000', '#00ccc0', '#7eed56', '#fdd636', '#ffa800'], ['#ffa800', '#ff4500', '#000000', '#000000', '#000000', '#00ccc0', '#7eed56', '#000000', '#ffa800', '#ff4500', '#be0039', '#000000', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#000000', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#000000', '#000000', '#fdd636', '#ffa800', '#ff4500'], ['#ff4500', '#be0039', '#000000', '#0f5aa6', '#00ccc0', '#000000', '#fdd636', '#000000', '#ff4500', '#be0039', '#811e9f', '#000000', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#000000', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#000000', '#000000', '#000000', '#000000', '#9c6927', '#9c6927', '#9c6927', '#9c6927', '#000000', '#000000', '#ffa800', '#ff4500', '#be0039'], ['#be0039', '#811e9f', '#000000', '#000000', '#000000', '#fdd636', '#ffa800', '#ff4500', '#000000', '#000000', '#000000', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#000000', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#000000', '#898d90', '#898d90', '#9c6927', '#000000', '#000000', '#000000', '#9c6927', '#000000', '#000000', '#ff4500', '#be0039', '#811e9f'], ['#811e9f', '#0f5aa6', '#000000', '#7eed56', '#fdd636', '#000000', '#ff4500', '#be0039', '#811e9f', '#000000', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#000000', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0', '#000000', '#000000', '#898d90', '#9c6927', '#898d90', '#9c6927', '#000000', '#000000', '#000000', '#be0039', '#811e9f', '#0f5aa6'], ['#0f5aa6', '#00ccc0', '#000000', '#000000', '#000000', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#000000', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#811e9f', '#0f5aa6', '#00ccc0'], ['#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56'], ['#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636'], ['#fdd636', '#ffa800', '#000000', '#be0039', '#811e9f', '#000000', '#00ccc0', '#000000', '#000000', '#000000', '#000000', '#be0039', '#000000', '#000000', '#000000', '#000000', '#000000', '#ffa800', '#000000', '#000000', '#000000', '#0f5aa6', '#00ccc0', '#000000', '#000000', '#000000', '#000000', '#be0039', '#811e9f', '#000000', '#000000', '#7eed56', '#fdd636', '#000000', '#ff4500', '#be0039', '#000000', '#0f5aa6', '#000000', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#000000', '#000000', '#000000', '#000000', '#000000', '#fdd636', '#ffa800'], ['#ffa800', '#ff4500', '#000000', '#000000', '#0f5aa6', '#000000', '#7eed56', '#000000', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#000000', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#000000', '#7eed56', '#000000', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#000000', '#00ccc0', '#7eed56', '#000000', '#ffa800', '#000000', '#be0039', '#811e9f', '#000000', '#00ccc0', '#000000', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#000000', '#7eed56', '#fdd636', '#ffa800', '#ff4500'], ['#ff4500', '#be0039', '#000000', '#0f5aa6', '#000000', '#000000', '#fdd636', '#000000', '#000000', '#000000', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#000000', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#000000', '#fdd636', '#000000', '#000000', '#000000', '#811e9f', '#0f5aa6', '#000000', '#000000', '#000000', '#000000', '#ff4500', '#000000', '#811e9f', '#0f5aa6', '#000000', '#7eed56', '#000000', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#000000', '#fdd636', '#ffa800', '#ff4500', '#be0039'], ['#be0039', '#811e9f', '#000000', '#00ccc0', '#7eed56', '#000000', '#ffa800', '#000000', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#000000', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#000000', '#fdd636', '#ffa800', '#000000', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#000000', '#fdd636', '#ffa800', '#000000', '#be0039', '#000000', '#0f5aa6', '#00ccc0', '#000000', '#fdd636', '#000000', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#000000', '#ffa800', '#ff4500', '#be0039', '#811e9f'], ['#811e9f', '#0f5aa6', '#000000', '#7eed56', '#fdd636', '#000000', '#ff4500', '#000000', '#000000', '#000000', '#000000', '#7eed56', '#fdd636', '#ffa800', '#000000', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#000000', '#ffa800', '#ff4500', '#000000', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#000000', '#ffa800', '#ff4500', '#000000', '#811e9f', '#0f5aa6', '#000000', '#000000', '#fdd636', '#ffa800', '#000000', '#000000', '#000000', '#000000', '#00ccc0', '#7eed56', '#fdd636', '#000000', '#ff4500', '#be0039', '#811e9f', '#0f5aa6'], ['#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0'], ['#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56', '#fdd636', '#ffa800', '#ff4500', '#be0039', '#811e9f', '#0f5aa6', '#00ccc0', '#7eed56']]

/*
// Coords of the top left corner of the picture
// this point will be the (0, 0) point of the matrix
// (1, 1) will be the point at the right of the top left corner
const offset_x = 0; 
const offset_y = 30;

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
    ]; */
const height = colorsMatrix.length;
const width = colorsMatrix[0].length;
var dimm = 50;
console.log(colorsMatrix);

const cooldown = 27000; // In milliseconds

// Start drawing in 3 seconds
setTimeout(draw, 3000);

