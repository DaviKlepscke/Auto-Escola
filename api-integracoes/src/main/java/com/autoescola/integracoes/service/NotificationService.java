package com.autoescola.integracoes.service;

import com.autoescola.integracoes.dto.NotificationRequest;
import com.autoescola.integracoes.dto.NotificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    /**
     * Envia notificação automática com 1 dia de antecedência para o aluno via WhatsApp ou E-mail
     */
    public NotificationResponse enviarLembrete(NotificationRequest request) {
        String protocolo = "NOTIF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        log.info("[Notificação] Disparando lembrete de 24h via {} para {} ({}): Evento={}",
                request.canal(), request.alunoNome(), request.destinatario(), request.tipoEvento());

        // Simula disparo seguro de mensagem
        String mensagemFormatada = String.format(
            "Olá %s! Lembramos que sua %s está agendada para %s (%s). Não se esqueça de portar seu documento oficial com foto e LADV. AutoEscola Pro.",
            request.alunoNome(), request.tipoEvento(), request.dataHoraEvento(), request.detalheEvento()
        );

        log.info("[Notificação Payload]: {}", mensagemFormatada);

        return new NotificationResponse(
            true,
            protocolo,
            request.canal().toUpperCase(),
            request.destinatario(),
            LocalDateTime.now(),
            "ENTREGUE",
            "Notificação disparada com sucesso com 1 dia de antecedência."
        );
    }
}
