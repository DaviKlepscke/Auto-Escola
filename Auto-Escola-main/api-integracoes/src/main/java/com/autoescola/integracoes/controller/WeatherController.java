package com.autoescola.integracoes.controller;

import com.autoescola.integracoes.dto.WeatherAlertResponse;
import com.autoescola.integracoes.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clima")
@CrossOrigin(origins = "*")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/alerta-aula")
    public ResponseEntity<WeatherAlertResponse> consultarAlerta(
            @RequestParam(required = false, defaultValue = "São Paulo") String cidade,
            @RequestParam(required = false) String dataAula,
            @RequestParam(defaultValue = "A") String categoria) {

        WeatherAlertResponse response = weatherService.consultarPrevisaoParaAula(cidade, dataAula, categoria);
        return ResponseEntity.ok(response);
    }
}
