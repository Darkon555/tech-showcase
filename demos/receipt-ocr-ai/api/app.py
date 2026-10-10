"""Flask app: OCR a receipt image and structure it with a local LLM."""
from __future__ import annotations

import io

import pytesseract
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

from parser import structure_receipt

app = Flask(__name__)
CORS(app)

ALLOWED = {"image/png", "image/jpeg", "image/jpg", "image/webp"}


@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.post("/api/parse")
def parse():
    if "file" not in request.files:
        return jsonify(error="No file uploaded"), 400

    file = request.files["file"]
    if file.mimetype not in ALLOWED:
        return jsonify(error=f"Unsupported file type: {file.mimetype}"), 400

    try:
        image = Image.open(io.BytesIO(file.read()))
    except Exception:
        return jsonify(error="Invalid image"), 400

    raw_text = pytesseract.image_to_string(image)
    structured = structure_receipt(raw_text)
    return jsonify(rawText=raw_text, structured=structured)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4003)
