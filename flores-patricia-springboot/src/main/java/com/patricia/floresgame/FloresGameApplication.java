package com.patricia.floresgame;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la aplicación.
 * Spring Boot sirve automáticamente todo lo que está en
 * src/main/resources/static (index.html, css, js, imágenes)
 * como un sitio web normal en http://localhost:8080
 */
@SpringBootApplication
public class FloresGameApplication {
    public static void main(String[] args) {
        SpringApplication.run(FloresGameApplication.class, args);
    }
}
