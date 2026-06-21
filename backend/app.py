from __future__ import annotations

import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from PIL import Image
from werkzeug.utils import secure_filename

try:
    import tensorflow as tf
except Exception as exc:  # pragma: no cover - surfaced through health endpoint
    tf = None
    MODEL_LOAD_ERROR = f"TensorFlow belum bisa dimuat: {exc}"
else:
    MODEL_LOAD_ERROR = ""


BASE_DIR = Path(__file__).resolve().parent
MODEL_CANDIDATES = [
    BASE_DIR / "batikvision_model_baru.keras",
    BASE_DIR / "batikvision_model.keras",
]
MODEL_PATH = next((path for path in MODEL_CANDIDATES if path.exists()), MODEL_CANDIDATES[0])

CLASS_NAMES = [
    "batik-bali",
    "batik-betawi",
    "batik-celup",
    "batik-cendrawasih",
    "batik-ceplok",
    "batik-ciamis",
    "batik-garutan",
    "batik-gentongan",
    "batik-kawung",
    "batik-keraton",
    "batik-lasem",
    "batik-megamendung",
    "batik-parang",
    "batik-pekalongan",
    "batik-priangan",
    "batik-sekar",
    "batik-sidoluhur",
    "batik-sidomukti",
    "batik-sogan",
    "batik-tambal",
    "batik-tegalan",
]

