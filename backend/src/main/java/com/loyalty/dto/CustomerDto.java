package com.loyalty.dto;

import java.time.LocalDateTime;

public class CustomerDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String qrCode;
    private Integer currentStamps;
    private Integer totalStamps;
    private Integer completedCards;
    private String cardStatus;
    private LocalDateTime memberSince;

    public CustomerDto() {}

    public CustomerDto(Long id, String email, String firstName, String lastName, String phone, String qrCode, Integer currentStamps, Integer totalStamps, Integer completedCards, String cardStatus, LocalDateTime memberSince) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.qrCode = qrCode;
        this.currentStamps = currentStamps;
        this.totalStamps = totalStamps;
        this.completedCards = completedCards;
        this.cardStatus = cardStatus;
        this.memberSince = memberSince;
    }

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getEmail(){return email;} public void setEmail(String email){this.email=email;}
    public String getFirstName(){return firstName;} public void setFirstName(String firstName){this.firstName=firstName;}
    public String getLastName(){return lastName;} public void setLastName(String lastName){this.lastName=lastName;}
    public String getPhone(){return phone;} public void setPhone(String phone){this.phone=phone;}
    public String getQrCode(){return qrCode;} public void setQrCode(String qrCode){this.qrCode=qrCode;}
    public Integer getCurrentStamps(){return currentStamps;} public void setCurrentStamps(Integer currentStamps){this.currentStamps=currentStamps;}
    public Integer getTotalStamps(){return totalStamps;} public void setTotalStamps(Integer totalStamps){this.totalStamps=totalStamps;}
    public Integer getCompletedCards(){return completedCards;} public void setCompletedCards(Integer completedCards){this.completedCards=completedCards;}
    public String getCardStatus(){return cardStatus;} public void setCardStatus(String cardStatus){this.cardStatus=cardStatus;}
    public LocalDateTime getMemberSince(){return memberSince;} public void setMemberSince(LocalDateTime memberSince){this.memberSince=memberSince;}

    public static Builder builder(){return new Builder();}
    public static class Builder{ private CustomerDto dto = new CustomerDto(); public Builder id(Long id){dto.setId(id);return this;} public Builder email(String e){dto.setEmail(e);return this;} public Builder firstName(String f){dto.setFirstName(f);return this;} public Builder lastName(String l){dto.setLastName(l);return this;} public Builder phone(String p){dto.setPhone(p);return this;} public Builder qrCode(String q){dto.setQrCode(q);return this;} public Builder currentStamps(Integer c){dto.setCurrentStamps(c);return this;} public Builder totalStamps(Integer t){dto.setTotalStamps(t);return this;} public Builder completedCards(Integer c){dto.setCompletedCards(c);return this;} public Builder cardStatus(String s){dto.setCardStatus(s);return this;} public Builder memberSince(java.time.LocalDateTime m){dto.setMemberSince(m);return this;} public CustomerDto build(){return dto;} }
}
