package com.gicm.student_management_system.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.gicm.student_management_system.security.CustomAuthSuccessHandler;
import com.gicm.student_management_system.security.CustomUserDetailsService;
import com.gicm.student_management_system.security.SessionJwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

        @Autowired
        private CustomUserDetailsService customUserDetailsService;

        @Autowired
        private SessionJwtAuthenticationFilter sessionJwtAuthenticationFilter;

        @Autowired
        private CustomAuthSuccessHandler customAuthSuccessHandler;

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
                return authConfig.getAuthenticationManager();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(authz -> authz
                                                // Public endpoints
                                                .requestMatchers("/", "/login", "/access-denied", "/css/**", "/js/**",
                                                                "/images/**", "/register/**")
                                                .permitAll()

                                                // Dashboard requires authentication
                                                .requestMatchers("/dashboard").authenticated()

                                                // GUEST only - can only access guest dashboard and logout
                                                .requestMatchers("/guest/**").hasRole("GUEST")
                                                .requestMatchers("/logout").authenticated()

                                                // SUPER_ADMIN and ADMIN can access admin areas
                                                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/students/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/teachers/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/courses/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/users/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/tests/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/results/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/reports/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                                                .requestMatchers("/dashboard").hasAnyRole("ADMIN", "SUPER_ADMIN", "GUEST")

                                                .anyRequest().authenticated())
                                .exceptionHandling(exception -> exception
                                                .accessDeniedPage("/access-denied"))
                                .formLogin(form -> form
                                                .loginPage("/login")
                                                .loginProcessingUrl("/login")
                                                .successHandler(customAuthSuccessHandler)
                                                .failureUrl("/login?error=true")
                                                .permitAll())
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/login?logout=true")
                                                .invalidateHttpSession(true)
                                                .deleteCookies("JSESSIONID")
                                                .permitAll())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                                                .maximumSessions(1)
                                                .maxSessionsPreventsLogin(false))
                                .userDetailsService(customUserDetailsService);

                // Add Session JWT filter for form-based authentication with JWT stored in Redis
                // session
                http.addFilterAfter(sessionJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}