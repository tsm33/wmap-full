'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send, User } from 'lucide-react';

export default function TripChat() {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоскролл вниз при новых сообщениях
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Загружаем информацию о поездке
      const { data: tripData } = await supabase
        .from('trips')
        .select('title')
        .eq('id', id)
        .single();
      setTrip(tripData);

      // Загружаем сообщения
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('trip_id', id)
        .order('created_at', { ascending: true });
      
      setMessages(messagesData || []);
      setLoading(false);
    };

    loadData();

    // Подписка на новые сообщения в реальном времени
    const channel = supabase
      .channel(`chat:${id}`)
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `trip_id=eq.${id}`
        }, 
        (payload) => {
          console.log('Новое сообщение:', payload.new);
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    // Очистка подписки при размонтировании
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Отправка сообщения
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          trip_id: id,
          content: newMessage.trim(),
          sender_id: null, // Для демо без авторизации
        })
        .select();

      if (error) {
        console.error('Ошибка при отправке:', error);
        alert('Ошибка при отправке: ' + error.message);
      } else {
        console.log('Сообщение отправлено:', data);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Не удалось отправить сообщение');
    } finally {
      setSending(false);
    }
  };

  // Отправка по Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Форматирование времени
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  // Группировка сообщений по датам
  const groupedMessages = messages.reduce((acc: any, msg) => {
    const date = new Date(msg.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(msg);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
        Загрузка чата...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-gray-800 p-5 flex items-center gap-4 bg-black sticky top-0 z-50">
        <Link href={`/trips/${id}`} className="text-gray-400 hover:text-white transition">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="font-bold text-xl text-white">{trip?.title || 'Поездка'}</h1>
          <p className="text-xs text-gray-500">Чат участников • {messages.length} сообщений</p>
        </div>
      </header>

      {/* СООБЩЕНИЯ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <User size={48} className="mx-auto mb-4 opacity-50" />
            <p>Пока нет сообщений</p>
            <p className="text-sm mt-2">Напишите что-нибудь, чтобы начать общение!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="text-xs text-gray-500 bg-zinc-900 px-3 py-1 rounded-full">
                  {formatDate(dateMessages[0].created_at)}
                </span>
              </div>
              <div className="space-y-3">
                {(dateMessages as any[]).map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Участник</span>
                        <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                      </div>
                      <div className="bg-zinc-900 border border-gray-800 rounded-2xl p-3 mt-1 max-w-[90%]">
                        <p className="text-gray-200 whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ФОРМА ОТПРАВКИ */}
      <div className="border-t border-gray-800 p-4 bg-black">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              className="w-full bg-zinc-900 border border-gray-700 rounded-2xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition resize-none"
              placeholder="Напишите сообщение..."
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="bg-white text-black px-6 py-3 rounded-2xl hover:bg-gray-200 transition flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                <span className="hidden sm:inline">Отправить</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}