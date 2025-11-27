package com.sap.fsad.leaveApp.controller.graphql;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.sap.fsad.leaveApp.model.Holiday;
import com.sap.fsad.leaveApp.model.LeaveApplication;
import com.sap.fsad.leaveApp.service.ReportService;

import io.swagger.v3.oas.annotations.tags.Tag;

@Controller
@Tag(name = "Reports (GraphQL)", description = "GraphQL endpoints for reports")
public class ReportGraphQLController {

    @Autowired
    private ReportService reportService;

    @QueryMapping(name = "leaveUsageReport")
    public List<LeaveApplication> getLeaveUsageReport() {
        return reportService.getLeaveUsageReport();
    }

    @QueryMapping(name = "pendingApprovalsReport")
    public List<LeaveApplication> getPendingApprovalsReport() {
        return reportService.getPendingApprovalsReport();
    }

    @QueryMapping(name = "holidayScheduleReport")
    public List<Holiday> getHolidayScheduleReport() {
        return reportService.getHolidayScheduleReport();
    }
}