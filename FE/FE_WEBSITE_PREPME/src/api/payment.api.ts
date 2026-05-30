import axiosInstance from '@lib/axios.lib';
import type { ApiResponse } from '@types';

export const paymentApi = {
  createMomoPayment: async (amount: string): Promise<any> => {
    const response = await axiosInstance.post('/payment', { amount });
    return response.data;
  },

  checkPaymentStatus: async (orderId: string): Promise<any> => {
    const response = await axiosInstance.get(`/payment/order-status/${orderId}`);
    return response.data;
  },
};
