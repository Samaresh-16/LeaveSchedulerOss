package com.sap.fsad.leaveApp.controller.graphql;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.sap.fsad.leaveApp.model.AuditLog;
import com.sap.fsad.leaveApp.repository.AuditLogRepository;

@Controller
public class AuditLogGraphQLController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    // Query Resolvers
    @QueryMapping
    public List<AuditLog> getAllAuditLogs() {
        // Use repository to fetch real audit logs
        return auditLogRepository.findAll();
    }
}
