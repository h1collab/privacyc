# ZorixOS

A small mac-like desktop & window simulator built with plain HTML/CSS/JS. It demonstrates:
- Menu bar with time and settings
- Dock and app launch
- Draggable, resizable windows with mac-like traffic buttons
- Settings panel: custom cursor, dark mode, hide Dock
- Accessible keyboard handling (basic)

How to run locally
1. Clone or copy files into a folder.
2. Open `index.html` in a modern browser, or run a local server for best results:
   - Python: `python3 -m http.server 8000`
   - Node (serve): `npx serve .`
3. Visit `http://localhost:8000` (or open the file directly).

Create a GitHub repo and push (example)
1. Initialize git and commit:
   ```
   git init
   git add .
   git commit -m "Initial ZorixOS mac-like simulator"
   ```
2. Create remote repo on GitHub:
   - Using GitHub website: create repo `zorix-os` under your account.
   - Or using GitHub CLI:
     ```
     gh repo create h1collab/zorix-os --public --source=. --remote=origin --push
     ```
   - Or add remote manually:
     ```
     git remote add origin https://github.com/<your-username>/zorix-os.git
     git branch -M main
     git push -u origin main
     ```

Customization ideas
- Add more sample apps
- Improve window snapping and animations
- Add configuration persistence (localStorage)
- Replace cursor image with richer SVG bitmaps or different pointers

License: MIT
