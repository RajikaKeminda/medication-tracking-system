import { apiRequest } from './client'

function queryString(params) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export async function listPharmacies(params = {}) {
  const res = await apiRequest(`/pharmacies${queryString(params)}`, { skipAuth: true })
  return res.data
}

export async function getPharmacy(id) {
  const res = await apiRequest(`/pharmacies/${id}`, { skipAuth: true })
  return res.data
}
