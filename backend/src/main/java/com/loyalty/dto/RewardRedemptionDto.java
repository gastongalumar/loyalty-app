package com.loyalty.dto;

public class RewardRedemptionDto {

    public static class Request {
        private Long rewardId;
        private String rewardType; // "CARD" o "FIDELITY"

        public Long getRewardId() { return rewardId; }
        public void setRewardId(Long rewardId) { this.rewardId = rewardId; }

        public String getRewardType() { return rewardType; }
        public void setRewardType(String rewardType) { this.rewardType = rewardType; }
    }

    public static class Response {
        private Long rewardId;
        private String status;
        private String message;

        public Response(Long rewardId, String status, String message) {
            this.rewardId = rewardId;
            this.status = status;
            this.message = message;
        }

        public Long getRewardId() { return rewardId; }
        public String getStatus() { return status; }
        public String getMessage() { return message; }
    }
}
