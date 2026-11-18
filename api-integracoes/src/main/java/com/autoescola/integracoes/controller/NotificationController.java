package com.autoescola.integracoes.controller;

import com.autoescola.integracoes.dto.NotificationRequest;
import com.autoescola.integracoes.dto.NotificationResponse;
import com.autoescola.integracoes.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notificacoes")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/enviar-lembrete")
    public ResponseEntity<NotificationResponse> enviarLembrete(@Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.enviarLembrete(request);
        return ResponseEntity.ok(response);
    }
}
