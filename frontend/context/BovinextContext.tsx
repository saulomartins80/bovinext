import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Animal, Manejo, Producao, Venda } from '../types/bovinext.types';

// Interface do contexto conforme especificação BOVINEXT
interface BovinextContextType {
  // Dados principais
  animais: Animal[];
  manejos: Manejo[];
  producoes: Producao[];
  vendas: Venda[];
  
  // KPIs do dashboard
  kpis: {
    totalAnimais: number;
    receitaMensal: number;
    gmdMedio: number;
    lucroMensal: number;
    precoArroba: number;
    alertasAtivos: number;
  };
  
  // Estados de carregamento
  loading: {
    animais: boolean;
    manejos: boolean;
    producoes: boolean;
    vendas: boolean;
  };
  
  // Métodos CRUD
  addAnimal: (animal: Omit<Animal, 'id'>) => Promise<void>;
  updateAnimal: (id: string, animal: Partial<Animal>) => Promise<void>;
  deleteAnimal: (id: string) => Promise<void>;
  
  addManejo: (manejo: Omit<Manejo, 'id'>) => Promise<void>;
  updateManejo: (id: string, manejo: Partial<Manejo>) => Promise<void>;
  deleteManejo: (id: string) => Promise<void>;
  
  addProducao: (producao: Omit<Producao, 'id'>) => Promise<void>;
  updateProducao: (id: string, producao: Partial<Producao>) => Promise<void>;
  deleteProducao: (id: string) => Promise<void>;
  
  addVenda: (venda: Omit<Venda, 'id'>) => Promise<void>;
  updateVenda: (id: string, venda: Partial<Venda>) => Promise<void>;
  deleteVenda: (id: string) => Promise<void>;
  
  // Métodos de filtro e busca
  filterAnimais: (filters: any) => Animal[];
  filterManejos: (filters: any) => Manejo[];
  filterProducoes: (filters: any) => Producao[];
  filterVendas: (filters: any) => Venda[];
  
  // Métodos de atualização
  refreshData: () => Promise<void>;
  calculateKPIs: () => void;
}

const BovinextContext = createContext<BovinextContextType | undefined>(undefined);

interface BovinextProviderProps {
  children: ReactNode;
}

