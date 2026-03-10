package com.nexops.api.shared.tenant.infrastructure;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Slf4j
@Component
public class TenantMigrationRunner {

    private final DataSource dataSource;

    public TenantMigrationRunner(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void migrate(String schemaName) {
        Flyway.configure()
                .dataSource(dataSource)
                .schemas(schemaName)
                .locations("classpath:db/migration/tenant")
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load()
                .migrate();
        
        log.info("Migrations applied to schema: {}", schemaName);
    }
}