BATIK_DATA = {
    "batik-bali": {
        "title": "Batik Bali",
        "origin": "Bali",
        "philosophies": [
            "Batik Bali menggambarkan harmoni manusia, alam, dan nilai spiritual dalam kehidupan sehari-hari.",
            "Motif Bali sering memadukan keberanian warna dan simbol alam sebagai ungkapan rasa syukur.",
            "Batik Bali merekam semangat seni yang hidup, terbuka, dan dekat dengan ritual budaya.",
        ],
    },
    "batik-betawi": {
        "title": "Batik Betawi",
        "origin": "Jakarta",
        "philosophies": [
            "Batik Betawi merayakan keterbukaan, kegembiraan, dan identitas masyarakat kota pesisir.",
            "Motif Betawi memuat warna hidup sebagai cerminan budaya yang ramah dan cair.",
            "Batik Betawi menjadi penanda keberagaman yang tumbuh di ruang perjumpaan Jakarta.",
        ],
    },
    "batik-celup": {
        "title": "Batik Celup",
        "origin": "Indonesia",
        "philosophies": [
            "Batik celup mengingatkan bahwa keindahan dapat lahir dari proses spontan dan sederhana.",
            "Coraknya yang tidak selalu sama melambangkan kebebasan ekspresi dalam berkarya.",
            "Teknik celup menghadirkan kejutan visual yang merekam keunikan setiap proses pewarnaan.",
        ],
    },
    "batik-cendrawasih": {
        "title": "Batik Cendrawasih",
        "origin": "Papua",
        "philosophies": [
            "Motif Cendrawasih melambangkan keagungan alam Papua, kebebasan, dan rasa syukur.",
            "Cendrawasih pada batik menjadi simbol keindahan alam yang perlu dihormati dan dijaga.",
            "Motif ini membawa pesan tentang kebanggaan daerah dan kekayaan hayati Nusantara.",
        ],
    },
    "batik-ceplok": {
        "title": "Batik Ceplok",
        "origin": "Yogyakarta dan Jawa Tengah",
        "philosophies": [
            "Ceplok melambangkan keteraturan, keseimbangan, dan kemantapan hidup.",
            "Pola geometris Ceplok mengajarkan harmoni melalui susunan yang tertib dan berulang.",
            "Motif Ceplok sering dibaca sebagai simbol keteguhan dalam menjaga nilai hidup.",
        ],
    },
    "batik-ciamis": {
        "title": "Batik Ciamis",
        "origin": "Ciamis, Jawa Barat",
        "philosophies": [
            "Batik Ciamis mencerminkan kesederhanaan, ketekunan, dan kedekatan dengan alam Priangan.",
            "Motif Ciamis membawa nuansa tenang yang lahir dari kehidupan agraris dan alam sekitar.",
            "Batik Ciamis mengajarkan keindahan yang tidak berlebihan tetapi tetap berkarakter.",
        ],
    },
    "batik-garutan": {
        "title": "Batik Garutan",
        "origin": "Garut, Jawa Barat",
        "philosophies": [
            "Batik Garutan memancarkan kelembutan, keramahan, dan kehalusan budi.",
            "Warna dan motif Garutan sering mencerminkan suasana alam yang sejuk dan bersahaja.",
            "Batik Garutan menyimpan pesan tentang keanggunan yang tumbuh dari kesederhanaan.",
        ],
    },
    "batik-gentongan": {
        "title": "Batik Gentongan",
        "origin": "Madura, Jawa Timur",
        "philosophies": [
            "Motif Gentongan menggambarkan kesabaran, daya tahan, dan karakter masyarakat Madura.",
            "Proses pewarnaan Gentongan yang panjang menjadi simbol ketekunan dan kualitas kerja.",
            "Batik Gentongan memperlihatkan keberanian warna yang lahir dari tradisi kuat.",
        ],
    },
    "batik-kawung": {
        "title": "Batik Kawung",
        "origin": "Yogyakarta",
        "philosophies": [
            "Kawung melambangkan pengendalian diri, kebijaksanaan, dan hati yang bersih.",
            "Bentuk Kawung yang seimbang mengingatkan manusia untuk menjaga pikiran dan tindakan.",
            "Motif Kawung sering dimaknai sebagai ajakan menjadi pribadi yang adil dan matang.",
        ],
    },
    "batik-keraton": {
        "title": "Batik Keraton",
        "origin": "Yogyakarta dan Surakarta",
        "philosophies": [
            "Batik Keraton mengajarkan tata krama, keluhuran, dan tanggung jawab moral.",
            "Motif Keraton memuat nilai kehalusan rasa serta disiplin dalam tradisi Jawa.",
            "Batik Keraton menjadi simbol martabat, pengendalian diri, dan kebijaksanaan.",
        ],
    },
    "batik-lasem": {
        "title": "Batik Lasem",
        "origin": "Lasem, Jawa Tengah",
        "philosophies": [
            "Batik Lasem mencerminkan akulturasi, keberanian, dan persahabatan lintas budaya.",
            "Warna merah khas Lasem menjadi tanda energi, keberanian, dan jejak perjumpaan budaya.",
            "Motif Lasem menunjukkan bahwa warisan budaya tumbuh kuat melalui dialog dan keterbukaan.",
        ],
    },
    "batik-megamendung": {
        "title": "Batik Megamendung",
        "origin": "Cirebon, Jawa Barat",
        "philosophies": [
            "Megamendung melambangkan keteduhan, kesabaran, dan kemampuan menenangkan diri.",
            "Lapisan awan pada Megamendung mengajarkan keluasan hati saat menghadapi keadaan.",
            "Motif Megamendung membawa pesan agar manusia tetap teduh meski berada dalam tekanan.",
        ],
    },
    "batik-parang": {
        "title": "Batik Parang",
        "origin": "Yogyakarta dan Surakarta",
        "philosophies": [
            "Parang menggambarkan perjuangan yang tidak putus dan keteguhan dalam menjalani hidup.",
            "Garis diagonal Parang menjadi simbol keberanian, kesinambungan, dan daya juang.",
            "Motif Parang mengingatkan pemakainya untuk bergerak maju dengan disiplin dan tekad.",
        ],
    },
    "batik-pekalongan": {
        "title": "Batik Pekalongan",
        "origin": "Pekalongan, Jawa Tengah",
        "philosophies": [
            "Batik Pekalongan merepresentasikan kreativitas, adaptasi, dan semangat perdagangan pesisir.",
            "Motif Pekalongan menunjukkan keberanian menerima pengaruh baru tanpa kehilangan akar lokal.",
            "Batik Pekalongan menjadi simbol masyarakat pesisir yang dinamis dan terbuka.",
        ],
    },
    "batik-priangan": {
        "title": "Batik Priangan",
        "origin": "Jawa Barat",
        "philosophies": [
            "Batik Priangan menggambarkan keanggunan, kesuburan, dan kesejukan tanah Sunda.",
            "Motif Priangan dekat dengan flora dan alam sebagai ekspresi rasa halus masyarakat Sunda.",
            "Batik Priangan menyampaikan kelembutan serta hubungan manusia dengan lanskap pegunungan.",
        ],
    },
    "batik-sekar": {
        "title": "Batik Sekar",
        "origin": "Jawa",
        "philosophies": [
            "Sekar melambangkan pertumbuhan, keindahan, dan harapan baik.",
            "Motif bunga pada Sekar menjadi simbol kehidupan yang berkembang dengan anggun.",
            "Batik Sekar membawa pesan tentang kelembutan, kesuburan, dan doa yang baik.",
        ],
    },
    "batik-sidoluhur": {
        "title": "Batik Sidoluhur",
        "origin": "Surakarta, Jawa Tengah",
        "philosophies": [
            "Sidoluhur menyimpan harapan agar pemakainya memiliki budi pekerti yang mulia.",
            "Motif Sidoluhur berisi doa agar hidup bergerak menuju keluhuran dan kebijaksanaan.",
            "Batik Sidoluhur mengajarkan pentingnya martabat, tanggung jawab, dan kebaikan hati.",
        ],
    },
    "batik-sidomukti": {
        "title": "Batik Sidomukti",
        "origin": "Surakarta dan Yogyakarta",
        "philosophies": [
            "Sidomukti berisi doa untuk kebahagiaan, kemakmuran, dan kehidupan yang sejahtera.",
            "Motif Sidomukti sering dikaitkan dengan harapan agar hidup menjadi berkecukupan dan harmonis.",
            "Batik Sidomukti membawa pesan tentang kemuliaan hidup yang diraih dengan ketulusan.",
        ],
    },
    "batik-sogan": {
        "title": "Batik Sogan",
        "origin": "Yogyakarta dan Surakarta",
        "philosophies": [
            "Sogan mencerminkan kesederhanaan, kedalaman rasa, dan martabat budaya Jawa.",
            "Warna coklat soga memberi kesan tenang, matang, dan dekat dengan tradisi klasik.",
            "Batik Sogan mengajarkan bahwa keanggunan dapat hadir dalam warna yang rendah hati.",
        ],
    },
    "batik-tambal": {
        "title": "Batik Tambal",
        "origin": "Jawa",
        "philosophies": [
            "Tambal melambangkan pemulihan, penyatuan, dan harapan untuk memperbaiki kehidupan.",
            "Susunan motif Tambal mengajarkan bahwa perbedaan dapat dirangkai menjadi kesatuan.",
            "Batik Tambal sering dimaknai sebagai doa untuk kesehatan, kekuatan, dan perbaikan diri.",
        ],
    },
    "batik-tegalan": {
        "title": "Batik Tegalan",
        "origin": "Tegal, Jawa Tengah",
        "philosophies": [
            "Batik Tegalan menggambarkan ketegasan, kerja keras, dan kebanggaan masyarakat lokal.",
            "Motif Tegalan memiliki karakter lugas yang mencerminkan semangat masyarakat pesisir.",
            "Batik Tegalan menyimpan energi keberanian dan identitas daerah yang kuat.",
        ],
    },
}


