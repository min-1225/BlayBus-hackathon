package com.kiobridge.backend.websocket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/**
 * WebSocket 이벤트 발행 검증.
 *
 * MockMvc 로 실제 REST 엔드포인트를 호출하면 서비스의 @Transactional 이 커밋되고,
 * 그때 AFTER_COMMIT 리스너(SessionEventPublisher)가 SimpMessagingTemplate.convertAndSend 를 호출한다.
 * 여기서는 그 template 을 Mock 으로 바꿔 발행 여부·Topic·payload 를 검증한다.
 * (테스트 클래스에 @Transactional 을 붙이면 커밋이 일어나지 않아 이벤트가 발행되지 않으므로 붙이지 않는다.)
 */
@SpringBootTest
class SessionWebSocketEventTest {

    @MockitoBean
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private MockMvc mvc() {
        if (mockMvc == null) {
            mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
        }
        return mockMvc;
    }

    // 1. Claim 성공 → SESSION_CLAIMED, 5·6. 올바른 Topic + sessionId/occurredAt 포함
    @Test
    void claim_publishesSessionClaimedToCorrectTopic() throws Exception {
        long id = createSession();
        issueTransfer(id);
        clearInvocations(messagingTemplate);

        mvc().perform(post("/api/v1/sessions/" + id + "/claim")).andExpect(status().isOk());

        SessionEvent event = captureSingleEvent(id);
        assertThat(event.type()).isEqualTo(SessionEventType.SESSION_CLAIMED);
        assertThat(event.sessionId()).isEqualTo(id);
        assertThat(event.occurredAt()).isNotNull();
    }

    // 2. PATCH 성공 → SESSION_UPDATED
    @Test
    void patch_publishesSessionUpdated() throws Exception {
        long id = createSession();
        clearInvocations(messagingTemplate);

        mvc().perform(patch("/api/v1/sessions/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"destination\":\"강릉\"}"))
                .andExpect(status().isOk());

        SessionEvent event = captureSingleEvent(id);
        assertThat(event.type()).isEqualTo(SessionEventType.SESSION_UPDATED);
        assertThat(event.sessionId()).isEqualTo(id);
        assertThat(event.occurredAt()).isNotNull();
    }

    // 3. Complete 성공 → SESSION_COMPLETED
    @Test
    void complete_publishesSessionCompleted() throws Exception {
        long id = createSession();
        issueTransfer(id);
        mvc().perform(post("/api/v1/sessions/" + id + "/claim")).andExpect(status().isOk());
        mvc().perform(patch("/api/v1/sessions/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"destination\":\"강릉\",\"travelDate\":\"2026-08-20\","
                                + "\"departureTime\":\"11:30\",\"busGrade\":\"PREMIUM\","
                                + "\"seatNo\":\"7\"}"))
                .andExpect(status().isOk());
        clearInvocations(messagingTemplate);

        mvc().perform(post("/api/v1/sessions/" + id + "/complete")).andExpect(status().isOk());

        SessionEvent event = captureSingleEvent(id);
        assertThat(event.type()).isEqualTo(SessionEventType.SESSION_COMPLETED);
        assertThat(event.sessionId()).isEqualTo(id);
        assertThat(event.occurredAt()).isNotNull();
    }

    // 4. 상태 전이 실패 시 이벤트 발행 안 함 (ACTIVE 세션 Claim → 409)
    @Test
    void failedTransition_doesNotPublish() throws Exception {
        long id = createSession();
        clearInvocations(messagingTemplate);

        mvc().perform(post("/api/v1/sessions/" + id + "/claim")).andExpect(status().isConflict());

        verifyNoInteractions(messagingTemplate);
    }

    // ---------- helpers ----------

    private SessionEvent captureSingleEvent(long id) {
        ArgumentCaptor<String> destination = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Object> payload = ArgumentCaptor.forClass(Object.class);
        verify(messagingTemplate, times(1)).convertAndSend(destination.capture(), payload.capture());
        assertThat(destination.getValue()).isEqualTo("/topic/sessions/" + id);
        assertThat(payload.getValue()).isInstanceOf(SessionEvent.class);
        return (SessionEvent) payload.getValue();
    }

    private long createSession() throws Exception {
        ResultActions result = mvc().perform(post("/api/v1/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"departure\":\"동서울\"}"))
                .andExpect(status().isCreated());
        Number id = JsonPath.read(body(result), "$.id");
        return id.longValue();
    }

    private void issueTransfer(long id) throws Exception {
        mvc().perform(post("/api/v1/sessions/" + id + "/transfer")).andExpect(status().isOk());
    }

    private String body(ResultActions result) throws Exception {
        return result.andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
    }
}
