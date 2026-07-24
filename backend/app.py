from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os, sys, time, zipfile
import pandas as pd
import requests

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from similarity_search import SimilaritySearch

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
IMAGES_DIR = os.path.join(DATA_DIR, 'images')
os.makedirs(DATA_DIR, exist_ok=True)

HF_BASE = "https://huggingface.co/datasets/Kinara2020/fitfind-data/resolve/main"
CSV_PATH = os.path.join(DATA_DIR, 'fashion_dataset.csv')
CSV_URL = f"{HF_BASE}/fashion_dataset.csv"
ZIP_PATH = os.path.join(DATA_DIR, 'images.zip')
ZIP_URL = f"{HF_BASE}/images.zip"

# --- Download CSV once if not cached locally ---
if not os.path.exists(CSV_PATH):
    print("Downloading product CSV from HuggingFace...")
    r = requests.get(CSV_URL)
    r.raise_for_status()
    with open(CSV_PATH, 'wb') as f:
        f.write(r.content)
    print("✅ CSV downloaded")

# --- Download + extract images.zip once if not cached locally ---
if not os.path.exists(IMAGES_DIR):
    print("Downloading images.zip from HuggingFace...")
    r = requests.get(ZIP_URL)
    r.raise_for_status()
    with open(ZIP_PATH, 'wb') as f:
        f.write(r.content)
    print("Extracting images...")
    with zipfile.ZipFile(ZIP_PATH, 'r') as z:
        z.extractall(IMAGES_DIR)
    os.remove(ZIP_PATH)
    print("✅ Images ready")

print("Loading AI models...")
searcher = SimilaritySearch()

print("Loading product data...")
df = pd.read_csv(CSV_PATH, on_bad_lines='skip')
df = df.dropna(subset=['id'])
df['id'] = df['id'].astype(int)
products_dict = df.set_index('id').to_dict('index')
print(f"✅ Loaded {len(products_dict)} products")


def image_url(pid):
    return f"/images/{pid}.jpg"


@app.route('/')
def index():
    return jsonify({'status': 'FitFind backend running', 'products': len(products_dict)})


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'products': len(products_dict)})


@app.route('/api/search', methods=['POST'])
def search():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    file = request.files['image']
    temp_path = os.path.join(BASE_DIR, 'temp_query.jpg')
    file.save(temp_path)
    start = time.time()
    similar = searcher.search(temp_path, top_k=12)
    ms = int((time.time() - start) * 1000)
    if os.path.exists(temp_path):
        os.remove(temp_path)
    results = []
    for item in similar:
        pid = item['product_id']
        row = products_dict.get(pid, {})
        results.append({
            'product_id': pid,
            'name': row.get('productDisplayName', ''),
            'category': row.get('masterCategory', ''),
            'sub_category': row.get('subCategory', ''),
            'article_type': row.get('articleType', ''),
            'color': row.get('baseColour', ''),
            'gender': row.get('gender', ''),
            'season': row.get('season', ''),
            'year': row.get('year', ''),
            'usage': row.get('usage', ''),
            'similarity_score': round(item['similarity_score'], 4),
            'image_url': image_url(pid)
        })
    return jsonify({'results': results, 'time_ms': ms})


@app.route('/api/categories', methods=['GET'])
def get_categories():
    cats = df['masterCategory'].value_counts().to_dict()
    return jsonify({'categories': [{'name': k, 'total': v} for k, v in cats.items()]})


@app.route('/api/colors', methods=['GET'])
def get_colors():
    colors = df['baseColour'].dropna().value_counts().head(20).to_dict()
    return jsonify({'colors': list(colors.keys())})


@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category', '')
    color = request.args.get('color', '')
    gender = request.args.get('gender', '')
    page = int(request.args.get('page', 1))
    limit = 20
    filtered = df.copy()
    if category:
        filtered = filtered[filtered['masterCategory'] == category]
    if color:
        filtered = filtered[filtered['baseColour'] == color]
    if gender:
        filtered = filtered[filtered['gender'] == gender]
    start = (page - 1) * limit
    page_df = filtered.iloc[start:start + limit]
    products = [{
        'product_id': int(r['id']),
        'name': r.get('productDisplayName', ''),
        'category': r.get('masterCategory', ''),
        'color': r.get('baseColour', ''),
        'gender': r.get('gender', ''),
        'image_url': image_url(int(r['id']))
    } for _, r in page_df.iterrows()]
    return jsonify({'products': products, 'page': page, 'total': len(filtered)})


@app.route('/api/analytics', methods=['GET'])
def analytics():
    return jsonify({
        'total_products': len(df),
        'top_category': df['masterCategory'].value_counts().idxmax(),
        'top_color': df['baseColour'].value_counts().idxmax(),
        'top_gender': df['gender'].value_counts().idxmax(),
        'category_breakdown': df['masterCategory'].value_counts().to_dict(),
        'color_breakdown': df['baseColour'].value_counts().head(10).to_dict(),
        'gender_breakdown': df['gender'].value_counts().to_dict(),
    })


@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory(IMAGES_DIR, filename)


if __name__ == '__main__':
    app.run(debug=False, port=int(os.environ.get('PORT', 5000)))