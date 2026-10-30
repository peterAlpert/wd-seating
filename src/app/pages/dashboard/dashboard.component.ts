import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SectionsService } from '../../services/sections.service';

interface Section {
  id: number;
  sectorName: string;
  sectionName: string;
  capacity: number;
  currentAttendance: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private service = inject(SectionsService);
  private router = inject(Router);

  sections: Section[] = [];

  loading = false;

  coverageSummary: any = null;
  coverageLoading = false;

  sectors = [
    {
      name: 'البحيرة',
      key: 'Leak'
    },
    {
      name: 'الجاردن',
      key: 'Garden'
    },
    {
      name: 'الملاعب',
      key: 'Courts'
    }
  ];

  ngOnInit(): void {
    this.loadData();
    this.loadCoverage();

    setInterval(() => {
      this.loadData();
      this.loadCoverage();
    }, 10000);
  }

  goToMap(): void {
    this.router.navigate(['/']);
  }

  loadData(): void {
    this.loading = true;

    this.service.getAll().subscribe({
      next: (res) => {
        this.sections = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading dashboard data:', err);
      }
    });
  }

  getTotalAttendance(): number {
    return this.sections.reduce(
      (total, section) =>
        total + Number(section.currentAttendance || 0),
      0
    );
  }

  getTotalCapacity(): number {
    return this.sections.reduce(
      (total, section) =>
        total + Number(section.capacity || 0),
      0
    );
  }

  getOverallPercentage(): number {
    const capacity = this.getTotalCapacity();

    if (capacity <= 0) {
      return 0;
    }

    return Math.min(
      Math.round(
        (this.getTotalAttendance() / capacity) * 100
      ),
      100
    );
  }

  getActiveSections(): number {
    return this.sections.filter(
      section => section.capacity > 0
    ).length;
  }

  getLowSections(): number {
    return this.sections.filter(section => {
      if (!section.capacity || section.capacity <= 0) {
        return false;
      }

      const percentage =
        (section.currentAttendance / section.capacity) * 100;

      return percentage < 50;
    }).length;
  }

  getMediumSections(): number {
    return this.sections.filter(section => {
      if (!section.capacity || section.capacity <= 0) {
        return false;
      }

      const percentage =
        (section.currentAttendance / section.capacity) * 100;

      return percentage >= 50 && percentage < 80;
    }).length;
  }

  getHighSections(): number {
    return this.sections.filter(section => {
      if (!section.capacity || section.capacity <= 0) {
        return false;
      }

      const percentage =
        (section.currentAttendance / section.capacity) * 100;

      return percentage >= 80;
    }).length;
  }

  getSectorStats(sectorName: string) {

    const sectorSections = this.sections.filter(
      section =>
        section.sectorName?.trim().toLowerCase() ===
        sectorName.trim().toLowerCase()
    );

    const attendance = sectorSections.reduce(
      (total, section) =>
        total + Number(section.currentAttendance || 0),
      0
    );

    const capacity = sectorSections.reduce(
      (total, section) =>
        total + Number(section.capacity || 0),
      0
    );

    const percentage =
      capacity > 0
        ? Math.min(
          Math.round((attendance / capacity) * 100),
          100
        )
        : 0;

    return {
      attendance,
      capacity,
      percentage,
      sectionsCount: sectorSections.length
    };
  }


  getAlertSections(): Section[] {
    return this.sections
      .filter(section => {
        if (!section.capacity || section.capacity <= 0) {
          return false;
        }

        const percentage =
          (section.currentAttendance / section.capacity) * 100;

        return percentage >= 50;
      })
      .sort((a, b) => {
        const percentageA =
          (a.currentAttendance / a.capacity) * 100;

        const percentageB =
          (b.currentAttendance / b.capacity) * 100;

        return percentageB - percentageA;
      });
  }

  getSectionPercentage(section: Section): number {
    if (!section.capacity || section.capacity <= 0) {
      return 0;
    }

    return Math.min(
      Math.round(
        (section.currentAttendance / section.capacity) * 100
      ),
      100
    );
  }

  getAlertLevel(section: Section): string {
    const percentage = this.getSectionPercentage(section);

    if (percentage >= 100) {
      return 'critical';
    }

    if (percentage >= 80) {
      return 'high';
    }

    return 'medium';
  }

  getAlertText(section: Section): string {
    const percentage = this.getSectionPercentage(section);

    if (percentage >= 100) {
      return 'السعة القصوى';
    }

    if (percentage >= 80) {
      return 'إشغال مرتفع';
    }

    return 'اقترب من السعة';
  }

  getTop5Sections(): Section[] {
    return [...this.sections]
      .filter(section =>
        section.capacity > 0
      )
      .sort((a, b) => {
        const percentageA =
          (a.currentAttendance / a.capacity) * 100;

        const percentageB =
          (b.currentAttendance / b.capacity) * 100;

        return percentageB - percentageA;
      })
      .slice(0, 5);
  }

  goToSection(sectionId: number): void {
    this.router.navigate(['/section', sectionId]);
  }

  goToHistory(): void {
    this.router.navigate(['/history']);
  }

  goToAlerts(): void {
    this.router.navigate(['/alerts']);
  }

  goToCoverage(): void {
    this.router.navigate(['/controller-schedule']);
  }

  loadCoverage(): void {
    this.coverageLoading = true;

    this.service.getControllerCoverage().subscribe({
      next: (res) => {
        this.coverageSummary = res.summary;
        this.coverageLoading = false;
      },
      error: (err) => {
        console.error(
          'Error loading controller coverage:',
          err
        );

        this.coverageLoading = false;
      }
    });
  }

  getCoverageStatus(): string {
    if (!this.coverageSummary) {
      return 'جاري تحميل حالة التغطية...';
    }

    if (this.coverageSummary.sectionsWithoutCoverage > 0) {
      return '⚠️ يوجد مناطق بدون تغطية';
    }

    if (this.coverageSummary.sectionsNeedingSupport > 0) {
      return '🟠 توجد مناطق تحتاج دعم';
    }

    return '✅ التغطية مستقرة';
  }

  getCoverageStatusClass(): string {
    if (!this.coverageSummary) {
      return '';
    }

    if (this.coverageSummary.sectionsWithoutCoverage > 0) {
      return 'danger';
    }

    if (this.coverageSummary.sectionsNeedingSupport > 0) {
      return 'warning';
    }

    return 'stable';
  }

  goToMaintenance(): void {
    this.router.navigate(['/maintenance']);
  }

  goToIncidents(): void {
    this.router.navigate(['/incidents']);
  }
}