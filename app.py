from flask import Flask, request, jsonify, g, send_from_directory
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
import os
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
# Crucial: Allow cross-origin requests from React dev server AND Legacy HTML pages
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:5000", "http://127.0.0.1:5000"
]}}, supports_credentials=True, allow_headers=["Authorization", "Content-Type"])

DB_PATH = os.path.join(os.path.dirname(__file__), 'upi_database.db')

# ─── Serve HTML Pages ──────────────────────────────────────────────────────────

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('.', filename)

# ─── DB Helpers ────────────────────────────────────────────────────────────────

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ─── DB Init ───────────────────────────────────────────────────────────────────

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()

        # Users table
        c.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Admins table
        c.execute('''
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                secret_hash TEXT NOT NULL
            )
        ''')

        # Login logs table
        c.execute('''
            CREATE TABLE IF NOT EXISTS login_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_type TEXT NOT NULL,
                username TEXT NOT NULL,
                email TEXT,
                ip_address TEXT,
                login_time TEXT DEFAULT CURRENT_TIMESTAMP,
                status TEXT NOT NULL
            )
        ''')

        # Complaints table
        c.execute('''
            CREATE TABLE IF NOT EXISTS complaints (
                id TEXT PRIMARY KEY,
                user_email TEXT,
                user_name TEXT NOT NULL,
                transaction_id TEXT NOT NULL,
                amount REAL NOT NULL,
                recipient TEXT,
                recipient_upi TEXT,
                issue_type TEXT,
                description TEXT,
                status TEXT DEFAULT 'new',
                filed_date TEXT DEFAULT CURRENT_TIMESTAMP,
                ref_number TEXT,
                agent_remarks TEXT
            )
        ''')

        # Sessions table for token validation
        c.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_email TEXT,
                user_name TEXT,
                role TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Seed default admin & manager if not exists
        admin_exists = c.execute("SELECT 1 FROM admins WHERE username='admin'").fetchone()
        if not admin_exists:
            c.execute("INSERT INTO admins (username, password_hash, role, secret_hash) VALUES (?,?,?,?)",
                      ('admin', hash_password('admin@123'), 'admin', hash_password('SECRET2026')))
            c.execute("INSERT INTO admins (username, password_hash, role, secret_hash) VALUES (?,?,?,?)",
                      ('manager', hash_password('manager@123'), 'manager', hash_password('SECRET2026')))

        conn.commit()
    print("✅ Database initialized at:", DB_PATH)

# ─── Routes ────────────────────────────────────────────────────────────────────

