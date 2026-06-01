package com.iktomy.s3lite_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/buckets/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/buckets/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/storage/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/storage/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/storage/**").authenticated()
                .anyRequest().authenticated())
            .httpBasic(basic -> {});
        return http.build();
    }
}
