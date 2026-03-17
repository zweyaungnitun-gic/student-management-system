package com.gicm.student_management_system.security;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Component
public class CustomAuthSuccessHandler implements AuthenticationSuccessHandler {

    private static final String JWT_REDIS_PREFIX = "sms:jwt:";
    private static final long SESSION_TIMEOUT_MINUTES = 30;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        // Generate JWT token for the authenticated user
        String jwt = jwtTokenProvider.generateToken(authentication);
        
        // Create session to get session ID
        HttpSession session = request.getSession(true);
        String sessionId = session.getId();
        
        // Store JWT directly in Redis with session ID as key
        String redisKey = JWT_REDIS_PREFIX + sessionId;
        redisTemplate.opsForValue().set(redisKey, jwt, SESSION_TIMEOUT_MINUTES, TimeUnit.MINUTES);
        
        // Also store user email in Redis
        redisTemplate.opsForValue().set(redisKey +":email", authentication.getName(), SESSION_TIMEOUT_MINUTES, TimeUnit.MINUTES);
        
        Set<String> roles = AuthorityUtils.authorityListToSet(authentication.getAuthorities());

        if (roles.contains("ROLE_ADMIN") || roles.contains("ROLE_GUEST")) {
            response.sendRedirect("/dashboard");
        } else {
            // Default fallback
            response.sendRedirect("/dashboard");
        }
    }
}
