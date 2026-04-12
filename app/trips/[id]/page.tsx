'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MapPin, MessageCircle, Calendar, Users, ArrowLeft, Plus, X, Search } from 'lucide-react';
import InteractiveMap from '@/components/Map';

export default function TripDashboard() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [allPlaces, setAllPlaces] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Загружаем данные
  useEffect(() => {
    loadTripData();
    loadAllPlaces();
  }, [id]);

  const loadTripData = async () => {
    setLoading(true);
    // Загружаем информацию о поездке
    const { data: tripData } = await supabase
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();
    setTrip(tripData);

    // Загружаем места, связанные с поездкой
    const { data: tripPlacesData } = await supabase
      .from('trip_places')
      .select('place_id, day, order, places(*)')
      .eq('trip_id', id)
      .order('day', { ascending: true })
      .order('order', { ascending: true });
    
    if (tripPlacesData) {
      const fetchedPlaces = tripPlacesData.map((tp: any) => ({
        ...tp.places,
        trip_place_id: tp.place_id,
        day: tp.day,
        order: tp.order
      }));
      setPlaces(fetchedPlaces);
    }
    setLoading(false);
  };

  const loadAllPlaces = async () => {
    const { data } = await supabase
      .from('places')
      .select('*')
      .order('name');
    setAllPlaces(data || []);
  };

  // Добавить место в поездку
  const addPlaceToTrip = async (place: any) => {
    const nextDay = places.length > 0 ? Math.max(...places.map(p => p.day || 1)) : 1;
    const nextOrder = places.filter(p => p.day === nextDay).length + 1;

    const { error } = await supabase
      .from('trip_places')
      .insert({
        trip_id: id,
        place_id: place.id,
        day: nextDay,
        order: nextOrder,
      });

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      await loadTripData();
      setShowAddModal(false);
      setSearchQuery('');
    }
  };

  // Удалить место из поездки
  const removePlaceFromTrip = async (placeId: number) => {
    if (!confirm('Удалить это место из поездки?')) return;

    const { error } = await supabase
      .from('trip_places')
      .delete()
      .eq('trip_id', id)
      .eq('place_id', placeId);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      await loadTripData();
    }
  };

  // Обновить день места
  const updatePlaceDay = async (placeId: number, newDay: number) => {
    const { error } = await supabase
      .from('trip_places')
      .update({ day: newDay })
      .eq('trip_id', id)
      .eq('place_id', placeId);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      await loadTripData();
    }
  };

  // Фильтр мест для модального окна (только те, которых ещё нет в поездке)
  const availablePlaces = allPlaces.filter(
    place => !places.some(p => p.id === place.id)
  );

  const filteredPlaces = availablePlaces.filter(place =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Группировка мест по дням
  const placesByDay = places.reduce((acc: any, place) => {
    const day = place.day || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(place);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 p-6 flex items-center justify-between bg-black sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/trips" className="text-gray-400 hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-bold text-2xl text-white">{trip?.title}</h1>
            <p className="text-sm text-gray-400">{trip?.location || 'Локация не указана'}</p>
          </div>
        </div>
        <Link 
          href={`/trips/${id}/chat`} 
          className="flex items-center gap-2 px-6 py-3 border border-gray-700 rounded-2xl hover:bg-white hover:text-black transition"
        >
          <MessageCircle size={18} />
          Чат
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка — места */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <MapPin size={20} />
                Места в поездке
                <span className="text-sm text-gray-500 ml-2">({places.length})</span>
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-2xl text-sm font-semibold hover:bg-gray-200 transition"
              >
                <Plus size={16} />
                Добавить место
              </button>
            </div>

            {places.length === 0 ? (
              <div className="bg-zinc-900 border border-gray-700 rounded-3xl p-8 text-center text-gray-500">
                <MapPin size={48} className="mx-auto mb-3 opacity-50" />
                <p>Пока нет добавленных мест</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-6 py-2 bg-white text-black rounded-2xl text-sm font-semibold hover:bg-gray-200 transition"
                >
                  + Добавить первое место
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {Object.keys(placesByDay).sort().map((day) => (
                  <div key={day}>
                    <div className="flex items-center gap-2 mb-3 sticky top-0 bg-black py-2">
                      <div className="w-8 h-8 bg-white text-black rounded-xl flex items-center justify-center font-bold text-sm">
                        {day}
                      </div>
                      <span className="font-semibold text-gray-300">День {day}</span>
                    </div>
                    <div className="space-y-2 ml-4">
                      {placesByDay[day].map((place: any) => (
                        <div key={place.id} className="bg-zinc-900 border border-gray-700 rounded-2xl p-4 hover:border-gray-500 transition group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500 uppercase">{place.category}</span>
                                <select
                                  value={place.day || 1}
                                  onChange={(e) => updatePlaceDay(place.id, parseInt(e.target.value))}
                                  className="bg-gray-800 text-white text-xs rounded-xl px-2 py-1 border border-gray-600 focus:outline-none"
                                >
                                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                    <option key={d} value={d}>День {d}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="font-semibold text-lg mt-1">{place.name}</div>
                              {place.description && (
                                <p className="text-gray-400 text-sm mt-1 line-clamp-2">{place.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removePlaceFromTrip(place.id)}
                              className="text-gray-500 hover:text-red-500 transition p-2 opacity-0 group-hover:opacity-100"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Правая колонка — карта */}
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Карта маршрута
            </h3>
            <div className="h-96 bg-zinc-900 rounded-3xl overflow-hidden border border-gray-700">
              {places.length > 0 ? (
                <InteractiveMap places={places} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Добавьте места, чтобы увидеть карту
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link 
            href={`/trips/${id}/map`} 
            className="flex-1 py-5 text-center bg-white text-black rounded-3xl text-lg font-semibold hover:bg-gray-200 transition"
          >
            🗺️ Открыть карту
          </Link>
          <Link 
            href={`/trips/${id}/plan`} 
            className="flex-1 py-5 text-center border-2 border-white rounded-3xl text-lg font-semibold hover:bg-white hover:text-black transition"
          >
            📋 Финальный план
          </Link>
        </div>

        {/* Информация о датах */}
        {(trip?.start_date || trip?.end_date) && (
          <div className="mt-8 p-5 bg-zinc-900 border border-gray-700 rounded-3xl">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar size={18} />
              <span>
                {trip.start_date && new Date(trip.start_date).toLocaleDateString('ru-RU')}
                {trip.end_date && ` — ${new Date(trip.end_date).toLocaleDateString('ru-RU')}`}
              </span>
            </div>
            {trip?.description && (
              <p className="mt-3 text-gray-500">{trip.description}</p>
            )}
          </div>
        )}
      </main>

      {/* Модальное окно добавления места */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-gray-700 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Добавить место</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск мест по названию или категории..."
                  className="w-full bg-black border border-gray-700 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredPlaces.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {searchQuery ? 'Ничего не найдено' : 'Нет доступных мест для добавления'}
                  </p>
                ) : (
                  filteredPlaces.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => addPlaceToTrip(place)}
                      className="w-full text-left p-4 bg-black border border-gray-800 rounded-2xl hover:border-white transition group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-500 uppercase">{place.category}</div>
                          <div className="font-semibold text-white group-hover:text-gray-300">{place.name}</div>
                          {place.description && (
                            <p className="text-gray-500 text-sm mt-1 line-clamp-1">{place.description}</p>
                          )}
                        </div>
                        <Plus size={20} className="text-gray-500 group-hover:text-white" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}