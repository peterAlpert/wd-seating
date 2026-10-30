
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ScheduleService,
  ScheduleAssignment,
  ScheduleDay,
  ScheduleWeek,
  ControllerScheduleData
} from '../../services/schedule.service';

interface ControllerMapArea {
  name: string;
  sectionName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aliases: string[];
}

interface DayOption {
  weekId: string;
  weekName: string;
  dayKey: string;
  dayLabel: string;
}

interface MappedAssignment {
  id: string;
  name: string;
  sector: string;
  assignment: string;
}

@Component({
  selector: 'app-controller-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './controller-map.component.html',
  styleUrl: './controller-map.component.css'
})
export class ControllerMapComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);

  weeks: ScheduleWeek[] = [];
  source = '';

  loading = true;
  errorMessage = '';

  viewMode: 'daily' | 'monthly' = 'daily';
  selectedWeekId = '';
  selectedDayKey = '';
  selectedSector = 'الكل';
  searchText = '';

  readonly sectors = [
    'الكل',
    'البحيرة',
    'الجاردن',
    'الملاعب'
  ];

  readonly areas: ControllerMapArea[] = [
    {
      name: 'ضلع 100/400',
      sectionName: 'Social-100',
      x: 27, y: 10, width: 29, height: 5,
      aliases: ['ضلع 100', 'الضلع 100', '100']
    },
    {
      name: 'الضلع الاجتماعي',
      sectionName: 'Social-200',
      x: 27, y: 16, width: 14, height: 5,
      aliases: ['الضلع الاجتماعي', 'اجتماعي', 'الاجتماعي']
    },
    {
      name: 'الضلع الرياضي',
      sectionName: 'Social-300',
      x: 42, y: 16, width: 14, height: 5,
      aliases: ['الضلع الرياضي', 'رياضي', 'الرياضي']
    },

    {
      name: 'المبنى الرياضي',
      sectionName: 'SportBuilding-WaitHall',
      x: 58, y: 10, width: 12, height: 20,
      aliases: ['المبنى الرياضي', 'المبني الرياضي', 'انتظار الرياضي']
    },

    {
      name: 'المبنى الاجتماعي',
      sectionName: 'SocialB-lowCafe',
      x: 10, y: 10, width: 12, height: 9,
      aliases: ['المبنى الاجتماعي', 'المبني الاجتماعي', 'الاجتماعي مبنى', 'مبني اجتماعي دور علوي', 'مبني اجتماعي دور ارضي']
    },

    {
      name: 'دار الفنون',
      sectionName: 'ArtHouse',
      x: 10, y: 21, width: 15, height: 3,
      aliases: ['دار الفنون', 'الفنون', 'دار فنون']
    },
    {
      name: 'جاردن 1',
      sectionName: 'garden1',
      x: 10, y: 25, width: 15, height: 6,
      aliases: ['جاردن 1', 'جاردن1', 'جاردن اول', 'جاردن أول', 'garden 1', 'garden1', 'g1']
    },
    {
      name: 'جاردن 2',
      sectionName: 'garden2',
      x: 26, y: 25, width: 15, height: 6,
      aliases: ['جاردن 2', 'جاردن2', 'جاردن ثاني', 'جاردن تاني', 'garden 2', 'garden2', 'g2']
    },
    {
      name: 'جاردن 3',
      sectionName: 'garden3',
      x: 42, y: 25, width: 15, height: 6,
      aliases: ['جاردن 3', 'جاردن3', 'جاردن ثالث', 'garden 3', 'garden3', 'g3']
    },
    {
      name: 'كويسكات',
      sectionName: 'Kiosks',
      x: 10, y: 32, width: 61, height: 6,
      aliases: ['كو يسكات', 'كشك', 'اكشاك', 'أكشاك', 'kiosks']
    },
    {
      name: 'ملعب 1-2',
      sectionName: 'Five-A-Side-1',
      x: 35, y: 40, width: 10, height: 7,
      aliases: ['ملعب 1-2', 'ملعب 1', 'ملعب2', 'ملعب اول', 'ملعب أول']
    },

    {
      name: 'ملعب 3-4',
      sectionName: 'Five-A-Side-3',
      x: 46, y: 40, width: 10, height: 7,
      aliases: ['ملعب 3-4', 'ملعب 3', 'ملعب3', 'ملعب ثالث']
    },

    {
      name: 'مبني و فتنس',
      sectionName: 'Fitness',
      x: 35, y: 49, width: 20, height: 5,
      aliases: ['الفتنس', 'مبني+ فتنس', 'فتنس', 'fitness', 'الجيم']
    },
    {
      name: 'التراك',
      sectionName: 'Track',
      x: 60, y: 40, width: 11, height: 10,
      aliases: ['التراك', 'تراك', 'track']
    },
    {
      name: 'المرحلة الثانية',
      sectionName: 'Phase-2',
      x: 10, y: 40, width: 20, height: 10,
      aliases: ['المرحلة الثانية', 'مرحلة ثانية', 'مرحله تانيه', 'phase 2']
    },


  ];

  ngOnInit(): void {
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.loading = true;
    this.errorMessage = '';

    this.scheduleService.getSchedule().subscribe({
      next: (data: ControllerScheduleData) => {
        if (!data?.weeks?.length) {
          this.loading = false;
          this.errorMessage = 'لا توجد بيانات توزيع متاحة.';
          return;
        }

        this.weeks = data.weeks;
        this.source = data.source ?? '';

        if (!this.weeks.some(w => w.id === this.selectedWeekId)) {
          this.selectedWeekId = this.weeks[0]?.id ?? '';
        }

        this.syncSelectedDay();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading controller map schedule:', error);
        this.loading = false;
        this.errorMessage =
          'تعذر تحميل التوزيعة من قاعدة البيانات. تحقق من تشغيل الـ API.';
      }
    });
  }

  get days(): ScheduleDay[] {
    return this.selectedWeek?.days ?? [];
  }

  get selectedWeek(): ScheduleWeek | undefined {
    return this.weeks.find(w => w.id === this.selectedWeekId);
  }

  get selectedDay(): ScheduleDay | undefined {
    return this.days.find(d => d.key === this.selectedDayKey);
  }

  get allDays(): DayOption[] {
    return this.weeks.flatMap(week =>
      (week.days ?? []).map(day => ({
        weekId: week.id,
        weekName: week.name,
        dayKey: day.key,
        dayLabel: day.label
      }))
    );
  }

  get availableSectors(): string[] {
    const all = this.weeks
      .flatMap(w => w.days ?? [])
      .flatMap(d => d.assignments ?? [])
      .map(a => a.sector)
      .filter(Boolean);

    return ['الكل', ...new Set([...this.sectors.slice(1), ...all])];
  }

  get visibleAssignments(): ScheduleAssignment[] {
    const assignments = this.viewMode === 'daily'
      ? (this.selectedDay?.assignments ?? [])
      : this.weeks
        .flatMap(w => w.days ?? [])
        .filter(d => d.key === this.selectedDayKey)
        .flatMap(d => d.assignments ?? []);

    const search = this.normalize(this.searchText);

    return assignments.filter(item => {
      const sectorMatches =
        this.selectedSector === 'الكل' ||
        item.sector === this.selectedSector;

      const searchMatches = !search ||
        this.normalize(item.name).includes(search) ||
        this.normalize(item.assignment).includes(search) ||
        this.normalize(item.sector).includes(search);

      return sectorMatches && searchMatches;
    });
  }

  get mappedAreas(): ControllerMapArea[] {
    return this.areas.filter(area => this.assignmentsForArea(area).length > 0);
  }

  get unmappedAssignments(): ScheduleAssignment[] {
    return this.visibleAssignments.filter(item =>
      !this.findArea(item.assignment)
    );
  }

  get totalPeople(): number {
    return this.visibleAssignments.length;
  }

  get totalMapped(): number {
    return this.visibleAssignments.filter(item =>
      !!this.findArea(item.assignment)
    ).length;
  }

  get totalUnmapped(): number {
    return this.unmappedAssignments.length;
  }

  assignmentsForArea(area: ControllerMapArea): MappedAssignment[] {
    return this.visibleAssignments
      .filter(item => this.findArea(item.assignment)?.sectionName === area.sectionName)
      .map((item, index) => ({
        id: String(item.id ?? `${item.name}-${item.sector}-${index}`),
        name: item.name,
        sector: item.sector,
        assignment: item.assignment
      }));
  }

  getAreaStyle(area: ControllerMapArea): Record<string, string> {
    return {
      left: `${area.x}%`,
      top: `${area.y}%`,
      width: `${area.width}%`,
      height: `${area.height}%`
    };
  }

  setMode(mode: 'daily' | 'monthly'): void {
    this.viewMode = mode;
  }

  onWeekChange(): void {
    this.syncSelectedDay();
  }

  onDayOptionChange(value: string): void {
    const [weekId, ...keyParts] = value.split('::');
    const dayKey = keyParts.join('::');

    this.selectedWeekId = weekId;
    this.selectedDayKey = dayKey;
  }

  get selectedDayOption(): string {
    return `${this.selectedWeekId}::${this.selectedDayKey}`;
  }

  set selectedDayOption(value: string) {
    this.onDayOptionChange(value);
  }

  private syncSelectedDay(): void {
    const days = this.selectedWeek?.days ?? [];

    if (!days.some(d => d.key === this.selectedDayKey)) {
      this.selectedDayKey = days[0]?.key ?? '';
    }
  }

  private findArea(assignment: string): ControllerMapArea | undefined {
    const normalized = this.normalize(assignment);

    if (!normalized) {
      return undefined;
    }

    const matches = this.areas.filter(area =>
      area.aliases.some(alias => {
        const candidate = this.normalize(alias);

        return normalized === candidate ||
          normalized.includes(candidate);
      })
    );

    // في حالة مطابقة أكثر من منطقة، نرفض الربط التلقائي
    // لتجنب وضع الشخص في مكان غير صحيح.
    return matches.length === 1 ? matches[0] : undefined;
  }

  private normalize(value: string | null | undefined): string {
    return (value ?? '')
      .toLocaleLowerCase('ar')
      .normalize('NFKC')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ًٌٍَُِّْـ]/g, '')
      .replace(/[٠-٩]/g, digit =>
        String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
      )
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }
}
