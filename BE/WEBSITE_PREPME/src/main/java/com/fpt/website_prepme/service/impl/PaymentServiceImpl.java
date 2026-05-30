package com.fpt.website_prepme.service.impl;

import com.fpt.website_prepme.config.MomoConfig;
import com.fpt.website_prepme.exception.AppException;
import com.fpt.website_prepme.exception.ErrorCode;
import com.fpt.website_prepme.service.PaymentService;
import com.fpt.website_prepme.model.entity.PaymentTransactionEntity;
import com.fpt.website_prepme.model.entity.UserEntity;
import com.fpt.website_prepme.enums.PaymentStatus;
import com.fpt.website_prepme.enums.MembershipType;
import com.fpt.website_prepme.repository.UserRepository;
import com.fpt.website_prepme.repository.PaymentTransactionRepository;
import com.fpt.website_prepme.repository.UserMembershipLogRepository;
import com.fpt.website_prepme.model.entity.UserMembershipLogEntity;
import java.time.LocalDateTime;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.cloudinary.json.JSONObject;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

  private final MomoConfig momoConfig;
  private final UserRepository userRepository;
  private final PaymentTransactionRepository paymentTransactionRepository;
  private final UserMembershipLogRepository userMembershipLogRepository;

  //momo
  @Override
  @Transactional
  public String createPaymentRequest(String amount) {
    try {
      // Get current authenticated user
      String username = SecurityContextHolder.getContext().getAuthentication().getName();
      UserEntity user = userRepository.findByUsername(username)
              .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found"));

      // Generate requestId and orderId
      String requestId = momoConfig.getPARTNER_CODE() + new Date().getTime();
      String orderId = requestId;
      String orderInfo = "Nâng cấp tài khoản PRO - Prepme";
      String extraData = "";

      // Generate raw signature
      String rawSignature = String.format(
          "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
          momoConfig.getACCESS_KEY(), amount, extraData, momoConfig.getIPN_URL(), orderId,
          orderInfo, momoConfig.getPARTNER_CODE(), momoConfig.getREDIRECT_URL(),
          requestId, momoConfig.getREQUEST_TYPE());

      // Sign with HMAC SHA256
      String signature = signHmacSHA256(rawSignature, momoConfig.getSECRET_KEY());

      JSONObject requestBody = new JSONObject();
      requestBody.put("partnerCode", momoConfig.getPARTNER_CODE());
      requestBody.put("accessKey", momoConfig.getACCESS_KEY());
      requestBody.put("requestId", requestId);
      requestBody.put("amount", amount);
      requestBody.put("orderId", orderId);
      requestBody.put("orderInfo", orderInfo);
      requestBody.put("redirectUrl", momoConfig.getREDIRECT_URL());
      requestBody.put("ipnUrl", momoConfig.getIPN_URL());
      requestBody.put("extraData", extraData);
      requestBody.put("requestType", momoConfig.getREQUEST_TYPE());
      requestBody.put("signature", signature);
      requestBody.put("lang", "vi");

      CloseableHttpClient httpClient = HttpClients.createDefault();
      HttpPost httpPost = new HttpPost("https://test-payment.momo.vn/v2/gateway/api/create");
      httpPost.setHeader("Content-Type", "application/json");
      httpPost.setEntity(new StringEntity(requestBody.toString(), StandardCharsets.UTF_8));

      try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
        BufferedReader reader = new BufferedReader(
            new InputStreamReader(response.getEntity().getContent(), StandardCharsets.UTF_8));
        StringBuilder result = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
          result.append(line);
        }
        
        String resultStr = result.toString();
        JSONObject responseJson = new JSONObject(resultStr);

        // If transaction link is generated successfully, create and save the transaction entity
        if (responseJson.has("payUrl")) {
            PaymentTransactionEntity transaction = PaymentTransactionEntity.builder()
                    .user(user)
                    .amount(new BigDecimal(amount))
                    .currency("VND")
                    .paymentProvider("MOMO")
                    .transactionReference(orderId)
                    .status(PaymentStatus.PENDING)
                    .description(orderInfo)
                    .build();
            paymentTransactionRepository.save(transaction);
        }

        return resultStr;
      }
    } catch (Exception e) {
      e.printStackTrace();
      return "{\"error\": \"Failed to create payment request: " + e.getMessage() + "\"}";
    }
  }

  // HMAC SHA256 signing method
  private static String signHmacSHA256(String data, String key) {
      try {
          Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
          SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
          hmacSHA256.init(secretKey);
          byte[] hash = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));
          StringBuilder hexString = new StringBuilder();
          for (byte b : hash) {
              String hex = Integer.toHexString(0xff & b);
              if (hex.length() == 1) {
                  hexString.append('0');
              }
              hexString.append(hex);
          }
          return hexString.toString();
      } catch (Exception e) {
          throw new AppException(ErrorCode.NOT_FOUND, e);
      }
  }


  @Override
  @Transactional
  public String checkPaymentStatus(String orderId) {
    try {
      String requestId = momoConfig.getPARTNER_CODE() + new Date().getTime();
      String rawSignature = String.format(
          "accessKey=%s&orderId=%s&partnerCode=%s&requestId=%s",
          momoConfig.getACCESS_KEY(), orderId, momoConfig.getPARTNER_CODE(), requestId);
      String signature = signHmacSHA256(rawSignature, momoConfig.getSECRET_KEY());

      JSONObject requestBody = new JSONObject();
      requestBody.put("partnerCode", momoConfig.getPARTNER_CODE());
      requestBody.put("accessKey", momoConfig.getACCESS_KEY());
      requestBody.put("requestId", requestId);
      requestBody.put("orderId", orderId);
      requestBody.put("signature", signature);
      requestBody.put("lang", "vi");

      CloseableHttpClient httpClient = HttpClients.createDefault();
      HttpPost httpPost = new HttpPost("https://test-payment.momo.vn/v2/gateway/api/query");
      httpPost.setHeader("Content-Type", "application/json");
      httpPost.setEntity(new StringEntity(requestBody.toString(), StandardCharsets.UTF_8));

      try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
        BufferedReader reader = new BufferedReader(
            new InputStreamReader(response.getEntity().getContent(), StandardCharsets.UTF_8));
        StringBuilder result = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
          result.append(line);
        }
        
        String resultStr = result.toString();
        JSONObject responseJson = new JSONObject(resultStr);

        // Process status update in database
        if (responseJson.has("resultCode")) {
            int resultCode = responseJson.getInt("resultCode");
            paymentTransactionRepository.findByTransactionReference(orderId).ifPresent(transaction -> {
                if (transaction.getStatus() == PaymentStatus.PENDING) {
                    if (resultCode == 0) {
                        transaction.setStatus(PaymentStatus.COMPLETED);
                        paymentTransactionRepository.save(transaction);

                        // Upgrade user to PRO/PREMIUM
                        UserEntity user = transaction.getUser();
                        MembershipType oldType = user.getMembershipType();
                        user.setMembershipType(MembershipType.PREMIUM);
                        user.setProSubscribedAt(LocalDateTime.now());
                        user.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(30));
                        userRepository.save(user);

                        // Save membership change log
                        UserMembershipLogEntity logEntity = UserMembershipLogEntity.builder()
                                .user(user)
                                .oldMembershipType(oldType)
                                .newMembershipType(MembershipType.PREMIUM)
                                .changeReason("PRO upgrade via MOMO payment (orderId: " + orderId + ")")
                                .build();
                        userMembershipLogRepository.save(logEntity);
                    } else if (resultCode != 1000 && resultCode != 9000) { // NOT pending / initiated
                        transaction.setStatus(PaymentStatus.FAILED);
                        paymentTransactionRepository.save(transaction);
                    }
                }
            });
        }

        return resultStr;
      }
    } catch (Exception e) {
      e.printStackTrace();
      return "{\"error\": \"Failed to check payment status: " + e.getMessage() + "\"}";
    }
  }
}
