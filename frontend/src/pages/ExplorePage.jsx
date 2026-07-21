import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ExplorePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(r => setCategories(r.data.categories));
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/products?category=${selected}&page=${page}`)
      .then(r => setProducts(r.data.products));
  }, [selected, page]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">Explore</h1>
      <div className="flex gap-3 flex-wrap mb-8">
        <button onClick={() => { setSelected(''); setPage(1); }}
          className={`px-4 py-2 rounded-full text-sm transition ${!selected ? 'bg-purple-600 text-white' : 'bg-[#1a1a2e] text-gray-400 hover:text-white'}`}>
          All
        </button>
        {categories.map(c => (
          <button key={c.name} onClick={() => { setSelected(c.name); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm transition ${selected === c.name ? 'bg-purple-600 text-white' : 'bg-[#1a1a2e] text-gray-400 hover:text-white'}`}>
            {c.name} ({c.total})
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {products.map(p => (
          <div key={p.product_id} className="bg-[#1a1a2e] rounded-xl overflow-hidden hover:scale-105 transition">
            <img src={`http://localhost:5000/images/${p.product_id}.jpg`} alt={p.name}
              className="w-full h-52 object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=No+Image'; }} />
            <div className="p-3">
              <p className="text-white text-sm font-medium truncate">{p.name}</p>
              <p className="text-purple-400 text-xs mt-1">{p.color} · {p.gender}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <button onClick={() => setPage(p => Math.max(1, p - 1))}
          className="px-6 py-2 bg-[#1a1a2e] rounded-xl text-gray-400 hover:text-white transition">
          Previous
        </button>
        <span className="px-6 py-2 text-gray-400">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}
          className="px-6 py-2 bg-[#1a1a2e] rounded-xl text-gray-400 hover:text-white transition">
          Next
        </button>
      </div>
    </div>
  );
}