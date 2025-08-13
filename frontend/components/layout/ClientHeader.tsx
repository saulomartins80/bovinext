'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

export function ClientHeader() {
  const router = useRouter();
  
  const menuItems = [
    { name: 'Recursos', path: '/recursos' },
    { name: 'Soluções', path: '/solucoes' },
    { name: 'Preços', path: '/precos' },
    { name: 'Clientes', path: '/clientes' },
    { name: 'Contato', path: '/contato' }
  ];

  // Filtrar menu items para não mostrar a página atual
  const currentPath = router.pathname;
  const filteredMenuItems = menuItems.filter(item => item.path !== currentPath);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/finnextho.png" alt="Finnextho" width={40} height={40} />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              fin<span className="text-blue-300">nextho</span>
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8">
            {filteredMenuItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm uppercase tracking-wider"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/login"  
              className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              Entrar
            </Link>
            <Link 
              href="/auth/register" 
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              Começar Gratuitamente
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 