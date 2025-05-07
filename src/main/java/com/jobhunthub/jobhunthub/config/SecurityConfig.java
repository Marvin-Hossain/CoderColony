package com.jobhunthub.jobhunthub.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;

    @Value("${frontend.url}")
    private String frontendUrlValue;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Main security setup:
        // - Enables CORS
        // - Disables CSRF (needed for our REST API)
        // - Public endpoints: auth routes
        // - Everything else requires authentication
        // - OAuth2 login redirects to dashboard
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> {
                    // Public endpoints
                    auth.requestMatchers("/", "/error", "/api/public/**", "/health").permitAll();
                    auth.requestMatchers("/oauth2/authorization/**").permitAll();
                    auth.requestMatchers("/login/oauth2/code/**").permitAll();
                    auth.requestMatchers("/logout").permitAll();
                    auth.requestMatchers("/api/auth/logout").permitAll();

                    // --- Allow the auth check endpoint ---
                    auth.requestMatchers("/api/auth/user").permitAll(); 
                    // --- End Change ---

                    // Protected endpoints
                    auth.anyRequest().authenticated();
                })
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(customAuthenticationSuccessHandler)
                        .failureUrl(frontendUrlValue + "/?error=true")
                )
                .logout(logout -> logout
                        .logoutSuccessUrl(frontendUrlValue + "/")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Use environment variable for allowed origins
        String allowedOrigin = System.getenv("ALLOWED_ORIGIN");
        List<String> origins = Arrays.asList(
            allowedOrigin != null ? allowedOrigin : "http://localhost:3000"
        );
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Location"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}