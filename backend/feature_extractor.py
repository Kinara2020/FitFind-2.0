import onnxruntime as ort
import numpy as np
from PIL import Image
import os

class FeatureExtractor:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        print("Loading ONNX model...")
        base_dir = os.path.dirname(os.path.abspath(__file__))
        onnx_path = os.path.join(base_dir, 'models', 'resnet50.onnx')

        if not os.path.exists(onnx_path):
            print("Downloading ONNX from HuggingFace...")
            from huggingface_hub import hf_hub_download
            hf_hub_download(
                repo_id="Kinara2020/fitfind-data",
                filename="resnet50.onnx",
                repo_type="dataset",
                local_dir=os.path.join(base_dir, 'models'),
                local_dir_use_symlinks=False
            )

        self.session = ort.InferenceSession(onnx_path)
        self.input_name = self.session.get_inputs()[0].name
        self._initialized = True
        print("✅ ONNX model loaded")

    def preprocess(self, image_path):
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224))
        arr = np.array(img).astype(np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        arr = (arr - mean) / std
        arr = arr.transpose(2, 0, 1)
        arr = np.expand_dims(arr, 0).astype(np.float32)
        return arr

    def extract(self, image_path):
        try:
            arr = self.preprocess(image_path)
            outputs = self.session.run(None, {self.input_name: arr})
            features = outputs[0].squeeze()
            features = features / np.linalg.norm(features)
            return features
        except Exception as e:
            print(f"Error: {e}")
<<<<<<< HEAD
            return None
=======
            return None
>>>>>>> e645151b09d5400c32bae2ea1713d5aec9b56467
