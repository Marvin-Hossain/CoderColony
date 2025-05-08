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

@Component // Make it a Spring bean
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationSuccessHandler.class);
    private final UserService userService;
    private final String frontendUrl;
    // Use SavedRequestAwareAuthenticationSuccessHandler to handle pre-login saved requests if needed
    private final AuthenticationSuccessHandler delegate = new SavedRequestAwareAuthenticationSuccessHandler();

    // Inject UserService and frontend URL from environment variable
    public CustomAuthenticationSuccessHandler(UserService userService, @Value("${frontend.url}") String injectedFrontendUrl) {
        logger.info("CustomAuthenticationSuccessHandler constructor: Injected frontendUrl is [{}]", injectedFrontendUrl); // LOG IT HERE

        this.userService = userService;
        this.frontendUrl = injectedFrontendUrl; // Assign to field

        if (injectedFrontendUrl == null || injectedFrontendUrl.trim().isEmpty() || "null".equalsIgnoreCase(injectedFrontendUrl)) {
            logger.error("FATAL: frontendUrl is null or invalid in CustomAuthenticationSuccessHandler constructor. Cannot set default target URL.");
            // Option 1: Throw an exception to make the failure clear
            throw new IllegalArgumentException("frontendUrl cannot be null or empty for CustomAuthenticationSuccessHandler. Check property frontend.url and its environment variable source.");
            // Option 2: Set a very basic, valid fallback (less ideal as it hides the config problem)
            // ((SavedRequestAwareAuthenticationSuccessHandler) this.delegate).setDefaultTargetUrl("/");
        } else {
            String targetUrl = injectedFrontendUrl + "/dashboard";
            logger.info("CustomAuthenticationSuccessHandler: Setting default target URL to [{}]", targetUrl);
            ((SavedRequestAwareAuthenticationSuccessHandler) this.delegate).setDefaultTargetUrl(targetUrl);
        }
        ((SavedRequestAwareAuthenticationSuccessHandler) this.delegate).setAlwaysUseDefaultTargetUrl(true);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        logger.info("Entering CustomAuthenticationSuccessHandler");

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            logger.warn("Authentication is not OAuth2AuthenticationToken, type: {}", authentication.getClass().getName());
             // Fallback to default handler if not OAuth2 (though unlikely in this flow)
            this.delegate.onAuthenticationSuccess(request, response, authentication);
            return;
        }

        OAuth2User oAuth2User = oauthToken.getPrincipal();
        Object idAttribute = oAuth2User.getAttribute("id");
        if (idAttribute == null) {
            logger.error("GitHub ID attribute is null in onAuthenticationSuccess");
            // Redirect to a generic login error page on the frontend
            response.sendRedirect(frontendUrl + "/?error=missing_id");
            return;
        }
        String githubId = idAttribute.toString();
        String login = oAuth2User.getAttribute("login");
        String email = oAuth2User.getAttribute("email");
        String avatarUrl = oAuth2User.getAttribute("avatar_url");

        logger.info("Processing successful authentication for GitHub user: {}, ID: {}", login, githubId);

        try {
            // Find or create user (same logic as your controller had)
            Optional<User> existingUser = userService.findByGithubId(githubId);
            User user;

            if (existingUser.isPresent()) {
                user = existingUser.get();
                logger.debug("Found existing user: {}", user.getUsername());
                // Update user info if needed
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
                // Create new user
                user = new User();
                user.setGithubId(githubId);
                user.setUsername(login);
                user.setEmail(email);
                user.setAvatarUrl(avatarUrl);
                 logger.info("Attempting to save new user: {}", user.getUsername());
                userService.save(user);
                 logger.info("Successfully saved new user: {}", user.getUsername());
            }

            // Use the delegate handler to perform the redirect (handles saved requests correctly)
            logger.info("User provisioning complete, delegating redirect to SavedRequestAwareAuthenticationSuccessHandler (target: {})", frontendUrl + "/dashboard");
            logger.debug("onAuthenticationSuccess: Using frontendUrl [{}] for potential redirects (though delegate handles actual redirect).", this.frontendUrl);
            this.delegate.onAuthenticationSuccess(request, response, authentication);

        } catch (Exception e) {
            logger.error("Error during user provisioning for githubId {}: {}", githubId, e.getMessage(), e);
            // Redirect to a generic error page on the frontend in case of failure
            response.sendRedirect(frontendUrl + "/?error=provisioning_failed");
        }
    }
}
