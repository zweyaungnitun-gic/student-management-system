package com.gicm.student_management_system.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filter that checks for JWT token in Redis and validates it
 * JWT is stored directly in Redis using session ID as key
 */
@Component
public class SessionJwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String JWT_REDIS_PREFIX = "sms:jwt:";

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Check if user is already authenticated
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                String sessionId = getSessionIdFromCookie(request);
                
                if (sessionId != null) {
                    String redisKey = JWT_REDIS_PREFIX + sessionId;
                    String jwt = (String) redisTemplate.opsForValue().get(redisKey);
                    
                    if (jwt != null && tokenProvider.validateToken(jwt)) {
                        String email = tokenProvider.getEmailFromToken(jwt);

                        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
                        UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication from Redis JWT", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getSessionIdFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("JSESSIONID".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
