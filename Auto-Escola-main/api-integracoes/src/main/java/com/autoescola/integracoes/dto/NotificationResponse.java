package com.autoescola.integracoes.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
    boolean sucesso,
    String protocolo,
    String canal,
    String destinatario,
    LocalDateTime dataEnvio,
    String status,
    String mensagemRetorno
) {}
