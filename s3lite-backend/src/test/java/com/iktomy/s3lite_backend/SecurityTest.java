package com.iktomy.s3lite_backend;

import com.iktomy.s3lite_backend.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    public void testAuth() throws Exception {
        String token = jwtService.generateToken(UUID.randomUUID(), "testuser");
        
        mockMvc.perform(get("/api/buckets/algo3/objects")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound()); // Expect 404 or something, but let's see if it prints the real status
    }
}
