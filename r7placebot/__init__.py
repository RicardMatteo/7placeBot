from helium import *
import time
from r7placebot.imgToMatrix import getHexMatrix

# Helium script to draw the image on the canvas of the website place.inpt.fr

# read_credentials: str -> (str, str)
def read_credentials(file_path):
    with open(file_path, "r") as file:
        username = file.readline().strip()
        password = file.readline().strip()
    return username, password


def read_image_config(file_path):
    with open(file_path, "r") as file:
        image_path = file.readline().strip()
        offset_x, offset_y = [int(i) for i in file.readline().strip().split()]
    return image_path, offset_x, offset_y


def main():
    # Chemin du fichier contenant les identifiants
    credentials_file = ".env"

    # Chemin du fichier contenant les parametres de l'image
    config_file = "config.txt"

    # Read the credentials from the file
    username, password = read_credentials(credentials_file)

    # Lire les parametres de l'image depuis le fichier
    image_path, offset_x, offset_y = read_image_config(config_file)

    # Open the website in a new browser window
    try:
        driver = start_chrome('place.inpt.fr', headless=False)
    except:
        driver = start_chrome('place.inpt.fr', headless=True)

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
    hex_matrix = str(getHexMatrix(image_path))

    # Replace the placeholder in the JavaScript code with the hex matrix
    javascript_code = javascript_code.replace("MATRIX_TO_DRAW", hex_matrix)

    # Replace the placeholder in the JavaScript code with the correct offsets
    javascript_code = javascript_code.replace("OFFSET_X", str(offset_x))
    javascript_code = javascript_code.replace("OFFSET_Y", str(offset_y))

    # Execute the JavaScript code
    driver.execute_script(javascript_code)

    print("Drawing")


if __name__ == "__main__":
    main()
