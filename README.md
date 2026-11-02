# Adaptive Gamer Coach
### Behavioral intelligence for gamers | Review 3 submission

A dark, broadcast-style dashboard (with a short Valorant-style intro animation) that uses machine learning to predict a gamer's **anger risk** (how likely they are to lose their temper and rage-quit) and **gaming addiction level**, shows exactly which habits drive each result, and writes a step-by-step recovery plan.

It is **not** a medical tool. It gives coaching guidance, not a diagnosis.

---

## Run it on your own Windows PC with VS Code

This guide assumes you have never run a project like this before. Follow it top to bottom. Every step says exactly what to click and type.

**How it works, in one picture.** The project has two parts, and each one runs in its **own terminal window**:

| Part | What it does | Terminal | Address |
| :--- | :--- | :--- | :--- |
| **Backend** (Python) | Runs the AI models | **Terminal 1** | http://127.0.0.1:8000 |
| **Frontend** (website) | The page you see and click | **Terminal 2** | http://localhost:5173 |

You must keep **both terminals open** while you use the app.

---

### Step 0: Install the tools (one time only)

Skip any tool you already have. To check, you can do Step 3 and come back if a command is not recognised.

1. **Visual Studio Code**: download from https://code.visualstudio.com and install it.
2. **Python 3.10 to 3.13**: download from https://www.python.org/downloads/windows/ and run the installer.
   - **Important:** on the first installer screen, tick **"Add python.exe to PATH"** *before* you click Install Now. If you forget this, `python` will not work later.
3. **Node.js (LTS version)**: download the **LTS** button from https://nodejs.org and install it with the default options.
4. **Git** (optional): from https://git-scm.com/download/win. You only need this if you want to *clone* the project. You can download a ZIP instead (Step 1).

After installing, **restart your computer** once so Windows picks everything up.

---

### Step 1: Get the project onto your PC

Pick **one** of the two ways.

**Option A: Download a ZIP (no Git needed)**
1. Open https://github.com/Butcherboy7/adaptive-gamer-coach in your browser.
2. Click the green **Code** button, then **Download ZIP**.
3. Right-click the downloaded ZIP, choose **Extract All...**, and extract it somewhere easy, for example your Desktop.
4. You now have a folder called `adaptive-gamer-coach-main` (or similar). This is your project folder.

**Option B: Clone with Git**
1. Open **Command Prompt** (press the Windows key, type `cmd`, press Enter).
2. Run:
   ```
   cd Desktop
   git clone https://github.com/Butcherboy7/adaptive-gamer-coach.git
   ```
3. You now have a `adaptive-gamer-coach` folder on your Desktop.

---

### Step 2: Open the project in VS Code

1. Open **VS Code**.
2. Click **File** (top left), then **Open Folder...**
3. Select the project folder you made in Step 1 (the one that contains `README.md`, `backend`, `frontend` and `ml`), then click **Select Folder**.
4. If VS Code asks *"Do you trust the authors of the files in this folder?"*, click **Yes, I trust the authors**.

You should now see `backend`, `frontend`, `ml` and `README.md` in the left sidebar.

---

### Step 3: Open Terminal 1 and start the backend

1. In VS Code, click **Terminal** in the top menu, then **New Terminal**.
   A panel opens at the bottom. This is **Terminal 1**.
2. Look at the top-right of that panel. It should say **powershell**. If it says something else, click the small arrow next to the **+** and choose **PowerShell**.
3. Check the terminal is in the project folder. The line should end with your project folder name, like `...daptive-gamer-coach>`. If not, run `cd` followed by the folder path.
4. Check Python is installed. Type this and press Enter:
   ```
   python --version
   ```
   You should see something like `Python 3.13.3`. If you see *"python is not recognized"*, go to the **Troubleshooting** table below.
5. Create a private Python environment for the project (only the first time):
   ```
   python -m venv .venv
   ```
6. Switch it on:
   ```
   .venv\Scripts\activate
   ```
   You should now see `(.venv)` at the start of the line.
   - **If it says "running scripts is disabled on this system":** run this once, then run the activate line again:
     ```
     Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
     ```
     Type `Y` and press Enter if it asks.
   - If VS Code pops up *"We noticed a new environment has been created. Do you want to select it?"*, click **Yes**.
7. Install what the backend needs (only the first time, takes about a minute):
   ```
   pip install -r requirements.txt
   ```
8. Start the backend:
   ```
   python backend/main.py
   ```

**It's working when** you see `Application startup complete.` and `Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)`. (`0.0.0.0` just means "this computer"; you will use `127.0.0.1` or `localhost` in the browser.)

