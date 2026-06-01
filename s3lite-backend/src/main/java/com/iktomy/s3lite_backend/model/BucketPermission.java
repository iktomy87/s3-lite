package com.iktomy.s3lite_backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

// RF-08: Permiso de un usuario sobre un bucket (read / write).

@Entity
@Table(name = "bucket_permissions", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "bucket_id", "permission" })
})
@Getter
@Setter
@NoArgsConstructor
public class BucketPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bucket_id", nullable = false)
    private Bucket bucket;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PermissionType permission;

    public enum PermissionType {
        READ, WRITE
    }
}
