import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()
from dotenv import load_dotenv
import os
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Environment variables
BLOSSOMS_API_KEY = os.getenv('BLOSSOMS_API_KEY')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
FIREBASE_CREDENTIALS = os.getenv('FIREBASE_CREDENTIALS')

# Initialize Firebase
firebase_db = None
try:
    if FIREBASE_CREDENTIALS and os.path.exists(FIREBASE_CREDENTIALS):
        cred = credentials.Certificate(FIREBASE_CREDENTIALS)
        firebase_admin.initialize_app(cred)
        firebase_db = firestore.client()
        print("✅ Firebase initialized successfully")
    else:
        print("⚠️ Firebase credentials not found or path missing")
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")

# In-memory fallback data
chat_sessions = {}
journal_entries = {}
user_profiles = {}

# -----------------------------------------------------------
# Health Check
# -----------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "UniMind API is running"}), 200

# -----------------------------------------------------------
# Chat Endpoint
# -----------------------------------------------------------
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        user_id = data.get('user_id', 'demo_user')
        calendar_events = data.get('calendar_events', [])

        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        emotion_data = detect_emotion(user_message)
        ai_response = generate_empathetic_response(user_message, emotion_data, calendar_events)

        chat_entry = {
            "user_message": user_message,
            "ai_response": ai_response,
            "emotion": emotion_data,
            "timestamp": datetime.now().isoformat()
        }

        if user_id not in chat_sessions:
            chat_sessions[user_id] = []
        chat_sessions[user_id].append(chat_entry)

        # Save chat to Firestore (optional)
        if firebase_db:
            firebase_db.collection('chats').add({
                "user_id": user_id,
                **chat_entry
            })

        return jsonify({
            "response": ai_response,
            "emotion": emotion_data,
            "timestamp": chat_entry["timestamp"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------------------------------------
# Emotion Detection (Blossoms.ai)
# -----------------------------------------------------------
def detect_emotion(message):
    if not BLOSSOMS_API_KEY:
        return {
            "emotion": "neutral",
            "intensity": 0.5,
            "confidence": 0.7,
            "note": "Using mock data - add BLOSSOMS_API_KEY to environment"
        }

    try:
        response = requests.post(
            'https://api.blossoms.ai/v1/analyze',
            headers={
                'Authorization': f'Bearer {BLOSSOMS_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={'text': message},
            timeout=10
        )
        return response.json() if response.status_code == 200 else {"emotion": "neutral"}
    except Exception as e:
        return {"emotion": "neutral", "note": f"Error: {e}"}

# -----------------------------------------------------------
# AI Response Generation (OpenRouter)
# -----------------------------------------------------------
def generate_empathetic_response(message, emotion_data, calendar_events=[]):
    if not OPENROUTER_API_KEY:
        return f"I hear you. It sounds like you're feeling {emotion_data.get('emotion', 'thoughtful')} right now. I'm here to support you. (Add OPENROUTER_API_KEY to enable full AI responses)"

    try:
        emotion = emotion_data.get('emotion', 'neutral')
        intensity = emotion_data.get('intensity', 0.5)
        calendar_context = ""

        if calendar_events:
            event_list = "\n".join([f"- {e['title']} on {e['date']}" for e in calendar_events[:3]])
            calendar_context = f"\n\nUpcoming events:\n{event_list}"

        system_prompt = f"""You are UniMind, a compassionate AI mental wellness companion for college students.

Current emotional state: The student seems to be feeling {emotion} (intensity: {intensity}/1.0).{calendar_context}

Guidelines:
- Be warm, empathetic, and supportive
- Keep responses concise (2-3 sentences)
- Acknowledge their emotions
- Offer gentle suggestions
- Reference calendar events if relevant
- Use a calm tone
"""

        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENROUTER_API_KEY}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://unimind.app',
                'X-Title': 'UniMind'
            },
            json={
                'model': 'anthropic/claude-3.5-sonnet',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': message}
                ],
                'max_tokens': 150
            },
            timeout=30
        )

        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        return f"I'm here for you. It sounds like you're experiencing {emotion}."

    except Exception as e:
        return f"I sense you might be feeling {emotion_data.get('emotion', 'stressed')}. I'm here to listen and support you."