def load_batik_model() -> Any | None:
    global MODEL_LOAD_ERROR

    if tf is None:
        return None

    if not MODEL_PATH.exists():
        MODEL_LOAD_ERROR = (
            "File model belum ditemukan. Letakkan batikvision_model_baru.keras "
            "atau batikvision_model.keras di folder backend."
        )
        return None

    try:
        return tf.keras.models.load_model(MODEL_PATH, compile=False)
    except Exception as exc:  # pragma: no cover - depends on user model file
        MODEL_LOAD_ERROR = f"Model gagal dimuat: {exc}"
        return None


model = load_batik_model()

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

DATABASE_PATH = BASE_DIR / "batikvision.db"
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH.as_posix()}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class ScanHistory(db.Model):
    __tablename__ = "scan_history"

    id = db.Column(db.Integer, primary_key=True)
    class_key = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    origin = db.Column(db.String(150), nullable=False)
    philosophy = db.Column(db.Text, nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    image_filename = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def to_dict(self) -> dict[str, str | float | int | None]:
        return {
            "id": self.id,
            "classKey": self.class_key,
            "title": self.title,
            "origin": self.origin,
            "philosophy": self.philosophy,
            "confidence": self.confidence,
            "imageFilename": self.image_filename,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


with app.app_context():
    db.create_all()



def save_uploaded_file(uploaded_file) -> tuple[Path | None, str | None]:
    safe_name = secure_filename(uploaded_file.filename or "")

    if not safe_name:
        return None, None

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")
    saved_filename = f"{timestamp}_{safe_name}"
    saved_path = UPLOAD_DIR / saved_filename

    uploaded_file.seek(0)
    uploaded_file.save(saved_path)

    return saved_path, saved_filename


def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB")
    image = image.resize((224, 224))
    image_array = np.asarray(image, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


def build_response(class_key: str, confidence: float) -> dict[str, str | float]:
    metadata = BATIK_DATA.get(class_key)

    if metadata is None:
        fallback_title = class_key.replace("-", " ").title() if class_key else "Motif Tidak Dikenal"
        return {
            "classKey": class_key or "unknown",
            "title": fallback_title,
            "origin": "Belum diketahui",
            "philosophy": "Informasi filosofi untuk motif ini belum tersedia di basis data BatikVision.",
            "confidence": round(confidence, 2),
        }

    return {
        "classKey": class_key,
        "title": metadata["title"],
        "origin": metadata["origin"],
        "philosophy": random.choice(metadata["philosophies"]),
        "confidence": round(confidence, 2),
    }


@app.get("/")
def index():
    return jsonify(
        {
            "status": "BatikVision backend berjalan",
            "modelLoaded": model is not None,
            "modelPath": str(MODEL_PATH.name),
            "modelError": MODEL_LOAD_ERROR,
        }
    )


@app.post("/predict")
def predict():
    if model is None:
        return (
            jsonify(
                {
                    "error": MODEL_LOAD_ERROR
                    or "Model belum siap. Pastikan file .keras tersedia dan dependency backend sudah terpasang."
                }
            ),
            503,
        )

    if "file" not in request.files:
        return jsonify({"error": "File gambar dengan key 'file' tidak ditemukan."}), 400

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        return jsonify({"error": "Nama file kosong. Pilih gambar batik terlebih dahulu."}), 400

    try:
        saved_path, saved_filename = save_uploaded_file(uploaded_file)

        if saved_path is None:
            image = Image.open(uploaded_file.stream)
        else:
            image = Image.open(saved_path)

        batch = preprocess_image(image)
        predictions = np.asarray(model.predict(batch, verbose=0))
        scores = predictions[0] if predictions.ndim > 1 else predictions
        class_index = int(np.argmax(scores))
        confidence = float(np.max(scores) * 100.0)
        class_key = CLASS_NAMES[class_index] if 0 <= class_index < len(CLASS_NAMES) else "unknown"

        response_data = build_response(class_key, confidence)

        scan_history = ScanHistory(
            class_key=str(response_data["classKey"]),
            title=str(response_data["title"]),
            origin=str(response_data["origin"]),
            philosophy=str(response_data["philosophy"]),
            confidence=float(response_data["confidence"]),
            image_filename=saved_filename,
        )

        db.session.add(scan_history)
        db.session.commit()

        return jsonify(response_data)
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Gagal memproses gambar: {exc}"}), 500




@app.delete("/history/<int:item_id>")
def delete_history_item(item_id: int):
    item = db.session.get(ScanHistory, item_id)

    if item is None:
        return jsonify({"error": "Riwayat scan tidak ditemukan."}), 404

    if item.image_filename:
        image_path = UPLOAD_DIR / item.image_filename
        if image_path.exists():
            image_path.unlink()

    db.session.delete(item)
    db.session.commit()

    return jsonify({"message": "Riwayat scan berhasil dihapus."})


@app.delete("/history")
def clear_history():
    histories = ScanHistory.query.all()

    for item in histories:
        if item.image_filename:
            image_path = UPLOAD_DIR / item.image_filename
            if image_path.exists():
                image_path.unlink()

    ScanHistory.query.delete()
    db.session.commit()

    return jsonify({"message": "Semua riwayat scan berhasil dihapus."})


@app.get("/history")
def history():
    histories = ScanHistory.query.order_by(ScanHistory.created_at.desc()).all()
    return jsonify([item.to_dict() for item in histories])


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
