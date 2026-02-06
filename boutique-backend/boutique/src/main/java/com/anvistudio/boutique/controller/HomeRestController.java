package com.anvistudio.boutique.controller;

import com.anvistudio.boutique.model.ContactMessage;
import com.anvistudio.boutique.model.Customer;
import com.anvistudio.boutique.service.ContactService;
import com.anvistudio.boutique.service.ProductService;
import com.anvistudio.boutique.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * REST API Controller for Home/Public endpoints.
 * Provides JSON-based endpoints for the React frontend.
 */
@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class HomeRestController {

    private final ProductService productService;
    private final ContactService contactService;
    private final UserService userService;

    public HomeRestController(ProductService productService, ContactService contactService, UserService userService) {
        this.productService = productService;
        this.contactService = contactService;
        this.userService = userService;
    }

    /**
     * GET /api/public/home
     * Get home page data with products and user info (if authenticated)
     * 
     * Response: { 
     *   authenticated: boolean, 
     *   customer: { firstName, lastName, email }, 
     *   products: [...] 
     * }
     */
    @GetMapping("/home")
    public ResponseEntity<Map<String, Object>> getHomeData() {
        Map<String, Object> response = new HashMap<>();

        // Check authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = authentication != null && 
                                  authentication.isAuthenticated() && 
                                  !authentication.getPrincipal().equals("anonymousUser");

        response.put("authenticated", isAuthenticated);

        if (isAuthenticated) {
            String username = authentication.getName();
            
            // Fetch Customer details if authenticated
            Optional<Customer> customerOptional = userService.getCustomerDetailsByUsername(username);
            if (customerOptional.isPresent()) {
                Customer customer = customerOptional.get();
                Map<String, Object> customerData = new HashMap<>();
                customerData.put("email", customer.getUser().getUsername());
                // Add customer-specific fields if available
                response.put("customer", customerData);
            } else {
                // Fallback - just username
                Map<String, Object> userData = new HashMap<>();
                userData.put("email", username);
                response.put("customer", userData);
            }
        }

        // Fetch products for display
        response.put("products", productService.getDisplayableProducts());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/products
     * Get all displayable products
     * 
     * Response: [ { id, name, price, ... }, ... ]
     */
    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProducts() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("products", productService.getDisplayableProducts());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/public/contact
     * Submit contact form
     * 
     * Request Body: { name, email, subject, message }
     * Response: { success: boolean, message: string }
     */
    @PostMapping("/contact")
    public ResponseEntity<Map<String, Object>> submitContactForm(@RequestBody ContactMessage contactMessage) {
        Map<String, Object> response = new HashMap<>();

        try {
            contactService.saveMessage(contactMessage);
            response.put("success", true);
            response.put("message", "Thank you for your message! We will get back to you shortly.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "There was an error submitting your message. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * GET /api/public/about
     * Get about page content
     * 
     * Response: { success: boolean, content: string }
     */
    @GetMapping("/about")
    public ResponseEntity<Map<String, Object>> getAboutContent() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("title", "About Anvi Studio Boutique");
        response.put("content", "Your destination for exquisite traditional and contemporary ethnic wear.");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/policies/return
     * Get return policy content
     * 
     * Response: { success: boolean, policy: string }
     */
    @GetMapping("/policies/return")
    public ResponseEntity<Map<String, Object>> getReturnPolicy() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("title", "Return Policy");
        response.put("policy", "Return policy content here...");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/policies/privacy
     * Get privacy policy content
     * 
     * Response: { success: boolean, policy: string }
     */
    @GetMapping("/policies/privacy")
    public ResponseEntity<Map<String, Object>> getPrivacyPolicy() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("title", "Privacy Policy");
        response.put("policy", "Privacy policy content here...");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/policies/terms
     * Get terms and conditions content
     * 
     * Response: { success: boolean, policy: string }
     */
    @GetMapping("/policies/terms")
    public ResponseEntity<Map<String, Object>> getTermsAndConditions() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("title", "Terms and Conditions");
        response.put("policy", "Terms and conditions content here...");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/policies/shipping
     * Get shipping policy content
     * 
     * Response: { success: boolean, policy: string }
     */
    @GetMapping("/policies/shipping")
    public ResponseEntity<Map<String, Object>> getShippingPolicy() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("title", "Shipping Policy");
        response.put("policy", "Shipping policy content here...");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/public/custom-request-info
     * Get information about custom requests
     * 
     * Response: { success: boolean, info: string }
     */
    @GetMapping("/custom-request-info")
    public ResponseEntity<Map<String, Object>> getCustomRequestInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("title", "Custom Request");
        response.put("info", "Submit your custom tailoring requirements here...");
        return ResponseEntity.ok(response);
    }
}