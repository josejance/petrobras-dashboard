import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { Sparkles, RefreshCw, Copy, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface AIAnalysisCardProps {
  sectionId: string;
  sectionLabel: string;
  aggregatedData: Record<string, unknown>;
}

export function AIAnalysisCard({ sectionId, sectionLabel, aggregatedData }: AIAnalysisCardProps) {
  const [analysisText, setAnalysisText] = useState<string>('');
  const [editedText, setEditedText] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const { generateAnalysis, isLoading } = useAIAnalysis();

  const handleGenerate = useCallback(async () => {
    try {
      const analysis = await generateAnalysis(sectionId, aggregatedData);
      setAnalysisText(analysis);
      setEditedText(analysis);
      setHasGenerated(true);
      toast.success('Análise gerada com sucesso!');
    } catch {
      // Error handling is done in the hook
    }
  }, [generateAnalysis, sectionId, aggregatedData]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(analysisText);
    toast.success('Texto copiado para a área de transferência!');
  }, [analysisText]);

  const handleEdit = useCallback(() => {
    setEditedText(analysisText);
    setIsEditing(true);
  }, [analysisText]);

  const handleSaveEdit = useCallback(() => {
    setAnalysisText(editedText);
    setIsEditing(false);
    toast.success('Edições salvas!');
  }, [editedText]);

  const handleCancelEdit = useCallback(() => {
    setEditedText(analysisText);
    setIsEditing(false);
  }, [analysisText]);

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Análise com IA - {sectionLabel}
          </CardTitle>
          
          {!hasGenerated && !isLoading && (
            <Button 
              onClick={handleGenerate} 
              size="sm"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Gerar Análise
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[70%]" />
          </div>
        )}

        {!isLoading && !hasGenerated && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Clique em "Gerar Análise" para criar um resumo analítico com IA baseado nos dados do período.
          </p>
        )}

        {!isLoading && hasGenerated && (
          <div className="space-y-4">
            {isEditing ? (
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[200px] text-sm"
                placeholder="Edite a análise..."
              />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {analysisText}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t">
              {isEditing ? (
                <>
                  <Button size="sm" variant="default" onClick={handleSaveEdit} className="gap-1">
                    <Check className="h-3 w-3" />
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit} className="gap-1">
                    <X className="h-3 w-3" />
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={handleEdit} className="gap-1">
                    <Pencil className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleGenerate} className="gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Regenerar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1">
                    <Copy className="h-3 w-3" />
                    Copiar
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
