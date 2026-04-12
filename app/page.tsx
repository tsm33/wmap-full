'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Compass, Users, MessageCircle, Route, Plus } from 'lucide-react';
import TripSelector from '@/components/TripSelector';

export default function Home() {
  const [showTripSelector, setShowTripSelector] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-gray-800 p-6 flex items-center justify-between bg-black sticky top-0 z-50">
        <h1 className="font-bold text-5xl tracking-tighter text-white">WMap</h1>
        <div className="text-gray-400 text-lg hidden md:block">Планируем поездки вместе</div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white">Куда хочешь перейти?</h2>
          <p className="text-gray-400 mt-3 text-xl">Выбери нужный раздел</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Лента идей */}
          <Link href="/feed" className="group">
            <div className="bg-zinc-900 border border-gray-700 rounded-3xl p-8 hover:border-white transition-all h-full flex flex-col">
              <MapPin className="w-12 h-12 mb-6 text-white" />
              <h3 className="text-2xl font-semibold text-white">Лента идей</h3>
              <p className="mt-3 text-gray-400 text-lg">Рекомендации мест от друзей и сообщества</p>
              <div className="mt-auto pt-10 text-white font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                Перейти в ленту →
              </div>
            </div>
          </Link>

          {/* Мои поездки */}
          <Link href="/trips" className="group">
            <div className="bg-zinc-900 border border-gray-700 rounded-3xl p-8 hover:border-white transition-all h-full flex flex-col">
              <Users className="w-12 h-12 mb-6 text-white" />
              <h3 className="text-2xl font-semibold text-white">Мои поездки</h3>
              <p className="mt-3 text-gray-400 text-lg">Все твои поездки и групповые планы</p>
              <div className="mt-auto pt-10 text-white font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                Открыть поездки →
              </div>
            </div>
          </Link>

          {/* Карточка места */}
          <Link href="/place/1" className="group">
            <div className="bg-zinc-900 border border-gray-700 rounded-3xl p-8 hover:border-white transition-all h-full flex flex-col">
              <Compass className="w-12 h-12 mb-6 text-white" />
              <h3 className="text-2xl font-semibold text-white">Карточка места</h3>
              <p className="mt-3 text-gray-400 text-lg">Пример детальной страницы (Кафе «Лаванда»)</p>
              <div className="mt-auto pt-10 text-white font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                Открыть пример →
              </div>
            </div>
          </Link>

          {/* Dashboard поездки - теперь открывает модальное окно */}
          <button onClick={() => setShowTripSelector(true)} className="group text-left">
            <div className="bg-zinc-900 border border-gray-700 rounded-3xl p-8 hover:border-white transition-all h-full flex flex-col w-full">
              <Route className="w-12 h-12 mb-6 text-white" />
              <h3 className="text-2xl font-semibold text-white">Dashboard поездки</h3>
              <p className="mt-3 text-gray-400 text-lg">Главная страница конкретной поездки</p>
              <div className="mt-auto pt-10 text-white font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                Выбрать поездку →
              </div>
            </div>
          </button>

          {/* Карта маршрута */}
          <button onClick={() => setShowTripSelector(true)} className="group text-left">
            <div className="bg-zinc-900 border border-gray-700 rounded-3xl p-8 hover:border-white transition-all h-full flex flex-col w-full">
              <MapPin className="w-12 h-12 mb-6 text-white" />
              <h3 className="text-2xl font-semibold text-white">Карта маршрута</h3>
              <p className="mt-3 text-gray-400 text-lg">Интерактивная карта с точками</p>
              <div className="mt-auto pt-10 text-white font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                Выбрать поездку →
              </div>
            </div>
          </button>

          {/* Чат поездки */}
          <button onClick={() => setShowTripSelector(true)} className="group text-left">
            <div className="bg-zinc-900 border border-gray-700 rounded-3xl p-8 hover:border-white transition-all h-full flex flex-col w-full">
              <MessageCircle className="w-12 h-12 mb-6 text-white" />
              <h3 className="text-2xl font-semibold text-white">Чат поездки</h3>
              <p className="mt-3 text-gray-400 text-lg">Общение участников в реальном времени</p>
              <div className="mt-auto pt-10 text-white font-medium flex items-center gap-2 group-hover:gap-3 transition-all">
                Выбрать поездку →
              </div>
            </div>
          </button>

        </div>

        {/* Кнопка создания новой поездки */}
        <div className="mt-16 text-center">
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-3 bg-white text-black px-10 py-5 rounded-3xl text-xl font-semibold hover:bg-gray-200 transition"
          >
            <Plus size={28} />
            Создать новую поездку
          </Link>
        </div>
      </main>

      {/* Модальное окно выбора поездки */}
      <TripSelector 
        isOpen={showTripSelector} 
        onClose={() => setShowTripSelector(false)} 
      />
    </div>
  );
}