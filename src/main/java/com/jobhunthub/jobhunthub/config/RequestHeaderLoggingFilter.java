package com.jobhunthub.jobhunthub.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Enumeration;

/**
 * Diagnostic filter to log incoming request headers specifically for the /api/auth/user path.
 */
@Component
public class RequestHeaderLoggingFilter implements Filter {

    private static final Logger logger = LoggerFactory.getLogger(RequestHeaderLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        // Only log headers for the specific path we are debugging
        if ("/api/auth/user".equals(httpRequest.getRequestURI())) {
            logger.info("--- Request Headers for {} ---", httpRequest.getRequestURI());
            Enumeration<String> headerNames = httpRequest.getHeaderNames();
            boolean cookieHeaderFound = false; // Flag to check if Cookie header exists

            if (headerNames != null) {
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();
                    // Specifically check if it's the Cookie header
                    if ("cookie".equalsIgnoreCase(headerName)) {
                        cookieHeaderFound = true;
                    }
                    // Log all values for the current header
                    Enumeration<String> headerValues = httpRequest.getHeaders(headerName);
                    while (headerValues.hasMoreElements()) {
                        logger.info("Header: {} = {}", headerName, headerValues.nextElement());
                    }
                }
            } else {
                logger.info("No headers found in the request enumeration.");
            }

            if (!cookieHeaderFound) {
                 logger.warn(">>> Cookie header was NOT found in the request headers for /api/auth/user! <<<");
            }
            logger.info("--- End Request Headers for {} ---", httpRequest.getRequestURI());
        }

        // IMPORTANT: Pass the request along the filter chain so it reaches the controller
        chain.doFilter(request, response);
    }

    // init and destroy methods are required by the Filter interface, but can be empty
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        logger.info("RequestHeaderLoggingFilter initialized.");
    }

    @Override
    public void destroy() {
        logger.info("RequestHeaderLoggingFilter destroyed.");
    }
} 