# Hướng Dẫn Tạo Giao Diện & Gọi API Mới Bắt Đầu (Frontend Flow)

Chào bạn, đối với dự án React + Vite hiện tại đang ứng dụng kiến trúc chuẩn (React Router DOM, Axios, Tanstack React Query), khi bạn muốn làm thêm 1 tính năng mới (ví dụ hiển thị Danh sách ABC, call API Backend...), bạn hãy tuân thủ theo **Flow 6 Bước** dưới đây. Nó giúp dự án mở rộng tốt và tránh spaghetti code.

Lộ trình: **Constants -> Types -> API -> Hooks -> Pages -> Router**.

---

## Bước 1: Định nghĩa Route của trang web
Tất cả các đường dẫn (`url`) của web phải được định nghĩa ở đây để tái sử dụng.

📂 **File:** `src/constants/routes.constants.ts`
```typescript
export const ROUTES = {
  // ... (phần hiện tại)
  USER: {
    // ...
    CUSTOM_FEATURE: '/custom-feature', // 👈 Khai báo path vào đây
  }
} as const;
```

---

## Bước 2: Khai báo Types (TypeScript)
Xác định đầu vào và dạng cục data mà BE sẽ trả về.

📂 **File:** `src/types/custom-feature.types.ts` *(tạo file mới)*
```typescript
// Giao diện model data
export interface CustomFeatureItem {
  id: string;
  name: string;
  score: number;
}

// Giao diện cục API Response trả về JSON
export interface GetCustomFeatureResponse {
  data: CustomFeatureItem[];
  total: number;
}
```
*Ghi chú: Đừng quên chèn dòng `export * from './custom-feature.types.ts';` vào file `src/types/index.ts` nhé!*

---

## Bước 3: Tạo service gọi API (Axios)
Tạo tệp chuyên biệt thực hiện việc nhét token và Call Server, không nên viết `axios.get` ở trong component giao diện.

📂 **File:** `src/api/custom-feature.api.ts` *(tạo file mới)*
```typescript
import axiosInstance from '@lib/axios.lib';
import type { GetCustomFeatureResponse, ApiResponse } from '@types';

export const customFeatureApi = {
  // Hàm Fetch Data
  getList: async (): Promise<ApiResponse<GetCustomFeatureResponse>> => {
    // Bạn gọi đến Path tương ứng mà BE đã cung cấp
    const response = await axiosInstance.get('/api/custom-feature/list');
    return response.data;
  },

  // VD Hàm Gửi Data (POST/PUT)
  createItem: async (payload: { name: string }): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post('/api/custom-feature', payload);
    return response.data;
  }
};
```

---

## Bước 4: Viết React Query (Custom Hook)
Đây là "trái tim" của việc gọi Data trên Frontend. Dùng `React Query` để quản lý cache, auto reload, bóc tách state loading/lỗi ra khỏi component.

📂 **File:** `src/hooks/useCustomFeature.ts` *(tạo file mới)*
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { customFeatureApi } from '@api/custom-feature.api';

// Hook để GET Data (query)
export const useCustomFeatureList = () => {
  return useQuery({
    queryKey: ['custom-feature-list'], // Chữ ký hệ thống lưu cache
    queryFn: () => customFeatureApi.getList(),
  });
};

// Hook để Edit/POST/DELETE (mutation)
export const useCreateCustomFeature = () => {
  return useMutation({
    mutationFn: (payload: { name: string }) => customFeatureApi.createItem(payload),
    // onSuccess: () => { ... có thể popup notify ở đây ... }
  });
};
```

---

## Bước 5: Code Giao Diện Page Component hiện Data
Lúc này bạn mới bắt đầu đổ giao diện thực tế.

📂 **File:** `src/pages/user/CustomFeaturePage.tsx` *(tạo file/thư mục tương ứng)*
```tsx
import React from 'react';
import { useCustomFeatureList } from '@hooks/useCustomFeature';
import { PageLoading } from '@components/ui/Loading'; // ví dụ thư viện loading có sẵn

export const CustomFeaturePage = () => {
  // 1. Kích hoạt gọi Hook!
  const { data, isLoading, isError } = useCustomFeatureList();

  // 2. Kiểm tra tiến trình
  if (isLoading) return <PageLoading />;
  if (isError) return <div className="text-red-500">Lỗi không thể tải dữ liệu server!</div>;

  // 3. Trích xuất data
  // data ở đây phụ thuộc cấu trúc ApiResponse, có thể lồng "data.data"
  const items = data?.data?.data || [];

  // 4. Render HTML/Tailwind
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 border-b pb-2">Danh sách Tính Năng Mới</h1>
      
      <div className="grid gap-4">
        {items.length === 0 ? (
          <p>Chưa có dữ liệu nào</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="p-4 border rounded-lg shadow-sm bg-white hover:bg-slate-50 transition-colors">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-gray-600">Điểm số: {item.score}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

---

## Bước 6: Nhúng Page đó vào Router (App/router.tsx)
Cuối cùng là cấu hình để khi user bấm vào URL thì React hiển thị Component Page trên.

📂 **File:** `src/app/router.tsx`

**Phần 1: Khai báo lazy load cho tab hiệu suất ở Block trên cùng:**
```tsx
const CustomFeaturePage = lazy(() =>
  import('@pages/user/CustomFeaturePage').then((m) => ({ default: m.CustomFeaturePage })),
);
```

**Phần 2: Ráp Route xuống danh sách:**
Tìm đến khu vực chứa Role mà trang bạn được phép nhìn (`UserLayout`, `AdminLayout` hoặc `AuthLayout/Public`). Chèn thêm route:
```tsx
  // User protected routes
  {
    element: (
      <ProtectedRoute allowedRoles={['USER']}>
        <UserLayout />
      </ProtectedRoute>
    ),
    errorElement: <ServerErrorPage />,
    children: [
      { path: ROUTES.USER.DASHBOARD, element: withSuspense(DashboardPage) },
      // ...
      
      // 👇 DÒNG MỚI ĐƯỢC THÊM SAU CÙNG:
      { path: ROUTES.USER.CUSTOM_FEATURE, element: withSuspense(CustomFeaturePage) }, 
    ],
  },
```

✅ **XONG!** Bây giờ bạn truy cập vào đường dẫn `http://localhost:3000/custom-feature` là web sẽ hiển thị trang bạn mới viết, có gắn logic loading và call backend đầy đủ theo tiêu chuẩn nhất của dự án.
