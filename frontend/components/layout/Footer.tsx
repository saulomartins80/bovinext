import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FiGithub, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';

export const Footer: React.FC = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    produto: [
      { label: 'Recursos', href: '/recursos' },
      { label: 'Soluções', href: '/solucoes' },
      { label: 'Preços', href: '/precos' },
      { label: 'Clientes', href: '/clientes' },
    ],
    empresa: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Blog', href: '/blog' },
      { label: 'Carreiras', href: '/carreiras' },
      { label: 'Contato', href: '/contato' },
    ],
    legal: [
      { label: 'Termos', href: '/termos' },
      { label: 'Privacidade', href: '/privacidade' },
      { label: 'Cookies', href: '/cookies' },
    ],
  };

  // Filtrar links do produto para não mostrar a página atual
  const currentPath = router.pathname;
  const filteredProdutoLinks = footerLinks.produto.filter(link => link.href !== currentPath);

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com/fin' },
    { icon: FiTwitter, href: 'https://twitter.com/theclosen' },
    { icon: FiLinkedin, href: 'https://linkedin.com/company/theclosen' },
    { icon: FiInstagram, href: 'https://instagram.com/theclosen' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/finnextho.png" alt="Finnextho" width={40} height={40} />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                fin<span className="text-blue-300">nextho</span>
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              A plataforma financeira mais avançada do mercado, com tecnologia de ponta para transformar sua relação com o dinheiro.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Produto
            </h3>
            <ul className="mt-4 space-y-4">
              {filteredProdutoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Empresa
              </h3>
              <ul className="mt-4 space-y-4">
              {footerLinks.empresa.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Jurídico
            </h3>
            <ul className="mt-4 space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-base text-gray-500 dark:text-gray-400 text-center">
            &copy; {currentYear} finnextho. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};