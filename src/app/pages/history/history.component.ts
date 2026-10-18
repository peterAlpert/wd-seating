import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SectionsService,
  SectionAttendanceHistory
} from '../../services/sections.service';

interface Section {
  id: number;
  sectorName: string;
  sectionName: string;
  capacity: number;
  currentAttendance: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  private service = inject(SectionsService);

  sections: Section[] = [];

  history: SectionAttendanceHistory[] = [];

  selectedSectionId: number | null = null;

  selectedDate = this.getToday();

  loadingSections = false;
  loadingHistory = false;

  ngOnInit(): void {
    this.loadSections();
  }

  // ==========================================
  // Sections
  // ==========================================

  loadSections(): void {

    this.loadingSections = true;

    this.service.getAll().subscribe({
      next: (res) => {

        this.sections = res;

        this.loadingSections = false;

        if (this.sections.length > 0) {

          this.selectedSectionId =
            this.sections[0].id;

          this.loadHistory();
        }
      },

      error: (err) => {

        this.loadingSections = false;

        console.error(
          'Error loading sections:',
          err
        );
      }
    });
  }

  // ==========================================
  // History
  // ==========================================

  loadHistory(): void {

    if (!this.selectedSectionId) {
      return;
    }

    this.loadingHistory = true;

    this.service
      .getHistory(
        this.selectedSectionId,
        this.selectedDate
      )
      .subscribe({

        next: (res) => {

          this.history = [...res]
            .sort(
              (a, b) =>
                new Date(a.recordedAt).getTime() -
                new Date(b.recordedAt).getTime()
            );

          this.loadingHistory = false;
        },

        error: (err) => {

          this.loadingHistory = false;

          console.error(
            'Error loading history:',
            err
          );

          this.history = [];
        }
      });
  }

  // ==========================================
  // Selection
  // ==========================================

  onSectionChange(): void {
    this.loadHistory();
  }

  onDateChange(): void {
    this.loadHistory();
  }

  // ==========================================
  // Selected Section
  // ==========================================

  getSelectedSection(): Section | undefined {

    return this.sections.find(
      section =>
        section.id === this.selectedSectionId
    );
  }

  // ==========================================
  // Statistics
  // ==========================================

  getHighestAttendance(): number {

    if (!this.history.length) {
      return 0;
    }

    return Math.max(
      ...this.history.map(
        item => item.attendance
      )
    );
  }

  getAverageAttendance(): number {

    if (!this.history.length) {
      return 0;
    }

    const total =
      this.history.reduce(
        (sum, item) =>
          sum + item.attendance,
        0
      );

    return Math.round(
      total / this.history.length
    );
  }

  getPeakTime(): string {

    if (!this.history.length) {
      return '--:--';
    }

    const peak =
      this.history.reduce(
        (max, item) =>
          item.attendance > max.attendance
            ? item
            : max
      );

    return this.formatTime(
      peak.recordedAt
    );
  }

  getPeakPercentage(): number {

    const section =
      this.getSelectedSection();

    if (!section || section.capacity <= 0) {
      return 0;
    }

    return Math.min(
      Math.round(
        (this.getHighestAttendance() /
          section.capacity) *
        100
      ),
      100
    );
  }

  // ==========================================
  // Timeline
  // ==========================================

  getHistoryPercentage(
    item: SectionAttendanceHistory
  ): number {

    const section =
      this.getSelectedSection();

    if (!section || section.capacity <= 0) {
      return 0;
    }

    return Math.min(
      Math.round(
        (item.attendance /
          section.capacity) *
        100
      ),
      100
    );
  }

  getBarHeight(
    item: SectionAttendanceHistory
  ): number {

    const percentage =
      this.getHistoryPercentage(item);

    return Math.max(
      percentage,
      4
    );
  }

  getHistoryLevel(
    item: SectionAttendanceHistory
  ): string {

    const percentage =
      this.getHistoryPercentage(item);

    if (percentage >= 80) {
      return 'critical';
    }

    if (percentage >= 50) {
      return 'medium';
    }

    return 'low';
  }

  // ==========================================
  // Formatting
  // ==========================================

  formatTime(
    value: string
  ): string {

    const date =
      new Date(value);

    return date.toLocaleTimeString(
      'ar-EG',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    );
  }

  formatDate(
    value: string
  ): string {

    const date =
      new Date(value);

    return date.toLocaleDateString(
      'ar-EG',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
  }

  getToday(): string {

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        now.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}