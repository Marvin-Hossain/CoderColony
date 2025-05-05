package com.jobhunthub.jobhunthub.config; // Or your preferred package

import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component // Make it a Spring bean
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = LoggerFactory.getLogger(CustomAuthenticationSuccessHandler.class);
    private final UserService userService;
    private final String frontendUrl;
    // Use SavedRequestAwareAuthenticationSuccessHandler to handle pre-login saved requests if needed
    private final AuthenticationSuccessHandler delegate = new SavedRequestAwareAuthenticationSuccessHandler();

    // Inject UserService and frontend URL from environment variable
    public CustomAuthenticationSuccessHandler(UserService userService, @Value("${frontend.url}") String frontendUrl) {
        this.userService = userService;
        this.frontendUrl = frontendUrl;
        // Set the default target URL for the delegate
        ((SavedRequestAwareAuthenticationSuccessHandler) this.delegate).setDefaultTargetUrl(frontendUrl + "/dashboard");
         ((SavedRequestAwareAuthenticationSuccessHandler) this.delegate).setAlwaysUseDefaultTargetUrl(true); // Force redirect to dashboard

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
            this.delegate.onAuthenticationSuccess(request, response, authentication);

        } catch (Exception e) {
            logger.error("Error during user provisioning for githubId {}: {}", githubId, e.getMessage(), e);
            // Redirect to a generic error page on the frontend in case of failure
            response.sendRedirect(frontendUrl + "/?error=provisioning_failed");
        }
    }
}
