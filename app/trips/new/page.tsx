'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Валидация
    if (!formData.title.trim()) {
      alert('Введите название поездки');
      setLoading(false);
      return;
    }

    // Сохраняем в Supabase
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
      console.error('Ошибка:', error);
      alert('Ошибка при создании поездки: ' + error.message);
      setLoading(false);
      return;
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
          {/* Название поездки */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Plus size={16} />
              Название поездки *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Например: Выходные в Москве"
              className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
              required
            />
          </div>

          {/* Локация */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Локация (город или регион)
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Например: Москва, Санкт-Петербург"
              className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
            />
          </div>

          {/* Даты */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Дата начала
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Дата окончания
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-white transition"
              />
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <FileText size={16} />
              Описание (необязательно)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Расскажите о планах, компании, целях поездки..."
              className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white transition resize-none"
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white text-black py-4 rounded-2xl text-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Создаём...' : '✨ Создать поездку'}
            </button>
            <Link
              href="/trips"
              className="flex-1 border border-gray-700 text-center py-4 rounded-2xl text-lg font-medium hover:bg-zinc-900 transition"
            >
              Отмена
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}