package com.anvistudio.boutique.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configure the AuthenticationManager with UserDetailsService and PasswordEncoder
     * This approach works with all Spring Security versions
     */
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = 
            http.getSharedObject(AuthenticationManagerBuilder.class);
        
        authenticationManagerBuilder
            .userDetailsService(userDetailsService)
            .passwordEncoder(passwordEncoder());
        
        return authenticationManagerBuilder.build();
    }

    /**
     * Custom Failure Handler for Thymeleaf-based login (backward compatibility)
     */
    @Bean
    public AuthenticationFailureHandler authenticationFailureHandler() {
        return (request, response, exception) -> {
            String redirectUrl = "/login?error";

            // If the user is disabled (i.e., email not verified)
            if (exception instanceof DisabledException) {
                redirectUrl = "/confirm-otp?email=" + request.getParameter("username") + "&error=unverified";
            } else if (exception.getMessage().equals("Bad credentials")) {
                redirectUrl = "/login?error=bad_credentials";
            }

            response.sendRedirect(redirectUrl);
        };
    }

    /**
     * CORS Configuration for React Frontend
     * Allows requests from React dev server and production URLs
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow requests from React development server and production
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",      // React dev server (default)
            "http://localhost:3001",      // Alternative React port
            "http://127.0.0.1:3000",
            "https://yourdomain.com"      // Replace with your production domain
        ));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);
        
        // Expose headers that the client can access
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "X-Total-Count"
        ));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply CORS configuration to API endpoints
        source.registerCorsConfiguration("/api/**", configuration);
        
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS with the configuration defined above
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Disable CSRF for API endpoints (enable for production with proper configuration)
                .csrf(csrf -> csrf
                    .ignoringRequestMatchers("/api/**")  // Disable CSRF for API endpoints
                )
                
                // Allow H2 console in development (remove in production)
                .headers(headers -> headers
                    .frameOptions(frameOptions -> frameOptions.sameOrigin())
                )

                .authorizeHttpRequests(authorize -> authorize
                        // Admin routes
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        
                        // Customer routes (require CUSTOMER role)
                        .requestMatchers("/customer/**").hasRole("CUSTOMER")
                        
                        // Authenticated routes (any authenticated user)
                        .requestMatchers("/wishlist", "/wishlist/**").authenticated()
                        .requestMatchers("/cart", "/cart/**").authenticated()
                        
                        // NEW: Public API endpoints (for React frontend)
                        .requestMatchers("/api/auth/**").permitAll()           // All auth endpoints
                        .requestMatchers("/api/public/**").permitAll()         // Public API endpoints
                        
                        // Public Thymeleaf routes (backward compatibility)
                        .requestMatchers(
                                "/", "/login", "/register", "/about", "/contact",
                                "/products", "/products/**", 
                                "/wishlist-unauth", "/cart-unauth",
                                "/custom-request",
                                "/confirm-otp",
                                "/forgot-password",
                                "/reset-otp",
                                "/reset-password",
                                "/newsletter/subscribe",
                                "/policy_return",
                                "/policy_privacy",
                                "/policy_terms",
                                "/policy_shipping",
                                "/customer/profile/verify-new-email",
                                "/css/**", "/js/**", "/images/**"
                        ).permitAll()
                        
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // Form-based login configuration (for Thymeleaf pages)
                .formLogin(form -> form
                        .loginPage("/login")
                        .permitAll()
                        .failureHandler(authenticationFailureHandler())
                        .successHandler((request, response, authentication) -> {
                            if (authentication.getAuthorities().stream()
                                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                                response.sendRedirect("/admin/dashboard");
                            } else {
                                response.sendRedirect("/");
                            }
                        })
                )
                
                // Logout configuration
                .logout(logout -> logout
                        .permitAll()
                        .logoutSuccessUrl("/")
                        .deleteCookies("JSESSIONID")
                );

        return http.build();
    }
}
