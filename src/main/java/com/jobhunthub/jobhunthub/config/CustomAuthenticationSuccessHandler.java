package com.jobhunthub.jobhunthub.config;

import java.io.IOException;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.jobhunthub.jobhunthub.model.User;
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
    // Handles pre-login saved requests and manages the actual redirection.
    private final AuthenticationSuccessHandler delegate = new SavedRequestAwareAuthenticationSuccessHandler();

    /**
     * Constructs the success handler.
     * @param userService The service for user-related operations.
     * @param injectedFrontendUrl The base URL of the frontend application, injected from properties.
     * @throws IllegalArgumentException if injectedFrontendUrl is null or empty.
     */
    public CustomAuthenticationSuccessHandler(UserService userService, @Value("${frontend.url}") String injectedFrontendUrl) {
        logger.info("CustomAuthenticationSuccessHandler constructor: Injected frontendUrl is [{}]", injectedFrontendUrl);

        this.userService = userService;
        this.frontendUrl = injectedFrontendUrl;

        if (injectedFrontendUrl == null || injectedFrontendUrl.trim().isEmpty() || "null".equalsIgnoreCase(injectedFrontendUrl)) {
            logger.error("FATAL: frontendUrl is null or invalid in CustomAuthenticationSuccessHandler constructor. Cannot set default target URL.");
            // Throw an exception to make the configuration failure clear.
            throw new IllegalArgumentException("frontendUrl cannot be null or empty for CustomAuthenticationSuccessHandler. Check property frontend.url and its environment variable source.");
        } else {
            String targetUrl = injectedFrontendUrl + "/dashboard";
            logger.info("CustomAuthenticationSuccessHandler: Setting default target URL to [{}]", targetUrl);
            ((SavedRequestAwareAuthenticationSuccessHandler) this.delegate).setDefaultTargetUrl(targetUrl);
        }
        ((SavedRequestAwareAuthenticationSuccessHandler) this.delegate).setAlwaysUseDefaultTargetUrl(true);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        logger.info("Entering CustomAuthenticationSuccessHandler.onAuthenticationSuccess");

        if (authentication == null) {
            logger.error("Received null Authentication object in onAuthenticationSuccess.");
            response.sendRedirect(frontendUrl + "/?error=internal_auth_error");
            return;
        }

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            logger.warn("Authentication is not OAuth2AuthenticationToken, type: {}. Delegating to default handler.", authentication.getClass().getName());
            // Fallback to default handler for non-OAuth2 authentications.
            this.delegate.onAuthenticationSuccess(request, response, authentication);
            return;
        }

        OAuth2User oAuth2User = oauthToken.getPrincipal();
        Object idAttribute = oAuth2User.getAttribute("id");
        if (idAttribute == null) {
            logger.error("GitHub ID attribute is null in onAuthenticationSuccess");
            response.sendRedirect(frontendUrl + "/?error=missing_id");
            return;
        }
        String githubId = idAttribute.toString();
        String login = oAuth2User.getAttribute("login");
        String email = oAuth2User.getAttribute("email");
        String avatarUrl = oAuth2User.getAttribute("avatar_url");

        logger.info("Processing successful authentication for GitHub user: {}, ID: {}", login, githubId);

        try {
            Optional<User> existingUserOpt = userService.findByGithubId(githubId);
            User user;

            if (existingUserOpt.isPresent()) {
                user = existingUserOpt.get();
                logger.debug("Found existing user: {}", user.getUsername());
                // Update user information if it has changed.
                boolean needsUpdate = false;
                if (login != null && (user.getUsername() == null || !user.getUsername().equals(login))) {
                    user.setUsername(login);
                    needsUpdate = true;
                }
                if (email != null && (user.getEmail() == null || !user.getEmail().equals(email))) {
                    user.setEmail(email);
                    needsUpdate = true;
                }
                if (avatarUrl != null && (user.getAvatarUrl() == null || !user.getAvatarUrl().equals(avatarUrl))) {
                    user.setAvatarUrl(avatarUrl);
                    needsUpdate = true;
                }

                if (needsUpdate) {
                     logger.info("Attempting to update existing user: {}", user.getUsername());
                    userService.save(user);
                     logger.info("Successfully updated user: {}", user.getUsername());
                } else {
                     logger.debug("No updates needed for existing user: {}", user.getUsername());
                }
            } else {
                user = new User();
                user.setGithubId(githubId);
                user.setUsername(login);
                user.setEmail(email);
                user.setAvatarUrl(avatarUrl);
                 logger.info("Attempting to save new user: {}", user.getUsername());
                userService.save(user);
                 logger.info("Successfully saved new user: {}", user.getUsername());
            }

            // Delegate redirection to handle saved requests correctly.
            logger.info("User provisioning complete, delegating redirect to SavedRequestAwareAuthenticationSuccessHandler (target: {})", frontendUrl + "/dashboard");
            logger.debug("onAuthenticationSuccess: Using frontendUrl [{}] for potential redirects.", this.frontendUrl);
            this.delegate.onAuthenticationSuccess(request, response, authentication);

        } catch (Exception e) {
            logger.error("Error during user provisioning for githubId {}: {}", githubId, e.getMessage(), e);
            response.sendRedirect(frontendUrl + "/?error=provisioning_failed");
        }
    }
}
