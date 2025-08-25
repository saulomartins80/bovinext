import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { transacaoAPI, investimentoAPI, metaAPI } from "../services/api";
import { Meta, Transacao, Investimento } from "../types";
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

// 1. Primeiro declare todas as interfaces
interface MongoId {
  $oid: string;
}

interface NovaTransacao {
  descricao: string;
  valor: number;
  data: { $date: string }; 
  categoria: string;
  tipo: "receita" | "despesa" | "transferencia";
  conta: string;
}

interface FinanceContextProps {
  transactions: Transacao[];
  investimentos: Investimento[];
  metas: Meta[];
  loading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  addTransaction: (novaTransacao: Omit<Transacao, "_id">) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  editTransaction: (id: string, updatedTransaction: Partial<Transacao>) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteTransaction: (id: string) => Promise<void>;
  fetchInvestimentos: () => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  addInvestimento: (novoInvestimento: Omit<Investimento, "_id">) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  editInvestimento: (id: string, updatedInvestimento: Partial<Investimento>) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteInvestimento: (id: string) => Promise<void>;
  fetchMetas: () => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  addMeta: (novaMeta: Omit<Meta, "_id" | "createdAt">) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  editMeta: (id: string, updatedMeta: Partial<Meta>) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  deleteMeta: (id: string) => Promise<void>;
  fetchData: () => Promise<void>;
  getMetas: () => Promise<Meta[]>;
}

// 2. Depois declare os type guards
function isMongoId(id: unknown): id is { $oid: string } {
  return Boolean(id && typeof id === 'object' && '$oid' in id);
}

// 3. Função de normalização
const normalizeId = (id: string | MongoId): string => {
  return typeof id === 'string' ? id : id.$oid;
};

const normalizeTransacao = (t: Transacao): Transacao => ({
  ...t,
  _id: isMongoId(t._id) ? t._id.$oid : t._id as string,
  data: typeof t.data === 'string' ? t.data : t.data.$date
});

// 4. Crie o contexto
const FinanceContext = createContext<FinanceContextProps>({} as FinanceContextProps);

