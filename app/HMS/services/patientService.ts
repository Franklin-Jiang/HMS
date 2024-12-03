import { patientAPI } from './api'
import { PatientFormData } from '../types'

export async function getPatients() {
  return await patientAPI.getList()
}

export async function addPatient(patientData: PatientFormData) {
  return await patientAPI.add(patientData)
}

export async function updatePatient(id: number, patientData: PatientFormData, userType: string) {
  return await patientAPI.update(id, patientData, userType)
}

export async function deletePatient(id: number, adminToken: string) {
  return await patientAPI.delete(id, adminToken)
} 