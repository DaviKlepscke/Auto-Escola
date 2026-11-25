package com.autoescola.integracoes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequest(
    @NotBlank(message = "O nome do aluno é obrigatório")
    String alunoNome,

    @NotNull(message = "O canal de envio é obrigatório (WHATSAPP ou EMAIL)")
    String canal, // WHATSAPP ou EMAIL

    @NotBlank(message = "O destinatário (telefone ou e-mail) é obrigatório")
    String destinatario,

    @NotBlank(message = "O tipo de evento é obrigatório (AULA_TEORICA, AULA_PRATICA, EXAME)")
    String tipoEvento,

    @NotBlank(message = "A data e hora do evento são obrigatórias")
    String dataHoraEvento,

    String detalheEvento // ex: "Veículo CG 160 Placa BRA1A23 - Instrutor Julio"
) {}
