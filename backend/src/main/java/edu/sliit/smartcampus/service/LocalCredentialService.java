package edu.sliit.smartcampus.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class LocalCredentialService {

    private final JdbcTemplate jdbcTemplate;

    public LocalCredentialService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        ensureCredentialsTable();
    }

    public void upsertPasswordHash(UUID userId, String passwordHash) {
        int updated = jdbcTemplate.update(
                "UPDATE user_credentials SET password_hash = ?, updated_at = NOW() WHERE user_id = ?",
                passwordHash,
                userId);
        if (updated == 0) {
            jdbcTemplate.update(
                    """
                            INSERT INTO user_credentials (user_id, password_hash, created_at, updated_at)
                            VALUES (?, ?, NOW(), NOW())
                            """,
                    userId,
                    passwordHash);
        }
    }

    public Optional<String> findPasswordHash(UUID userId) {
        List<String> hashes = jdbcTemplate.query(
                "SELECT password_hash FROM user_credentials WHERE user_id = ?",
                (rs, rowNum) -> rs.getString("password_hash"),
                userId);
        return hashes.stream().findFirst();
    }

    private void ensureCredentialsTable() {
        jdbcTemplate.execute(
                """
                        CREATE TABLE IF NOT EXISTS user_credentials (
                            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                            password_hash VARCHAR(255) NOT NULL,
                            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                        )
                        """);
    }
}
