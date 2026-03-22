#!/bin/bash
PROJECT_ROOT="/home/batman/Public/huh?"

echo "Setting up Extension Structure..."
mkdir -p "$PROJECT_ROOT/huh-extension/public"
mkdir -p "$PROJECT_ROOT/huh-extension/src/popup"
mkdir -p "$PROJECT_ROOT/huh-extension/src/components"
mkdir -p "$PROJECT_ROOT/huh-extension/src/hooks"
mkdir -p "$PROJECT_ROOT/huh-extension/src/store"
mkdir -p "$PROJECT_ROOT/huh-extension/src/services"
mkdir -p "$PROJECT_ROOT/huh-extension/src/utils"

echo '{
  "manifest_version": 3,
  "name": "Huh?",
  "version": "1.0",
  "description": "AI Explainer"
}' > "$PROJECT_ROOT/huh-extension/public/manifest.json"

echo '// Main popup component' > "$PROJECT_ROOT/huh-extension/src/popup/Popup.jsx"
echo '/* Popup styles */' > "$PROJECT_ROOT/huh-extension/src/popup/Popup.css"
echo '// React entry point for popup' > "$PROJECT_ROOT/huh-extension/src/popup/index.jsx"
echo '// Input component for timestamps' > "$PROJECT_ROOT/huh-extension/src/components/TimestampInput.jsx"
echo '// Card component to show AI explanation' > "$PROJECT_ROOT/huh-extension/src/components/ExplanationCard.jsx"
echo '// Loading indicator' > "$PROJECT_ROOT/huh-extension/src/components/Loader.jsx"
echo '// Custom hook for explain logic' > "$PROJECT_ROOT/huh-extension/src/hooks/useExplain.js"
echo '// Zustand store for extension state' > "$PROJECT_ROOT/huh-extension/src/store/useStore.js"
echo '// API connection back to Node server' > "$PROJECT_ROOT/huh-extension/src/services/api.js"
echo '// Time formatting utilities' > "$PROJECT_ROOT/huh-extension/src/utils/formatTime.js"
echo '// Content script to extract YouTube video information' > "$PROJECT_ROOT/huh-extension/src/content.js"
echo '// Background script for managing extension events' > "$PROJECT_ROOT/huh-extension/src/background.js"


echo "Setting up Backend Structure..."
mkdir -p "$PROJECT_ROOT/huh-backend/src/config"
mkdir -p "$PROJECT_ROOT/huh-backend/src/routes"
mkdir -p "$PROJECT_ROOT/huh-backend/src/controllers"
mkdir -p "$PROJECT_ROOT/huh-backend/src/services"
mkdir -p "$PROJECT_ROOT/huh-backend/src/models"
mkdir -p "$PROJECT_ROOT/huh-backend/src/utils"
mkdir -p "$PROJECT_ROOT/huh-backend/src/middleware"

echo '// Express server entry point' > "$PROJECT_ROOT/huh-backend/src/server.js"
echo '// Database connection logic' > "$PROJECT_ROOT/huh-backend/src/config/db.js"
echo '// Environment variables loader' > "$PROJECT_ROOT/huh-backend/src/config/env.js"
echo '// Express routes for explain endpoint' > "$PROJECT_ROOT/huh-backend/src/routes/explain.route.js"
echo '// Controller handling explain route logic' > "$PROJECT_ROOT/huh-backend/src/controllers/explain.controller.js"
echo '// Youtube transcript extraction service' > "$PROJECT_ROOT/huh-backend/src/services/transcript.service.js"
echo '// OpenAI / AI API integration service' > "$PROJECT_ROOT/huh-backend/src/services/ai.service.js"
echo '// AI Response JSON formatting service' > "$PROJECT_ROOT/huh-backend/src/services/formatter.service.js"
echo '// User database model' > "$PROJECT_ROOT/huh-backend/src/models/user.model.js"
echo '// HuhMoment database model' > "$PROJECT_ROOT/huh-backend/src/models/huhMoment.model.js"
echo '// Time parsing utilities' > "$PROJECT_ROOT/huh-backend/src/utils/timeParser.js"
echo '// Context window processing utilities' > "$PROJECT_ROOT/huh-backend/src/utils/contextWindow.js"
echo '// Request rate limiting middleware' > "$PROJECT_ROOT/huh-backend/src/middleware/rateLimiter.js"


echo "Setting up Python Microservice Structure..."
mkdir -p "$PROJECT_ROOT/huh-microservice/src/services"
mkdir -p "$PROJECT_ROOT/huh-microservice/src/api"
mkdir -p "$PROJECT_ROOT/huh-microservice/src/utils"

echo '# FastAPI entry point / Main app' > "$PROJECT_ROOT/huh-microservice/src/main.py"
echo '# Transcribe-anything wrapper service' > "$PROJECT_ROOT/huh-microservice/src/services/transcription.py"
echo '# API endpoints and routes' > "$PROJECT_ROOT/huh-microservice/src/api/routes.py"
echo '# Audio / Video extraction utilities' > "$PROJECT_ROOT/huh-microservice/src/utils/video_processor.py"
echo '# Python dependencies' > "$PROJECT_ROOT/huh-microservice/requirements.txt"

echo "Project structure creation complete!"
