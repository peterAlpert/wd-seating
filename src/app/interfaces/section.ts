export interface Section {
    id: number;
    sectorName: string;
    sectionName: string;
    capacity: number;
    currentAttendance: number;
    noData?: boolean;
}
