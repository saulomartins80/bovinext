import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { metaAPI } from "../services/api";
import { Meta } from "../types";
import { useAuth } from '../context/AuthContext';

interface FinanceContextProps {
  metas: Meta[];
  loading: boolean;
  error: string | null;
  fetchMetas: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextProps>({} as FinanceContextProps);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthReady } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetas = async () => {
    if (!isAuthReady || !user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await metaAPI.getAll();
      setMetas(data);
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMetas();
  }, [isAuthReady, user?.uid]);

  return (
    <FinanceContext.Provider value={{ metas, loading, error, fetchMetas }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);