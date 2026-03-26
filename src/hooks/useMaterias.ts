import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Materia {
  id_noticia: number;
  titulo: string;
  Data: string;
  Tipo: string;
  Mídia: string;
  Veiculo: string;
  Valor: string;
  publico: string | number;
  K: number | null;
  Vn: string | number | null;
  Teor: string;
  Avaliação: string;
  Abrangência: string;
  uf: string;
  Temas: string;
  Fonte: string;
  Destaque: string;
  VMN: string | number | null;
  Aderência: string;
  autor: string;
  tipo_autor: string;
  Narrativa: string;
  [key: string]: unknown;
}

interface FetchMateriasResponse {
  data: Materia[];
  total: number;
}

function getFriendlyErrorMessage(message: string) {
  if (
    message.includes('External data source is unavailable') ||
    message.includes('failed to lookup address information') ||
    message.includes('Name or service not known')
  ) {
    return 'The external data source is unavailable. Verify that the external project is active and that the configured URL is correct.';
  }

  if (message.includes('[object Object]') || message.includes('Unknown error')) {
    return 'Could not load data from the external source because the backend returned an invalid error response.';
  }

  return message;
}

async function fetchMaterias(): Promise<Materia[]> {
  const { data, error } = await supabase.functions.invoke('fetch-materias');

  if (error) {
    throw new Error(getFriendlyErrorMessage(error.message));
  }

  const response = data as FetchMateriasResponse;
  return response.data || [];
}

export function useMaterias() {
  return useQuery({
    queryKey: ['materias'],
    queryFn: fetchMaterias,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
