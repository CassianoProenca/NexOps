package com.nexops.api.shared.ai.infrastructure.web;

import com.nexops.api.shared.ai.domain.ports.in.AiCompletionUseCase;
import com.nexops.api.shared.security.SecurityContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "AI-assisted features per tenant")
public class AiController {

    private final AiCompletionUseCase aiCompletionUseCase;

    @Operation(summary = "Suggest 1-3 self-service solutions for an end-user problem description")
    @PostMapping("/suggest-solutions")
    public SuggestSolutionsResponse suggestSolutions(@RequestBody SuggestSolutionsRequest req) {
        var caller = SecurityContext.get();
        String system = """
                Você é um assistente de TI de autoatendimento. Dado um problema descrito pelo usuário final, \
                sugira de 1 a 3 soluções simples e práticas que ele pode tentar sem precisar de conhecimento técnico avançado. \
                As soluções NÃO devem envolver comandos de terminal, linhas de comando ou acesso a configurações avançadas do sistema. \
                Responda APENAS com um JSON no formato:
                {"solutions": ["Solução 1", "Solução 2", "Solução 3"]}
                Inclua apenas as soluções aplicáveis (pode ser 1, 2 ou 3). Sem texto adicional fora do JSON.""";
        String raw = aiCompletionUseCase.complete(caller.tenantId(), system, req.problem());
        var solutions = parseSolutions(raw);
        return new SuggestSolutionsResponse(solutions);
    }

    @Operation(summary = "Generate a prioritized summary of the technician's open tickets")
    @PostMapping("/technician-summary")
    public TechnicianSummaryResponse technicianSummary(@RequestBody TechnicianSummaryRequest req) {
        var caller = SecurityContext.get();
        String system = """
                Você é um assistente de suporte técnico de TI. Dado um resumo dos chamados abertos de um técnico, \
                organize e priorize a ordem de atendimento explicando brevemente o motivo de cada prioridade. \
                Considere urgência, tempo de espera e nível de SLA. \
                Responda em português, de forma concisa e objetiva. Sem marcações excessivas.""";
        String prompt = "Chamados abertos:\n" + req.ticketsSummary();
        String result = aiCompletionUseCase.complete(caller.tenantId(), system, prompt);
        return new TechnicianSummaryResponse(result);
    }

    @Operation(summary = "Generate a personalized governance report in natural language")
    @PostMapping("/generate-report")
    public GenerateReportResponse generateReport(@RequestBody GenerateReportRequest req) {
        var caller = SecurityContext.get();
        String system = """
                Você é um assistente de governança de TI da NexOps (NexOps AI Analyst). \
                Seu objetivo é analisar os dados de métricas do helpdesk e responder às solicitações do gestor de TI. \
                Se o gestor pedir um relatório, gere um relatório executivo claro. Se ele fizer uma pergunta específica sobre os dados, responda diretamente à pergunta. \
                Destaque pontos críticos, tendências e recomendações acionáveis quando apropriado. \
                Seja direto, objetivo e profissional. Responda em português. Sem formatação excessiva.""";
        String prompt = "Período: " + req.period() + "\nDados ou Pergunta do Gestor:\n" + req.metricsData();
        String result = aiCompletionUseCase.complete(caller.tenantId(), system, prompt);
        return new GenerateReportResponse(result);
    }

