#!/usr/bin/env python3
"""
QuickMoto AI Garage — Master REST API & Web Server
Lightweight Python 3 HTTP Server & Reactive Garage Management Backend
"""

import http.server
import socketserver
import json
import urllib.parse
import os
import sys
import time
import re
from datetime import datetime, timedelta

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_FILE = os.path.join(DATA_DIR, "database.json")

# ----------------------------------------------------------------------
# KNOWLEDGE BASE FOR BACKEND DIAGNOSIS
# ----------------------------------------------------------------------
KNOWLEDGE_BASE = [
    {
        "key": "oil_change",
        "label": "Engine oil change",
        "keywords": ["oil change", "engine oil", "oil maathu", "oil poduren", "oil podanum", "oil top up", "oil service"],
        "part": "Engine Oil 1L + Oil Filter",
        "partCost": 450,
        "laborCost": 100,
        "duration": 20
    },
    {
        "key": "brake_front",
        "label": "Front brake noise",
        "keywords": ["front brake", "munnal brake", "front braking", "front disc sound", "disc pad satham"],
        "part": "Front Brake Pad Set",
        "partCost": 350,
        "laborCost": 150,
        "duration": 30
    },
    {
        "key": "brake_rear",
        "label": "Rear brake noise",
        "keywords": ["rear brake", "back brake", "pinnal brake", "pin wheel brake", "drum brake sound"],
        "part": "Rear Brake Shoe Set",
        "partCost": 280,
        "laborCost": 150,
        "duration": 30
    },
    {
        "key": "chain_loose",
        "label": "Chain loose / sprocket sound",
        "keywords": ["chain loose", "chain sound", "chain noise", "saakiri", "chain la sappu", "sprocket sound"],
        "part": "Chain Lubrication & Adjustment",
        "partCost": 120,
        "laborCost": 120,
        "duration": 25
    },
    {
        "key": "fork_oil_leak",
        "label": "Front fork oil leak",
        "keywords": ["fork oil", "fork leak", "front fork", "fork la oil vara", "shock absorber leak"],
        "part": "Fork Oil Seal Set + Fork Oil",
        "partCost": 420,
        "laborCost": 350,
        "duration": 60
    },
    {
        "key": "full_wash",
        "label": "Full water wash / detailing",
        "keywords": ["water wash", "full wash", "kazhuvu", "cleaning pannunga", "vandi wash", "foam wash"],
        "part": "Foam Wash & Detailing Kit",
        "partCost": 80,
        "laborCost": 150,
        "duration": 30
    },
    {
        "key": "battery_dead",
        "label": "Battery dead / self-start issue",
        "keywords": ["battery dead", "self start", "battery low", "start aagala", "self start aagala", "battery problem"],
        "part": "12V 5Ah Sealed Battery",
        "partCost": 1200,
        "laborCost": 100,
        "duration": 20
    },
    {
        "key": "clutch_issue",
        "label": "Clutch hard / slipping",
        "keywords": ["clutch hard", "clutch slip", "clutch problem", "clutch katti", "gear pidikala"],
        "part": "Clutch Plate Set",
        "partCost": 650,
        "laborCost": 300,
        "duration": 60
    },
    {
        "key": "headlight",
        "label": "Headlight not working",
        "keywords": ["headlight", "light not working", "light poagala", "head light problem"],
        "part": "Headlight Bulb / LED Unit",
        "partCost": 250,
        "laborCost": 80,
        "duration": 15
    },
    {
        "key": "puncture",
        "label": "Tyre puncture / air leak",
        "keywords": ["puncture", "tyre air", "air leak", "tube pottu", "wheel air"],
        "part": "Tube / Tyre Puncture Repair",
        "partCost": 100,
        "laborCost": 80,
        "duration": 20
    },
    {
        "key": "air_filter",
        "label": "Air filter dirty / mileage drop",
        "keywords": ["air filter", "mileage", "mayilej kammi", "mileage kammi"],
        "part": "Air Filter Replacement",
        "partCost": 180,
        "laborCost": 60,
        "duration": 15
    },
    {
        "key": "spark_plug",
        "label": "Pickup / spark plug issue",
        "keywords": ["spark plug", "pickup illa", "hesitation", "engine miss", "start la delay"],
        "part": "Spark Plug Replacement",
        "partCost": 120,
        "laborCost": 60,
        "duration": 15
    },
    {
        "key": "horn",
        "label": "Horn not working",
        "keywords": ["horn not working", "horn problem", "horn ordu", "horn illa"],
        "part": "Horn Unit Replacement",
        "partCost": 150,
        "laborCost": 60,
        "duration": 10
    },
    {
        "key": "general_service",
        "label": "General service / tuning",
        "keywords": ["general service", "full service", "tuning pannunga", "vandi tuning", "regular service"],
        "part": "Full Service Kit (Oil, Filter, Grease, Cleaning)",
        "partCost": 600,
        "laborCost": 250,
        "duration": 90
    }
]

