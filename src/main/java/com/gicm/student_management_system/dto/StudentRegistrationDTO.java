package com.gicm.student_management_system.dto;

import com.gicm.student_management_system.dto.validation.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

public class StudentRegistrationDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    // First page fields with validation
    @NotBlank(message = "英語名は必須です", groups = FirstPageValidation.class)
    @Size(max = 20, message = "英語名は20文字以内で入力してください", groups = FirstPageValidation.class)
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "英語名は英字とスペースのみ入力してください", groups = FirstPageValidation.class)
    private String englishName;
    
    @NotBlank(message = "カタカナ名は必須です", groups = FirstPageValidation.class)
    @Size(max = 20, message = "カタカナ名は20文字以内で入力してください", groups = FirstPageValidation.class)
    @Pattern(regexp = "^[ァ-ヶー\\s]+$", message = "カタカナで入力してください", groups = FirstPageValidation.class)
    private String katakanaName;
    
    @NotBlank(message = "生年月日は必須です", groups = FirstPageValidation.class)
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "正しい日付形式で入力してください", groups = FirstPageValidation.class)
    private String dob;
    
    @NotBlank(message = "性別は必須です", groups = FirstPageValidation.class)
    @Pattern(regexp = "^(Male|Female)$", message = "性別を選択してください", groups = FirstPageValidation.class)
    private String gender;
    
    @NotBlank(message = "現在所は必須です", groups = FirstPageValidation.class)
    @Size(max = 100, message = "現在所は100文字以内で入力してください", groups = FirstPageValidation.class)
    private String currentAddress;
    
    @NotBlank(message = "出身地住所は必須です", groups = FirstPageValidation.class)
    @Size(max = 100, message = "出身地住所は100文字以内で入力してください", groups = FirstPageValidation.class)
    private String hometownAddress;
    
    @NotBlank(message = "電話番号は必須です", groups = FirstPageValidation.class)
    @Pattern(regexp = "^(\\+?959|09)\\d{7,9}$", message = "正しい電話番号形式で入力してください（例：09xxxxxxxxx または +959xxxxxxxxx）", groups = FirstPageValidation.class)
    private String phoneNumber;
    
    @NotBlank(message = "保護者電話番号は必須です", groups = FirstPageValidation.class)
    @Pattern(regexp = "^(\\+?959|09)\\d{7,9}$", message = "正しい電話番号形式で入力してください", groups = FirstPageValidation.class)
    private String guardianPhoneNumber;

    // Second page fields
    @NotBlank(message = "父親名は必須です", groups = SecondPageValidation.class)
    @Size(max = 20, message = "父親名は20文字以内で入力してください", groups = SecondPageValidation.class)
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "父親名は英字とスペースのみ入力してください", groups = SecondPageValidation.class)
    private String fatherName;

    @NotBlank(message = "パスポート番号は必須です", groups = SecondPageValidation.class)
    @Pattern(regexp = "^[A-Z]{2}[0-9]{7}$", message = "パスポート番号の形式が正しくありません（例：MA1234567）", groups = SecondPageValidation.class)
    private String passportNumber;

    @NotBlank(message = "国民ID番号は必須です", groups = SecondPageValidation.class)
    @Pattern(regexp = "^\\d{1,2}/[A-Za-z]{3,9}\\([A-Z]\\)\\d{6}$", message = "国民ID番号の形式が正しくありません（例：12/ThaPhaYa(N)111111）", groups = SecondPageValidation.class)
    private String nationalIdNumber;

    @NotBlank(message = "JLPTレベルは必須です", groups = SecondPageValidation.class)
    private String jlptLevel;

    @NotBlank(message = "希望職種は必須です", groups = SecondPageValidation.class)
    private String desiredOccupation;

    @Size(max = 20, message = "その他職種は20文字以内で入力してください", groups = SecondPageValidation.class)
    private String otherOccupation;

    @NotBlank(message = "日本渡航経験を選択してください", groups = SecondPageValidation.class)
    private String japanTravelExperience;

    @NotBlank(message = "COE申請経験を選択してください", groups = SecondPageValidation.class)
    private String coeApplicationExperience;

    // Additional fields (third page with validation)
    @NotBlank(message = "宗教を選択してください", groups = ThirdPageValidation.class)
    private String religion;
    
    @Size(max = 20, message = "その他宗教は20文字以内で入力してください", groups = ThirdPageValidation.class)
    private String otherReligion;
    
    @NotBlank(message = "タバコを選択してください", groups = ThirdPageValidation.class)
    private String smoking;
    
    @NotBlank(message = "お酒を選択してください", groups = ThirdPageValidation.class)
    private String alcohol;
    
    @NotBlank(message = "入れ墨を選択してください", groups = ThirdPageValidation.class)
    private String tattoo;
    
    @NotBlank(message = "授業料支払予定日は必須です", groups = ThirdPageValidation.class)
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "正しい日付形式で入力してください", groups = ThirdPageValidation.class)
    private String tuitionPaymentDate;
    
    @NotBlank(message = "寮を選択してください", groups = ThirdPageValidation.class)
    private String wantDorm;
    
    private String otherMemo;

    // Default constructor
    public StudentRegistrationDTO() {}

    // Getters and Setters for first page
    public String getEnglishName() { return englishName; }
    public void setEnglishName(String englishName) { this.englishName = englishName; }
    
    public String getKatakanaName() { return katakanaName; }
    public void setKatakanaName(String katakanaName) { this.katakanaName = katakanaName; }
    
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getCurrentAddress() { return currentAddress; }
    public void setCurrentAddress(String currentAddress) { this.currentAddress = currentAddress; }
    
    public String getHometownAddress() { return hometownAddress; }
    public void setHometownAddress(String hometownAddress) { this.hometownAddress = hometownAddress; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getGuardianPhoneNumber() { return guardianPhoneNumber; }
    public void setGuardianPhoneNumber(String guardianPhoneNumber) { this.guardianPhoneNumber = guardianPhoneNumber; }

    // Getters and Setters for second page
    public String getFatherName() { return fatherName; }
    public void setFatherName(String fatherName) { this.fatherName = fatherName; }
    
    public String getPassportNumber() { return passportNumber; }
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }
    
    public String getNationalIdNumber() { return nationalIdNumber; }
    public void setNationalIdNumber(String nationalIdNumber) { this.nationalIdNumber = nationalIdNumber; }
    
    public String getJlptLevel() { return jlptLevel; }
    public void setJlptLevel(String jlptLevel) { this.jlptLevel = jlptLevel; }
    
    public String getDesiredOccupation() { return desiredOccupation; }
    public void setDesiredOccupation(String desiredOccupation) { this.desiredOccupation = desiredOccupation; }
    
    public String getOtherOccupation() { return otherOccupation; }
    public void setOtherOccupation(String otherOccupation) { this.otherOccupation = otherOccupation; }
    
    public String getJapanTravelExperience() { return japanTravelExperience; }
    public void setJapanTravelExperience(String japanTravelExperience) { this.japanTravelExperience = japanTravelExperience; }
    
    public String getCoeApplicationExperience() { return coeApplicationExperience; }
    public void setCoeApplicationExperience(String coeApplicationExperience) { this.coeApplicationExperience = coeApplicationExperience; }

    // Getters and Setters for additional fields
    public String getReligion() {
        return religion;
    }
    public void setReligion(String religion) {
        this.religion = religion;
    }

    public String getOtherReligion() {
        return otherReligion;
    }
    public void setOtherReligion(String otherReligion) {
        this.otherReligion = otherReligion;
    }

    public String getSmoking() {
        return smoking;
    }
    public void setSmoking(String smoking) {
        this.smoking = smoking;
    }

    public String getAlcohol() {
        return alcohol;
    }
    public void setAlcohol(String alcohol) {
        this.alcohol = alcohol;
    }

    public String getTattoo() {
        return tattoo;
    }
    public void setTattoo(String tattoo) {
        this.tattoo = tattoo;
    }

    public String getTuitionPaymentDate() {
        return tuitionPaymentDate;
    }
    public void setTuitionPaymentDate(String tuitionPaymentDate) {
        this.tuitionPaymentDate = tuitionPaymentDate;
    }

    public String getWantDorm() {
        return wantDorm;
    }
    public void setWantDorm(String wantDorm) {
        this.wantDorm = wantDorm;
    }

    public String getOtherMemo() {
        return otherMemo;
    }
    public void setOtherMemo(String otherMemo) {
        this.otherMemo = otherMemo;
    }
}