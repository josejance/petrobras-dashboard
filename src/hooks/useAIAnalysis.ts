import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAIAnalysisReturn {
  generateAnalysis: (sectionId: string, aggregatedData: Record<string, unknown>) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export function useAIAnalysis(): UseAIAnalysisReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = useCallback(async (
    sectionId: string,
    aggregatedData: Record<string, unknown>
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ sectionId, aggregatedData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Erro ao gerar análise';
        
        if (response.status === 429) {
          toast.error('Limite de requisições excedido. Aguarde alguns minutos.');
        } else if (response.status === 402) {
          toast.error('Créditos insuficientes para gerar análise.');
        } else {
          toast.error(errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generateAnalysis, isLoading, error };
}
