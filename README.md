# 7placeBot
## Installation

First, clone the repository and install the dependencies with poetry.
```
git clone https://github.com/RicardMatteo/7placeBot.git
```

Install the dependencies : `poetry install`. (not needed if you wanna use docker)

## Setup

```bash
cp  .env.example .env
```
Then fill the `.env` file with your credentials and all the options (image name, offset...).
Warning: if you run in docker you need to keep `HEADLESS=y`

### Classique

source your `.env` and then run 
```bash
poetry run python3 ./7placebot/draw.py
```

### Docker

You need to build the image first with the following command:
```bash
docker compose build
```

Then you can run the bot with the following command:
```bash
docker compose up -d
```
