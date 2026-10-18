import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule
} from '@angular/forms';

import {
  ClubSnapshot,
  SectionsService
} from '../../services/sections.service';

interface HeatMapRow {
  sectionId: number;
  sectionName: string;
  sectorName: string;
  capacity: number;

  values: {
    time: string;
    attendance: number;
    percentage: number;
  }[];
}

interface SectorAnalysis {
  name: string;
  busiestArea: string;
  peakPercentage: number;
  averagePercentage: number;
}

interface ChildSafetyAnalysis {
  sectionId: number;
  sectionName: string;
  capacity: number;
  peakPercentage: number;
  averagePercentage: number;
  highOccupancySnapshots: number;
  safetyScore: number;
  safetyLevel: string;
}

@Component({
  selector: 'app-heat-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.css']
})
export class HeatMapComponent implements OnInit {

  private sectionsService = inject(SectionsService);

  selectedDate = this.getToday();

  snapshots: ClubSnapshot[] = [];

  rows: HeatMapRow[] = [];

  loading = false;

  errorMessage = '';

  times: string[] = [];

  peakTime = '--';
  busiestArea = '--';
  peakPercentage = 0;
  peakAttendance = 0;
  averageOccupancy = 0;

  sectorAnalysis: SectorAnalysis[] = [];
  childSafetyAnalysis: ChildSafetyAnalysis[] = [];

  ngOnInit(): void {
    this.loadHeatMap();
  }

