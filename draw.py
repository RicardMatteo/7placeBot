from helium import *
import time
from imgToMatrix import getHexMatrix

# Helium script to draw the image on the canvas of the website place.inpt.fr

# read_credentials: str -> (str, str)
def read_credentials(file_path):
    with open(file_path, "r") as file:
        username = file.readline().strip()
        password = file.readline().strip()
    return username, password

# Path to the file containing the credentials
credentials_file = "credentials.txt"

# Read the credentials from the file
username, password = read_credentials(credentials_file)

# Open the website in a new browser window
driver = start_chrome('place.inpt.fr', headless=False)

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
hex_matrix = str(getHexMatrix("mario.png"))

# Replace the placeholder in the JavaScript code with the hex matrix
javascript_code = javascript_code.replace("MATRIX_TO_DRAW", hex_matrix)


# Execute the JavaScript code
driver.execute_script(javascript_code)

print("Drawing")