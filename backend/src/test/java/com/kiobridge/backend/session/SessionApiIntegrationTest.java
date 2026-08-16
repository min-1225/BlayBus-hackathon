package com.kiobridge.backend.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.kiobridge.backend.support.MutableClock;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * REST API 통합 테스트. MockMvc 로 Controller → Service → Repository 실제 흐름을 검증한다.
 * MockMvc 는 Spring Test 가 제공하는 도구이며 직접 HTTP 클라이언트를 만들지 않는다.
 */
@SpringBootTest
@Import(SessionApiIntegrationTest.TestClockConfig.class)
class SessionApiIntegrationTest {

    @TestConfiguration
    static class TestClockConfig {
        @Bean
        @Primary
        MutableClock testClock() {
            return new MutableClock(Instant.parse("2026-08-14T10:00:00Z"), ZoneId.of("UTC"));
        }
    }

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private MutableClock clock;

    private MockMvc mockMvc;

    private MockMvc mvc() {
        if (mockMvc == null) {
            mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        }
        return mockMvc;
    }

    // ------- 1. 세션 생성 -------
    @Test
    void createSession_returns201WithActiveState() throws Exception {
        mvc().perform(post("/api/v1/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"departure\":\"동서울\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.currentStep").value("DESTINATION"))
                .andExpect(jsonPath("$.departure").value("동서울"))
                .andExpect(jsonPath("$.seatNo").doesNotExist());
    }

