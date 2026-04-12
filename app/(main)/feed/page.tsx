'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MapPin } from 'lucide-react';

const categories = ['Все', 'Кафе', 'Природа', 'Музеи', 'Рестораны', 'Парки'];

export default function Feed() {
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');

  useEffect(() => {
    let query = supabase.from('places').select('*');

    if (selectedCategory !== 'Все') {
      query = query.eq('category', selectedCategory);
    }

    query.then(({ data }) => setPlaces(data || []));
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 p-6 flex items-center justify-between">
        <h1 className="font-bold text-4xl">WMap</h1>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-8">Лента идей</h2>

        {/* Фильтры — теперь работают */}
        <div className="flex gap-3 flex-wrap mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-3xl font-medium transition-all ${
                selectedCategory === cat 
                  ? 'bg-white text-black' 
                  : 'bg-zinc-900 border border-gray-700 hover:border-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {places.map(place => (
            <Link key={place.id} href={`/place/${place.id}`}>
              <div className="bg-zinc-900 border border-gray-700 rounded-3xl p-6 hover:border-white transition">
                <div className="h-48 bg-gray-800 rounded-2xl flex items-center justify-center">
                  <MapPin size={60} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold mt-6">{place.name}</h3>
                <p className="text-gray-400 mt-2">{place.description}</p>
                <div className="mt-4 text-xs uppercase tracking-widest">{place.category}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}