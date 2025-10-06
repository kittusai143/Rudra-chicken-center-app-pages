from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import smtplib
from email.mime.text import MIMEText
import os, random, re
from dotenv import load_dotenv
from twilio.rest import Client

# ============================================================
# 🔧 Load environment variables
# ============================================================
load_dotenv()

app = Flask(__name__)
CORS(app)

# ---------------- Database Setup ----------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'   # stored in local file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ---------------- Email / Twilio ----------------
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE")

twilio_client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

# ============================================================
# 🟢 Database Models
# ============================================================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    identifier = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    old_passwords = db.Column(db.Text, default="")         # comma-separated old passwords
    reset_otp = db.Column(db.String(10), nullable=True)

    def as_dict(self):
        return {
            "id": self.id,
            "identifier": self.identifier
        }

class Order(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    customer_name = db.Column(db.String(100))
    customer_mobile = db.Column(db.String(20))
    customer_email = db.Column(db.String(100))
    customer_address = db.Column(db.String(255))
    product_name = db.Column(db.String(100))
    kgs = db.Column(db.Integer)
    price = db.Column(db.Float)
    status = db.Column(db.String(50))

    def as_dict(self):
        return {
            "id": self.id,
            "customerName": self.customer_name,
            "customerMobile": self.customer_mobile,
            "customerEmail": self.customer_email,
            "customerAddress": self.customer_address,
            "productName": self.product_name,
            "kgs": self.kgs,
            "price": self.price,
            "status": self.status,
        }

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    address = db.Column(db.String(200))
    phone = db.Column(db.String(20), unique=True)
    email = db.Column(db.String(100))

    def as_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
        }

# Create DB tables
with app.app_context():
    db.create_all()

# ============================================================
# 🔑 Helpers
# ============================================================
def is_valid_email(identifier):
    return re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", identifier)

def is_valid_phone(identifier):
    return re.match(r"^[0-9]{10}$", identifier)

def geocode_address(address):
    """Return (lat, lng) tuple from address using Google Maps API"""
    try:
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={GOOGLE_MAPS_API_KEY}"
        res = requests.get(url).json()
        if res["results"]:
            loc = res["results"][0]["geometry"]["location"]
            return loc["lat"], loc["lng"]
    except Exception as e:
        print(f"Geocoding error: {e}")
    return None, None

