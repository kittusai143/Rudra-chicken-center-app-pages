from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import smtplib
from email.mime.text import MIMEText
import os, random, re
from dotenv import load_dotenv
from twilio.rest import Client
from werkzeug.utils import secure_filename

# ============================================================
# 🔧 Load environment variables
# ============================================================
app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "✅ Flask backend is running successfully!"



# ============================================================
# 🗂 Instance + Upload Folder Setup
# ============================================================
BASE_DIR = os.path.dirname(__file__)
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(INSTANCE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============================================================
# 🧱 Database Setup
# ============================================================
db_path = os.path.join(INSTANCE_DIR, "app.db")
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# ============================================================
# 📧 Email / Twilio Config
# ============================================================
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
TWILIO_SID = os.getenv("TWILIO_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE")

twilio_client = None
if all([TWILIO_SID, TWILIO_AUTH_TOKEN]):
    twilio_client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)

# ============================================================
# 🧩 Models
# ============================================================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    identifier = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    old_passwords = db.Column(db.Text, default="")
    reset_otp = db.Column(db.String(10))
    profile_file = db.Column(db.String(255))

    def as_dict(self):
        return {"id": self.id, "identifier": self.identifier}


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


with app.app_context():
    db.create_all()

# ============================================================
# 🧠 Helpers
# ============================================================
def is_valid_email(identifier):
    return re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", identifier)


def is_valid_phone(identifier):
    return re.match(r"^[0-9]{10}$", identifier)


ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


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

    if User.query.filter_by(identifier=identifier).first():
        return jsonify({"error": "This email or phone number is already registered."}), 409

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


# ============================================================
# 🔁 PASSWORD RESET ROUTES
# ============================================================
@app.route("/send-reset", methods=["POST"])
def send_reset():
    data = request.get_json()
    identifier = data.get("identifier")
    if not identifier:
        return jsonify({"error": "Email or Phone required"}), 400

    user = User.query.filter_by(identifier=identifier).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # If email, send link
    if is_valid_email(identifier):
        reset_link = f"/reset-password?identifier={identifier}"
        msg = MIMEText(f"Click this link to reset your password: {reset_link}")
        msg["Subject"] = "Password Reset"
        msg["From"] = SENDER_EMAIL
        msg["To"] = identifier
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(SENDER_EMAIL, SENDER_PASSWORD)
                server.sendmail(SENDER_EMAIL, identifier, msg.as_string())
            return jsonify({"message": f"📩 Reset link sent to {identifier}"}), 200
        except Exception as e:
            return jsonify({"error": f"Email send failed: {str(e)}"}), 500

    # If phone, send OTP
    if is_valid_phone(identifier):
        otp = str(random.randint(100000, 999999))
        user.reset_otp = otp
        db.session.commit()
        if twilio_client:
            try:
                twilio_client.messages.create(
                    body=f"Your OTP for password reset is: {otp}",
                    from_=TWILIO_PHONE,
                    to=f"+91{identifier}",
                )
                return jsonify({"message": f"📱 OTP sent to {identifier}"}), 200
            except Exception as e:
                return jsonify({"error": f"Failed to send SMS: {str(e)}"}), 500
        else:
            return jsonify({"error": "Twilio not configured"}), 500


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
    if user.reset_otp != otp:
        return jsonify({"error": "❌ Invalid OTP"}), 400

    user.reset_otp = None
    db.session.commit()
    return jsonify({"message": "✅ OTP verified successfully!"})


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
    if new_password == user.password:
        return jsonify({"error": "⚠️ New password cannot be the same as old"}), 400
    if new_password in old_pw_list:
        return jsonify({"error": "⚠️ Cannot reuse an old password"}), 400

    old_pw_list.append(user.password)
    user.password = new_password
    user.old_passwords = ",".join(old_pw_list)
    db.session.commit()

    return jsonify({"message": "✅ Password changed successfully!"})


