package com.kiobridge.backend.session.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.kiobridge.backend.session.BookingStep;
import com.kiobridge.backend.session.BusGrade;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * PATCH /api/v1/sessions/{id} 요청 본문.
 *
 * 모든 필드는 optional 이며, 전달된(=null 이 아닌) 필드만 반영한다.
 * Frontend(SessionPatch)는 바꾸려는 필드만 담아 보내므로 null=미변경 규칙으로 충분하다.
 * 잘못된 Enum/날짜/시간 문자열은 역직렬화 단계에서 걸러져 VALIDATION_ERROR(400) 가 된다.
 */
public class UpdateSessionRequest {

    private BookingStep currentStep;
    private String destination;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate travelDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime departureTime;

    private BusGrade busGrade;
    private String seatNo;

    public BookingStep getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(BookingStep currentStep) {
        this.currentStep = currentStep;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDate getTravelDate() {
        return travelDate;
    }

    public void setTravelDate(LocalDate travelDate) {
        this.travelDate = travelDate;
    }

    public LocalTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalTime departureTime) {
        this.departureTime = departureTime;
    }

    public BusGrade getBusGrade() {
        return busGrade;
    }

    public void setBusGrade(BusGrade busGrade) {
        this.busGrade = busGrade;
    }

    public String getSeatNo() {
        return seatNo;
    }

    public void setSeatNo(String seatNo) {
        this.seatNo = seatNo;
    }
}
