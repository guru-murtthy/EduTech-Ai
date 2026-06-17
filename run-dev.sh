#!/usr/bin/env bash
# ===================================================
#               EduTech AI local run script
#          Supporting SDG 4: Quality Education
# ===================================================

# Find absolute path of the workspace
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Locate Maven
if command -v mvn &> /dev/null; then
    MVN_PATH="mvn"
    echo "[Info] Using system Maven found in PATH."
elif [ -f "/home/gururaj/Videos/java/apache-maven-3.9.6/bin/mvn" ]; then
    MVN_PATH="/home/gururaj/Videos/java/apache-maven-3.9.6/bin/mvn"
    echo "[Info] Using local Maven at $MVN_PATH."
else
    echo "[Info] Maven not found. Downloading Apache Maven 3.9.6..."
    mkdir -p "$DIR/backend/.maven"
    curl -L -o "$DIR/backend/maven.tar.gz" "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz"
    tar -xzf "$DIR/backend/maven.tar.gz" -C "$DIR/backend/.maven/"
    rm "$DIR/backend/maven.tar.gz"
    MVN_PATH="$DIR/backend/.maven/apache-maven-3.9.6/bin/mvn"
fi

echo "[Step 1/3] Starting Python FastAPI AI Service..."
cd "$DIR/ai-service"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
python main.py > ai-service.log 2>&1 &
AI_PID=$!

echo "[Step 2/3] Starting Spring Boot Backend..."
cd "$DIR/backend"
"$MVN_PATH" spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!

echo "[Step 3/3] Starting Next.js Frontend..."
cd "$DIR/frontend"
npm install
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "==================================================="
echo "All services have been launched in the background:"
echo "  - AI Service (PID: $AI_PID):   http://localhost:8000"
echo "  - Backend API (PID: $BACKEND_PID):  http://localhost:8080"
echo "  - Frontend UI (PID: $FRONTEND_PID):  http://localhost:3000"
echo "==================================================="
echo "Logs are being written to:"
echo "  - ai-service/ai-service.log"
echo "  - backend/backend.log"
echo "  - frontend/frontend.log"
echo "==================================================="
echo "Press Ctrl+C to stop all services..."

cleanup() {
    echo -e "\nStopping all services..."
    kill $AI_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

wait