# ============================================================
# 📦 ORDER + CUSTOMER ROUTES
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

            # Add new customer if not exists
            if not Customer.query.filter_by(phone=data["customerMobile"]).first():
                customer = Customer(
                    name=data["customerName"],
                    address=data["customerAddress"],
                    phone=data["customerMobile"],
                    email=data["customerEmail"],
                )
                db.session.add(customer)
                db.session.commit()

            return jsonify({"message": "✅ Order added successfully!", "order": order.as_dict()}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    orders = Order.query.all()
    return jsonify([o.as_dict() for o in orders])


@app.route("/api/customers", methods=["GET"])
def get_customers():
    customers = Customer.query.all()
    return jsonify([c.as_dict() for c in customers])


# ============================================================
# 🖼 FILE UPLOAD & PROFILE UPDATE
# ============================================================
@app.route("/upload-profile", methods=["POST"])
def upload_profile():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    identifier = request.form.get("identifier")

    if not file or file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type (JPG, PNG, PDF only)"}), 400

    user = User.query.filter_by(identifier=identifier).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_DIR, filename)
    file.save(filepath)
    user.profile_file = filename
    db.session.commit()

    return jsonify({"message": "✅ File uploaded successfully!", "file": filename})


@app.route("/update-profile", methods=["POST"])
def update_profile():
    data = request.get_json()
    current_identifier = data.get("currentIdentifier")
    new_identifier = data.get("identifier")
    new_password = data.get("password")

    if not current_identifier:
        return jsonify({"error": "Current identifier missing"}), 400

    user = User.query.filter_by(identifier=current_identifier).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update identifier
    if new_identifier and new_identifier != current_identifier:
        if User.query.filter_by(identifier=new_identifier).first():
            return jsonify({"error": "Identifier already taken"}), 400
        user.identifier = new_identifier

    # Update password
    if new_password and new_password.strip():
        if new_password == user.password:
            return jsonify({"error": "New password must differ"}), 400
        old_pw_list = user.old_passwords.split(",") if user.old_passwords else []
        if new_password in old_pw_list:
            return jsonify({"error": "Cannot reuse old password"}), 400
        old_pw_list.append(user.password)
        user.password = new_password
        user.old_passwords = ",".join(old_pw_list)

    db.session.commit()
    return jsonify({"message": "✅ Profile updated successfully!"})


# ============================================================
# 🏪 DUMMY DATA ROUTES (Stores, Products, Drivers, Reviews)
# ============================================================
drivers, reviews, mapview = [], [], []

# Stores & products from old backend
stores = [
    {"id": 1, "name": "Fresh Chicken Breast", "desc": "Tender chicken breast pieces, perfect for grilling.", "price": 250, "image": "https://media.istockphoto.com/id/492787098/photo/chicken-breasts-on-cutting-board.jpg?s=612x612&w=0&k=20&c=l1O94YCSRMUgj58WVPpOQFzuzRVwFHDeL6GF6dXFsFg="},
    {"id": 2, "name": "Whole Chicken", "desc": "Fresh whole chicken, ideal for roasting.", "price": 400, "image": "https://t3.ftcdn.net/jpg/02/00/03/68/360_F_200036893_dw1iYWEjrODZjlor0LzBMLRhyBJKhEmB.jpg"},
    {"id": 3, "name": "Chicken Drumsticks", "desc": "Juicy drumsticks for curries and BBQ.", "price": 200, "image": "https://media.istockphoto.com/id/629722566/photo/baked-chicken-drumstick.jpg?s=612x612&w=0&k=20&c=F33WyIcFQNMYAhQ-DyCIaMXFj8sKF7m-zyhBNKBtzdI="}
]

