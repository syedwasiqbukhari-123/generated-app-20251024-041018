import { ApiResponse } from "../../shared/types"

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init })
  const resClone = res.clone() // Clone the response to allow reading the body multiple times

  let json: ApiResponse<T>
  try {
    json = (await res.json()) as ApiResponse<T>
  } catch (error) {
    console.error('API JSON Parsing Failed:', {
      status: resClone.status,
      statusText: resClone.statusText,
      body: await resClone.text(),
    })
    throw new Error('Failed to parse server response')
  }

  if (!res.ok) {
    console.error('API Request Failed:', {
      status: resClone.status,
      statusText: resClone.statusText,
      body: json, // Log the parsed JSON body if available
    })
  }

  if (!res.ok || !json.success || json.data === undefined) throw new Error(json.error || 'Request failed')
  return json.data
}