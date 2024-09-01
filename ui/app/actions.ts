import axios from "axios";

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
const headers = {
  'Content-Type': 'application/json',
};

/**
 * Search papers based on the query.
 * @param query The query string to search for.
 * @returns The response from the API.
 */
export const searchPapers = async (query: String): Promise<any> => {
  const apiUrl = `${baseApiUrl}/papers/search?${query}`;
  const response = await axios.get(apiUrl);
  return response;
};

/**
 * Export the papers data.
 * @returns The response from the API.
 */
export const exportPapers = async (): Promise<any> => {
  const apiUrl = `${baseApiUrl}/papers/export`;
  const response = await axios.post(apiUrl, { headers });
  return response;
}