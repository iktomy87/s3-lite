package com.iktomy.s3lite_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.iktomy.s3lite_backend.model.Bucket;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BucketRepository extends JpaRepository<Bucket, UUID> {

    Optional<Bucket> findByName(String name);

    boolean existsByName(String name);
}