# -----------------------------------------------------------
# Journal Entries
# -----------------------------------------------------------
@app.route('/api/journal', methods=['POST'])
def add_journal_entry():
    try:
        data = request.json
        user_id = data.get('user_id', 'demo_user')
        mood = data.get('mood')
        mood_text = data.get('mood_text', '')

        if not mood:
            return jsonify({"error": "Mood is required"}), 400

        entry = {
            "mood": mood,
            "mood_text": mood_text,
            "timestamp": datetime.now().isoformat(),
            "date": datetime.now().strftime("%Y-%m-%d")
        }

        if user_id not in journal_entries:
            journal_entries[user_id] = []
        journal_entries[user_id].append(entry)

        # Save to Firestore if connected
        if firebase_db:
            firebase_db.collection('journals').add({
                "user_id": user_id,
                **entry
            })

        return jsonify({"message": "Journal entry saved", "entry": entry}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/journal', methods=['GET'])
def get_journal_entries():
    try:
        user_id = request.args.get('user_id', 'demo_user')
        days = int(request.args.get('days', 30))
        entries = journal_entries.get(user_id, [])
        cutoff_date = datetime.now() - timedelta(days=days)
        recent = [e for e in entries if datetime.fromisoformat(e['timestamp']) > cutoff_date]

        return jsonify({"entries": recent, "count": len(recent)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------------------------------------
# Nationwide + School-Specific Mental Health Resources
# -----------------------------------------------------------
GLOBAL_RESOURCES = [
    {"name": "988 Suicide & Crisis Lifeline", "description": "24/7 free & confidential", "url": "https://988lifeline.org"},
    {"name": "Crisis Text Line", "description": "Text HOME to 741741 (US/CA)", "url": "https://www.crisistextline.org"},
    {"name": "7 Cups", "description": "Free emotional support & affordable therapy", "url": "https://www.7cups.com"},
    {"name": "SAMHSA National Helpline", "description": "Treatment referral & info", "url": "https://findtreatment.gov"}
]

@app.route('/api/resources', methods=['GET'])
def get_resources():
    try:
        school = request.args.get('school', '').strip()
        if not school:
            return jsonify({"error": "Missing school parameter"}), 400

        GOOGLE_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
        print("🔑 Key loaded:", bool(GOOGLE_KEY))

        # ---------- Geocode the school ----------
        geo = requests.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={"address": f"{school} university campus", "key": GOOGLE_KEY},
            timeout=10
        ).json()
        print("📍 Geocode status:", geo.get("status"))

        if not geo.get("results"):
            return jsonify({
                "global": GLOBAL_RESOURCES,
                "school_specific": [{
                    "name": school,
                    "description": "Not found. Try typing the full college or university name."
                }]
            }), 200

        loc = geo["results"][0]["geometry"]["location"]
        lat, lng = loc["lat"], loc["lng"]
        print(f"✅ Geocoded {school} → {lat}, {lng}")

        # ---------- NEW Places API (Nearby first) ----------
        places_url_nearby = "https://places.googleapis.com/v1/places:searchNearby"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_KEY,
            # FieldMask = only the fields you will render
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.googleMapsUri"
        }
        nearby_payload = {
            "includedTypes": [
                "doctor", "psychologist", "psychiatrist", "hospital", "clinic",
                "university", "school"
            ],
            "maxResultCount": 20,
            "rankPreference": "DISTANCE",
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": lat, "longitude": lng},
                    "radius": 32187  # ≈ 20 miles
                }
            }
        }

        nearby_resp = requests.post(places_url_nearby, headers=headers, json=nearby_payload, timeout=12)
        nearby_json = nearby_resp.json()
        print("🏥 Nearby status:", nearby_resp.status_code, nearby_json.get("error", {}).get("message"))

        def normalize(places_list):
            out = []
            for p in places_list:
                name = (p.get("displayName") or {}).get("text")
                addr = p.get("formattedAddress") or "Address not available"
                maps = p.get("googleMapsUri") or "#"
                if name:
                    out.append({"name": name, "description": addr, "url": maps})
            return out

        local = normalize(nearby_json.get("places", []))

        # ---------- Fallback: Places searchText (semantic) ----------
        if not local:
            print("🔁 Falling back to searchText…")
            places_url_text = "https://places.googleapis.com/v1/places:searchText"
            text_payload = {
                "textQuery": "mental health OR counseling OR wellness center OR therapy",
                "maxResultCount": 20,
                "locationBias": {
                    "circle": {
                        "center": {"latitude": lat, "longitude": lng},
                        "radius": 32187
                    }
                }
            }
            text_resp = requests.post(places_url_text, headers=headers, json=text_payload, timeout=12)
            text_json = text_resp.json()
            print("🧭 searchText status:", text_resp.status_code, text_json.get("error", {}).get("message"))
            local = normalize(text_json.get("places", []))

        return jsonify({
            "global": GLOBAL_RESOURCES,
            "school_specific": local or [{
                "name": school,
                "description": "No nearby resources found within ~20 miles."
            }]
        }), 200

    except Exception as e:
        print("💥 ERROR:", e)
        return jsonify({
            "global": GLOBAL_RESOURCES,
            "school_specific": [{"name": "Server Error", "description": str(e)}]
        }), 500

# -----------------------------------------------------------
# Calendar Mock Data
# -----------------------------------------------------------
@app.route('/api/calendar/events', methods=['GET'])
def get_calendar_events():
    mock_events = [
        {"title": "History Exam", "date": "April 25", "time": "10:00 AM"},
        {"title": "Presentation Discussion", "date": "April 20", "time": "1:00 PM"},
        {"title": "Physics Exam", "date": "April 21", "time": "10:00 AM"}
    ]
    return jsonify({"events": mock_events}), 200

# -----------------------------------------------------------
# Firebase Test Route
# -----------------------------------------------------------
@app.route('/api/firebase-test', methods=['GET'])
def firebase_test():
    try:
        if not firebase_db:
            return jsonify({"status": "error", "message": "Firebase not initialized"}), 500

        test_data = {
            "message": "Hello from Flask!",
            "timestamp": datetime.now().isoformat()
        }
        firebase_db.collection('test_connection').add(test_data)
        return jsonify({"status": "success", "message": "Data written to Firestore"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# -----------------------------------------------------------
# Run Server
# -----------------------------------------------------------
if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=8000, debug=debug_mode)
