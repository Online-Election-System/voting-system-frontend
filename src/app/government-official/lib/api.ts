// import { StatusCounts, RegistrationApplication, RegistrationDetails } from './types';

// // The base URL of your Ballerina backend
// const API_BASE_URL = 'http://localhost:8080/api/v1';

// // A generic fetch function to handle errors and JSON parsing
// async function fetchAPI<T>(url: string, options: RequestInit = {}): Promise<T> {
//   const response = await fetch(url, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       ...options.headers,
//     },
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
//   }

//   // Handle responses that might not have a body (e.g., 204 No Content)
//   if (response.status === 204 || response.headers.get('content-length') === '0') {
//       return null as T;
//   }
  
//   return response.json() as T;
// }

// // Fetches the list of all applications, with optional filtering
// export const getApplications = (nameOrNic: string, status: string): Promise<RegistrationApplication[]> => {
//   const params = new URLSearchParams();
//   if (nameOrNic) params.append('nameOrNic', nameOrNic);
//   if (status && status !== 'all') params.append('statusFilter', status);
  
//   return fetchAPI(`${API_BASE_URL}/registrations/applications?${params.toString()}`);
// };

// // Fetches the dashboard card counts
// export const getApplicationCounts = (): Promise<StatusCounts> => {
//   return fetchAPI(`${API_BASE_URL}/registrations/counts`);
// };

// // Fetches the full details for a single applicant by their NIC
// export const getApplicationDetails = (nic: string): Promise<RegistrationDetails> => {
//   return fetchAPI(`${API_BASE_URL}/registrations/applications/${nic}`);
// };

// // Sends an approval or rejection request to the backend
// export const reviewApplication = (nic: string, status: 'approved' | 'rejected', comments?: string): Promise<void> => {
//   return fetchAPI(`${API_BASE_URL}/registrations/applications/${nic}/review`, {
//     method: 'POST',
//     body: JSON.stringify({ status, comments }),
//   });
// };