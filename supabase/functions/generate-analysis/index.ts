import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SECTION_PROMPTS: Record<string, string> = {
  panorama: `Você é um analista de mídia especializado. Analise os dados agregados do período e forneça um panorama executivo em português brasileiro.
Foque em:
- Visão geral quantitativa (volume de matérias, valoração)
- Análise de sentimento predominante
- Principais veículos e narrativas
- Tendências observadas e alertas importantes
Seja conciso mas completo. Use linguagem profissional.`,

  metricas: `Você é um analista de mídia. Analise os KPIs apresentados e forneça insights executivos em português brasileiro.
Foque em:
- Interpretação dos indicadores principais
- Comparação e proporções relevantes
- Alertas sobre métricas fora do padrão
- Recomendações baseadas nos números`,

  timeline: `Você é um analista de mídia. Analise a evolução temporal dos dados e forneça insights em português brasileiro.
Foque em:
- Tendências de crescimento ou queda
- Picos e vales no período
- Sazonalidades identificadas
- Projeções e padrões`,

  midia: `Você é um analista de mídia. Analise a distribuição por tipos de mídia e forneça insights em português brasileiro.
Foque em:
- Dominância de canais
- Oportunidades em mídias subexploradas
- Correlação entre mídia e sentimento
- Estratégias por canal`,

  veiculos: `Você é um analista de mídia. Analise o desempenho por veículos de comunicação e forneça insights em português brasileiro.
Foque em:
- Veículos mais influentes
- Concentração ou diversificação
- Qualidade vs quantidade
- Relacionamento com veículos-chave`,

  geografia: `Você é um analista de mídia. Analise a distribuição geográfica da cobertura e forneça insights em português brasileiro.
Foco em:
- Estados e regiões com maior presença
- Lacunas geográficas
- Correlação entre região e sentimento
- Estratégias regionais`,

  cruzamentos: `Você é um analista de mídia. Analise os cruzamentos de dados e correlações e forneça insights em português brasileiro.
Foque em:
- Correlações significativas identificadas
- Padrões entre variáveis cruzadas
- Insights não óbvios
- Recomendações estratégicas`,

  sentimento: `Você é um analista de mídia. Analise a distribuição de sentimento e forneça insights em português brasileiro.
Foque em:
- Balanço positivo/negativo
- Tendências de sentimento
- Fontes de crises ou oportunidades
- Ações recomendadas`,

  fontes_temas: `Você é um analista de mídia. Analise as fontes citadas e temas abordados e forneça insights em português brasileiro.
Foque em:
- Narrativas dominantes
- Fontes mais influentes
- Temas emergentes
- Gestão de narrativa recomendada`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sectionId, aggregatedData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não está configurada");
    }

    const systemPrompt = SECTION_PROMPTS[sectionId] || SECTION_PROMPTS.panorama;
    
    const userPrompt = `Analise os seguintes dados agregados do período e gere uma análise textual completa:

${JSON.stringify(aggregatedData, null, 2)}

Forneça uma análise de 3-5 parágrafos, destacando os pontos mais relevantes. Use formatação markdown se necessário.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar análise" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content || "Não foi possível gerar a análise.";

    return new Response(
      JSON.stringify({ analysis: analysisText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na função generate-analysis:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
