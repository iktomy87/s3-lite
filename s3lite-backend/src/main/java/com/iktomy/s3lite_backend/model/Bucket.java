package com.iktomy.s3lite_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

// RF-01: Creación de Bucket.

@Entity
@Table(name = "buckets")
@Getter
@Setter
@NoArgsConstructor
public class Bucket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    /**
     * UUID del usuario propietario (FK lógica — no se modela User aquí todavía).
     */
    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
