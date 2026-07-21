import faiss
import numpy as np
import pickle
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from feature_extractor import FeatureExtractor

class SimilaritySearch:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(base_dir, 'models')
        os.makedirs(models_dir, exist_ok=True)

        faiss_path = os.path.join(models_dir, 'fashion_index.faiss')
        ids_path = os.path.join(models_dir, 'valid_ids.pkl')

        if not os.path.exists(faiss_path) or not os.path.exists(ids_path):
            print("Downloading models from HuggingFace...")
            from huggingface_hub import hf_hub_download
            hf_hub_download(
                repo_id="Kinara2020/fitfind-data",
                filename="fashion_index.faiss",
                repo_type="dataset",
                local_dir=models_dir,
                local_dir_use_symlinks=False
            )
            hf_hub_download(
                repo_id="Kinara2020/fitfind-data",
                filename="valid_ids.pkl",
                repo_type="dataset",
                local_dir=models_dir,
                local_dir_use_symlinks=False
            )
            print("✅ Downloaded successfully")

        print("Loading FAISS index...")
        self.index = faiss.read_index(faiss_path)

        with open(ids_path, 'rb') as f:
            self.valid_ids = pickle.load(f)

        self.extractor = FeatureExtractor()
        print(f"✅ Loaded index with {self.index.ntotal} products")

    def search(self, image_path, top_k=5):
        query_features = self.extractor.extract(image_path)

        if query_features is None:
            return []

        query_vector = query_features.reshape(1, -1).astype('float32')
        distances, indices = self.index.search(query_vector, top_k)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.valid_ids):
                results.append({
                    'product_id': self.valid_ids[idx],
                    'similarity_score': float(dist)
                })

        return results

if __name__ == "__main__":
    searcher = SimilaritySearch()
    results = searcher.search("data/images/15970.jpg", top_k=5)
    print("Top 5 similar products:")
    for r in results:
        print(f"  Product {r['product_id']} — Score: {r['similarity_score']:.4f}")