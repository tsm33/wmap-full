'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import InteractiveMap from '@/components/Map';
import { ArrowLeft } from 'lucide-react';

export default function RouteMap() {
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('trips').select('*').eq('id', id).single().then(({ data }) => {
      setTrip(data);
    });

    supabase
      .from('trip_places')
      .select('place_id, day, order, places(*)')
      .eq('trip_id', id)
      .then(({ data }) => {
        if (data) {
          const fetchedPlaces = data.map((tp: any) => tp.places);
          setPlaces(fetchedPlaces);
        }
      });
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="border-b border-gray-800 p-5 flex items-center gap-4 bg-black sticky top-0 z-50">
        <Link href={`/trips/${id}`} className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={24} />
        </Link>
        <span className="font-bold text-xl">{trip?.title || 'Маршрут поездки'}</span>
        <div className="ml-auto text-sm text-gray-400">
          {places.length} мест
        </div>
      </header>
      <div className="flex-1">
        {places.length > 0 ? (
          <InteractiveMap places={places} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Нет мест для отображения на карте
          </div>
        )}
      </div>
    </div>
  );
}