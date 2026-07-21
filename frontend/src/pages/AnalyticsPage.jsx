import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#7c3aed','#a855f7','#c084fc','#e879f9','#f0abfc','#6d28d9','#8b5cf6','#ddd6fe'];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/analytics').then(r => setData(r.data));
  }, []);

  if (!data) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const catData = Object.entries(data.category_breakdown).map(([name, value]) => ({ name, value }));
  const colorData = Object.entries(data.color_breakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-8">Retailer Analytics</h1>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Products', value: data.total_products },
          { label: 'Top Category', value: data.top_category },
          { label: 'Top Colour', value: data.top_color },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a2e] rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-1">{s.label}</p>
            <p className="text-white text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1a1a2e] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name}) => name}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Top 10 Colours</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={colorData}>
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: 'none' }} />
              <Bar dataKey="value" fill="#7c3aed" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}