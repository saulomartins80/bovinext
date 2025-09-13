import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface DairyEntry {
  id: string;
  date: string; // ISO date
  cowsMilked: number;
  liters: number;
  fat?: number; // %
  protein?: number; // %
  pricePerLiter?: number; // R$/L
  notes?: string;
}

const STORAGE_KEY = 'bovinext_dairy_entries';

export default function LeitePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DairyEntry[]>([]);
  const [form, setForm] = useState<Partial<DairyEntry>>({ date: new Date().toISOString().slice(0,10), cowsMilked: 0, liters: 0, fat: undefined, protein: undefined, pricePerLiter: undefined, notes: '' });
  const [filterMonth, setFilterMonth] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  }, [entries]);

  const filtered = useMemo(() => {
    if (!filterMonth) return entries;
    return entries.filter(e => e.date.startsWith(filterMonth));
  }, [entries, filterMonth]);

  const totals = useMemo(() => {
    const totalLiters = filtered.reduce((s, e) => s + (e.liters || 0), 0);
    const totalCows = filtered.reduce((s, e) => s + (e.cowsMilked || 0), 0);
    const avgPerCow = totalCows > 0 ? totalLiters / totalCows : 0;
    const avgFat = filtered.length ? (filtered.reduce((s, e) => s + (e.fat || 0), 0) / filtered.filter(e => e.fat != null).length || 0) : 0;
    const avgProtein = filtered.length ? (filtered.reduce((s, e) => s + (e.protein || 0), 0) / filtered.filter(e => e.protein != null).length || 0) : 0;
    const revenue = filtered.reduce((s, e) => s + (e.liters || 0) * (e.pricePerLiter || 0), 0);
    return { totalLiters, totalCows, avgPerCow, avgFat, avgProtein, revenue };
  }, [filtered]);

  const setNumber = (key: keyof DairyEntry) => (v: string) => {
    setForm(prev => ({ ...prev, [key]: v === '' ? undefined : Number(v) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.liters || !form.cowsMilked) return;
    const entry: DairyEntry = {
      id: crypto.randomUUID(),
      date: form.date,
      cowsMilked: Number(form.cowsMilked),
      liters: Number(form.liters),
      fat: form.fat != null ? Number(form.fat) : undefined,
      protein: form.protein != null ? Number(form.protein) : undefined,
      pricePerLiter: form.pricePerLiter != null ? Number(form.pricePerLiter) : undefined,
      notes: form.notes || ''
    };
    setEntries(prev => [entry, ...prev]);
    setForm({ date: new Date().toISOString().slice(0,10), cowsMilked: 0, liters: 0, fat: undefined, protein: undefined, pricePerLiter: undefined, notes: '' });
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Leite</h1>
        <p className="text-gray-600 dark:text-gray-400">Registre a ordenha diária e acompanhe métricas básicas. (Dados locais; integraremos ao Supabase depois.)</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Data</label>
          <input type="date" value={form.date || ''} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Vac as ordenhadas</label>
          <input type="number" min={0} value={form.cowsMilked ?? ''} onChange={e => setNumber('cowsMilked')(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Litros</label>
          <input type="number" min={0} step={0.01} value={form.liters ?? ''} onChange={e => setNumber('liters')(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gordura %</label>
          <input type="number" min={0} max={10} step={0.01} value={form.fat ?? ''} onChange={e => setNumber('fat')(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Proteína %</label>
          <input type="number" min={0} max={10} step={0.01} value={form.protein ?? ''} onChange={e => setNumber('protein')(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preço R$/L</label>
          <input type="number" min={0} step={0.01} value={form.pricePerLiter ?? ''} onChange={e => setNumber('pricePerLiter')(e.target.value)} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
        </div>
        <div className="md:col-span-6">
          <label className="block text-sm font-medium mb-1">Observações</label>
          <input type="text" value={form.notes || ''} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700" />
        </div>
        <div className="md:col-span-6 flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Adicionar</button>
        </div>
      </form>

      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-lg font-semibold">Métricas</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm">Mês (AAAA-MM):</label>
            <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="border rounded px-3 py-2 bg-white dark:bg-gray-700" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4 text-sm">
          <div>
            <div className="text-gray-500">Total de Leite (L)</div>
            <div className="text-xl font-bold">{totals.totalLiters.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">Vacas Ordenhadas</div>
            <div className="text-xl font-bold">{totals.totalCows}</div>
          </div>
          <div>
            <div className="text-gray-500">Média por Vaca (L)</div>
            <div className="text-xl font-bold">{totals.avgPerCow.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">Gordura Média (%)</div>
            <div className="text-xl font-bold">{(totals.avgFat || 0).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">Proteína Média (%)</div>
            <div className="text-xl font-bold">{(totals.avgProtein || 0).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500">Receita Estimada (R$)</div>
            <div className="text-xl font-bold">{totals.revenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Registros</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 dark:text-gray-300">
                <th className="p-2">Data</th>
                <th className="p-2">Vacas</th>
                <th className="p-2">Litros</th>
                <th className="p-2">Gordura %</th>
                <th className="p-2">Proteína %</th>
                <th className="p-2">Preço R$/L</th>
                <th className="p-2">Observações</th>
                <th className="p-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="p-2">{e.date}</td>
                  <td className="p-2">{e.cowsMilked}</td>
                  <td className="p-2">{e.liters.toFixed(2)}</td>
                  <td className="p-2">{e.fat != null ? e.fat.toFixed(2) : '-'}</td>
                  <td className="p-2">{e.protein != null ? e.protein.toFixed(2) : '-'}</td>
                  <td className="p-2">{e.pricePerLiter != null ? e.pricePerLiter.toFixed(2) : '-'}</td>
                  <td className="p-2">{e.notes || '-'}</td>
                  <td className="p-2 text-right">
                    <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-gray-500" colSpan={8}>Sem registros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


