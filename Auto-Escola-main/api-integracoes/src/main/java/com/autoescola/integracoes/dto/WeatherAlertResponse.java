package com.autoescola.integracoes.dto;

public record WeatherAlertResponse(
    String cidade,
    String dataConsulta,
    int probabilidadeChuva,
    String condicaoMeteorologica,
    boolean alertaChuvaAtivo,
    boolean sugerirReagendamentoMoto,
    String mensagemAviso
) {}
