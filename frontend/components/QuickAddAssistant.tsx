/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { X } from 'lucide-react';
import { metaAPI } from '../services/api';
import { Meta, Prioridade } from '../types/Meta';

interface QuickAddAssistantProps {
  onClose: () => void;
  onSuccess?: (type: 'goal', data: Record<string, string | number>) => void;
}

interface FormStep {
  question: string;
  field: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  optional?: boolean;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string | number) => string | null;
  };
}

interface FormModel {
  title: string;
  steps: FormStep[];
}

interface ValidationError {
  field: string;
  message: string;
}

export const QuickAddAssistant = ({ 
  onClose,
  onSuccess
}: QuickAddAssistantProps) => {
  const [activeTab] = useState<'goal'>('goal');
  const [formData, setFormData] = useState<Record<string, string | number>>({});
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const formModels: Record<'goal', FormModel> = {
    goal: {
      title: "Adicionar Meta",
      steps: [
        {
          question: "Qual o nome da sua meta?",
          field: "meta",
          type: "text",
          validation: {
            required: true,
            minLength: 3,
            maxLength: 50,
            custom: (value) => {
              if (!value || (value as string).trim().length < 3) return "Nome da meta deve ter pelo menos 3 caracteres";
              if ((value as string).trim().length > 50) return "Nome da meta muito longo";
              return null;
            }
          }
        },
        {
          question: "Qual o valor total necessário?",
          field: "valor_total",
          type: "number",
          validation: {
            required: true,
            min: 1,
            max: 10000000,
            custom: (value) => {
              if (!value || (value as number) <= 0) return "Valor deve ser maior que zero";
              if ((value as number) > 10000000) return "Valor muito alto";
              return null;
            }
          }
        },
        {
          question: "Quando deseja alcançar?",
          field: "data_conclusao",
          type: "date",
          validation: {
            required: true,
            custom: (value) => {
              if (!value) return "Data é obrigatória";
              const selectedDate = new Date(value as string);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (selectedDate < today) return "Data não pode ser no passado";
              if (selectedDate > new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000)) {
                return "Data muito distante (máximo 1 ano)";
              }
              return null;
            }
          }
        },
        {
          question: "Qual a categoria?",
          field: "categoria",
          type: "select",
          options: ["Viagem", "Educação", "Casa", "Carro", "Investimento", "Outros"],
          optional: true
        }
      ]
    }
  };

  const currentStep = formModels[activeTab].steps[step - 1];

  const validateField = (value: string | number | undefined, validation?: FormStep['validation']): string | null => {
    if (!validation) return null;
    if (validation.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return "Este campo é obrigatório";
    }
    if (!validation.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return null;
    }
    if (validation.min !== undefined && Number(value) < validation.min) return `Valor mínimo é ${validation.min}`;
    if (validation.max !== undefined && Number(value) > validation.max) return `Valor máximo é ${validation.max}`;
    if (validation.minLength && typeof value === 'string' && value.length < validation.minLength) return `Mínimo de ${validation.minLength} caracteres`;
    if (validation.maxLength && typeof value === 'string' && value.length > validation.maxLength) return `Máximo de ${validation.maxLength} caracteres`;
    if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) return "Formato inválido";
    if (validation.custom && value !== undefined) return validation.custom(value);
    return null;
  };

  const validateCurrentField = (): boolean => {
    const currentValue = formData[currentStep.field];
    const error = validateField(currentValue, currentStep.validation);
    if (error) {
      setValidationErrors([{ field: currentStep.field, message: error }]);
      return false;
    } else {
      setValidationErrors([]);
      return true;
    }
  };

  const getCurrentFieldError = (): string | null => {
    const error = validationErrors.find(e => e.field === currentStep.field);
    return error ? error.message : null;
  };

  const handleNext = () => {
    if (!validateCurrentField()) return;
    if (step < formModels[activeTab].steps.length) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!validateCurrentField()) return;
    setIsLoading(true);
    setError('');
    try {
      const metaData: Omit<Meta, '_id' | 'concluida' | 'createdAt'> = {
        meta: String(formData.meta || ''),
        descricao: String(formData.descricao || ''),
        valor_total: Number(formData.valor_total || 0),
        valor_atual: Number(formData.valor_atual || 0),
        data_conclusao: String(formData.data_conclusao || ''),
        userId: String(formData.userId || ''),
        categoria: formData.categoria ? String(formData.categoria) : undefined,
        prioridade: formData.prioridade ? String(formData.prioridade) as Prioridade : undefined
      };
      const result = await metaAPI.create(metaData);
      if (onSuccess && result) onSuccess('goal', result as unknown as Record<string, string | number>);
      onClose();
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setStep(1);
    setError('');
    setValidationErrors([]);
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData({...formData, [field]: value});
    setValidationErrors(prev => prev.filter(e => e.field !== field));
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-white">
            {formModels[activeTab].title}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {currentStep.question}
            {currentStep.validation?.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {currentStep.type === 'select' ? (
            <select
              value={String(formData[currentStep.field] || '')}
              onChange={(e) => handleFieldChange(currentStep.field, e.target.value)}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white ${getCurrentFieldError() ? 'border-red-500' : ''}`}
            >
              <option value="">Selecione...</option>
              {currentStep.options && currentStep.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : currentStep.type === 'date' ? (
            <input
              type="date"
              value={String(formData[currentStep.field] || '')}
              onChange={(e) => handleFieldChange(currentStep.field, e.target.value)}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white ${getCurrentFieldError() ? 'border-red-500' : ''}`}
            />
          ) : (
            <input
              type={currentStep.type}
              value={String(formData[currentStep.field] || '')}
              onChange={(e) => handleFieldChange(currentStep.field, e.target.value)}
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white ${getCurrentFieldError() ? 'border-red-500' : ''}`}
              placeholder={currentStep.question}
            />
          )}
          {getCurrentFieldError() && (
            <p className="text-red-500 text-sm mt-1">{getCurrentFieldError()}</p>
          )}
        </div>

        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300"
              disabled={isLoading}
            >
              Voltar
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isLoading}
            className={`px-4 py-2 bg-indigo-600 text-white rounded-lg ml-auto ${isLoading ? 'opacity-50' : ''}`}
          >
            {isLoading ? 'Processando...' : step < formModels[activeTab].steps.length ? 'Próximo' : 'Concluir'}
          </button>
        </div>
      </div>
    </div>
  );
};