package com.autoescola.integracoes;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ApiIntegracoesApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiIntegracoesApplication.class, args);
    }
}