@app.before_request
def handle_options_request():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        headers = None
        if 'ACCESS_CONTROL_REQUEST_HEADERS' in request.headers:
            headers = request.headers['ACCESS_CONTROL_REQUEST_HEADERS']
        
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, GET, OPTIONS, PUT, DELETE'
        response.headers['Access-Control-Allow-Headers'] = headers if headers else 'Authorization, Content-Type'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    data = request.get_json()
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not all([name, email, password]):
        return jsonify({'success': False, 'message': 'All fields required'}), 400

    db = get_db()
    try:
        db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?,?,?)",
            (name, email, hash_password(password))
        )
        db.commit()
        return jsonify({'success': True, 'message': 'Account created! You can now login.'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already registered'}), 409


@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    name = (data.get('name') or '').strip()
    ip = request.remote_addr

    db = get_db()
    user = db.execute(
        "SELECT * FROM users WHERE email=? AND password_hash=?",
        (email, hash_password(password))
    ).fetchone()

    if not user:
        # log failed attempt
        db.execute(
            "INSERT INTO login_logs (user_type, username, email, ip_address, status) VALUES (?,?,?,?,?)",
            ('user', name or email, email, ip, 'failed')
        )
        db.commit()
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    # log success
    db.execute(
        "INSERT INTO login_logs (user_type, username, email, ip_address, status) VALUES (?,?,?,?,?)",
        ('user', user['name'], email, ip, 'success')
    )
    
    token = secrets.token_hex(32)
    db.execute(
        "INSERT INTO sessions (token, user_email, user_name, role) VALUES (?,?,?,?)",
        (token, email, user['name'], 'user')
    )
    db.commit()

    return jsonify({
        'success': True,
        'token': token,
        'name': user['name'],
        'email': email,
        'role': 'user'
    })


@app.route('/api/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    secret = data.get('secret') or ''
    ip = request.remote_addr

    db = get_db()
    admin = db.execute(
        "SELECT * FROM admins WHERE username=? AND password_hash=? AND secret_hash=?",
        (username, hash_password(password), hash_password(secret))
    ).fetchone()

    if not admin:
        db.execute(
            "INSERT INTO login_logs (user_type, username, ip_address, status) VALUES (?,?,?,?)",
            ('admin', username, ip, 'failed')
        )
        db.commit()
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    db.execute(
        "INSERT INTO login_logs (user_type, username, ip_address, status) VALUES (?,?,?,?)",
        ('admin', username, ip, 'success')
    )
    
    token = secrets.token_hex(32)
    db.execute(
        "INSERT INTO sessions (token, user_name, role) VALUES (?,?,?)",
        (token, username, admin['role'])
    )
    db.commit()

    return jsonify({
        'success': True,
        'token': token,
        'name': username.capitalize(),
        'role': admin['role']
    })


@app.route('/api/admin/logins', methods=['GET'])
def get_logins():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM login_logs ORDER BY login_time DESC LIMIT 200"
    ).fetchall()
    logs = [dict(r) for r in rows]
    return jsonify({'success': True, 'logins': logs})


@app.route('/api/admin/complaints', methods=['GET'])
def get_all_complaints():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM complaints ORDER BY filed_date DESC"
    ).fetchall()
    return jsonify({'success': True, 'complaints': [dict(r) for r in rows]})


# ─── Auth Helper ───────────────────────────────────────────────────────────────

def get_user_from_token():
    auth_header = request.headers.get('Authorization')
    print(f"[AUTH] Header received: {auth_header}")
    
    if not auth_header:
        print("[AUTH] No Authorization header found in request")
        return None
        
    token = auth_header.replace('Bearer ', '').strip()
    print(f"[AUTH] Extracted Token: {token}")
    
    db = get_db()
    session = db.execute("SELECT * FROM sessions WHERE token=?", (token,)).fetchone()
    
    if session:
        print(f"[AUTH] Session found for user: {session['user_email']}")
    else:
        print("[AUTH] Alert: Token not found in database! (User might be using an old token)")
        
    return session

# ─── External Notifications Engine (Twilio & SendGrid) ─────────────────────────
import os
from twilio.rest import Client
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content

class ExternalNotifier:
    """Handles external API calls for SMS and Email notifications."""
    TWILIO_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
    TWILIO_AUTH = os.environ.get('TWILIO_AUTH_TOKEN', '')
    TWILIO_PHONE = os.environ.get('TWILIO_PHONE_NUMBER', '')
    SENDGRID_KEY = os.environ.get('SENDGRID_API_KEY', '')

    @staticmethod
    def send_sms(to_number, message):
        print(f"\n📱 [MOCK SMS DISPATCHED to {to_number}]:")
        print(f"   => {message}\n")
        
        # Real Twilio injection point
        if ExternalNotifier.TWILIO_SID and ExternalNotifier.TWILIO_AUTH:
            try:
                client = Client(ExternalNotifier.TWILIO_SID, ExternalNotifier.TWILIO_AUTH)
                client.messages.create(body=message, from_=ExternalNotifier.TWILIO_PHONE, to=to_number)
                print("   (Actual Twilio SMS Sent successfully)")
            except Exception as e:
                print(f"   (Twilio Error: {e})")

    @staticmethod
    def send_email(to_email, user_name, subject, html_content):
        print(f"📧 [MOCK EMAIL DISPATCHED to {to_email}]:")
        print(f"   Subject: {subject}")
        print(f"   Body: [HTML Content rendered]\n")
        
        # Real SendGrid injection point 
        if ExternalNotifier.SENDGRID_KEY:
            try:
                sg = sendgrid.SendGridAPIClient(api_key=ExternalNotifier.SENDGRID_KEY)
                from_email = Email("support@upirapidresolution.com")
                to_email = To(to_email)
                content = Content("text/html", html_content)
                mail = Mail(from_email, to_email, subject, content)
                sg.client.mail.send.post(request_body=mail.get())
                print("   (Actual SendGrid Email Sent successfully)")
            except Exception as e:
                print(f"   (SendGrid Error: {e})")


# ─── Mock Bank API ─────────────────────────────────────────────────────────────
# This fulfills the hackathon requirement for "Mock bank API integration" and API Security

MOCK_BANK_API_KEY = "sk_live_npci_mock_9923"

@app.route('/api/mock/bank/verify', methods=['POST'])
def mock_bank_verify():
    # 1. API Security Constraint Requirement
    api_key = request.headers.get('X-API-KEY')
    if api_key != MOCK_BANK_API_KEY:
        return jsonify({'error': 'Unauthorized. Invalid or missing X-API-KEY.'}), 401

    data = request.get_json()
    txn_id = data.get('transaction_id', '')

    # 2. Mock Logic based on Txn ID
    if not txn_id:
        return jsonify({'status': 'invalid', 'message': 'Missing transaction ID'})
        
    if txn_id.endswith('000'):
        return jsonify({'status': 'invalid', 'message': 'Transaction not found in ledger'})
    
    # All 4 scenarios represent money-debited situations that qualify for refund
    remainder = int(txn_id[-1]) % 4
    if remainder == 0:
        return jsonify({
            'status': 'timeout_at_merchant', 
            'bank_status': 'debited',
            'merchant_status': 'failed',
            'resolution_action': 'initiate_refund',
            'scenario': 'gateway_timeout',
            'agent_reasoning': "Bank has confirmed that ₹ was successfully debited from your account. However, the merchant payment gateway experienced a timeout and never received the funds. The money is currently held in an escrow state.",
            'resolution_explanation': "Since the debit occurred but merchant confirmation was never received, NPCI guidelines mandate an automatic refund. Our system has flagged this as a Gateway Timeout error."
        })
    elif remainder == 1:
        return jsonify({
            'status': 'bank_reversal_pending', 
            'bank_status': 'debited',
            'merchant_status': 'failed',
            'resolution_action': 'initiate_refund',
            'scenario': 'bank_reversal',
            'agent_reasoning': "Bank records confirm that the amount was debited from your account. The transaction was flagged internally for reversal due to a network interruption between the issuer bank and payment switch.",
            'resolution_explanation': "This is a Bank-Side Reversal Pending case. Your bank initiated a debit but the payment switch (NPCI UPI) could not complete the routing. The RBI mandates refund within 5 business days for such cases."
        })
    elif remainder == 2:
        return jsonify({
            'status': 'duplicate_debit', 
            'bank_status': 'double_debited',
            'merchant_status': 'single_received',
            'resolution_action': 'initiate_refund',
            'scenario': 'duplicate_transaction',
            'agent_reasoning': "Our system detected that your account was debited twice for the same transaction reference. The merchant received only one successful credit, confirming the second debit was erroneous.",
            'resolution_explanation': "This is a Duplicate Transaction error. NPCI's UPI dispute mechanism automatically qualifies duplicate debits for immediate refund. The extra amount will be returned to your source account."
        })
    else:
        return jsonify({
            'status': 'technical_failure',
            'bank_status': 'debited',
            'merchant_status': 'not_reached',
            'resolution_action': 'initiate_refund',
            'scenario': 'technical_failure',
            'agent_reasoning': "A technical fault occurred at the UPI infrastructure layer after your bank confirmed the debit. The transaction was marked as failed at the NPCI switch despite funds leaving your account.",
            'resolution_explanation': "Technical failure at NPCI layer post-debit is classified as a Type-2 UPI dispute. Per RBI Circular on UPI Dispute Resolution, users are entitled to a full refund within 1-3 business days."
        })

# ─── Complaints Endpoint / Dispute Agent ───────────────────────────────────────

import requests

@app.route('/api/complaints', methods=['POST', 'OPTIONS'])
def file_complaint():
    if request.method == 'OPTIONS':
        return '', 200
        
    user = get_user_from_token()
    if not user:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    data = request.get_json()
    txn_id = data.get('transactionId', '')
    comp_id = 'CMP' + datetime.now().strftime('%Y%m%d%H%M%S') + secrets.token_hex(3).upper()

    # 1. AI AGENT: Classify the transaction via Mock Bank API
    # Agent diagnoses the issue and stores recommendation in agent_remarks.
    # Admin Dashboard is the decision point - agent does NOT auto-resolve.
    agent_status = 'processing'
    agent_remarks = 'Awaiting bank API diagnostics...'
    
    try:
        mock_response = requests.post(
            'http://127.0.0.1:5000/api/mock/bank/verify', 
            json={'transaction_id': txn_id},
            headers={'X-API-KEY': MOCK_BANK_API_KEY},
            timeout=5
        )
        if mock_response.status_code == 200:
            bank_data = mock_response.json()
            reasoning = bank_data.get('agent_reasoning', '')
            explanation = bank_data.get('resolution_explanation', '')
            scenario = bank_data.get('scenario', 'unknown').replace('_', ' ').title()
            
            # Build full AI analysis stored for Admin to read and User to view
            agent_remarks = (
                f"SCENARIO: {scenario} | "
                f"AI FINDING: {reasoning} | "
                f"RESOLUTION: {explanation}"
            )
                
    except Exception as e:
        agent_remarks = f"Bank API unreachable: {str(e)}. Complaint routed for manual review."
        print(f"Agent API Error: {e}")

    # 2. Write to DB — always 'processing' until Admin approves
    db = get_db()
    db.execute('''
        INSERT INTO complaints
        (id, user_email, user_name, transaction_id, amount, recipient, recipient_upi, issue_type, description, status, filed_date, agent_remarks)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ''', (
        comp_id,
        user['user_email'],
        user['user_name'],
        txn_id,
        float(data.get('amount', 0)),
        data.get('recipient', ''),
        data.get('recipientUPI', ''),
        data.get('issueType', ''),
        data.get('description', ''),
        'processing',
        datetime.now().isoformat(),
        agent_remarks
    ))
    db.commit()
    
    # 3. Send receipt notification
    email_html = f"<h3>UPI Rapid - Complaint Received</h3><p>Hi {user['user_name']}, your dispute for Txn <b>{txn_id}</b> has been received and is being reviewed. Our AI Agent has analyzed your case and flagged it for Admin approval.</p><p>Tracking ID: <b>{comp_id}</b></p>"
    ExternalNotifier.send_email(user['user_email'], user['user_name'], f"Complaint Received: {comp_id}", email_html)
    ExternalNotifier.send_sms('+919876543210', f"UPI Rapid: Dispute {comp_id} received. Status: Processing. We'll update you shortly.")

    return jsonify({
        'success': True, 
        'complaintId': comp_id,
        'status': 'processing',
        'message': 'Complaint filed successfully. Our AI agent has analyzed your case. Pending Admin review.'
    })


@app.route('/api/complaints/mine', methods=['GET', 'OPTIONS'])
def my_complaints():
    if request.method == 'OPTIONS':
        return '', 200
        
    user = get_user_from_token()
    if not user or user['role'] != 'user':
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    db = get_db()
    rows = db.execute(
        "SELECT * FROM complaints WHERE user_email=? ORDER BY filed_date DESC",
        (user['user_email'],)
    ).fetchall()
    return jsonify({'success': True, 'complaints': [dict(r) for r in rows]})


@app.route('/api/complaints/<complaint_id>', methods=['PUT'])
def update_complaint(complaint_id):
    data = request.get_json()
    new_status = data.get('status', '')
    ref_number = None

    if new_status == 'resolved':
        ref_number = 'REF' + secrets.token_hex(3).upper()

    # Fetch the original complaint to get the user email for notifications
    db = get_db()
    complaint = db.execute("SELECT user_email, user_name, transaction_id FROM complaints WHERE id=?", (complaint_id,)).fetchone()
    
    if ref_number:
        db.execute("UPDATE complaints SET status=?, ref_number=? WHERE id=?", (new_status, ref_number, complaint_id))
    else:
        db.execute("UPDATE complaints SET status=? WHERE id=?", (new_status, complaint_id))
    db.commit()
    
    # Send resolution notifications if complaint exists
    if complaint:
        status_msg = f"RESOLVED. Refund Ref: {ref_number}" if new_status == 'resolved' else f"REJECTED. Reason: {new_status}"
        
        email_html = f"<h3>UPI Rapid - Complaint Update</h3><p>Hi {complaint['user_name']}, your dispute for Txn <b>{complaint['transaction_id']}</b> (ID: {complaint_id}) has been updated.</p><p><b>Final Status:</b> {status_msg}</p>"
        ExternalNotifier.send_email(complaint['user_email'], complaint['user_name'], f"Complaint Update: {complaint_id}", email_html)
        ExternalNotifier.send_sms('+919876543210', f"UPI Rapid: Your dispute {complaint_id} is finalized. Status: {status_msg}")

    return jsonify({'success': True, 'refNumber': ref_number})


@app.route('/api/admin/stats', methods=['GET'])
def get_stats():
    db = get_db()
    total = db.execute("SELECT COUNT(*) FROM complaints").fetchone()[0]
    pending = db.execute("SELECT COUNT(*) FROM complaints WHERE status IN ('new','pending')").fetchone()[0]
    resolved = db.execute("SELECT COUNT(*) FROM complaints WHERE status='resolved'").fetchone()[0]
    total_refunded = db.execute("SELECT SUM(amount) FROM complaints WHERE status='resolved'").fetchone()[0] or 0
    today = datetime.now().strftime('%Y-%m-%d')
    resolved_today = db.execute(
        "SELECT COUNT(*) FROM complaints WHERE status='resolved' AND filed_date LIKE ?",
        (today + '%',)
    ).fetchone()[0]
    rate = round((resolved / total * 100) if total > 0 else 0)
    total_users = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]

    return jsonify({
        'success': True,
        'total': total,
        'pending': pending,
        'resolved': resolved,
        'resolvedToday': resolved_today,
        'totalRefunded': total_refunded,
        'resolutionRate': rate,
        'totalUsers': total_users
    })


# ─── Run ───────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    init_db()
    print("🚀 UPI Rapid Resolution Backend running on http://localhost:5000")
    app.run(debug=True, port=5000)
