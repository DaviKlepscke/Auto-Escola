package com.autoescola.integracoes.service;

import com.autoescola.integracoes.dto.WeatherAlertResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Random;

@Service
public class WeatherService {

    @Value("${weather.rain.threshold.percentage:60}")
    private int rainThreshold;

    /**
     * Consulta a previsão meteorológica para o município do CFC
     * Simula resiliência e cálculo de alerta para aulas de Categoria A (Moto)
     */
    public WeatherAlertResponse consultarPrevisaoParaAula(String cidade, String dataAula, String categoria) {
        // Mock inteligente / fallback quando não houver chave ativa de API externa
        int chanceChuva = ("A".equalsIgnoreCase(categoria)) ? 75 : 20;
        boolean alertaChuva = chanceChuva >= rainThreshold;
        boolean sugerirReagendar = "A".equalsIgnoreCase(categoria) && alertaChuva;

        String condicao = alertaChuva ? "Pancadas de Chuva Forte / Trovoada" : "Céu Limpo com Poucas Nuvens";
        String aviso = sugerirReagendar 
            ? "ALERTA DE SEGURANÇA: Previsão de chuva acima de " + rainThreshold + "% para aula prática de Motocicleta (Cat A). Sugerido reagendamento sem custos ao aluno."
            : "Condições meteorológicas adequadas para a realização da aula prática.";

        return new WeatherAlertResponse(
            cidade != null ? cidade : "São Paulo - SP",
            dataAula != null ? dataAula : LocalDate.now().toString(),
            chanceChuva,
            condicao,
            alertaChuva,
            sugerirReagendar,
            aviso
        );
    }
}