    // ------- 2. 단건 조회 -------
    @Test
    void getSession_returnsCreatedSession() throws Exception {
        long id = createSession();
        mvc().perform(get("/api/v1/sessions/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value((int) id))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    // ------- 3. PATCH 성공 -------
    @Test
    void patchSession_updatesOnlyProvidedFields() throws Exception {
        long id = createSession();
        mvc().perform(patch("/api/v1/sessions/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"destination\":\"강릉\",\"travelDate\":\"2026-08-14\","
                                + "\"departureTime\":\"11:30\",\"busGrade\":\"PREMIUM\","
                                + "\"currentStep\":\"SEAT_SELECTION\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.destination").value("강릉"))
                .andExpect(jsonPath("$.travelDate").value("2026-08-14"))
                .andExpect(jsonPath("$.departureTime").value("11:30"))
                .andExpect(jsonPath("$.busGrade").value("PREMIUM"))
                .andExpect(jsonPath("$.currentStep").value("SEAT_SELECTION"))
                .andExpect(jsonPath("$.departure").value("동서울"));
    }

    // ------- 4. 시간표 조회 -------
    @Test
    void getSchedules_returnsGangneungOptions() throws Exception {
        mvc().perform(get("/api/v1/schedules").param("destination", "강릉"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5))
                .andExpect(jsonPath("$[2].id").value("gn-1130"))
                .andExpect(jsonPath("$[2].departureTime").value("11:30"))
                .andExpect(jsonPath("$[2].busGrade").value("PREMIUM"))
                .andExpect(jsonPath("$[2].fareWon").value(22500))
                .andExpect(jsonPath("$[2].remainingSeats").value(8));
    }

    // ------- 5. Transfer 발급: ACTIVE → WAITING -------
    @Test
    void transfer_issuesSixDigitCodeAndMovesToWaiting() throws Exception {
        long id = createSession();
        mvc().perform(post("/api/v1/sessions/" + id + "/transfer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value((int) id))
                .andExpect(jsonPath("$.code").value(org.hamcrest.Matchers.matchesPattern("\\d{6}")))
                .andExpect(jsonPath("$.expiresAt").exists());

        mvc().perform(get("/api/v1/sessions/" + id))
                .andExpect(jsonPath("$.status").value("WAITING"));
    }

    // ------- 6. 동일 세션 Transfer 재요청 → 같은 코드 -------
    @Test
    void transfer_repeatedRequestReturnsSameCode() throws Exception {
        long id = createSession();
        String first = issueTransfer(id);
        String second = issueTransfer(id);
        assertThat(second).isEqualTo(first);
    }

    // ------- 7. 코드로 세션 조회 -------
    @Test
    void getByTransferCode_returnsSession() throws Exception {
        long id = createSession();
        String code = issueTransfer(id);
        mvc().perform(get("/api/v1/transfers/" + code))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value((int) id))
                .andExpect(jsonPath("$.transferCode").value(code));
    }

    // ------- 8. Claim: WAITING → CLAIMED -------
    @Test
    void claim_movesWaitingToClaimed() throws Exception {
        long id = createSession();
        issueTransfer(id);
        mvc().perform(post("/api/v1/sessions/" + id + "/claim").content("{}").contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLAIMED"));
    }

    // ------- 9. 중복 Claim → 409 INVALID_SESSION_STATUS -------
    @Test
    void claim_duplicateReturnsConflict() throws Exception {
        long id = createSession();
        issueTransfer(id);
        claim(id);
        mvc().perform(post("/api/v1/sessions/" + id + "/claim"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_SESSION_STATUS"));
    }

    // ------- 10. 좌석 없는 Complete → 400 VALIDATION_ERROR -------
    @Test
    void complete_withoutSeatReturnsValidationError() throws Exception {
        long id = createSession();
        issueTransfer(id);
        claim(id);
        mvc().perform(post("/api/v1/sessions/" + id + "/complete"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    // ------- 11. 좌석 PATCH 후 Complete: CLAIMED → COMPLETED -------
    @Test
    void complete_afterSeatPatchMovesToCompleted() throws Exception {
        long id = createSession();
        issueTransfer(id);
        claim(id);
        patchSeat(id, "7");
        mvc().perform(post("/api/v1/sessions/" + id + "/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.currentStep").value("COMPLETED"))
                .andExpect(jsonPath("$.seatNo").value("7"));
    }

    @Test
    void customerCanCompleteActiveSessionAfterSelectingSeat() throws Exception {
        long id = createSession();
        patchSeat(id, "7");

        mvc().perform(post("/api/v1/sessions/" + id + "/complete"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.currentStep").value("COMPLETED"))
                .andExpect(jsonPath("$.seatNo").value("7"));
    }

    // ------- 12. COMPLETED 세션 수정 차단 -------
    @Test
    void patch_onCompletedSessionIsBlocked() throws Exception {
        long id = createSession();
        issueTransfer(id);
        claim(id);
        patchSeat(id, "7");
        mvc().perform(post("/api/v1/sessions/" + id + "/complete")).andExpect(status().isOk());

        mvc().perform(patch("/api/v1/sessions/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"seatNo\":\"9\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_SESSION_STATUS"));
    }

    // ------- 13. 존재하지 않는 세션 → 404 SESSION_NOT_FOUND -------
    @Test
    void getSession_missingReturnsNotFound() throws Exception {
        mvc().perform(get("/api/v1/sessions/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("SESSION_NOT_FOUND"));
    }

    // ------- 14. 존재하지 않는 코드 → 404 TRANSFER_CODE_NOT_FOUND -------
    @Test
    void getByTransferCode_missingReturnsNotFound() throws Exception {
        mvc().perform(get("/api/v1/transfers/000000"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TRANSFER_CODE_NOT_FOUND"));
    }

    // ------- 15. 만료 코드 → 404 TRANSFER_CODE_EXPIRED -------
    @Test
    void getByTransferCode_expiredReturnsExpired() throws Exception {
        long id = createSession();
        String code = issueTransfer(id);
        clock.advance(Duration.ofMinutes(16));
        mvc().perform(get("/api/v1/transfers/" + code))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TRANSFER_CODE_EXPIRED"));
    }

    // ------- 16. 잘못된 Enum → 400 VALIDATION_ERROR -------
    @Test
    void patch_invalidEnumReturnsValidationError() throws Exception {
        long id = createSession();
        mvc().perform(patch("/api/v1/sessions/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"busGrade\":\"LUXURY\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void createSession_missingDepartureReturnsValidationError() throws Exception {
        mvc().perform(post("/api/v1/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    // ---------- helpers ----------

    private long createSession() throws Exception {
        ResultActions result = mvc().perform(post("/api/v1/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"departure\":\"동서울\"}"))
                .andExpect(status().isCreated());
        Number id = JsonPath.read(body(result), "$.id");
        return id.longValue();
    }

    private String issueTransfer(long id) throws Exception {
        ResultActions result = mvc().perform(post("/api/v1/sessions/" + id + "/transfer"))
                .andExpect(status().isOk());
        return JsonPath.read(body(result), "$.code");
    }

    private void claim(long id) throws Exception {
        mvc().perform(post("/api/v1/sessions/" + id + "/claim")).andExpect(status().isOk());
    }

    private void patchSeat(long id, String seat) throws Exception {
        mvc().perform(patch("/api/v1/sessions/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"seatNo\":\"" + seat + "\"}"))
                .andExpect(status().isOk());
    }

    private String body(ResultActions result) throws Exception {
        return result.andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
    }
}