// 5. Implemente o provider
export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  // console.log('[FinanceProvider] Component Mounted. Current router path:', router.pathname, 'Is router ready?', router.isReady);

  const [transactions, setTransactions] = useState<Transacao[]>([]);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isDataFresh, setIsDataFresh] = useState(false);

  const { user, isAuthReady } = useAuth(); // isAuthReady é o authChecked do AuthContext
  // console.log('[FinanceProvider] Auth state from useAuth: isAuthReady =', isAuthReady, 'user exists =', !!user);

  const fetchTransactions = async () => {
    console.log('[FinanceContext] Attempting to call fetchTransactions. AuthState:', { isAuthReady, user: !!user });
    if (!isAuthReady || !user) {
        console.log('[FinanceContext] fetchTransactions ABORTED - Auth not ready or no user.');
        setLoading(false); 
        return;
    }
    console.log('[fetchTransactions] Starting to fetch transactions');
    setLoading(true);
    setError(null);
    try {
      const data = await transacaoAPI.getAll();
      console.log('[fetchTransactions] Data received:', data);
      setTransactions(data.map(normalizeTransacao));
      console.log('[fetchTransactions] Transactions updated successfully');
    } catch (error) {
      console.error("[fetchTransactions] Error fetching transactions:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
      console.log('[fetchTransactions] Finished fetching transactions');
    }
  };

  const toApiTransacao = (t: Omit<Transacao, "_id">): NovaTransacao => {
  // Extrai a data no formato ISO string, independentemente do formato original
  const dataISO = typeof t.data === 'string' 
    ? new Date(t.data).toISOString() 
    : new Date(t.data.$date).toISOString();
  
  return {
    descricao: t.descricao,
    valor: Number(t.valor),
    data: { $date: dataISO }, // Garante que sempre será um objeto com $date
    categoria: t.categoria,
    tipo: t.tipo,
    conta: t.conta
  };
};

  const addTransaction = async (newTransaction: Omit<Transacao, "_id">) => {
    console.log('[addTransaction] Adding new transaction:', newTransaction);
    try {
      const apiData = toApiTransacao(newTransaction);
      console.log('[addTransaction] Formatted for API:', apiData);
      const data = await transacaoAPI.create(apiData);
      console.log('[addTransaction] Created successfully:', data);
      setTransactions((prev) => [...prev, normalizeTransacao(data)]);
      console.log('[addTransaction] State updated with new transaction');
    } catch (error) {
      console.error("[addTransaction] Error adding transaction:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      throw error;
    }
  };

  const editTransaction = async (id: string | MongoId, updatedTransaction: Partial<Transacao>) => {
    console.log('[editTransaction] Editing transaction ID:', id, 'with data:', updatedTransaction);
    try {
      const normalizedId = normalizeId(id);
      console.log('[editTransaction] Normalized ID:', normalizedId);
      const data = await transacaoAPI.update(normalizedId, updatedTransaction);
      console.log('[editTransaction] Update successful, received:', data);
      
      setTransactions((prev) =>
        prev.map((t) => {
          const currentId = normalizeId(t._id);
          return currentId === normalizedId ? normalizeTransacao({...t, ...data}) : t;
        })
      );
      console.log('[editTransaction] State updated successfully');
    } catch (error) {
      console.error("[editTransaction] Error editing transaction:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      throw error;
    }
  };

  const deleteTransaction = async (id: string | MongoId) => {
    console.log('[deleteTransaction] Deleting transaction ID:', id);
    try {
      const normalizedId = normalizeId(id);
      console.log('[deleteTransaction] Normalized ID:', normalizedId);
      
      await transacaoAPI.delete(normalizedId);
      console.log('[deleteTransaction] Deletion successful');
      
      setTransactions((prev) => 
        prev.filter((t) => {
          const currentId = normalizeId(t._id);
          return currentId !== normalizedId;
        })
      );
      console.log('[deleteTransaction] State updated successfully');
    } catch (error) {
      console.error("[deleteTransaction] Error deleting transaction:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      throw error;
    }
  };

  const fetchInvestimentos = async () => {
    console.log('[FinanceContext] Attempting to call fetchInvestimentos. AuthState:', { isAuthReady, user: !!user });
    if (!isAuthReady || !user) {
        console.log('[FinanceContext] fetchInvestimentos ABORTED - Auth not ready or no user.');
        setLoading(false);
        return;
    }
    console.log('[fetchInvestimentos] Starting to fetch investments');
    setLoading(true);
    setError(null);
    try {
      const data = await investimentoAPI.getAll();
      console.log('[fetchInvestimentos] Data received:', data);
      setInvestimentos(data);
      console.log('[fetchInvestimentos] Investments updated successfully');
    } catch (error) {
      console.error("[fetchInvestimentos] Error fetching investments:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
      console.log('[fetchInvestimentos] Finished fetching investments');
    }
  };
  
  const addInvestimento = async (novoInvestimento: Omit<Investimento, "_id">) => {
    console.log('[addInvestimento] Adding new investment:', novoInvestimento);
    try {
      const data = await investimentoAPI.create(novoInvestimento);
      console.log('[addInvestimento] Created successfully:', data);
      setInvestimentos((prev) => [...prev, data]);
      console.log('[addInvestimento] State updated with new investment');
    } catch (error) {
      console.error("[addInvestimento] Error adding investment:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      throw error;
    }
  };
  
  const editInvestimento = async (id: string, updatedInvestimento: Partial<Investimento>) => {
    console.log('[editInvestimento] Editing investment ID:', id, 'with data:', updatedInvestimento);
    try {
      const data = await investimentoAPI.update(id, updatedInvestimento);
      console.log('[editInvestimento] Update successful, received:', data);
      setInvestimentos((prev) =>
        prev.map((inv) => (inv._id === id ? { ...inv, ...data } : inv))
      );
      console.log('[editInvestimento] State updated successfully');
    } catch (error) {
      console.error("[editInvestimento] Error editing investment:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      throw error;
    }
  };
  
  const deleteInvestimento = async (id: string) => {
    console.log('[deleteInvestimento] Deleting investment ID:', id);
    try {
      await investimentoAPI.delete(id);
      console.log('[deleteInvestimento] Deletion successful');
      setInvestimentos((prev) => prev.filter((inv) => inv._id !== id));
      console.log('[deleteInvestimento] State updated successfully');
    } catch (error) {
      console.error("[deleteInvestimento] Error deleting investment:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      throw error;
    }
  };

  const fetchMetas = async () => {
    console.log('[FinanceContext] Attempting to call fetchMetas. AuthState:', { isAuthReady, user: !!user });
    if (!isAuthReady || !user) {
        console.log('[FinanceContext] fetchMetas ABORTED - Auth not ready or no user.');
        setLoading(false);
        return;
    }
    console.log('[fetchMetas] Starting to fetch goals');
    setLoading(true);
    setError(null);
    try {
      const data = await metaAPI.getAll();
      console.log('[fetchMetas] Data received:', data);
      const normalizedMetas = data.map(meta => ({
        ...meta,
        concluida: meta && meta.valor_atual !== undefined && meta.valor_total !== undefined ? meta.valor_atual >= meta.valor_total : false
      }));
      setMetas(normalizedMetas);
      console.log('[fetchMetas] Goals updated successfully');
    } catch (error) {
      console.error("[fetchMetas] Error fetching goals:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
      console.log('[fetchMetas] Finished fetching goals');
    }
  };

  const addMeta = async (novaMeta: Omit<Meta, "_id" | "createdAt">) => {
    console.log('[addMeta] Adding new goal:', novaMeta);
    try {
      const data = await metaAPI.create(novaMeta);
      console.log('[addMeta] Created successfully:', data);
      setMetas((prev) => [...prev, data]);
      console.log('[addMeta] State updated with new goal');
    } catch (error) {
      console.error("[addMeta] Error adding goal:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      throw error;
    }
  };

  const editMeta = async (id: string, updatedMeta: Partial<Meta>) => {
    console.log('[editMeta] Editing goal ID:', id, 'with data:', updatedMeta);
    try {
      const data = await metaAPI.update(id, updatedMeta);
      console.log('[editMeta] Update successful, received:', data);
      setMetas((prev) =>
        prev.map((m) => (m._id === id ? { ...m, ...data } : m))
      );
      console.log('[editMeta] State updated successfully');
    } catch (error) {
      console.error("[editMeta] Error editing goal:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      throw error;
    }
  };

  const deleteMeta = async (id: string) => {
    console.log('[deleteMeta] Deleting goal ID:', id);
    try {
      await metaAPI.delete(id);
      console.log('[deleteMeta] Deletion successful');
      setMetas((prev) => prev.filter((m) => m._id !== id));
      console.log('[deleteMeta] State updated successfully');
    } catch (error) {
      console.error("[deleteMeta] Error deleting goal:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
      throw error;
    }
  };

  const fetchData = useCallback(async () => {
    const fetchDataCallId = Date.now();
    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 segundos de cache
    
    // Verificar se os dados ainda estão frescos
    if (isDataFresh && (now - lastFetchTime) < CACHE_DURATION) {
      console.log(`[fetchData CALL ${fetchDataCallId}] 🔄 CACHE HIT - Dados ainda frescos (${Math.round((now - lastFetchTime) / 1000)}s atrás). Pulando fetch.`);
      return;
    }
    
    console.log(`[fetchData CALL ${fetchDataCallId}] 🚀 Starting to fetch all data. Path: ${router.pathname}, AuthReady: isAuthReady=${isAuthReady}, user=${!!user}`);
    if (!isAuthReady || !user) {
      console.log(`[fetchData CALL ${fetchDataCallId}] ❌ ABORTED - Auth not ready or no user. Path: ${router.pathname}`);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[fetchData CALL ${fetchDataCallId}] 📡 Making parallel API calls...`);
      const [transacoes, investimentos, metasData] = await Promise.all([
        transacaoAPI.getAll(),
        investimentoAPI.getAll(),
        metaAPI.getAll()
      ]);
      
      console.log(`[fetchData CALL ${fetchDataCallId}] 📊 Data received:`, { transacoes, investimentos, metas: metasData });
    setTransactions(transacoes.map(normalizeTransacao));
    setInvestimentos(investimentos);
    setMetas(metasData.map(meta => ({
      ...meta,
      concluida: meta && meta.valor_atual !== undefined && meta.valor_total !== undefined ? meta.valor_atual >= meta.valor_total : false
    })));
    setLastFetchTime(now);
    setIsDataFresh(true);
    console.log(`[fetchData CALL ${fetchDataCallId}] ✅ All data updated successfully. Cache válido por ${CACHE_DURATION/1000}s. Path: ${router.pathname}`);
    } catch (error) {
      const err = error as Error;
      const apiError = error as { response?: { data?: { message?: string } } };
      console.error(`[fetchData CALL ${fetchDataCallId}] ❌ Error fetching data:`, error, "Path:", router.pathname);
      setError(apiError.response?.data?.message || err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
      console.log(`[fetchData CALL ${fetchDataCallId}] 🏁 Finished fetching all data. Path: ${router.pathname}`);
    }
  }, [isAuthReady, user, router.pathname, isDataFresh, lastFetchTime]);

  // Debounce para evitar múltiplas chamadas
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const effectId = Date.now();
    console.log(`[FinanceProvider EFFECT ${effectId}] Triggered. Path: ${router.pathname}, RouterReady: ${router.isReady}, AuthReady: ${isAuthReady}, User: ${!!user}`);
    
    // Limpar timer anterior se existir
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Lista de rotas que precisam de dados financeiros
    const protectedRoutes = ['/dashboard', '/investimentos', '/metas', '/transacoes', '/configuracoes', '/profile', '/assinaturas', '/milhas'];
    const isProtectedRoute = protectedRoutes.some(route => router.pathname.startsWith(route));
    
    console.log(`[FinanceProvider EFFECT ${effectId}] DEBUG - isProtectedRoute: ${isProtectedRoute}, router.isReady: ${router.isReady}`);
    console.log(`[FinanceProvider EFFECT ${effectId}] DEBUG - isAuthReady: ${isAuthReady}, user exists: ${!!user}`);
    
    if (router.isReady && isProtectedRoute && isAuthReady && user) {
      console.log(`[FinanceProvider EFFECT ${effectId}] ⏱️ Setting debounce timer (500ms) for fetchData...`);
      
      const timer = setTimeout(() => {
        console.log(`[FinanceProvider EFFECT ${effectId}] ✅ DEBOUNCE COMPLETE - CALLING fetchData(). User ID: ${user.uid}`);
        fetchData();
      }, 500); // 500ms de debounce
      
      setDebounceTimer(timer);
    } else {
      console.log(`[FinanceProvider EFFECT ${effectId}] ❌ SKIPPING fetchData - Path: ${router.pathname}, RouterReady: ${router.isReady}, isProtectedRoute: ${isProtectedRoute}, AuthReady: ${isAuthReady}, User: ${!!user}`);
      setLoading(false);
    }
    
    // Cleanup
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [isAuthReady, user?.uid, router.isReady, router.pathname, fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        investimentos,
        metas,
        loading,
        error,
        fetchTransactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        fetchInvestimentos,
        addInvestimento,
        editInvestimento,
        deleteInvestimento,
        fetchMetas,
        addMeta,
        editMeta,
        deleteMeta,
        fetchData,
        getMetas: metaAPI.getAll,
      }}
    >
      {/* O console.log foi removido daqui para corrigir o erro de ReactNode */}
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    console.error("[useFinance] Must be used within a FinanceProvider");
    throw new Error("useFinance deve ser usado dentro de um FinanceProvider");
  }
  return context;
};