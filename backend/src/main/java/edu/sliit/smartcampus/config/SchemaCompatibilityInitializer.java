package edu.sliit.smartcampus.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaCompatibilityInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaCompatibilityInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public SchemaCompatibilityInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        patchResourcesTable();
        patchSecurityActivityLogsTable();
    }

    private void patchResourcesTable() {
        jdbcTemplate.execute("ALTER TABLE resources ADD COLUMN IF NOT EXISTS resource_code VARCHAR(50)");

        jdbcTemplate.execute("""
                UPDATE resources
                SET resource_code = UPPER('RES-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8))
                WHERE resource_code IS NULL OR BTRIM(resource_code) = ''
                """);

        jdbcTemplate.execute("ALTER TABLE resources ALTER COLUMN resource_code SET NOT NULL");
        jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_resources_resource_code ON resources (resource_code)");
        log.info("Schema compatibility patch applied for resources.resource_code");
    }

    private void patchSecurityActivityLogsTable() {
        jdbcTemplate.execute("ALTER TABLE security_activity_logs ADD COLUMN IF NOT EXISTS acknowledged BOOLEAN");
        jdbcTemplate.execute("UPDATE security_activity_logs SET acknowledged = FALSE WHERE acknowledged IS NULL");
        jdbcTemplate.execute("ALTER TABLE security_activity_logs ALTER COLUMN acknowledged SET DEFAULT FALSE");
        jdbcTemplate.execute("ALTER TABLE security_activity_logs ALTER COLUMN acknowledged SET NOT NULL");
        log.info("Schema compatibility patch applied for security_activity_logs.acknowledged");
    }
}
