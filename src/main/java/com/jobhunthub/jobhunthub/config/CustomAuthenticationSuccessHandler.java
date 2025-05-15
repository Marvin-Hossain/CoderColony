package com.jobhunthub.jobhunthub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

/**
 * Handles post‑login redirects only; provisioning is done in the OAuth2UserService.
 */
@Component
public class CustomAuthenticationSuccessHandler
        extends SavedRequestAwareAuthenticationSuccessHandler {

    public CustomAuthenticationSuccessHandler(
            @Value("${frontend.url}") String frontendUrl
    ) {
        // send everyone here after successful login
        setDefaultTargetUrl(frontendUrl + "/dashboard");
        setAlwaysUseDefaultTargetUrl(true);
    }
}
