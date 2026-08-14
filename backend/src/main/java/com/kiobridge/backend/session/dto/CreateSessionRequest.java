package com.kiobridge.backend.session.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * POST /api/v1/sessions 요청 본문.
 */
public class CreateSessionRequest {

    @NotBlank(message = "은(는) 필수입니다.")
    private String departure;

    public String getDeparture() {
        return departure;
    }

    public void setDeparture(String departure) {
        this.departure = departure;
    }
}
