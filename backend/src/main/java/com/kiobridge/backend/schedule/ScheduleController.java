package com.kiobridge.backend.schedule;

import com.kiobridge.backend.session.BusGrade;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 시간표 조회. 데모용 고정 데이터로 제공하며, Frontend 의 SCHEDULES(src/mocks/data.ts)와 동일한 값을 반환한다.
 * 알 수 없는 목적지는 빈 배열을 반환한다.
 */
@RestController
@RequestMapping("/api/v1")
public class ScheduleController {

    private static final Map<String, List<ScheduleOptionResponse>> SCHEDULES = Map.of(
            "강릉", List.of(
                    new ScheduleOptionResponse("gn-0900", "09:00", BusGrade.STANDARD, 15400, 12),
                    new ScheduleOptionResponse("gn-1030", "10:30", BusGrade.STANDARD, 15400, 3),
                    new ScheduleOptionResponse("gn-1130", "11:30", BusGrade.PREMIUM, 22500, 8),
                    new ScheduleOptionResponse("gn-1400", "14:00", BusGrade.PREMIUM, 22500, 21),
                    new ScheduleOptionResponse("gn-1730", "17:30", BusGrade.STANDARD, 15400, 0)
            ),
            "속초", List.of(
                    new ScheduleOptionResponse("sc-0930", "09:30", BusGrade.STANDARD, 17800, 9),
                    new ScheduleOptionResponse("sc-1300", "13:00", BusGrade.PREMIUM, 25900, 14)
            ),
            "춘천", List.of(
                    new ScheduleOptionResponse("cc-0820", "08:20", BusGrade.STANDARD, 8600, 18),
                    new ScheduleOptionResponse("cc-1215", "12:15", BusGrade.STANDARD, 8600, 6)
            ),
            "원주", List.of(
                    new ScheduleOptionResponse("wj-1000", "10:00", BusGrade.STANDARD, 9800, 22),
                    new ScheduleOptionResponse("wj-1530", "15:30", BusGrade.PREMIUM, 14200, 11)
            ),
            "안동", List.of(
                    new ScheduleOptionResponse("ad-1100", "11:00", BusGrade.PREMIUM, 28400, 7)
            ),
            "전주", List.of(
                    new ScheduleOptionResponse("jj-0940", "09:40", BusGrade.PREMIUM, 26100, 15),
                    new ScheduleOptionResponse("jj-1620", "16:20", BusGrade.STANDARD, 19300, 4)
            )
    );

    /** GET /api/v1/schedules?destination=강릉 */
    @GetMapping("/schedules")
    public List<ScheduleOptionResponse> getSchedules(@RequestParam String destination) {
        return SCHEDULES.getOrDefault(destination, List.of());
    }
}
