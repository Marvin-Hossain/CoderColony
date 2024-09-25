package com.mindvoyager.mindvoyager.repository;

import com.mindvoyager.mindvoyager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
