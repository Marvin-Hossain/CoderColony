package com.jobhunthub.jobhunthub.config;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.AuthenticationException;
import com.jobhunthub.jobhunthub.service.UserService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Handles actions to be taken upon successful user authentication via OAuth2.
 * This includes finding or creating a user in the local database,
 * updating their details if necessary, and then redirecting them to the frontend dashboard.
 * It uses a {@link SavedRequestAwareAuthenticationSuccessHandler} delegate to manage
 * redirection, properly handling any requests saved prior to authentication.
 */
@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationSuccessHandler.class);
    private final UserService userService;
    private final String frontendUrl;
    private final AuthenticationSuccessHandler delegate = new SavedRequestAwareAuthenticationSuccessHandler();

    /**
     * Constructs the success handler.
     * @param userService The service for user-related operations.
     * @param injectedFrontendUrl The base URL of the frontend application, injected from properties.
     * @throws IllegalArgumentException if injectedFrontendUrl is null or empty.
     */
    public CustomAuthenticationSuccessHandler(UserService userService, @Value("${frontend.url}") String injectedFrontendUrl) {
        this.userService = userService;
        this.frontendUrl = injectedFrontendUrl;

        if (injectedFrontendUrl == null || injectedFrontendUrl.trim().isEmpty() || "null".equalsIgnoreCase(injectedFrontendUrl)) {
            logger.error("Frontend URL is invalid");
            throw new IllegalArgumentException("frontend.url cannot be null or empty");
        }
        
        String targetUrl = injectedFrontendUrl + "/dashboard";
        ((SavedRequestAwareAuthenticationSuccessHandler) this.delegate).setDefaultTargetUrl(targetUrl);
        ((SavedRequestAwareAuthenticationSuccessHandler) this.delegate).setAlwaysUseDefaultTargetUrl(true);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2AuthenticationToken oauthToken = userService.validateAuthentication(authentication);
            OAuth2User oAuth2User = oauthToken.getPrincipal();
            String registrationId = oauthToken.getAuthorizedClientRegistrationId();
            String userIdentifier = userService.getUserIdentifierForLogging(oAuth2User, registrationId);
            
            logger.info("Processing {} user: {}", registrationId, userIdentifier);

            userService.provisionOrUpdateUserFromOAuth2(oAuth2User, registrationId);
            this.delegate.onAuthenticationSuccess(request, response, authentication);
        } catch (AuthenticationException e) {
            logger.error("Authentication failed: {}", e.getMessage());
            response.sendRedirect(frontendUrl + "/?error=internal_auth_error");
        } catch (Exception e) {
            logger.error("User provisioning failed: {}", e.getMessage());
            response.sendRedirect(frontendUrl + "/?error=provisioning_failed");
        }
    }
}
