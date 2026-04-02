package edu.sliit.smartcampus.util;

import java.util.Map;

public final class ResponseUtil {

    private ResponseUtil() {
    }

    public static Map<String, Object> ok(String message) {
        return Map.of("message", message);
    }
}
