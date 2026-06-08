package com.iktomy.s3lite_backend.controllers;

import com.iktomy.s3lite.api.AuthApi;
import com.iktomy.s3lite.model.LoginRequest;
import com.iktomy.s3lite.model.LoginResponse;
import com.iktomy.s3lite.model.RegisterRequest;
import com.iktomy.s3lite.model.UserResponse;
import com.iktomy.s3lite_backend.model.User;
import com.iktomy.s3lite_backend.service.AuthService;
import com.iktomy.s3lite_backend.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController implements AuthApi {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @Override
    public ResponseEntity<LoginResponse> loginUser(LoginRequest loginRequest) {
        User user = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        String token = jwtService.generateToken(user.getId(), user.getUsername());
        
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setExpiresIn((long) jwtService.getExpirationMs() / 1000); // Expiration in seconds
        
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<UserResponse> registerUser(RegisterRequest registerRequest) {
        User user = authService.register(
                registerRequest.getUsername(), 
                registerRequest.getEmail(), 
                registerRequest.getPassword()
        );
        
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setCreatedAt(user.getCreatedAt());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
