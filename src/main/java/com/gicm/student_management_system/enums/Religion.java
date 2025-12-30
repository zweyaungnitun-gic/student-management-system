package com.gicm.student_management_system.enums;

import lombok.Getter;

@Getter
public enum Religion {
    BUDDHISM("buddhism", "仏教"),
    ISLAM("islam", "イスラム教"),
    CHRISTIAN("christian", "キリスト教"),
    OTHER("other", "その他");

    private final String value; // The database value (english)
    private final String label; // The display value (japanese)

    Religion(String value, String label) {
        this.value = value;
        this.label = label;
    }

    // Helper method to get the Japanese label from the English string
    public static String getLabelFromValue(String value) {
        if (value == null || value.isEmpty()) {
            return ""; 
        }
        
        for (Religion religion : Religion.values()) {
            if (religion.getValue().equalsIgnoreCase(value)) {
                return religion.getLabel();
            }
        }
        // If no match found, return the original value (fallback)
        return value;
    }
}