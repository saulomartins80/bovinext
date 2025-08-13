import { useTheme } from '../context/ThemeContext';
import Head from 'next/head';
import { FiShield } from 'react-icons/fi';
import { InstitutionalHeader } from '../components/layout/InstitutionalHeader';
import { Footer } from '../components/layout/Footer';

export default function Juridico() {
  const { resolvedTheme } = useTheme();
  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'dark' : ''}`}>
      <Head>
        <title>Jurídico | finnextho</title>
        <meta name="description" content="Informações jurídicas e legais da finnextho" />
      </Head>
      
      <InstitutionalHeader 
        title="Jurídico" 
        icon={<FiShield className="w-6 h-6 text-blue-500" />}
        breadcrumb="Jurídico"
      />
      
      <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className={`${resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
            <div className="flex items-center mb-8">
              <FiShield className={`w-8 h-8 mr-3 ${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h1 className="text-3xl font-bold">Jurídico</h1>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className={`mb-6 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Aqui você encontra informações sobre nossos termos legais, políticas de privacidade, compliance e obrigações regulatórias. Para dúvidas jurídicas, entre em contato pelo e-mail <a href="mailto:juridico@finnextho.com">juridico@finnextho.com</a>.</p>
              <ul className={`space-y-2 ${resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• CNPJ: 00.000.000/0001-00</li>
                <li>• Endereço: Av. Paulista, 1000 - São Paulo, SP</li>
                <li>• Responsável Legal: Dr. João Advogado</li>
                <li>• Compliance com LGPD e regulamentações financeiras</li>
                <li>• Documentos legais disponíveis mediante solicitação</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
} 