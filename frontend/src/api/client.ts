import axios from 'axios';
import { API_BASE_URL } from './config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/**
 * True when the request failed because the server could not be reached at all
 * (as opposed to a request that reached the server and returned an error status).
 */
export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}
