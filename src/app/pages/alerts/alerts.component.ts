import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  SectionsService,
  SmartAlert
} from '../../services/sections.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {

  private service = inject(SectionsService);
  private router = inject(Router);

  alerts: SmartAlert[] = [];

  loading = false;

  actionLoadingId: number | null = null;

  selectedFilter:
    | 'all'
    | 'medium'
    | 'high'
    | 'critical' = 'all';

  ngOnInit(): void {

    this.loadAlerts();

    setInterval(() => {
      this.loadAlerts();
    }, 10000);
  }

  loadAlerts(): void {

    this.loading = true;

    this.service.getSmartAlerts().subscribe({

      next: (res) => {

        this.alerts = res.map(alert => ({

          ...alert,

          sectionName:
            this.translateSectionName(
              alert.sectionName
            ),

          sectorName:
            this.translateSectorName(
              alert.sectorName
            )

        }));

        this.alerts.sort(
          (a, b) => {

            const priorityDifference =
              this.getLevelPriority(b.level) -
              this.getLevelPriority(a.level);

            if (priorityDifference !== 0) {
              return priorityDifference;
            }

            return (
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
            );
          }
        );

        this.loading = false;
      },

      error: (err) => {

        console.error(
          'Error loading smart alerts:',
          err
        );

        this.loading = false;
      }
    });
  }

  getLevelPriority(
    level:
      | 'medium'
      | 'high'
      | 'critical'
  ): number {

    switch (level) {

      case 'critical':
        return 3;

      case 'high':
        return 2;

      case 'medium':
        return 1;

      default:
        return 0;
    }
  }

  get filteredAlerts(): SmartAlert[] {

    if (this.selectedFilter === 'all') {
      return this.alerts;
    }

    return this.alerts.filter(
      alert =>
        alert.level ===
        this.selectedFilter
    );
  }

  get totalAlerts(): number {
    return this.alerts.filter(
      alert => alert.status !== 'Resolved'
    ).length;
  }

  get mediumAlerts(): number {

    return this.alerts.filter(
      alert =>
        alert.level === 'medium' &&
        alert.status !== 'Resolved'
    ).length;
  }

  get highAlerts(): number {

    return this.alerts.filter(
      alert =>
        alert.level === 'high' &&
        alert.status !== 'Resolved'
    ).length;
  }

  get criticalAlerts(): number {

    return this.alerts.filter(
      alert =>
        alert.level === 'critical' &&
        alert.status !== 'Resolved'
    ).length;
  }

  setFilter(
    filter:
      | 'all'
      | 'medium'
      | 'high'
      | 'critical'
  ): void {

    this.selectedFilter = filter;
  }

  getStatusText(
    status: SmartAlert['status']
  ): string {

    switch (status) {

      case 'New':
        return 'جديد';

      case 'Acknowledged':
        return 'تم الاطلاع';

      case 'Handling':
        return 'جاري التعامل';

      case 'Resolved':
        return 'تم الحل';

      default:
        return status;
    }
  }

  getStatusIcon(
    status: SmartAlert['status']
  ): string {

    switch (status) {

      case 'New':
        return '🆕';

      case 'Acknowledged':
        return '👁️';

      case 'Handling':
        return '🛠️';

      case 'Resolved':
        return '✅';

      default:
        return 'ℹ️';
    }
  }

  acknowledgeAlert(
    alert: SmartAlert,
    event: Event
  ): void {

    event.stopPropagation();

    if (
      this.actionLoadingId !== null ||
      alert.status !== 'New'
    ) {
      return;
    }

    this.actionLoadingId = alert.id;

    this.service
      .acknowledgeAlert(alert.id)
      .subscribe({

        next: () => {

          this.actionLoadingId = null;

          this.loadAlerts();
        },

        error: (err) => {

          console.error(
            'Error acknowledging alert:',
            err
          );

          this.actionLoadingId = null;
        }
      });
  }

  startAlertHandling(
    alert: SmartAlert,
    event: Event
  ): void {

    event.stopPropagation();

    if (
      this.actionLoadingId !== null ||
      alert.status === 'Resolved'
    ) {
      return;
    }

    this.actionLoadingId = alert.id;

    this.service
      .startAlertHandling(alert.id)
      .subscribe({

        next: () => {

          this.actionLoadingId = null;

          this.loadAlerts();
        },

        error: (err) => {

          console.error(
            'Error starting alert handling:',
            err
          );

          this.actionLoadingId = null;
        }
      });
  }

  resolveAlert(
    alert: SmartAlert,
    event: Event
  ): void {

    event.stopPropagation();

    if (
      this.actionLoadingId !== null ||
      alert.status === 'Resolved'
    ) {
      return;
    }

    this.actionLoadingId = alert.id;

    this.service
      .resolveAlert(alert.id)
      .subscribe({

        next: () => {

          this.actionLoadingId = null;

          this.loadAlerts();
        },

        error: (err) => {

          console.error(
            'Error resolving alert:',
            err
          );

          this.actionLoadingId = null;
        }
      });
  }

  getDurationText(
    minutes: number
  ): string {

    if (minutes < 60) {
      return `${minutes} دقيقة`;
    }

    const hours =
      Math.floor(minutes / 60);

    const remainingMinutes =
      minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ساعة`;
    }

    return `${hours} ساعة و ${remainingMinutes} دقيقة`;
  }

  getStartedTime(
    startedAt: string
  ): string {

    return new Date(
      startedAt
    ).toLocaleTimeString(
      'ar-EG',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  goToSection(
    sectionId: number
  ): void {

    this.router.navigate([
      '/section',
      sectionId
    ]);
  }

  translateSectorName(
    name: string
  ): string {

    const translations: Record<
      string,
      string
    > = {

      'Leak': 'البحيرة',

      'Garden': 'الجاردن',

      'Courts': 'الملاعب'
    };

    return (
      translations[name] ||
      name
    );
  }

  translateSectionName(
    name: string
  ): string {

    const translations: Record<
      string,
      string
    > = {

      'SocialB-lowCafe':
        'اللو كافيه',

      'SportBuilding-WaitHall':
        'قاعة الانتظار',

      'SocialB-Front':
        'امام المبنى الاجتماعي',

      'SportB-Front':
        'امام المبنى الرياضي',

      'Social-100':
        'ضلع 100',

      'Social-200':
        'ضلع 200',

      'Social-300':
        'ضلع 300',

      'Social-400':
        'ضلع 400',

      'garden1':
        'جاردن 1',

      'garden2':
        'جاردن 2',

      'garden3':
        'جاردن 3',

      'Kiosks':
        'الكويشكات',

      'Phase-2':
        'المرحلة الثانية',

      'Fitness':
        'الفيتنس',

      'Track':
        'التراك'
    };

    return (
      translations[name] ||
      name
    );
  }
}