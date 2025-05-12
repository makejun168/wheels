import apiClient from '@/utils/http';

export const VITE_API_BASE_URL = 'https://api.example.com';

// 示例：GET 请求
apiClient.get('/example-endpoint', { param1: 'value1' }).then((response) => {
  console.log(response);
});

// 示例：POST 请求
apiClient.post('/example-endpoint', { key: 'value' }).then((response) => {
  console.log(response);
});

