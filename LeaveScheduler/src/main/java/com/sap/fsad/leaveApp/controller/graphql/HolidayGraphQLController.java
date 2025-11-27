package com.sap.fsad.leaveApp.controller.graphql;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.sap.fsad.leaveApp.dto.response.ApiResponse;
import com.sap.fsad.leaveApp.model.Holiday;
import com.sap.fsad.leaveApp.service.HolidayService;

@Controller
public class HolidayGraphQLController {

    @Autowired
    private HolidayService holidayService;

    // Query Resolvers
    @QueryMapping
    public List<Holiday> getAllHolidays() {
        return holidayService.getAllHolidays();
    }

    @QueryMapping
    public Holiday getHolidayById(@Argument Long id) {
        return holidayService.getHolidayById(id);
    }

    @QueryMapping
    public List<Holiday> getHolidaysByYear(@Argument Integer year) {
        return holidayService.getHolidaysByYear(year);
    }

    @QueryMapping
    public List<Holiday> getHolidaysByMonthAndYear(@Argument Integer month, @Argument Integer year) {
        return holidayService.getHolidaysByMonthAndYear(month, year);
    }

    @QueryMapping
    public List<Holiday> getCalendarView() {
        return holidayService.getAllHolidays();
    }

    // Mutation Resolvers
    @MutationMapping
    public Holiday createHoliday(@Argument Holiday input) {
        return holidayService.createHoliday(input);
    }

    @MutationMapping
    public List<Holiday> createHolidays(@Argument List<Holiday> input) {
        return holidayService.createHolidays(input);
    }

    @MutationMapping
    public Holiday updateHoliday(@Argument Long id, @Argument Holiday input) {
        return holidayService.updateHoliday(id, input);
    }

    @MutationMapping
    public String deleteHoliday(@Argument Long id) {
        ApiResponse response = holidayService.deleteHoliday(id);
        return response.getMessage();
    }
}