  loadHeatMap(): void {

    this.loading = true;
    this.errorMessage = '';

    this.sectionsService
      .getAllSnapshots(this.selectedDate)
      .subscribe({

        next: (data) => {

          this.snapshots = data;

          this.buildHeatMap();

          this.calculatePeakAnalysis();
          this.calculateSectorAnalysis();
          this.calculateChildSafety();

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Heat Map Error:',
            error
          );

          this.errorMessage =
            'حدث خطأ أثناء تحميل بيانات الـ Heat Map';

          this.loading = false;
        }
      });
  }

  buildHeatMap(): void {

    const grouped =
      new Map<number, HeatMapRow>();

    const timeSet =
      new Set<string>();

    for (const snapshot of this.snapshots) {

      const date =
        new Date(snapshot.recordedAt);

      const time =
        date.toLocaleTimeString(
          'en-GB',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        );

      const percentage =
        snapshot.capacity > 0
          ? Math.round(
            (snapshot.attendance /
              snapshot.capacity) * 100
          )
          : 0;

      timeSet.add(time);

      if (!grouped.has(snapshot.sectionId)) {

        grouped.set(
          snapshot.sectionId,
          {
            sectionId:
              snapshot.sectionId,

            sectionName: this.translateSectionName(
              snapshot.sectionName
            ),

            sectorName: this.translateSectorName(
              snapshot.sectorName
            ),

            capacity:
              snapshot.capacity,

            values: []
          }
        );
      }

      grouped
        .get(snapshot.sectionId)!
        .values
        .push({
          time,
          attendance:
            snapshot.attendance,
          percentage
        });
    }

    this.times =
      Array.from(timeSet)
        .sort();

    this.rows =
      Array.from(grouped.values());

    // ترتيب المناطق حسب القطاع ثم الاسم
    this.rows.sort((a, b) => {

      const sectorCompare =
        a.sectorName.localeCompare(
          b.sectorName
        );

      if (sectorCompare !== 0) {
        return sectorCompare;
      }

      return a.sectionName.localeCompare(
        b.sectionName
      );
    });
  }

  getValue(
    row: HeatMapRow,
    time: string
  ) {

    return row.values.find(
      value =>
        value.time === time
    );
  }

  getCellClass(
    percentage: number
  ): string {

    if (percentage >= 90) {
      return 'critical';
    }

    if (percentage >= 75) {
      return 'high';
    }

    if (percentage >= 50) {
      return 'medium';
    }

    return 'low';
  }

  getToday(): string {

    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        today.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  calculatePeakAnalysis(): void {

    if (!this.snapshots.length) {
      this.peakTime = '--';
      this.busiestArea = '--';
      this.peakPercentage = 0;
      this.peakAttendance = 0;
      this.averageOccupancy = 0;
      return;
    }

    let highestSnapshot = this.snapshots[0];

    let totalPercentage = 0;

    for (const snapshot of this.snapshots) {

      const percentage =
        snapshot.capacity > 0
          ? (snapshot.attendance / snapshot.capacity) * 100
          : 0;

      totalPercentage += percentage;

      const highestPercentage =
        highestSnapshot.capacity > 0
          ? (highestSnapshot.attendance /
            highestSnapshot.capacity) * 100
          : 0;

      if (percentage > highestPercentage) {
        highestSnapshot = snapshot;
      }
    }

    const peakDate =
      new Date(highestSnapshot.recordedAt);

    this.peakTime =
      peakDate.toLocaleTimeString(
        'en-GB',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );

    this.busiestArea =
      this.translateSectionName(
        highestSnapshot.sectionName
      );

    this.peakAttendance =
      highestSnapshot.attendance;

    this.peakPercentage =
      Math.round(
        (highestSnapshot.attendance /
          highestSnapshot.capacity) * 100
      );

    this.averageOccupancy =
      Math.round(
        totalPercentage /
        this.snapshots.length
      );
  }

  calculateSectorAnalysis(): void {

    const sectors = new Map<string, ClubSnapshot[]>();

    for (const snapshot of this.snapshots) {

      if (!sectors.has(snapshot.sectorName)) {
        sectors.set(snapshot.sectorName, []);
      }

      sectors.get(snapshot.sectorName)!.push(snapshot);
    }

    this.sectorAnalysis = [];

    sectors.forEach((snapshots, sectorName) => {

      let busiest = snapshots[0];
      let totalPercentage = 0;

      for (const snapshot of snapshots) {

        const percentage =
          snapshot.capacity > 0
            ? (snapshot.attendance /
              snapshot.capacity) * 100
            : 0;

        totalPercentage += percentage;

        const busiestPercentage =
          busiest.capacity > 0
            ? (busiest.attendance /
              busiest.capacity) * 100
            : 0;

        if (percentage > busiestPercentage) {
          busiest = snapshot;
        }
      }

      const peakPercentage =
        busiest.capacity > 0
          ? Math.round(
            (busiest.attendance /
              busiest.capacity) * 100
          )
          : 0;

      const averagePercentage =
        Math.round(
          totalPercentage /
          snapshots.length
        );

      this.sectorAnalysis.push({
        name: this.translateSectorName(sectorName),
        busiestArea: this.translateSectionName(
          busiest.sectionName
        ),
        peakPercentage,
        averagePercentage
      });
    });

    // ترتيب القطاعات
    this.sectorAnalysis.sort(
      (a, b) =>
        b.peakPercentage -
        a.peakPercentage
    );
  }


  translateSectorName(name: string): string {
    const translations: Record<string, string> = {
      'Leak': 'البحيرة',
      'Garden': 'الجاردن',
      'Courts': 'الملاعب'
    };

    return translations[name] || name;
  }

  translateSectionName(name: string): string {
    const translations: Record<string, string> = {

      // البحيرة
      'SocialB-lowCafe': 'اللو كافيه',
      'SportBuilding-WaitHall': 'قاعة الانتظار ',
      'SocialB-Front': 'امام المبنى الاجتماعي',
      'SportB-Front': 'امام المبنى الرياضي',
      'Social-100': 'ضلع 100',
      'Social-200': 'ضلع 200',
      'Social-300': 'ضلع 300',
      'Social-400': 'ضلع 400',

      // الجاردن
      'garden1': 'جاردن 1',
      'garden2': 'جاردن 2',
      'garden3': 'جاردن 3',
      'Kiosks': 'الكويسكات',

      // الملاعب

      'Phase-2': 'المرحلة الثانية',
      'Fitness': 'الفيتنس',
      'Track': 'التراك'
    };

    return translations[name] || name;
  }


  calculateChildSafety(): void {

    const childZones = [
      'garden1',
      'garden2',
      'garden3'
    ];

    const grouped = new Map<
      number,
      ClubSnapshot[]
    >();

    for (const snapshot of this.snapshots) {

      if (
        !childZones.includes(
          snapshot.sectionName
        )
      ) {
        continue;
      }

      if (!grouped.has(snapshot.sectionId)) {
        grouped.set(
          snapshot.sectionId,
          []
        );
      }

      grouped
        .get(snapshot.sectionId)!
        .push(snapshot);
    }

    this.childSafetyAnalysis = [];

    grouped.forEach(
      (snapshots, sectionId) => {

        const first = snapshots[0];

        let peakPercentage = 0;
        let totalPercentage = 0;
        let highOccupancySnapshots = 0;

        for (const snapshot of snapshots) {

          const percentage =
            snapshot.capacity > 0
              ? (
                snapshot.attendance /
                snapshot.capacity
              ) * 100
              : 0;

          totalPercentage += percentage;

          if (
            percentage >
            peakPercentage
          ) {
            peakPercentage =
              percentage;
          }

          if (percentage >= 75) {
            highOccupancySnapshots++;
          }
        }

        const averagePercentage =
          snapshots.length > 0
            ? totalPercentage /
            snapshots.length
            : 0;

        /*
         * Safety Score
         *
         * Peak Occupancy = 60%
         * Average Occupancy = 25%
         * Time above 75% = 15%
         */

        const peakScore =
          Math.min(
            peakPercentage,
            100
          ) * 0.60;

        const averageScore =
          Math.min(
            averagePercentage,
            100
          ) * 0.25;

        const highOccupancyScore =
          snapshots.length > 0
            ? (
              highOccupancySnapshots /
              snapshots.length
            ) * 15
            : 0;

        const safetyScore =
          Math.round(
            peakScore +
            averageScore +
            highOccupancyScore
          );

        let safetyLevel = 'طبيعي';

        if (safetyScore >= 85) {
          safetyLevel = 'حرج';
        }
        else if (safetyScore >= 70) {
          safetyLevel = 'مرتفع';
        }
        else if (safetyScore >= 50) {
          safetyLevel = 'يحتاج متابعة';
        }

        this.childSafetyAnalysis.push({
          sectionId,

          sectionName:
            this.translateSectionName(
              first.sectionName
            ),

          capacity:
            first.capacity,

          peakPercentage:
            Math.round(
              peakPercentage
            ),

          averagePercentage:
            Math.round(
              averagePercentage
            ),

          highOccupancySnapshots,

          safetyScore,

          safetyLevel
        });
      }
    );

    this.childSafetyAnalysis.sort(
      (a, b) =>
        b.safetyScore -
        a.safetyScore
    );
  }
}