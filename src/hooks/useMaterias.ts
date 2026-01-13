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
  [key: string]: unknown;
}

interface FetchMateriasResponse {
  data: Materia[];
  total: number;
}

async function fetchMaterias(): Promise<Materia[]> {
  const { data, error } = await supabase.functions.invoke('fetch-materias');
  
  if (error) {
    throw new Error(error.message);
  }
  
  const response = data as FetchMateriasResponse;
  return response.data || [];
}

export function useMaterias() {
  return useQuery({
    queryKey: ['materias'],
    queryFn: fetchMaterias,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
