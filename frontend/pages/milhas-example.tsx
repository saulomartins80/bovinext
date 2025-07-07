// Exemplo de como os cards de milhas devem ficar com bordas coloridas
// Baseado no padrão das outras páginas (metas, transações, investimentos)

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, CreditCard, Banknote } from 'lucide-react';

const SummaryCardsExample = () => {
  const totalPoints = 45000;
  const totalValue = 1125;
  const activeCards = 2;
  const pendingInvoices = 2;
  const totalPending = 4301.25;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card - Total de Pontos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-blue-500"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total de Pontos</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalPoints.toLocaleString()}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
        </div>
        <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 1 }}
          />
        </div>
      </motion.div>

      {/* Card - Valor Estimado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-green-500"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Valor Estimado</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              R$ {totalValue.toLocaleString()}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <DollarSign className="text-green-600 dark:text-green-400" size={20} />
          </div>
        </div>
        <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.7, duration: 1.5 }}
          />
        </div>
      </motion.div>

      {/* Card - Cartões Ativos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-purple-500"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Cartões Ativos</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {activeCards}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <CreditCard className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
        </div>
        <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.9, duration: 1 }}
          />
        </div>
      </motion.div>

      {/* Card - Faturas Pendentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-yellow-500"
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Faturas Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingInvoices}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
            <Banknote className="text-yellow-600 dark:text-yellow-400" size={20} />
          </div>
        </div>
        <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-yellow-500"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1.1, duration: 1 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SummaryCardsExample; 