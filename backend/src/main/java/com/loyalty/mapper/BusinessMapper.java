package com.loyalty.mapper;

import com.loyalty.dto.platform.AdminResponse;
import com.loyalty.dto.platform.BusinessResponse;
import com.loyalty.dto.platform.BusinessSummary;
import com.loyalty.entity.Business;
import com.loyalty.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BusinessMapper {

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "totalCustomers", ignore = true)
    @Mapping(target = "totalAdmins", ignore = true)
    BusinessResponse toResponse(Business business);

    @Mapping(target = "totalCustomers", ignore = true)
    BusinessSummary toSummary(Business business);

    @Mapping(target = "userId", source = "id")
    AdminResponse toAdminResponse(User user);
}
