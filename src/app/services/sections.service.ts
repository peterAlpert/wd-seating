import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Section } from '../interfaces/section';
import { environment } from '../../environments/environment';

export interface SectionAttendanceHistory {
  id: number;
  sectionId: number;
  attendance: number;
  recordedAt: string;
  recordType: string;
}

export interface ClubSnapshot {
  id: number;
  sectionId: number;
  sectionName: string;
  sectorName: string;
  capacity: number;
  attendance: number;
  recordedAt: string;
  recordType: string;
}

export interface PersistentSmartAlert {
  sectionId: number;
  sectionName: string;
  sectorName: string;
  attendance: number;
  capacity: number;
  percentage: number;
  level: 'medium' | 'high' | 'critical';
  title: string;
  startedAt: string;
  lastUpdated: string;
  durationMinutes: number;
  message: string;
}

export interface SmartAlert {
  id: number;
  sectionId: number;
  sectionName: string;
  sectorName: string;

  level: 'medium' | 'high' | 'critical';

  title: string;
  message: string;

  attendance: number;
  capacity: number;
  percentage: number;
  durationMinutes: number;

  startedAt: string;
  createdAt: string;

  acknowledgedAt?: string;
  handlingStartedAt?: string;
  resolvedAt?: string;

  status:
  | 'New'
  | 'Acknowledged'
  | 'Handling'
  | 'Resolved';
}

export interface PersistentAlertsResponse {
  generatedAt: string;
  count: number;
  alerts: PersistentSmartAlert[];
}

export interface ControllerCoverageItem {
  sectionId: number;
  sectionName: string;
  sectorName: string;

  capacity: number;
  attendance: number;
  percentage: number;

  controllerCount: number;

  controllers: {
    id: number;
    name: string;
    code: string;
    status: string;
  }[];

  coverageStatus:
  | 'Covered'
  | 'NeedsSupport'
  | 'NoCoverage';

  needsSupport: boolean;
}

export interface ControllerCoverageSummary {
  totalSections: number;
  coveredSections: number;
  sectionsNeedingSupport: number;
  sectionsWithoutCoverage: number;

  totalControllers: number;
  assignedControllers: number;
  availableControllers: number;
}

export interface ControllerCoverageResponse {
  generatedAt: string;
  summary: ControllerCoverageSummary;
  sections: ControllerCoverageItem[];
}

export interface ClubController {
  id: number;
  name: string;
  code: string;
  sector: string;
  currentSectionId: number | null;
  sectionName: string | null;
  status: string;
  lastUpdated: string;
  isAvailable: boolean;
}

export interface Incident {

  id: number;

  type: string;

  status: string;

  title: string;

  description: string;

  childName: string;

  childAge: number | null;

  childGender: string;

  clothingDescription: string;

  lastSeenLocation: string;

  reportedBy: string;

  assignedTo: string | null;

  createdAt: string;

  foundAt: string | null;

  closedAt: string | null;

}

@Injectable({
  providedIn: 'root'
})
export class SectionsService {

  private http = inject(HttpClient);


  apiUrl = environment.apiUrl + '/Sections';
  // ==========================================
  // Sections / Attendance
  // ==========================================

  // جلب كل المناطق
  getAll() {
    return this.http.get<Section[]>(this.apiUrl);
  }

  // جلب منطقة واحدة
  getById(id: number) {
    return this.http.get<Section>(`${this.apiUrl}/${id}`);
  }

  // تحديث العدد مباشرة
  updateAttendance(id: number, count: number) {
    return this.http.put(
      `${this.apiUrl}/${id}/attendance`,
      count
    );
  }

  enter(id: number, count: number) {
    return this.http.post<Section>(
      `${this.apiUrl}/${id}/enter`,
      {
        count
      }
    );
  }

  // خروج شخص
  exit(id: number, count: number) {
    return this.http.post<Section>(
      `${this.apiUrl}/${id}/exit`,
      {
        count
      }
    );
  }


  updateCapacity(id: number, capacity: number) {
    return this.http.put<Section>(
      `${this.apiUrl}/${id}/capacity`,
      capacity
    );
  }
  // ==========================================
  // Attendance History
  // ==========================================

  getHistory(
    sectionId: number,
    date?: string
  ) {
    let url = `${this.apiUrl}/${sectionId}/history`;

    if (date) {
      url += `?date=${date}`;
    }

    return this.http.get<SectionAttendanceHistory[]>(url);
  }

  // 🔥 كل Snapshots النادي في يوم معين
  getAllSnapshots(date: string) {
    return this.http.get<ClubSnapshot[]>(
      `${this.apiUrl}/history/all?date=${date}`
    );
  }


