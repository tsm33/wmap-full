'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

export default function BackToHome() {
  const pathname = usePathname();
  
  // Не показываем на главной странице
  if (pathname === '/') return null;
  
  return (
    <Link 
      href="/" 
      className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-gray-700 rounded-2xl px-4 py-2.5 hover:bg-white hover:text-black transition-all group shadow-lg"
      title="Вернуться на главную"
    >
      <ArrowLeft size={18} className="group-hover:text-black" />
      <span className="text-sm font-medium hidden sm:inline">Главная</span>
      <Home size={16} className="hidden sm:inline group-hover:text-black" />
    </Link>
  );
}