NEARBY_WORKSHOPS = [
    {
        "id": "ws_eachanari_main",
        "name": "QuickMoto AI Flagship Workshop",
        "area": "Eachanari Temple Junction",
        "distance": "0.1 km",
        "rating": 4.9,
        "reviews": 340,
        "speciality": "Multi-Brand Two-Wheeler & EV Diagnostics",
        "phone": "+91 98943 12456",
        "isOpen": True,
        "certified": True
    },
    {
        "id": "ws_sundarapuram",
        "name": "Sundarapuram FastTrack Bike Point",
        "area": "Sundarapuram Main Road",
        "distance": "2.4 km",
        "rating": 4.8,
        "reviews": 190,
        "speciality": "Royal Enfield & Superbike Tuning",
        "phone": "+91 98422 55102",
        "isOpen": True,
        "certified": True
    },
    {
        "id": "ws_malumichampatti",
        "name": "Malumichampatti Two-Wheeler Care",
        "area": "Pollachi Highway Near SIDCO",
        "distance": "4.1 km",
        "rating": 4.7,
        "reviews": 115,
        "speciality": "Commuter Scooter & Clutch Overhaul",
        "phone": "+91 97890 33412",
        "isOpen": True,
        "certified": True
    },
    {
        "id": "ws_podanur",
        "name": "Podanur Junction Moto Garage",
        "area": "Podanur Railway Station Road",
        "distance": "5.2 km",
        "rating": 4.8,
        "reviews": 240,
        "speciality": "Electrical Wiring & Battery Systems",
        "phone": "+91 99441 77800",
        "isOpen": True,
        "certified": True
    }
]

STAGES = [
    {"id": "diagnosed", "label": "1. Problem Checked", "desc": "Estimate ready for customer"},
    {"id": "spares_allocated", "label": "2. Parts Ready", "desc": "Spare parts pulled from store"},
    {"id": "bay_in_progress", "label": "3. Work in Progress", "desc": "Mechanic repairing bike"},
    {"id": "quality_check", "label": "4. Road Test", "desc": "Final test ride & bolt check"},
    {"id": "ready_delivery", "label": "5. Ready for Pickup", "desc": "Polished & customer alerted"},
    {"id": "delivered", "label": "6. Bill Paid & Delivered", "desc": "Payment done & bike handed over"}
]

# ----------------------------------------------------------------------
# DATABASE MANAGER
# ----------------------------------------------------------------------
class Database:
    @staticmethod
    def load():
        if not os.path.exists(DB_FILE):
            os.makedirs(DATA_DIR, exist_ok=True)
            return {"workshop_info": {}, "jobcards": [], "spares_inventory": [], "sos_requests": [], "pickup_requests": []}
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading DB: {e}", file=sys.stderr)
            return {"workshop_info": {}, "jobcards": [], "spares_inventory": [], "sos_requests": [], "pickup_requests": []}

    @staticmethod
    def save(data):
        os.makedirs(DATA_DIR, exist_ok=True)
        try:
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving DB: {e}", file=sys.stderr)
            return False

