package com.iktomy.s3lite_backend.repository;

import com.iktomy.s3lite_backend.model.BucketPermission;
import com.iktomy.s3lite_backend.model.BucketPermission.PermissionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BucketPermissionRepository extends JpaRepository<BucketPermission, UUID> {

    @Query("""
            SELECT COUNT(bp) > 0 FROM BucketPermission bp
            WHERE bp.user.username  = :username
              AND bp.bucket.name    = :bucketName
              AND bp.permission     = :permission
            """)
    boolean existsByUsernameAndBucketNameAndPermission(
            @Param("username")   String username,
            @Param("bucketName") String bucketName,
            @Param("permission") PermissionType permission);
}
