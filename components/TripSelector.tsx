'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { X, Calendar, MapPin, Users } from 'lucide-react';

interface TripSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TripSelector({ isOpen, onClose }: TripSelectorProps) {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTrips();
    }
  }, [isOpen]);

  const loadTrips = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });
    setTrips(data || []);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-gray-700 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Выберите поездку</h2>
            <p className="text-gray-400 text-sm mt-1">Чтобы открыть Dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Загрузка поездок...
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">У вас пока нет поездок</p>
              <Link
                href="/trips/new"
                onClick={onClose}
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition"
              >
                Создать первую поездку
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  onClick={onClose}
                  className="block group"
                >
                  <div className="bg-black border border-gray-800 rounded-2xl p-5 hover:border-white transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white group-hover:text-gray-300">
                          {trip.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                          {trip.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{trip.location}</span>
                            </div>
                          )}
                          {(trip.start_date || trip.end_date) && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>
                                {trip.start_date || '?'} — {trip.end_date || '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>Планируется</span>
                          </div>
                        </div>
                        {trip.description && (
                          <p className="mt-2 text-gray-500 text-sm line-clamp-1">
                            {trip.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 text-gray-500 group-hover:text-white transition">
                        →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}