    @Operation(summary = "Analyze user description and suggest title, category, department and solutions")
    @PostMapping("/analyze-ticket")
    public AnalyzeTicketResponse analyzeTicket(@RequestBody AnalyzeTicketRequest req) {
        var caller = SecurityContext.get();
        String system = """
                Você é um assistente inteligente de Helpdesk da NexOps. Sua missão é ajudar o usuário a abrir um chamado. \
                Analise a descrição do problema e extraia:
                1. Um título curto e objetivo.
                2. O Departamento de Origem (onde o usuário trabalha). Tente identificar pelo contexto (ex: "estou no RH") ou peça ao usuário. \
                3. O Tipo de Problema (categoria técnica do erro).
                4. Sugestões de autoatendimento.

                Você receberá uma lista de Departamentos e Tipos de Problemas válidos. \
                Responda APENAS com um JSON no formato:
                {
                  "suggestedTitle": "Título Curto",
                  "suggestedDepartmentId": "ID do departamento de ORIGEM do usuário ou null",
                  "suggestedProblemTypeId": "ID do tipo de problema ou null",
                  "solutions": ["Solução 1", "Solução 2"],
                  "nextQuestion": "Uma pergunta amigável pedindo o que falta (geralmente o departamento de trabalho ou mais detalhes)"
                }
                Se o usuário não disser onde trabalha, pergunte educadamente. Sem texto adicional fora do JSON.""";

        StringBuilder prompt = new StringBuilder("Descrição do Usuário: " + req.description() + "\n\n");
        prompt.append("Departamentos Disponíveis (ID: Nome):\n");
        req.departments().forEach(d -> prompt.append(d.id()).append(": ").append(d.name()).append("\n"));
        prompt.append("\nTipos de Problemas Disponíveis (ID: Nome):\n");
        req.problemTypes().forEach(p -> prompt.append(p.id()).append(": ").append(p.name()).append("\n"));

        String raw = aiCompletionUseCase.complete(caller.tenantId(), system, prompt.toString());
        return parseAnalyzeResponse(raw);
    }

    // ─── Records ─────────────────────────────────────────────────────────────

    public record AnalyzeTicketRequest(
        String description,
        List<IdNamePair> departments,
        List<IdNamePair> problemTypes
    ) {}

    public record IdNamePair(String id, String name) {}

    public record AnalyzeTicketResponse(
        String suggestedTitle,
        String suggestedDepartmentId,
        String suggestedProblemTypeId,
        List<String> solutions,
        String nextQuestion
    ) {}

    public record SuggestSolutionsRequest(String problem) {}
    public record SuggestSolutionsResponse(List<String> solutions) {}

    public record TechnicianSummaryRequest(String ticketsSummary) {}
    public record TechnicianSummaryResponse(String summary) {}

    public record GenerateReportRequest(String period, String metricsData) {}
    public record GenerateReportResponse(String report) {}

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private AnalyzeTicketResponse parseAnalyzeResponse(String raw) {
        try {
            // Simplified JSON extraction for AnalyzeTicketResponse
            String clean = raw.trim();
            if (clean.startsWith("```json")) clean = clean.substring(7);
            if (clean.endsWith("```")) clean = clean.substring(0, clean.length() - 3);
            clean = clean.trim();

            // Extract values using regex to avoid heavy JSON parser dependency in this layer
            String title = extractJsonValue(clean, "suggestedTitle");
            String deptId = extractJsonValue(clean, "suggestedDepartmentId");
            String typeId = extractJsonValue(clean, "suggestedProblemTypeId");
            String nextQ = extractJsonValue(clean, "nextQuestion");
            List<String> solutions = parseSolutions(clean);

            return new AnalyzeTicketResponse(title, deptId, typeId, solutions, nextQ);
        } catch (Exception e) {
            return new AnalyzeTicketResponse("Novo Chamado", null, null, List.of(), "Pode me dar mais detalhes?");
        }
    }

    private String extractJsonValue(String json, String key) {
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\"" + key + "\":\\s*\"?([^\",}]+)\"?");
        java.util.regex.Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            String val = matcher.group(1).trim();
            if (val.equalsIgnoreCase("null")) return null;
            return val.replaceAll("^\"|\"$", "");
        }
        return null;
    }

    private List<String> parseSolutions(String raw) {
        try {
            // Simple JSON extraction — avoids pulling in ObjectMapper for a trivial parse
            int start = raw.indexOf('[');
            int end   = raw.lastIndexOf(']');
            if (start < 0 || end < 0) return List.of(raw.trim());
            String array = raw.substring(start + 1, end);
            return java.util.Arrays.stream(array.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"))
                    .map(s -> s.trim().replaceAll("^\"|\"$", "").replace("\\\"", "\""))
                    .filter(s -> !s.isBlank())
                    .toList();
        } catch (Exception e) {
            return List.of(raw.trim());
        }
    }
}
