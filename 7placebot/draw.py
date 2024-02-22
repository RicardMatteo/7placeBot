from helium import *
import time
import os
from imgToMatrix import getHexMatrix

# Helium script to draw the image on the canvas of the website place.inpt.fr

# Fonction pour lire les identifiants depuis un fichier
def cli_arg_or(key, ask_message):
    if (arg := os.getenv(key)) is not None and arg != "":
        return arg
    return input(ask_message)

username = cli_arg_or("USERNAME", "Username: ")
password = cli_arg_or("PASSWORD", "Password: ")
image = cli_arg_or("IMAGE", "Image you want to draw: ")
offsetX = cli_arg_or("OFFSET_X", "Offset X: ")
offsetY = cli_arg_or("OFFSET_Y", "Offset Y: ")

# Open the website in a new browser window
driver = start_firefox('place.inpt.fr', headless=True)

# Log in to the website
write(username, into='Username')
write(password, into='Password')
click('Login')

# Wait for the page to load
time.sleep(5)

# Load the JavaScript code from the file
with open("draw.js", "r") as file:
    javascript_code = file.read()

# Get the hex matrix of the image
hex_matrix = str(getHexMatrix("/images/" + image))

# Replace the placeholder in the JavaScript code with the hex matrix
javascript_code = javascript_code.replace("MATRIX_TO_DRAW", hex_matrix)
javascript_code = javascript_code.replace("OFFSET_X", offsetX)
javascript_code = javascript_code.replace("OFFSET_Y", offsetY)


# Execute the JavaScript code
driver.execute_script(javascript_code)

print("Drawing")

while(True):
    time.sleep(1000)