> **Do not close this terminal and do not type in it again.** It is busy running the backend. Leave it alone and go to Step 4.

---

### Step 4: Open a NEW terminal (Terminal 2) and start the website

The first terminal is now busy, so you need a second one.

1. In VS Code, click **Terminal**, then **New Terminal** again. (Or click the **+** icon at the top-right of the terminal panel.)
   A second terminal tab appears. This is **Terminal 2**. You can switch between the two using the list on the right side of the panel.
2. Make sure Terminal 2 is also **PowerShell** and is in the project folder.
3. Go into the frontend folder:
   ```
   cd frontend
   ```
4. Install what the website needs (only the first time, takes one to three minutes):
   ```
   npm install
   ```
   Warnings in yellow are normal. Red `ERR!` lines are not (see Troubleshooting).
5. Start the website:
   ```
   npm run dev
   ```

**It's working when** you see a box with `Local: http://localhost:5173/`. If 5173 is busy, Vite picks the next free number (5174, 5175...). Always use the address it prints.

---

### Step 5: Open the app

Hold **Ctrl** and click the `http://localhost:5173/` link in Terminal 2, or open your browser (Chrome, Edge or Brave) and type `localhost:5173` in the address bar.

In the top-right of the page you should see a green dot and **Models online**. If it says **Server offline**, the backend in Terminal 1 is not running (see Troubleshooting).

---

### Running it again another day

You only install things once. Next time:

1. Open VS Code, then **File > Open Folder...** and choose the project folder again.
2. **Terminal 1** (Terminal > New Terminal):
   ```
   .venv\Scripts\activate
   python backend/main.py
   ```
3. **Terminal 2** (Terminal > New Terminal again):
   ```
   cd frontend
   npm run dev
   ```
4. Open http://localhost:5173.

### Stopping the app

Click inside a terminal and press **Ctrl + C**. Do this in both terminals. You can then close VS Code.

---

## Using the app

When the page opens you see three steps: pick a player, move the sliders, get the plan.

**Option A: Pick a player**
1. Click the big search box, or click one of the example players. You can also type a Riot ID such as `kyuu#0711` and press Enter. Press `/` anywhere to jump to the search.
2. The player's profile appears on the left: rank, K/D, headshot rate, win rate, favourite agents, last 10 matches and what time of day they play.
3. The report appears on the right. Read it top to bottom:
   - **The headline and the dark "Do this first" bar** tell you the one thing to do right now.
   - **Anger risk** and **Gaming addiction** are the two scores. The solid marker is where the player is now. The hollow marker is where they would land if they follow the plan.
   - **What's pushing your risk up** lists the biggest problems. Each row has one scale: the green zone is healthy and the dot is you. Click a row for why it matters and how to fix it.
   - **Your plan** has Today, Weeks 1 to 2 and Weeks 3 to 6. Click any step to see the details.
   - **Warning signs** and **Talk to someone** show free help resources.
4. Drag any slider on the left under **Try changing a habit** and the whole report updates live. This shows how a change would help.

**Option B: Type your own numbers**
1. On the start page, click **Or type your own numbers**.
2. Answer six quick questions by moving each slider: hours played a day, late-night play, stress, anger after a loss, happiness and loneliness. Sliders with a hollow dot have not been answered yet.
3. The **Your result so far** box on the right runs the real models as you move the sliders.
4. Click **See my report**. The other 8 inputs are estimated from your answers or left at typical values, and are tagged **Estimated** or **Typical** so nothing is hidden. You can change any of them on the report page.

> Player profiles come from a synthetic dataset. They are not real people.

---

## Deploy it on Vercel (free)

The repo is already set up for Vercel (`vercel.json` and the `api/` folder). You change nothing.

1. Push the project to your GitHub repo (`git add .`, `git commit -m "update"`, `git push`).
2. Go to https://vercel.com, sign in with GitHub, click **Add New... > Project**, and **Import** `adaptive-gamer-coach`.
3. Leave every setting on its default. Do not set a Root Directory. The build and output settings are read from `vercel.json`.
4. Click **Deploy** and wait about a minute or two.
5. When it says **Congratulations**, click the preview. The page should open with the intro animation and show **Models online** top-right.

If **Models online** does not appear, open the Vercel project, go to **Logs**, and check the `/api` function.

---

## Troubleshooting

