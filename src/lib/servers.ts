/*
 * Fetches the list of servers from the API
 * Makes a GET request to the /api/servers endpoint
 * If the response is not OK, it throws an error with the message from the response or a default message
 * @returns The JSON response containing the list of servers
 * @throws Will throw an error if the fetch operation fails or if the response is not OK
 */
export async function getServers() {
  const res = await fetch(`/api/servers`, {
    method: `GET`,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || `Failed to fetch servers`);
  }
  return res.json();
}
