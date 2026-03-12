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
                Você é um assistente de governança de TI. Dado os dados de métricas do helpdesk, \
                gere um relatório executivo claro e personalizado em português. \
                Destaque pontos críticos, tendências e recomendações acionáveis. \
                Seja direto e objetivo. Sem formatação excessiva.""";
        String prompt = "Período: " + req.period() + "\nMétricas:\n" + req.metricsData();
        String result = aiCompletionUseCase.complete(caller.tenantId(), system, prompt);
        return new GenerateReportResponse(result);
    }

    // ─── Records ─────────────────────────────────────────────────────────────

    public record SuggestSolutionsRequest(String problem) {}
    public record SuggestSolutionsResponse(List<String> solutions) {}

    public record TechnicianSummaryRequest(String ticketsSummary) {}
    public record TechnicianSummaryResponse(String summary) {}

    public record GenerateReportRequest(String period, String metricsData) {}
    public record GenerateReportResponse(String report) {}

    // ─── Helpers ─────────────────────────────────────────────────────────────

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
