from helium import *
import time
# author:
#  - mricard

# Ce script utilise la bibliothèque Helium pour automatiser le dessin sur le site place.inpt.fr

# Fonction pour lire les identifiants depuis un fichier
def read_credentials(file_path):
    with open(file_path, "r") as file:
        username = file.readline().strip()
        password = file.readline().strip()
    return username, password

# Chemin du fichier contenant les identifiants
credentials_file = ".env"

# Lecture des identifiants depuis le fichier
username, password = read_credentials(credentials_file)

# Démarrage du navigateur
driver = start_chrome('place.inpt.fr', headless=False)

# Saisie du nom d'utilisateur et du mot de passe, puis connexion
write(username, into='Username')
write(password, into='Password')
click('Login')

# Attendre quelques secondes pour que la page se charge
time.sleep(5)  # Attendre 5 secondes (vous pouvez ajuster cette valeur si nécessaire)

# Charger le contenu du fichier JavaScript
with open("draw.js", "r") as file:
    javascript_code = file.read()

print(javascript_code)
# Exécuter le code JavaScript dans la console
driver.execute_script(javascript_code)

print("Drawing")
