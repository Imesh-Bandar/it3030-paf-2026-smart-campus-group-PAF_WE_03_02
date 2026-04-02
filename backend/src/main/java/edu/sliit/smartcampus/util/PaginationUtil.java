package edu.sliit.smartcampus.util;

import org.springframework.data.domain.Pageable;

public final class PaginationUtil {

    private PaginationUtil() {
    }

    public static Pageable defaultPageable(Pageable pageable) {
        return pageable;
    }
}
