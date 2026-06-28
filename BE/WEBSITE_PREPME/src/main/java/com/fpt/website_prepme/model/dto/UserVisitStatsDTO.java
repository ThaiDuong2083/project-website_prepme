package com.fpt.website_prepme.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserVisitStatsDTO {
    private long totalVisits;
    private List<VisitStatsEntry> details;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VisitStatsEntry {
        private String period; // e.g. "2026-06-28", "2026-06", or "2026"
        private long count;
    }
}
