# inCredible-AI
Installation guide:
git clone https://github.com/fearyj/inCredible-AI.git

# Create python virtual environment
python -m venv .venv

# For Mac
source .venv/bin/activate

# For Windows
.venv/Scripts activate

# Go to backend directory
cd inCredible-AI/backend

# Install Backend modules
pip install -r requirements.txt

# Run backend server
python App.py

# Go to frontend
cd ../frontend

# Install frotnend modules
npm install 
# Make sure downloaded nodejs

# Run frontend
npm run dev

# Make sure port number on flask and react server stated correctly in routing files (api.py/App.py/inDetect.jsx/inFact.jsx)
