package com.nexops.api.shared.tenant.infrastructure;

import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.springframework.stereotype.Component;

@Component
public class TenantSchemaInterceptor implements StatementInspector {

    @Override
    public String inspect(String sql) {
        // Não modifica o SQL — o search_path é setado no filtro
        return sql;
    }
}
