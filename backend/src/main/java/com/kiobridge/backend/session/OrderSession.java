package com.kiobridge.backend.session;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * 키오스크에서 진행 중인 하나의 예매 세션.
 *
 * 해커톤 MVP 규모이므로 Entity 는 이 하나면 충분하다.
 * {@code transferExpiresAt} 는 서버 내부 관리 필드이며, 일반 Session 응답에는 노출하지 않는다
 * (Transfer 응답의 {@code expiresAt} 으로만 반환한다).
 */
@Entity
public class OrderSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    @Enumerated(EnumType.STRING)
    private BookingStep currentStep;

    private String departure;
    private String destination;
    private LocalDate travelDate;
    private LocalTime departureTime;

    @Enumerated(EnumType.STRING)
    private BusGrade busGrade;

    private String seatNo;

    private String transferCode;
    private LocalDateTime transferExpiresAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected OrderSession() {
        // JPA 전용 기본 생성자
    }

    public static OrderSession createActive(String departure, LocalDateTime now) {
        OrderSession session = new OrderSession();
        session.status = SessionStatus.ACTIVE;
        session.currentStep = BookingStep.DESTINATION;
        session.departure = departure;
        session.createdAt = now;
        session.updatedAt = now;
        return session;
    }

    public Long getId() {
        return id;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public BookingStep getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(BookingStep currentStep) {
        this.currentStep = currentStep;
    }

    public String getDeparture() {
        return departure;
    }

    public void setDeparture(String departure) {
        this.departure = departure;
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

    public String getTransferCode() {
        return transferCode;
    }

    public void setTransferCode(String transferCode) {
        this.transferCode = transferCode;
    }

    public LocalDateTime getTransferExpiresAt() {
        return transferExpiresAt;
    }

    public void setTransferExpiresAt(LocalDateTime transferExpiresAt) {
        this.transferExpiresAt = transferExpiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