# ============================================================
# 🔑 AUTH ROUTES
# ============================================================
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    identifier = data.get("identifier")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({"error": "Email/Phone and password required"}), 400

    if not (is_valid_email(identifier) or is_valid_phone(identifier)):
        return jsonify({"error": "Enter valid email or 10-digit phone number"}), 400

    existing_user = User.query.filter_by(identifier=identifier).first()
    if existing_user:
        return jsonify({"error": "This email or phone number is already registered. Please login instead."}), 409

    new_user = User(identifier=identifier, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "✅ Registered successfully!"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    identifier = data.get("identifier")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({"error": "Email/Phone and password required"}), 400

    user = User.query.filter_by(identifier=identifier).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.password != password:
        return jsonify({"error": "Invalid password"}), 400

    return jsonify({"message": "✅ Login successful!", "user": user.as_dict()})

@app.route("/send-reset", methods=["POST"])
def send_reset():
    data = request.get_json()
    identifier = data.get("identifier")

    if not identifier:
        return jsonify({"error": "Email or Phone required"}), 400

    user = User.query.filter_by(identifier=identifier).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if is_valid_email(identifier):
        reset_link = f"http://localhost:5173/reset-password?identifier={identifier}"
        msg = MIMEText(f"Click this link to reset your password: {reset_link}")
        msg["Subject"] = "Password Reset"
        msg["From"] = SENDER_EMAIL
        msg["To"] = identifier

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                server.sendmail(SENDER_EMAIL, identifier, msg.as_string())
            return jsonify({"message": f"📩 Reset link sent to {identifier}"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    if is_valid_phone(identifier):
        otp = str(random.randint(100000, 999999))
        user.reset_otp = otp
        db.session.commit()

        try:
            twilio_client.messages.create(
                body=f"Your OTP for password reset is: {otp}",
                from_=TWILIO_PHONE,
                to=f"+91{identifier}"
            )
            return jsonify({"message": f"📱 OTP sent to {identifier}"})
        except Exception as e:
            return jsonify({"error": f"Failed to send SMS: {str(e)}"}), 500

@app.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.get_json()
    identifier = data.get("identifier")
    otp = data.get("otp")

    if not identifier or not otp:
        return jsonify({"error": "Phone and OTP required"}), 400

    user = User.query.filter_by(identifier=identifier).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.reset_otp == otp:
        user.reset_otp = None
        db.session.commit()
        return jsonify({"message": "✅ OTP verified successfully!"})
    else:
        return jsonify({"error": "❌ Invalid OTP"}), 400

@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    identifier = data.get("identifier")
    new_password = data.get("newPassword")

    if not identifier or not new_password:
        return jsonify({"error": "Email/Phone and new password required"}), 400

    user = User.query.filter_by(identifier=identifier).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    old_pw_list = user.old_passwords.split(",") if user.old_passwords else []

    if user.password == new_password:
        return jsonify({"error": "⚠️ New password cannot be the same as the old password"}), 400
    if new_password in old_pw_list:
        return jsonify({"error": "⚠️ You cannot reuse an old password"}), 400

    old_pw_list.append(user.password)
    user.password = new_password
    user.old_passwords = ",".join(old_pw_list)
    db.session.commit()

    return jsonify({"message": "✅ Password changed successfully!"})

# ============================================================
# 📦 DATA ROUTES
# ============================================================
@app.route("/api/orders", methods=["GET", "POST"])
def handle_orders():
    if request.method == "POST":
        data = request.get_json()
        try:
            order = Order(
                id=data.get("id", str(random.randint(1000, 9999))),
                customer_name=data["customerName"],
                customer_mobile=data["customerMobile"],
                customer_email=data["customerEmail"],
                customer_address=data["customerAddress"],
                product_name=data.get("productName", "Chicken"),
                kgs=int(data.get("kgs", 1)),
                price=float(data.get("price", 0)),
                status=data.get("status", "Pending"),
            )
            db.session.add(order)
            db.session.commit()

            # Add customer automatically if not exists
            existing_customer = Customer.query.filter_by(phone=data["customerMobile"]).first()
            if not existing_customer:
                customer = Customer(
                    name=data["customerName"],
                    address=data["customerAddress"],
                    phone=data["customerMobile"],
                    email=data["customerEmail"]
                )
                db.session.add(customer)
                db.session.commit()

            return jsonify({"message": "✅ Order & Customer added successfully!", "order": order.as_dict()}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    orders = Order.query.all()
    return jsonify([o.as_dict() for o in orders])

@app.route("/api/customers", methods=["GET"])
def get_customers():
    customers = Customer.query.all()
    return jsonify([c.as_dict() for c in customers])

# ============================================================
# Dummy arrays for drivers, reviews, mapview
# ============================================================
drivers, reviews, mapview = [], [], []

@app.route("/api/drivers", methods=["GET", "POST"])
def handle_drivers():
    if request.method == "POST":
        new_driver = request.get_json()
        drivers.append(new_driver)
        return jsonify({"message": "✅ Driver added successfully!", "driver": new_driver}), 201
    return jsonify(drivers)

@app.route("/api/stores", methods=["GET", "POST"])
def handle_stores():
    if request.method == "POST":
        new_store = request.get_json()
        stores.append(new_store)
        return jsonify({"message": "✅ Store added successfully!", "store": new_store}), 201
    return jsonify(stores)

@app.route("/api/reviews", methods=["GET", "POST"])
def handle_reviews():
    if request.method == "POST":
        new_review = request.get_json()
        reviews.append(new_review)
        return jsonify({"message": "✅ Review added successfully!", "review": new_review}), 201
    return jsonify(reviews)

@app.route("/api/mapview", methods=["GET", "POST"])
def handle_mapview():
    if request.method == "POST":
        new_marker = request.get_json()
        mapview.append(new_marker)
        return jsonify({"message": "✅ Marker added successfully!", "marker": new_marker}), 201
    return jsonify(mapview)

# ============================================================
# Dummy stores and products
# ============================================================
stores = [
    {"id": 1, "name": "Fresh Chicken Breast", "desc": "Tender chicken breast pieces, perfect for grilling.", "price": 250, "image": "https://media.istockphoto.com/id/492787098/photo/chicken-breasts-on-cutting-board.jpg?s=612x612&w=0&k=20&c=l1O94YCSRMUgj58WVPpOQFzuzRVwFHDeL6GF6dXFsFg="},
    {"id": 2, "name": "Whole Chicken", "desc": "Fresh whole chicken, ideal for roasting.", "price": 400, "image": "https://t3.ftcdn.net/jpg/02/00/03/68/360_F_200036893_dw1iYWEjrODZjlor0LzBMLRhyBJKhEmB.jpg"},
    {"id": 3, "name": "Chicken Drumsticks", "desc": "Juicy drumsticks for curries and BBQ.", "price": 200, "image": "https://media.istockphoto.com/id/629722566/photo/baked-chicken-drumstick.jpg?s=612x612&w=0&k=20&c=F33WyIcFQNMYAhQ-DyCIaMXFj8sKF7m-zyhBNKBtzdI="}
]

products = [
    {"id": 1, "name": "Whole Chicken With Skin", "category": "With Skin", "price": 250, "stock": 20, "image": "https://freshtogo.in/product_image/1678000570Chicken%20Whole(Full%20Body)%20-%20With%20Skin.jpg"},
    {"id": 2, "name": "Whole Chicken Without Skin", "category": "Without Skin", "price": 450, "stock": 15, "image": "https://5.imimg.com/data5/UV/EV/MY-35135467/raw-tandoori-chicken-500x500.jpg"},
    {"id": 3, "name": "Chicken Breast Boneless", "category": "Boneless", "price": 600, "stock": 10, "image": "https://assets.tendercuts.in/product/C/H/594e4559-f6b7-417d-9aac-d0643b5711d3.jpg"},
    {"id": 4, "name": "Chicken Drumsticks", "category": "Leg Pieces", "price": 320, "stock": 25, "image": "https://media.istockphoto.com/id/629722566/photo/baked-chicken-drumstick.jpg?s=612x612&w=0&k=20&c=F33WyIcFQNMYAhQ-DyCIaMXFj8sKF7m-zyhBNKBtzdI="},
    {"id": 5, "name": "Chicken Wings", "category": "Wings", "price": 280, "stock": 30, "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ05vcTAeQ1YGKA8wCAVSrFA4_DU4B9Aw7d1w&s"},
    {"id": 6, "name": "Chicken Thigh Boneless", "category": "Boneless", "price": 550, "stock": 12, "image": "https://www.bbassets.com/media/uploads/p/xl/40227607_1-fresho-chicken-thigh-boneless-without-skin-soft-tender.jpg"},
    {"id": 7, "name": "Chicken Liver", "category": "Offal", "price": 180, "stock": 35, "image": "https://img.freepik.com/premium-photo/uncooked-raw-chicken-liver-poultry-offals-steel-plate-black-background-top-view_89816-42963.jpg"},
    {"id": 8, "name": "Chicken Mince (Keema)", "category": "Mince", "price": 400, "stock": 18, "image": "https://5.imimg.com/data5/SELLER/Default/2020/12/WN/QQ/TI/2970290/frozen-spicy-chicken-keema.jpg"},
    {"id": 9, "name": "Chicken Leg (Curry Cut)", "category": "Curry Cut", "price": 350, "stock": 20, "image": "https://5.imimg.com/data5/SELLER/Default/2021/5/ER/OQ/YM/84743643/curry-cut-chicken-500x500.jpg"},
    {"id": 10, "name": "Chicken Boneless Cubes", "category": "Boneless", "price": 580, "stock": 15, "image": "https://5.imimg.com/data5/ECOM/Default/2023/7/324897114/QS/CQ/JH/192884303/1677138518710-sku-0155-0-500x500.jpeg"},
    {"id": 11, "name": "Chicken Lollipop", "category": "Party Cuts", "price": 420, "stock": 22, "image": "https://cdn.prod.website-files.com/654369dcffba1c0eb478187e/676467ea7415e6e5715affd9_IMG_2965.jpeg"},
    {"id": 12, "name": "Chicken Curry Cut (Small Pieces)", "category": "Curry Cut", "price": 300, "stock": 28, "image": "https://godavaricuts.com/cdn/shop/files/Godavari-Cuts-Day-1-_60-of-65_1_1a645364-e537-47cf-a978-4c1e7101ed5f.jpg?v=1682943338"},
    {"id": 13, "name": "Chicken Gizzard", "category": "Offal", "price": 160, "stock": 40, "image": "https://frozenlivestockexperters.com/wp-content/uploads/2024/12/1670731017Fresh_Chicken_Gizzard.jpg"},
    {"id": 14, "name": "Chicken Soup Bones", "category": "Bones", "price": 200, "stock": 25, "image": "https://www.fooppers.in/wp-content/uploads/2021/11/Chicken-Soup-Bones.jpg"},
    {"id": 15, "name": "Chicken Cutlet (Ready to Cook)", "category": "Ready to Cook", "price": 450, "stock": 14, "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ09WJoS49CsQdXWvRsCAFRcIG1D_iQ54cdg&s"},
]

@app.route("/api/stores", methods=["GET"])
def get_stores():
    return jsonify(stores)

@app.route("/api/products", methods=["GET", "POST"])
def handle_products():
    global products
    if request.method == "POST":
        new_product = request.get_json()
        products.append(new_product)
        return jsonify({"message": "✅ Product added successfully!", "product": new_product}), 201
    return jsonify(products)

# ============================================================
# Run Server
# ============================================================
if __name__ == "__main__":
    app.run(port=5000, debug=True)
