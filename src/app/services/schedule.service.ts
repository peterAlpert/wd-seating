
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ScheduleAssignment {
    id?: number;
    sector: string;
    name: string;
    assignment: string;
    sourceRow?: number | null;
}

export interface ScheduleDay {
    key: string;
    label: string;
    assignments: ScheduleAssignment[];
}

export interface ScheduleWeek {
    id: string;
    name: string;
    days: ScheduleDay[];
}

export interface ControllerScheduleData {
    source?: string;
    weeks: ScheduleWeek[];
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/schedule`;

    getSchedule(): Observable<ControllerScheduleData> {
        return this.http.get<ControllerScheduleData>(this.apiUrl);
    }

    getSourceJson(): Observable<ControllerScheduleData> {
        return this.http.get<ControllerScheduleData>(
            'assets/controller-schedule.json'
        );
    }

    importSchedule(data: ControllerScheduleData): Observable<unknown> {
        return this.http.post(`${this.apiUrl}/import`, data);
    }

    updateAssignment(
        id: number,
        data: ScheduleAssignment
    ): Observable<ScheduleAssignment> {
        return this.http.put<ScheduleAssignment>(
            `${this.apiUrl}/assignments/${id}`,
            {
                sector: data.sector,
                name: data.name,
                assignment: data.assignment
            }
        );
    }
}