| Problem | Fix |
| :--- | :--- |
| `python` is not recognized | Python is not installed or was installed without "Add to PATH". Reinstall it from python.org and tick **Add python.exe to PATH**, then close and reopen VS Code. You can also try `py --version` and use `py` instead of `python` in the commands. |
| `npm` is not recognized | Install Node.js (LTS) from nodejs.org, restart your PC, then reopen VS Code. |
| "running scripts is disabled on this system" when activating | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, type `Y`, then run `.venv\Scripts\activate` again. |
| Page says **Server offline** or "Can't reach the analysis server" | The backend is not running. Go to Terminal 1 and run `python backend/main.py` (with `(.venv)` showing). |
| You typed the website commands in Terminal 1 and nothing works | Terminal 1 is busy running the backend. Open a **new** terminal (Terminal > New Terminal) for the website. |
| `Could not open requirements file` | You are in the wrong folder. The terminal must be in the project folder that contains `requirements.txt`. Use `cd` to go there. |
| `ENOENT ... package.json` when running `npm` | You forgot `cd frontend`. Run it first. |
| Port 8000 or 5173 is already in use | Another copy is still running. Press Ctrl+C in the old terminals, or close VS Code and reopen it. If it persists, restart your PC. |
| A model loading error in Terminal 1 | Check that `ml/mlp_weights.json` exists. If you retrained the models, run `python export_weights.py` inside the `ml` folder. |
| Python or npm installs fail on a college or office network | Try a different network or a phone hotspot. Some networks block package downloads. |

---

## How it works

```
                  ┌───────────────────┐
                  │   Vite + React    │   (port 5173)
                  │    the website    │
                  └─────────┬─────────┘
                            │  POST /predict
                            ▼
                  ┌───────────────────┐
                  │  FastAPI backend  │   (port 8000)
                  └─────────┬─────────┘
                            │  inference
                            ▼
                ┌────────────────────────┐
                │ Two neural networks    │
                │ (multi-layer           │
                │  perceptrons)          │
                └────────────────────────┘
```

### The models
Both are trained by `ml/train_deep_learning.py` on 22,000 synthetic, population-shaped player profiles (80/20 train/test split).

- **Anger (rage-quit) model**: 9 inputs (stress, anxiety, anger after losses, daily hours, toxic lobbies, late-night play, sessions, sleep, loneliness) leading to a probability. Test accuracy 79.7%, ROC-AUC 0.86. The labels are noisy by design, which caps any model at about 79%.
- **Addiction model**: 10 inputs (daily hours, sessions, late-night play, sleep, loneliness, offline social life, spending, years playing, happiness, low mood) leading to Low, Medium or High. Test accuracy 92.6%, macro-F1 0.91.
- **Factor impacts**: sampled Shapley values against a healthy baseline profile (`backend/coaching.py`). Each factor's points are its average effect on the model output across random orderings of the factors.
- **Coaching engine**: `backend/coaching.py` writes the headline, per-factor advice, phased plan, step-down schedule and the projected outcome from the player's own numbers.
- **Player database**: `backend/players.py` generates each player from a behavioural archetype, so the stats, match history and wellbeing answers stay consistent.

### About the "Estimated" inputs
In the quick form, some inputs are estimated from related answers (for example sleep from late-night play, anxiety from stress). These shortcuts are assumptions made by the app. The models were trained on data where every input varies independently, so they did not learn these links. This is why those values are always labelled **Estimated** and can be edited.

### API
| Endpoint | Purpose |
| :--- | :--- |
| `GET /health` | Model status |
| `GET /players/search?q=` | Search players by Riot ID |
| `GET /players/lookup?riot_id=` | Full player profile |
| `POST /predict` | Predictions, factor impacts, plan and projection |

### Retraining the models (optional)
The models run from `ml/mlp_weights.json` using plain NumPy (`backend/mlp.py`), so the server does not need scikit-learn. To retrain, open a terminal in the project folder, activate `.venv`, then:
```
pip install -r ml/requirements.txt
cd ml
python train_deep_learning.py
```
This re-exports `mlp_weights.json` automatically.

---

## Project layout

| Folder | What is in it |
| :--- | :--- |
| `backend/` | FastAPI server, coaching engine, player database, NumPy model runner |
| `frontend/` | The React website (Vite) |
| `ml/` | Model training scripts and the trained weights |
| `api/` | Entry point for deploying the backend on Vercel |
| `vercel.json` | Vercel build and routing settings (do not delete) |
| `docs/` | Extra project notes |

---

## License
MIT. See [LICENSE](LICENSE).

## Academic attribution
- **Course**: Mallareddy University, Department of CSE, Review 3
- **Research**: Predicting Gamer Burnout via Behavioral Modeling
- **Lead developer**: Abdullah
