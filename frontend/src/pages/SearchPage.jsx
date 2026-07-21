import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function SearchPage() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeTaken, setTimeTaken] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResults([]);
  };

  const handleSearch = async () => {
    if (!image) return;
    setLoading(true);
    const form = new FormData();
    form.append('image', image);
    try {
      const res = await axios.post('http://localhost:5000/api/search', form);
      setResults(res.data.results);
      setTimeTaken(res.data.time_ms);
    } catch (e) {
      alert('Search failed. Is backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-2">Visual Search</h1>
      <p className="text-gray-400 mb-8">Upload any fashion item to find similar products</p>

      <div
        className="border-2 border-dashed border-purple-700 rounded-2xl p-10 text-center cursor-pointer hover:border-purple-400 transition mb-6"
        onClick={() => fileRef.current.click()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="max-h-64 mx-auto rounded-xl" />
        ) : (
          <div>
            <p className="text-4xl mb-3">👗</p>
            <p className="text-gray-400">Drag & drop or click to upload</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      <button
        onClick={handleSearch}
        disabled={!image || loading}
        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 rounded-xl font-semibold transition mb-10"
      >
        {loading ? 'Searching...' : 'Find Similar Items'}
      </button>

      {timeTaken && <p className="text-gray-500 text-sm mb-4">Found in {timeTaken}ms</p>}

      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-purple-300">Similar Items</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((r) => (
              <div key={r.product_id} className="bg-[#1a1a2e] rounded-xl overflow-hidden hover:scale-105 transition">
                <img
                  src={`http://localhost:5000/images/${r.product_id}.jpg`}
                  alt={r.name}
                  className="w-full h-52 object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; }}
                />
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">{r.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{r.article_type}</p>
                  <p className="text-purple-400 text-xs mt-1">{r.color} · {r.gender}</p>
                  <p className="text-green-400 text-xs mt-1">Score: {r.similarity_score}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}