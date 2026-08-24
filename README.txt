COSMIC BATS 3D — global leaderboard build

Files:
  index.html                      the whole game, self-contained
  netlify/functions/scores.mjs    the leaderboard API (GET/POST /api/scores)
  netlify.toml                    tells Netlify where the function lives
  package.json                    the one dependency the function needs

Deploy: connect this folder to Netlify from a Git repository (see the chat
for step-by-step). Drag-and-drop will NOT work for the leaderboard, because
the function needs its dependency installed at deploy time.

Without the function the game still runs — it just keeps a local table.
