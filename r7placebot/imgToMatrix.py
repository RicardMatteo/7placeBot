from PIL import Image
import numpy as np


def RGBToHex(r, g, b, a):
    return "#{:02x}{:02x}{:02x}".format(r, g, b) if a > 0 else "#gggggg" #gggggg is not a valid color, it is used to represent the transparency


def getHexMatrix(image_path):
    with Image.open(image_path, "r") as image:
        pixels = np.array(image)
        hex_matrix = [list(map(lambda x: RGBToHex(x[0], x[1], x[2], x[3]), pixels[i])) for i in range(len(pixels))]
          
    with open('image', 'w') as file:
        file.write(str(hex_matrix))
        
    return hex_matrix

if __name__ == "__main__":
    image_path = "night2.png"
    
    with Image.open(image_path, "r") as image:
        #image = image.convert("h")
        pixels = np.array(image)
        hex_matrix = [list(map(lambda x: RGBToHex(x[0], x[1], x[2], x[3]), pixels[i])) for i in range(len(pixels))]
        
    with open('image', 'w') as file:
        file.write(str(hex_matrix))