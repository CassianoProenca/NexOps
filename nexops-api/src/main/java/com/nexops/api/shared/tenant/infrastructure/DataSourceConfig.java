package com.nexops.api.shared.tenant.infrastructure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.util.HashMap;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        TenantAwareDataSource ds = new TenantAwareDataSource();

        DataSource defaultDs = DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .build();

        ds.setDefaultTargetDataSource(defaultDs);
        ds.setTargetDataSources(new HashMap<>());
        ds.afterPropertiesSet();
        return ds;
    }
}