  getPersistentAlerts() {
    return this.http.get<PersistentAlertsResponse>(
      `${this.apiUrl}/alerts/persistent`
    );
  }

  getSmartAlerts() {
    return this.http.get<SmartAlert[]>(
      `${this.apiUrl}/alerts`
    );
  }

  acknowledgeAlert(id: number) {
    return this.http.put(
      `${this.apiUrl}/alerts/${id}/acknowledge`,
      {}
    );
  }

  startAlertHandling(id: number) {
    return this.http.put(
      `${this.apiUrl}/alerts/${id}/handling`,
      {}
    );
  }

  resolveAlert(id: number) {
    return this.http.put(
      `${this.apiUrl}/alerts/${id}/resolve`,
      {}
    );
  }

  getControllerCoverage() {
    return this.http.get<ControllerCoverageResponse>(
      `${this.apiUrl.replace('/Sections', '/Controllers')}/coverage`
    );
  }

  getControllers() {
    return this.http.get<ClubController[]>(
      `${this.apiUrl.replace('/Sections', '/Controllers')}`
    );
  }

  addController(controller: {
    name: string;
    code: string;
    sector: string;
  }) {
    return this.http.post<ClubController>(
      `${this.apiUrl.replace('/Sections', '/Controllers')}`,
      controller
    );
  }


  updateController(
    id: number,
    controller: {
      name: string;
      code: string;
      sector: string;
      status: string;
      isAvailable: boolean;
    }
  ) {
    return this.http.put<ClubController>(
      `${this.apiUrl.replace('/Sections', '/Controllers')}/${id}`,
      controller
    );
  }


  assignController(
    controllerId: number,
    sectionId: number
  ) {
    return this.http.put(
      `${this.apiUrl.replace('/Sections', '/Controllers')}/${controllerId}/assign`,
      sectionId
    );
  }

  unassignController(
    controllerId: number
  ) {
    return this.http.put(
      `${this.apiUrl.replace('/Sections', '/Controllers')}/${controllerId}/unassign`,
      {}
    );
  }


  updateControllerStatus(
    controllerId: number,
    status: string
  ) {
    return this.http.put(
      `${this.apiUrl.replace('/Sections', '/Controllers')}/${controllerId}/status`,
      status
    );
  }


  // =========================
  // Maintenance / Issues
  // =========================

  getMaintenanceIssues() {
    return this.http.get<any[]>(
      `${this.apiUrl.replace('/Sections', '/Maintenance')}`
    );
  }

  createMaintenanceIssue(issue: {
    title: string;
    description: string;
    category: string;
    priority: string;
    sector: string;
    sectionId: number | null;
    reportedBy: string;
  }) {
    return this.http.post(
      `${this.apiUrl.replace('/Sections', '/Maintenance')}`,
      issue
    );
  }

  updateMaintenanceStatus(
    id: number,
    status: string
  ) {
    return this.http.put(
      `${this.apiUrl.replace('/Sections', '/Maintenance')}/${id}/status`,
      JSON.stringify(status),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  assignMaintenanceIssue(
    id: number,
    assignedTo: string
  ) {
    return this.http.put(
      `${this.apiUrl.replace('/Sections', '/Maintenance')}/${id}/assign`,
      JSON.stringify(assignedTo),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  deleteMaintenanceIssue(id: number) {
    return this.http.delete(
      `${this.apiUrl.replace('/Sections', '/Maintenance')}/${id}`
    );
  }



  getIncidents() {

    return this.http.get<Incident[]>(
      `${this.apiUrl.replace('/Sections', '/Incident')}`
    );

  }


  createIncident(incident: {
    type: string;

    title: string;

    description: string;

    childName: string;

    childAge: number | null;

    childGender: string;

    clothingDescription: string;

    lastSeenLocation: string;

    reportedBy: string;
  }) {

    return this.http.post(
      `${this.apiUrl.replace('/Sections', '/Incident')}`,
      incident
    );

  }


  updateIncidentStatus(
    id: number,
    status: string
  ) {

    return this.http.put(
      `${this.apiUrl.replace('/Sections', '/Incident')}/${id}/status`,
      JSON.stringify(status),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  }


  assignIncident(
    id: number,
    assignedTo: string
  ) {

    return this.http.put(
      `${this.apiUrl.replace('/Sections', '/Incident')}/${id}/assign`,
      JSON.stringify(assignedTo),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  }


  deleteIncident(id: number) {

    return this.http.delete(
      `${this.apiUrl.replace('/Sections', '/Incident')}/${id}`
    );

  }
}