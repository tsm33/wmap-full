'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { createTripInBitrix24 } from '@/lib/bitrix24';
import { ArrowLeft, Calendar, MapPin, FileText, Plus } from 'lucide-react';

export default function CreateTrip() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 1. handleSubmit вызвана');
    setLoading(true);

    if (!formData.title.trim()) {
      alert('Введите название поездки');
      setLoading(false);
      return;
    }

    console.log('🔵 2. Сохраняем в Supabase...');
    const { data, error } = await supabase
      .from('trips')
      .insert({
        title: formData.title,
        location: formData.location || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        description: formData.description || null,
        status: 'planning',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Ошибка Supabase:', error);
      alert('Ошибка при создании поездки');
      setLoading(false);
      return;
    }

    console.log('🔵 3. Поездка создана в Supabase, ID:', data.id);
    console.log('🔵 4. Отправляем в Bitrix24...');

    try {
      const result = await createTripInBitrix24({
        id: data.id,
        title: formData.title,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description,
        status: 'planning',
      });
      console.log('🔵 5. Результат Bitrix24:', result);
    } catch (err) {
      console.error('❌ Ошибка Bitrix24:', err);
    }

    alert('✅ Поездка "' + data.title + '" успешно создана!');
    router.push(`/trips/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 p-6 flex items-center gap-4 bg-black sticky top-0 z-50">
        <Link href="/trips" className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-2xl text-white">Создать новую поездку</h1>
      </header>
      <main className="max-w-2xl mx-auto p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Название поездки *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange}
              className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Локация</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange}
              className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Дата начала</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange}
                className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Дата окончания</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange}
                className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Описание</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              rows={4} className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-white text-black py-4 rounded-2xl text-lg font-semibold">
            {loading ? 'Создаём...' : '✨ Создать поездку'}
          </button>
        </form>
      </main>
    </div>
  );
}