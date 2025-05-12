import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string, timeout = 10000) {
    this.instance = axios.create({
      baseURL,
      timeout,
    });

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // 在这里可以添加通用的请求头，比如 token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 可以在这里处理通用的响应逻辑，比如错误提示
        return response.data;
      },
      (error) => {
        // 处理错误响应
        console.error('HTTP Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // GET 请求
  public get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return this.instance.get(url, { params });
  }

  // POST 请求
  public post<T>(url: string, data?: Record<string, any>): Promise<T> {
    return this.instance.post(url, data);
  }

  // PUT 请求
  public put<T>(url: string, data?: Record<string, any>): Promise<T> {
    return this.instance.put(url, data);
  }

  // DELETE 请求
  public delete<T>(url: string, params?: Record<string, any>): Promise<T> {
    return this.instance.delete(url, { params });
  }
}

// 默认导出一个实例
const apiClient = new HttpClient(import.meta.env.VITE_API_BASE_URL || '');

export default apiClient;