# ----------------------------------------------------------------------
# REST API REQUEST HANDLER
# ----------------------------------------------------------------------
class QuickMotoServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data, default=str).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        try:
            length = int(self.headers.get('Content-Length', 0))
            if length == 0:
                return {}
            raw = self.rfile.read(length)
            return json.loads(raw.decode('utf-8'))
        except Exception as e:
            return None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')

        # 1. Health Check
        if path == '/api/health':
            db = Database.load()
            self.send_json({
                "status": "healthy",
                "service": "QuickMoto AI Garage REST Engine",
                "version": "2.4.0",
                "timestamp": datetime.now().isoformat(),
                "uptime": "100%",
                "database": {
                    "active_jobcards": len(db.get("jobcards", [])),
                    "spares_items": len(db.get("spares_inventory", [])),
                    "sos_requests": len(db.get("sos_requests", []))
                }
            })
            return

        # 2. Workshop & General Info
        if path == '/api/info':
            db = Database.load()
            self.send_json(db.get("workshop_info", {}))
            return

        # 3. List All Job Cards
        if path == '/api/jobcards':
            db = Database.load()
            self.send_json({
                "count": len(db.get("jobcards", [])),
                "jobcards": db.get("jobcards", [])
            })
            return

        # 4. Single Job Card Query
        if path.startswith('/api/jobcards/'):
            raw_id = path[len('/api/jobcards/'):]
            job_id = urllib.parse.unquote(raw_id)
            db = Database.load()
            cards = db.get("jobcards", [])
            card = next((c for c in cards if c.get("id") == job_id or c.get("id") == raw_id), None)
            if card:
                self.send_json(card)
            else:
                self.send_json({"error": f"Job card '{job_id}' not found"}, 404)
            return

        # 5. Spares Inventory
        if path == '/api/spares':
            db = Database.load()
            self.send_json({
                "inventory": db.get("spares_inventory", [])
            })
            return

        # 6. Workshop Bays Status
        if path == '/api/bays':
            db = Database.load()
            cards = db.get("jobcards", [])
            self.send_json({
                "total_lifts": 4,
                "stages": STAGES,
                "active_jobs": cards
            })
            return

        # 7. Nearby Certified Workshops
        if path == '/api/workshops':
            self.send_json({
                "count": len(NEARBY_WORKSHOPS),
                "workshops": NEARBY_WORKSHOPS
            })
            return

        # 8. SOS Requests
        if path == '/api/sos':
            db = Database.load()
            self.send_json({
                "sos_requests": db.get("sos_requests", [])
            })
            return

        # Default: Serve static files
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')
        payload = self.read_json_body()

        if payload is None:
            self.send_json({"error": "Invalid JSON request body"}, 400)
            return

        # 1. AI Diagnosis & Estimator Endpoint
        if path == '/api/diagnose':
            complaint = payload.get("complaint", "").lower()
            custom_items = payload.get("customItems", [])
            discount_pct = float(payload.get("discountPercent", 0))
            gst_pct = float(payload.get("gstPercent", 0))

            matched = []
            for item in KNOWLEDGE_BASE:
                if any(kw.lower() in complaint for kw in item["keywords"]):
                    matched.append({
                        "key": item["key"],
                        "label": item["label"],
                        "part": item["part"],
                        "partCost": item["partCost"],
                        "laborCost": item["laborCost"],
                        "duration": item["duration"]
                    })

            all_items = matched + custom_items
            parts_cost = sum(it.get("partCost", 0) for it in all_items)
            labor_cost = sum(it.get("laborCost", 0) for it in all_items)
            subtotal = parts_cost + labor_cost
            discount_amount = round(subtotal * (discount_pct / 100))
            taxable = max(0, subtotal - discount_amount)
            gst_amount = round(taxable * (gst_pct / 100))
            grand_total = round(taxable + gst_amount)
            duration = sum(it.get("duration", 0) for it in all_items) + 20 # 20m diagnostic buffer

            now = datetime.now()
            y = str(now.year)[2:]
            m = str(now.month).zfill(2)
            d = str(now.day).zfill(2)
            rand_code = int(time.time()) % 9000 + 1000
            job_id = f"EAM/JC/{y}{m}{d}/{rand_code}"

            eta_time = now + timedelta(minutes=duration)
            eta_str = f"Today · {eta_time.strftime('%I:%M %p')}"

            result = {
                "id": job_id,
                "createdAt": now.isoformat(),
                "complaint": payload.get("complaint", ""),
                "items": all_items,
                "partsCost": parts_cost,
                "laborCost": labor_cost,
                "subtotal": subtotal,
                "discountPercent": discount_pct,
                "discountAmount": discount_amount,
                "gstPercent": gst_pct,
                "gstAmount": gst_amount,
                "grandTotal": grand_total,
                "duration": duration,
                "eta": eta_str,
                "stageIndex": 0,
                "stageLabel": "Diagnosed"
            }
            self.send_json(result)
            return

        # 2. Create/Save Job Card
        if path == '/api/jobcards':
            db = Database.load()
            cards = db.get("jobcards", [])
            job_id = payload.get("id")
            if not job_id:
                now = datetime.now()
                job_id = f"EAM/JC/{str(now.year)[2:]}{str(now.month).zfill(2)}{str(now.day).zfill(2)}/{int(time.time()) % 9000 + 1000}"
                payload["id"] = job_id
            
            payload["updatedAt"] = datetime.now().isoformat()
            
            # Upsert into DB
            existing_idx = next((i for i, c in enumerate(cards) if c.get("id") == job_id), -1)
            if existing_idx >= 0:
                cards[existing_idx] = {**cards[existing_idx], **payload}
            else:
                cards.insert(0, payload)

            db["jobcards"] = cards
            Database.save(db)
            self.send_json({"status": "success", "jobcard": payload}, 201)
            return

        # 3. Mark Payment Settled
        m_pay = re.match(r'^/api/jobcards/(.+)/payment$', path)
        if m_pay:
            raw_id = m_pay.group(1)
            job_id = urllib.parse.unquote(raw_id)
            db = Database.load()
            cards = db.get("jobcards", [])
            card = next((c for c in cards if c.get("id") == job_id or c.get("id") == raw_id), None)
            if card:
                card["isPaid"] = True
                card["paymentStatus"] = "Paid via UPI"
                card["paidAt"] = datetime.now().isoformat()
                card["paymentDetails"] = {
                    "method": payload.get("method", "UPI"),
                    "amount": card.get("grandTotal", 0),
                    "upiId": "eachanari.motoworks@okaxis"
                }
                Database.save(db)
                self.send_json({"status": "success", "message": f"Payment settled for {job_id}", "jobcard": card})
            else:
                self.send_json({"error": f"Job card '{job_id}' not found"}, 404)
            return

        # 4. Emergency SOS Request
        if path == '/api/sos':
            db = Database.load()
            sos_id = f"SOS-{int(time.time()) % 9000 + 1000}"
            sos_entry = {
                "id": sos_id,
                "timestamp": datetime.now().isoformat(),
                "customerName": payload.get("name", "Emergency Caller"),
                "phone": payload.get("phone", ""),
                "location": payload.get("location", "Coimbatore Highway"),
                "issue": payload.get("issue", "Vehicle Breakdown"),
                "status": "Dispatched Rescue Van",
                "eta": "10-15 mins"
            }
            db.setdefault("sos_requests", []).insert(0, sos_entry)
            Database.save(db)
            self.send_json({"status": "success", "sos": sos_entry}, 201)
            return

        # 5. Doorstep Pickup Request
        if path == '/api/pickup':
            db = Database.load()
            pickup_id = f"PKP-{int(time.time()) % 9000 + 1000}"
            pickup_entry = {
                "id": pickup_id,
                "timestamp": datetime.now().isoformat(),
                "customerName": payload.get("name", "Customer"),
                "phone": payload.get("phone", ""),
                "address": payload.get("address", ""),
                "vehicle": payload.get("vehicle", ""),
                "slot": payload.get("slot", "Today Immediate (Within 45 mins)"),
                "status": "Confirmed (Driver Assigned)"
            }
            db.setdefault("pickup_requests", []).insert(0, pickup_entry)
            Database.save(db)
            self.send_json({"status": "success", "pickup": pickup_entry}, 201)
            return

        # 6. Spares Inventory Pull
        if path == '/api/spares/pull':
            part_name = payload.get("partName", "")
            qty = int(payload.get("quantity", 1))
            db = Database.load()
            spares = db.get("spares_inventory", [])
            for item in spares:
                if item["name"].lower() in part_name.lower() or part_name.lower() in item["name"].lower():
                    item["stock"] = max(0, item["stock"] - qty)
                    Database.save(db)
                    self.send_json({"status": "success", "updatedSpare": item})
                    return
            self.send_json({"status": "ignored", "message": "Part not found in tracked inventory"})
            return

        self.send_json({"error": "Endpoint not found"}, 404)

    def do_PATCH(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip('/')
        payload = self.read_json_body()

        # Update Job Card Stage Progression
        m_stage = re.match(r'^/api/jobcards/(.+)/stage$', path)
        if m_stage:
            raw_id = m_stage.group(1)
            job_id = urllib.parse.unquote(raw_id)
            stage_index = int(payload.get("stageIndex", 0))
            db = Database.load()
            cards = db.get("jobcards", [])
            card = next((c for c in cards if c.get("id") == job_id or c.get("id") == raw_id), None)
            if card:
                card["stageIndex"] = stage_index
                card["stageLabel"] = STAGES[min(stage_index, len(STAGES)-1)]["label"]
                card["updatedAt"] = datetime.now().isoformat()
                Database.save(db)
                self.send_json({"status": "success", "jobcard": card})
            else:
                self.send_json({"error": f"Job card '{job_id}' not found"}, 404)
            return

        self.send_json({"error": "Endpoint not found"}, 404)

def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), QuickMotoServerHandler) as httpd:
        print(f"====================================================================")
        print(f"🚀 QuickMoto AI Garage REST API & Web Server LIVE on port {PORT}")
        print(f"📡 Serving: http://localhost:{PORT}")
        print(f"🩺 Health Check: http://localhost:{PORT}/api/health")
        print(f"====================================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server gracefully...")

if __name__ == '__main__':
    run()
