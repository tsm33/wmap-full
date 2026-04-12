'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Plus, Home } from 'lucide-react';

export default function TripsList() {
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('trips').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setTrips(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 p-6 flex items-center justify-between bg-black sticky top-0 z-50">
        {/* Левый угол — логотип WMap */}
        <Link href="/" className="font-bold text-2xl tracking-tighter text-white hover:text-gray-300 transition">
          WMap
        </Link>

        {/* Центр — заголовок */}
        <h1 className="font-bold text-3xl tracking-tighter text-white absolute left-1/2 transform -translate-x-1/2">
          Мои поездки
        </h1>

        {/* Правый угол — кнопки */}
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 bg-white/10 border border-gray-700 rounded-2xl px-5 py-2.5 hover:bg-white hover:text-black transition group"
          >
            <Home size={18} className="group-hover:text-black" />
            <span className="text-sm font-medium">Главная</span>
          </Link>
          <Link 
            href="/trips/new" 
            className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-2xl font-semibold hover:bg-gray-200 transition"
          >
            <Plus size={18} />
            Новая поездка
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">У тебя пока нет поездок</p>
            <Link href="/trips/new" className="inline-block mt-6 px-8 py-4 bg-white text-black rounded-3xl font-semibold hover:bg-gray-200 transition">
              Создать первую поездку
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`} className="group">
                <div className="bg-zinc-900 border border-gray-700 rounded-3xl p-6 hover:border-white transition-all">
                  <h2 className="text-2xl font-bold text-white group-hover:text-gray-300">{trip.title}</h2>
                  <div className="flex items-center gap-4 mt-3 text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{trip.location || 'Не указано'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{trip.start_date || '?'} — {trip.end_date || '?'}</span>
                    </div>
                  </div>
                  {trip.description && (
                    <p className="mt-4 text-gray-500 text-sm line-clamp-2">{trip.description}</p>
                  )}
                  <div className="mt-5 pt-4 border-t border-gray-800 text-gray-500 text-sm">
                    Статус: {trip.status === 'planning' ? '📝 Планируется' : '✅ Завершена'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}