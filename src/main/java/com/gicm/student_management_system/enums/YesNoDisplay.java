package com.gicm.student_management_system.enums;

public enum YesNoDisplay {

    YES(true, "ある"),
    NO(false, "ない"),
    EMPTY(null, "");

    private final Boolean value;
    private final String label;

    YesNoDisplay(Boolean value, String label) {
        this.value = value;
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static YesNoDisplay from(Boolean value) {
        if (value == null) {
            return EMPTY;
        }
        return value ? YES : NO;
    }
}
