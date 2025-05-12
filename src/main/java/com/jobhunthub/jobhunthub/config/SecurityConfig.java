package com.jobhunthub.jobhunthub.config;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Configures web security for the application, including CORS, CSRF,
 * request authorization, OAuth2 login, and logout behaviors.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;
    private final String frontendUrlValue;
    private final String allowedOriginValue;

    public SecurityConfig(CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler,
                          @Value("${frontend.url}") String frontendUrlValue,
                          @Value("${allowed.origin}") String allowedOriginValue) {
        this.customAuthenticationSuccessHandler = customAuthenticationSuccessHandler;
        this.frontendUrlValue = frontendUrlValue;
        this.allowedOriginValue = allowedOriginValue;
    }

    /**
     * Defines the security filter chain for HTTP requests.
     * Configures:
     * - CORS (Cross-Origin Resource Sharing)
     * - CSRF (Cross-Site Request Forgery) protection (disabled for REST API compatibility)
     * - Authorization rules for public and protected endpoints
     * - OAuth2 login process, including success and failure handlers
     * - Logout process
     *
     * @param http The {@link HttpSecurity} to configure.
     * @return The configured {@link SecurityFilterChain}.
     * @throws Exception if an error occurs during configuration.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable) // CSRF disabled for stateless REST API
                .authorizeHttpRequests(auth -> {
                    // Define public endpoints
                    auth.requestMatchers("/", "/error", "/api/public/**", "/health").permitAll();
                    auth.requestMatchers("/oauth2/authorization/**").permitAll();
                    auth.requestMatchers("/login/oauth2/code/**").permitAll();
                    auth.requestMatchers("/api/auth/user").permitAll();

                    // All other requests require authentication
                    auth.anyRequest().authenticated();
                })
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(customAuthenticationSuccessHandler)
                        .failureUrl(frontendUrlValue + "/?error=true")
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(org.springframework.http.HttpStatus.OK))
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )
                .build();
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing).
     * Allows requests from the specified frontend URL and defines permitted methods,
     * headers, and credentials.
     *
     * @return The {@link CorsConfigurationSource} with defined CORS rules.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Frontend URL allowed to make requests
        List<String> origins = Collections.singletonList(allowedOriginValue);
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(List.of("Location"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply CORS to all paths
        return source;
    }
}