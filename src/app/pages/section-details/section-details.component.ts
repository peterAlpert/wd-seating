import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SectionsService } from '../../services/sections.service';

interface Section {
  id: number;
  sectorName: string;
  sectionName: string;
  capacity: number;
  currentAttendance: number;
}

@Component({
  selector: 'app-section-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-details.component.html',
  styleUrls: ['./section-details.component.css']
})
export class SectionDetailsComponent implements OnInit {

  private service = inject(SectionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  section: Section | null = null;

  loading = false;
  attendanceUpdating = false;

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!id) {
      this.goBack();
      return;
    }

    this.loadSection(id);
  }

  loadSection(id: number): void {

    this.loading = true;

    this.service.getById(id).subscribe({
      next: (res) => {
        this.section = res;
        this.loading = false;
      },

      error: (err) => {
        console.error(
          'Error loading section:',
          err
        );

        this.loading = false;
        this.goBack();
      }
    });
  }

  getPercentage(): number {

    if (
      !this.section ||
      !this.section.capacity ||
      this.section.capacity <= 0
    ) {
      return 0;
    }

    return Math.min(
      Math.round(
        (this.section.currentAttendance /
          this.section.capacity) * 100
      ),
      100
    );
  }

  getAvailable(): number {

    if (!this.section) {
      return 0;
    }

    return Math.max(
      this.section.capacity -
      this.section.currentAttendance,
      0
    );
  }

  getStatus(): string {

    const percentage = this.getPercentage();

    if (percentage >= 100) {
      return 'السعة القصوى';
    }

    if (percentage >= 80) {
      return 'إشغال مرتفع';
    }

    if (percentage >= 50) {
      return 'إشغال متوسط';
    }

    return 'إشغال منخفض';
  }

  getStatusClass(): string {

    const percentage = this.getPercentage();

    if (percentage >= 100) {
      return 'critical';
    }

    if (percentage >= 80) {
      return 'high';
    }

    if (percentage >= 50) {
      return 'medium';
    }

    return 'low';
  }

  enter(): void {

    if (!this.section) return;

    if (
      this.section.currentAttendance >=
      this.section.capacity
    ) {
      return;
    }

    if (this.attendanceUpdating) return;

    this.attendanceUpdating = true;

    this.service.enter(this.section.id, 1).subscribe({

      next: (updatedSection) => {

        this.section = updatedSection;

        this.attendanceUpdating = false;
      },

      error: (err) => {

        console.error(
          'Error entering section:',
          err
        );

        this.attendanceUpdating = false;

        alert(
          err?.error?.message ||
          'حدث خطأ أثناء تسجيل الدخول'
        );
      }
    });
  }

  exit(): void {

    if (!this.section) return;

    if (this.section.currentAttendance <= 0) {
      return;
    }

    if (this.attendanceUpdating) return;

    this.attendanceUpdating = true;

    this.service.exit(this.section.id, 1).subscribe({

      next: (updatedSection) => {

        this.section = updatedSection;

        this.attendanceUpdating = false;
      },

      error: (err) => {

        console.error(
          'Error exiting section:',
          err
        );

        this.attendanceUpdating = false;

        alert(
          err?.error?.message ||
          'حدث خطأ أثناء تسجيل الخروج'
        );
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goToMap(): void {
    this.router.navigate(['/map']);
  }
}