export function BovinextProvider({ children }: BovinextProviderProps) {
  // Estados principais
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [manejos, setManejos] = useState<Manejo[]>([]);
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  
  // KPIs calculados
  const [kpis, setKpis] = useState({
    totalAnimais: 0,
    receitaMensal: 0,
    gmdMedio: 0,
    lucroMensal: 0,
    precoArroba: 315.80,
    alertasAtivos: 0
  });
  
  // Estados de carregamento
  const [loading, setLoading] = useState({
    animais: false,
    manejos: false,
    producoes: false,
    vendas: false
  });

  // Inicialização com dados mock (será substituído pela integração Supabase)
  useEffect(() => {
    initializeMockData();
  }, []);

  // Recalcular KPIs quando dados mudarem
  useEffect(() => {
    calculateKPIs();
  }, [animais, manejos, producoes, vendas]);

  const initializeMockData = async () => {
    // Mock data para desenvolvimento
    const mockAnimais: Animal[] = [
      {
        id: '1',
        brinco: 'BV001',
        categoria: 'BOI',
        peso: 485,
        idade: 36,
        raca: 'Nelore',
        status: 'ATIVO',
        lote: 'Lote A',
        pasto: 'Pasto 1',
        dataEntrada: new Date('2021-03-15'),
        valorCompra: 2500,
        custoAcumulado: 850,
        previsaoVenda: new Date('2024-12-15'),
        observacoes: 'Animal em excelente estado'
      },
      {
        id: '2',
        brinco: 'BV002',
        categoria: 'NOVILHO',
        peso: 380,
        idade: 24,
        raca: 'Angus',
        status: 'ATIVO',
        lote: 'Lote B',
        pasto: 'Pasto 2',
        dataEntrada: new Date('2022-06-10'),
        valorCompra: 2200,
        custoAcumulado: 650,
        observacoes: 'Bom ganho de peso'
      }
    ];

    const mockManejos: Manejo[] = [
      {
        id: '1',
        tipo: 'VACINACAO',
        animais: ['BV001', 'BV002', 'BV003'],
        data: new Date('2024-12-15'),
        produto: 'Vacina Aftosa',
        dosagem: '5ml por animal',
        custo: 450.00,
        responsavel: 'Dr. João Silva',
        observacoes: 'Aplicação realizada conforme protocolo',
        proximaAplicacao: new Date('2025-09-08'),
        status: 'REALIZADO'
      }
    ];

    const mockProducoes: Producao[] = [
      {
        id: '1',
        tipo: 'ENGORDA',
        animal: 'BV001',
        data: new Date('2024-09-01'),
        peso: 485,
        ganhoMedio: 1.2,
        custoProducao: 850,
        receita: 2400,
        margemLucro: 65,
        observacoes: 'Excelente ganho de peso'
      },
      {
        id: '2',
        tipo: 'ENGORDA',
        animal: 'BV002',
        data: new Date('2024-09-01'),
        peso: 380,
        ganhoMedio: 1.1,
        custoProducao: 650,
        receita: 2000,
        margemLucro: 60,
        observacoes: 'Bom ganho de peso'
      },
      {
        id: '3',
        tipo: 'ENGORDA',
        animal: 'BV003',
        data: new Date('2024-09-01'),
        peso: 420,
        ganhoMedio: 1.2,
        custoProducao: 750,
        receita: 2200,
        margemLucro: 65,
        observacoes: 'Bom ganho de peso'
      }
    ];

    const mockVendas: Venda[] = [
      {
        id: '1',
        animais: ['BV001', 'BV002', 'BV003'],
        comprador: 'Frigorífico Central',
        tipoVenda: 'FRIGORIFICO',
        pesoTotal: 1650,
        precoArroba: 315.80,
        valorTotal: 347370.00,
        dataVenda: new Date('2024-12-10'),
        dataEntrega: new Date('2024-12-15'),
        impostos: {
          funrural: 6947.40,
          icms: 41684.40,
          outros: 3473.70
        },
        lucroLiquido: 295264.50,
        observacoes: 'Animal pronto para abate',
        status: 'ENTREGUE'
      }
    ];

    setAnimais(mockAnimais);
    setManejos(mockManejos);
    setProducoes(mockProducoes);
    setVendas(mockVendas);
  };

  const calculateKPIs = () => {
    const totalAnimais = animais.filter(a => a.status === 'ATIVO').length;
    const receitaMensal = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
    const lucroMensal = vendas.reduce((acc, v) => acc + v.lucroLiquido, 0);
    const gmdMedio = producoes.length > 0 
      ? producoes.reduce((acc, p) => acc + (p.ganhoMedio || 0), 0) / producoes.length 
      : 1.12;
    const alertasAtivos = manejos.filter(m => 
      new Date(m.data) <= new Date() && !m.proximaAplicacao
    ).length;

    setKpis({
      totalAnimais,
      receitaMensal,
      gmdMedio,
      lucroMensal,
      precoArroba: 315.80, // Será obtido via API CEPEA
      alertasAtivos
    });
  };

  // Métodos CRUD para Animais
  const addAnimal = async (animalData: Omit<Animal, 'id'>) => {
    setLoading(prev => ({ ...prev, animais: true }));
    try {
      const newAnimal: Animal = {
        ...animalData,
        id: Date.now().toString() // Será substituído por UUID do Supabase
      };
      setAnimais(prev => [...prev, newAnimal]);
    } finally {
      setLoading(prev => ({ ...prev, animais: false }));
    }
  };

  const updateAnimal = async (id: string, animalData: Partial<Animal>) => {
    setLoading(prev => ({ ...prev, animais: true }));
    try {
      setAnimais(prev => prev.map(animal => 
        animal.id === id ? { ...animal, ...animalData } : animal
      ));
    } finally {
      setLoading(prev => ({ ...prev, animais: false }));
    }
  };

  const deleteAnimal = async (id: string) => {
    setLoading(prev => ({ ...prev, animais: true }));
    try {
      setAnimais(prev => prev.filter(animal => animal.id !== id));
    } finally {
      setLoading(prev => ({ ...prev, animais: false }));
    }
  };

  // Métodos CRUD para Manejos
  const addManejo = async (manejoData: Omit<Manejo, 'id'>) => {
    setLoading(prev => ({ ...prev, manejos: true }));
    try {
      const newManejo: Manejo = {
        ...manejoData,
        id: Date.now().toString()
      };
      setManejos(prev => [...prev, newManejo]);
    } finally {
      setLoading(prev => ({ ...prev, manejos: false }));
    }
  };

  const updateManejo = async (id: string, manejoData: Partial<Manejo>) => {
    setLoading(prev => ({ ...prev, manejos: true }));
    try {
      setManejos(prev => prev.map(manejo => 
        manejo.id === id ? { ...manejo, ...manejoData } : manejo
      ));
    } finally {
      setLoading(prev => ({ ...prev, manejos: false }));
    }
  };

  const deleteManejo = async (id: string) => {
    setLoading(prev => ({ ...prev, manejos: true }));
    try {
      setManejos(prev => prev.filter(manejo => manejo.id !== id));
    } finally {
      setLoading(prev => ({ ...prev, manejos: false }));
    }
  };

  // Métodos CRUD para Produção
  const addProducao = async (producaoData: Omit<Producao, 'id'>) => {
    setLoading(prev => ({ ...prev, producoes: true }));
    try {
      const newProducao: Producao = {
        ...producaoData,
        id: Date.now().toString()
      };
      setProducoes(prev => [...prev, newProducao]);
    } finally {
      setLoading(prev => ({ ...prev, producoes: false }));
    }
  };

  const updateProducao = async (id: string, producaoData: Partial<Producao>) => {
    setLoading(prev => ({ ...prev, producoes: true }));
    try {
      setProducoes(prev => prev.map(producao => 
        producao.id === id ? { ...producao, ...producaoData } : producao
      ));
    } finally {
      setLoading(prev => ({ ...prev, producoes: false }));
    }
  };

  const deleteProducao = async (id: string) => {
    setLoading(prev => ({ ...prev, producoes: true }));
    try {
      setProducoes(prev => prev.filter(producao => producao.id !== id));
    } finally {
      setLoading(prev => ({ ...prev, producoes: false }));
    }
  };

  // Métodos CRUD para Vendas
  const addVenda = async (vendaData: Omit<Venda, 'id'>) => {
    setLoading(prev => ({ ...prev, vendas: true }));
    try {
      const newVenda: Venda = {
        ...vendaData,
        id: Date.now().toString()
      };
      setVendas(prev => [...prev, newVenda]);
    } finally {
      setLoading(prev => ({ ...prev, vendas: false }));
    }
  };

  const updateVenda = async (id: string, vendaData: Partial<Venda>) => {
    setLoading(prev => ({ ...prev, vendas: true }));
    try {
      setVendas(prev => prev.map(venda => 
        venda.id === id ? { ...venda, ...vendaData } : venda
      ));
    } finally {
      setLoading(prev => ({ ...prev, vendas: false }));
    }
  };

  const deleteVenda = async (id: string) => {
    setLoading(prev => ({ ...prev, vendas: true }));
    try {
      setVendas(prev => prev.filter(venda => venda.id !== id));
    } finally {
      setLoading(prev => ({ ...prev, vendas: false }));
    }
  };

  // Métodos de filtro
  const filterAnimais = (filters: any) => {
    return animais.filter(animal => {
      if (filters.categoria && animal.categoria !== filters.categoria) return false;
      if (filters.status && animal.status !== filters.status) return false;
      if (filters.lote && animal.lote !== filters.lote) return false;
      if (filters.raca && animal.raca !== filters.raca) return false;
      if (filters.search && !animal.brinco.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  };

  const filterManejos = (filters: any) => {
    return manejos.filter(manejo => {
      if (filters.tipo && manejo.tipo !== filters.tipo) return false;
      if (filters.responsavel && manejo.responsavel !== filters.responsavel) return false;
      if (filters.search && !manejo.animais.some(a => a.toLowerCase().includes(filters.search.toLowerCase()))) return false;
      return true;
    });
  };

  const filterProducoes = (filters: any) => {
    return producoes.filter(producao => {
      if (filters.tipo && producao.tipo !== filters.tipo) return false;
      if (filters.animal && producao.animal !== filters.animal) return false;
      return true;
    });
  };

  const filterVendas = (filters: any) => {
    return vendas.filter(venda => {
      if (filters.tipoVenda && venda.tipoVenda !== filters.tipoVenda) return false;
      if (filters.comprador && venda.comprador !== filters.comprador) return false;
      if (filters.search && !venda.comprador.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  };

  const refreshData = async () => {
    // Recarregar todos os dados (implementar com Supabase)
    await initializeMockData();
  };

  const value: BovinextContextType = {
    // Dados
    animais,
    manejos,
    producoes,
    vendas,
    kpis,
    loading,
    
    // Métodos CRUD
    addAnimal,
    updateAnimal,
    deleteAnimal,
    addManejo,
    updateManejo,
    deleteManejo,
    addProducao,
    updateProducao,
    deleteProducao,
    addVenda,
    updateVenda,
    deleteVenda,
    
    // Métodos de filtro
    filterAnimais,
    filterManejos,
    filterProducoes,
    filterVendas,
    
    // Métodos de atualização
    refreshData,
    calculateKPIs
  };

  return (
    <BovinextContext.Provider value={value}>
      {children}
    </BovinextContext.Provider>
  );
}

export function useBovinext() {
  const context = useContext(BovinextContext);
  if (context === undefined) {
    throw new Error('useBovinext must be used within a BovinextProvider');
  }
  return context;
}
