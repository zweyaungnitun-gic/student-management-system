package com.gicm.student_management_system.dto;

import java.io.Serializable;

public class StudentRegistrationDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    // First page fields
    private String englishName;
    private String katakanaName;
    private String dob;
    private String gender;
    private String currentAddress;
    private String hometownAddress;
    private String phoneNumber;
    private String guardianPhoneNumber;

    // Second page fields (NEW)
    private String fatherName;
    private String passportNumber;
    private String nationalIdNumber;
    private String jlptLevel;
    private String desiredOccupation;
    private String otherOccupation;
    private String japanTravelExperience;
    private String coeApplicationExperience;

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

    // Getters and Setters for second page (NEW)
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
}