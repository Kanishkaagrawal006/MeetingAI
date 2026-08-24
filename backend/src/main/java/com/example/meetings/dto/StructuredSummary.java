package com.example.meetings.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StructuredSummary(
        String summary,
        List<String> keyDecisions,
        List<ActionItem> actionItems,
        List<String> risks
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ActionItem(
            String task,
            String assignee,
            String deadline,
            String priority
    ) {
    }
}