'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MapPin, Plus, Heart, Star } from 'lucide-react';
import InteractiveMap from '@/components/Map';

export default function PlaceCard() {
  const { id } = useParams();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Пытаемся загрузить из Supabase
    supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (data) {
          setPlace(data);
        } else {
          // Если данных нет — показываем красивый мок
          setPlace({
            id: 1,
            name: "Кафе «Лаванда»",
            category: "Кафе",
            description: "Уютное кафе в центре города с авторскими десертами и свежесваренным кофе. Идеальное место для завтрака или романтического свидания.",
            latitude: 55.7558,
            longitude: 37.6173,
            address: "Тверской бульвар, 26А",
            rating: 4.8
          });
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Загрузка...
      </div>
    );
  }

  // Рендерим звезды рейтинга
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={20} className="fill-yellow-500 text-yellow-500" />);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Логотип WMap в левом верхнем углу */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/" className="font-bold text-2xl tracking-tighter text-white hover:text-gray-300 transition">
          WMap
        </Link>
      </div>

      <main className="max-w-4xl mx-auto p-6 pt-8">
        {/* Фото-заглушка */}
        <div className="h-80 bg-gradient-to-br from-purple-800 to-pink-700 rounded-3xl flex items-center justify-center relative overflow-hidden">
          <MapPin size={120} className="text-white/20" />
          <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-2xl border border-gray-700">
            {place.category}
          </div>
        </div>

        {/* Название и рейтинг */}
        <div className="mt-8">
          <h1 className="text-4xl font-bold text-white">{place.name}</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1">
              {renderStars(place.rating)}
            </div>
            <span className="text-gray-400 text-sm ml-2">({place.rating})</span>
          </div>
          <p className="mt-6 text-lg text-gray-300 leading-relaxed">
            {place.description}
          </p>
        </div>

        {/* Адрес */}
        <div className="mt-8 flex items-center gap-3 text-gray-300 bg-zinc-900 p-4 rounded-2xl border border-gray-800">
          <MapPin size={22} className="text-gray-400" />
          <span className="text-lg">{place.address}</span>
        </div>

        {/* Карта */}
        <div className="mt-8">
          <h3 className="font-bold text-xl mb-4 text-white">Расположение</h3>
          <div className="h-96 bg-zinc-900 rounded-3xl overflow-hidden border border-gray-800">
            <InteractiveMap places={[place]} />
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => alert('✅ Место добавлено в поездку!')}
            className="flex-1 bg-white text-black py-5 rounded-3xl text-xl font-semibold hover:bg-gray-200 transition flex items-center justify-center gap-3"
          >
            <Plus size={28} />
            Добавить в поездку
          </button>

          <button className="flex-1 border-2 border-white py-5 rounded-3xl text-xl font-semibold hover:bg-white hover:text-black transition flex items-center justify-center gap-3">
            <Heart size={28} />
            Сохранить в избранное
          </button>
        </div>
      </main>
    </div>
  );
}