products = [
    {"id": 1, "name": "Chicken Curry Cut (Small Pieces) 1kg", "category": "Curry Cut", "price": 230, "stock": 28, "image": "https://png.pngtree.com/thumb_back/fh260/background/20210912/pngtree-photograph-of-raw-chicken-nuggets-ingredients-image_871858.jpg"},
    {"id": 2, "name": "Whole Chicken Without Skin 1kg", "category": "Without Skin", "price": 230, "stock": 15, "image": "https://5.imimg.com/data5/SELLER/Default/2021/3/TY/SY/FQ/124593234/frozen-whole-chicken-without-skin.jpg"},
    {"id": 3, "name": "Chicken Breast Boneless 1kg", "category": "Boneless", "price": 460, "stock": 10, "image": "https://assets.tendercuts.in/product/C/H/594e4559-f6b7-417d-9aac-d0643b5711d3.jpg"},
    {"id": 4, "name": "Chicken Wings 1kg", "category": "Wings", "price": 280, "stock": 30, "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxc61ZHoQuZnaSH3B219MdtF7JXAIXXwx7bA&s"},
    {"id": 5, "name": "Chicken Liver 1kg", "category": "Offal", "price": 280, "stock": 35, "image": "https://img.freepik.com/premium-photo/uncooked-raw-chicken-liver-poultry-offals-steel-plate-black-background-top-view_89816-42963.jpg"},
    {"id": 6, "name": "Chicken Leg (Curry Cut) 1kg", "category": "Curry Cut", "price": 230, "stock": 20, "image": "https://5.imimg.com/data5/SELLER/Default/2021/5/ER/OQ/YM/84743643/curry-cut-chicken-500x500.jpg"},
    {"id": 7, "name": "Chicken Boneless Cubes 1kg", "category": "Boneless", "price": 580, "stock": 15, "image": "https://5.imimg.com/data5/ECOM/Default/2023/7/324897114/QS/CQ/JH/192884303/1677138518710-sku-0155-0-500x500.jpeg"},
    {"id": 8, "name": "Chicken Gizzard 1kg", "category": "Offal", "price": 280, "stock": 40, "image": "https://frozenlivestockexperters.com/wp-content/uploads/2024/12/1670731017Fresh_Chicken_Gizzard.jpg"},
    {"id": 9, "name": "Chicken Soup Bones 1kg", "category": "Bones", "price": 200, "stock": 25, "image": "https://www.fooppers.in/wp-content/uploads/2021/11/Chicken-Soup-Bones.jpg"},
    {"id": 10, "name": "Live Broiler Chickens 1kg", "category": "Live Bird", "price": 150, "stock": 25, "image": "https://khpet.com/cdn/shop/articles/White-Leghorn-Rooster-v2_800x800.jpg?v=1593020040"},
    {"id": 11, "name": "Desimurgei 1kg", "category": "Desimurgei", "price": 500, "stock": 25, "image": "https://images.squarespace-cdn.com/content/v1/5ea97f3fd652bf2c1c1aeb7e/1598453066763-JQSB3G7OZLOTCHUVKHFP/39-Cream_Legbar-chickens.jpg"},
    {"id": 12, "name": "Chicken Curry 1kg", "category": "Chicken", "price": 400, "stock": 25, "image": "https://gypsyplate.com/wp-content/uploads/2024/02/chicken-curry_square.jpg"},
]


@app.route("/api/drivers", methods=["GET", "POST"])
def handle_drivers():
    if request.method == "POST":
        new_driver = request.get_json()
        drivers.append(new_driver)
        return jsonify({"message": "✅ Driver added!", "driver": new_driver}), 201
    return jsonify(drivers)


@app.route("/api/stores", methods=["GET", "POST"])
def handle_stores():
    if request.method == "POST":
        new_store = request.get_json()
        stores.append(new_store)
        return jsonify({"message": "✅ Store added!", "store": new_store}), 201
    return jsonify(stores)


@app.route("/api/products", methods=["GET", "POST"])
def handle_products():
    if request.method == "POST":
        new_product = request.get_json()
        products.append(new_product)
        return jsonify({"message": "✅ Product added!", "product": new_product}), 201
    return jsonify(products)

@app.route("/api/user/update", methods=["POST"])
def update_user():
    first_name = request.form.get("firstName")
    last_name = request.form.get("lastName")
    email = request.form.get("email")
    phone = request.form.get("phone")
    file = request.files.get("profilePic")

    profile_url = None
    if file:
        filename = secure_filename(file.filename)
        save_path = os.path.join("uploads", filename)
        file.save(save_path)
        profile_url = f"http://localhost:5000/uploads/{filename}"

    updated_user = {
        "firstName": first_name,
        "lastName": last_name,
        "email": email,
        "phone": phone,
        "profilePic": profile_url,
    }

    return jsonify(updated_user)


# ============================================================
# 🧭 Serve React Frontend
# ============================================================
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and os.path.exists(os.path.join("dist", path)):
        return send_from_directory("dist", path)
    return send_from_directory("dist", "index.html")


# ============================================================
# 🚀 Run Server
# ============================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
