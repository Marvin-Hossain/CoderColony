package com.jobhunthub.jobhunthub.config;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com.jobhunthub.jobhunthub.model.User;

import lombok.Getter;

public class UserPrincipal implements OidcUser {
    private final OAuth2User delegate;
    @Getter
    private final User       domainUser;
    private final OidcUser   oidcDelegate;

    public UserPrincipal(OAuth2User delegate, User domainUser) {
        this.delegate = delegate;
        this.domainUser = domainUser;
        this.oidcDelegate = delegate instanceof OidcUser oidc ? oidc : null;
    }

    // === OAuth2User methods ===
    @Override public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return delegate.getAuthorities();
    }
    @Override public String getName() {
        return delegate.getName();
    }

    // === OidcUser methods ===
    @Override public Map<String, Object> getClaims() {
        return (oidcDelegate != null)
                ? oidcDelegate.getClaims()
                : Collections.emptyMap();
    }
    @Override public OidcUserInfo getUserInfo() {
        return (oidcDelegate != null)
                ? oidcDelegate.getUserInfo()
                : null;
    }
    @Override public OidcIdToken getIdToken() {
        return (oidcDelegate != null)
                ? oidcDelegate.getIdToken()
                : null;
    }
}
