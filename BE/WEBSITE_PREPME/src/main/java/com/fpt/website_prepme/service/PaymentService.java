package com.fpt.website_prepme.service;

public interface PaymentService {
     //momo
     String createPaymentRequest(String amount);
     String checkPaymentStatus(String orderId);
}