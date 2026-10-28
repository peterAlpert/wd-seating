
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ScheduleService,
  ScheduleAssignment,
  ScheduleDay,
  ScheduleWeek,
  ControllerScheduleData
} from '../../services/schedule.service';

@Component({
  selector: 'app-controller-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './controller-schedule.component.html',
  styleUrl: './controller-schedule.component.css'
})
export class ControllerScheduleComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);

  weeks: ScheduleWeek[] = [];
  source = '';

  selectedWeekId = '';
  selectedDayKey = '';
  selectedSector = 'الكل';
  searchText = '';

  loading = true;
  errorMessage = '';
  importing = false;

  editingId: number | null = null;
  savingId: number | null = null;
  editDraft: ScheduleAssignment | null = null;
  saveError = '';

  readonly preferredSectors = [
    'الوردية الصباحية',
    'البحيرة',
    'الجاردن',
    'الملاعب'
  ];

  ngOnInit(): void {
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.loading = true;
    this.errorMessage = '';

    this.scheduleService.getSchedule().subscribe({
      next: data => {
        if (data?.weeks?.length) {
          this.setSchedule(data);
          this.loading = false;
          return;
        }

        // The database is empty: attempt a one-time import from the existing JSON.
        this.importFromJson();
      },
      error: error => {
        console.error('Failed to load schedule from API:', error);
        this.errorMessage =
          'تعذر الاتصال بقاعدة البيانات. تأكد من أن الـ API يعمل وأن عنوانه صحيح.';
        this.loading = false;
      }
    });
  }

  private importFromJson(): void {
    this.importing = true;

    this.scheduleService.getSourceJson().subscribe({
      next: data => {
        if (!data?.weeks?.length) {
          this.showError('ملف JSON موجود لكنه لا يحتوي على أسابيع للتوزيعة.');
          return;
        }

        this.scheduleService.importSchedule(data).subscribe({
          next: () => this.reloadAfterImport(),
          error: (error: HttpErrorResponse) => {
            // Another request may have imported the data first.
            if (error.status === 409) {
              this.reloadAfterImport();
              return;
            }

            console.error('Schedule import failed:', error);
            this.showError(
              'تعذر استيراد التوزيعة إلى قاعدة البيانات. راجع رسالة الخطأ في الـ API.'
            );
          }
        });
      },
      error: error => {
        console.error('Failed to load source JSON:', error);
        this.showError(
          'تعذر العثور على ملف src/assets/controller-schedule.json.'
        );
      }
    });
  }

  private reloadAfterImport(): void {
    this.scheduleService.getSchedule().subscribe({
      next: data => {
        if (!data?.weeks?.length) {
          this.showError('لم يتم العثور على بيانات بعد الاستيراد.');
          return;
        }

        this.setSchedule(data);
        this.loading = false;
        this.importing = false;
      },
      error: error => {
        console.error('Failed to reload imported schedule:', error);
        this.showError('تمت محاولة الاستيراد، لكن تعذرت قراءة البيانات.');
      }
    });
  }

  private setSchedule(data: ControllerScheduleData): void {
    this.weeks = data.weeks ?? [];
    this.source = data.source ?? '';

    if (!this.weeks.some(w => w.id === this.selectedWeekId)) {
      this.selectedWeekId = this.weeks[0]?.id ?? '';
    }

    const days = this.selectedWeek?.days ?? [];
    if (!days.some(d => d.key === this.selectedDayKey)) {
      this.selectedDayKey = days[0]?.key ?? '';
    }
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
    this.importing = false;
  }

  get selectedWeek(): ScheduleWeek | undefined {
    return this.weeks.find(week => week.id === this.selectedWeekId);
  }

  get days(): ScheduleDay[] {
    return this.selectedWeek?.days ?? [];
  }

  get selectedDay(): ScheduleDay | undefined {
    return this.days.find(day => day.key === this.selectedDayKey);
  }

  get availableSectors(): string[] {
    const allSectors = this.weeks
      .flatMap(week => week.days ?? [])
      .flatMap(day => day.assignments ?? [])
      .map(item => item.sector)
      .filter((sector): sector is string => !!sector);

    return [
      'الكل',
      ...new Set([...this.preferredSectors, ...allSectors])
    ];
  }

  get filteredAssignments(): ScheduleAssignment[] {
    const assignments = this.selectedDay?.assignments ?? [];
    const search = this.searchText.trim().toLocaleLowerCase('ar');

    return assignments.filter(item => {
      const matchesSector =
        this.selectedSector === 'الكل' ||
        item.sector === this.selectedSector;

      const matchesSearch =
        !search ||
        item.name.toLocaleLowerCase('ar').includes(search) ||
        item.assignment.toLocaleLowerCase('ar').includes(search) ||
        item.sector.toLocaleLowerCase('ar').includes(search);

      return matchesSector && matchesSearch;
    });
  }

  get totalAssignments(): number {
    return this.selectedDay?.assignments?.length ?? 0;
  }

  get offCount(): number {
    return (this.selectedDay?.assignments ?? []).filter(item =>
      /\boff\b|راحة|اجازة|إجازة|annual|casual/i.test(item.assignment)
    ).length;
  }

  get supervisorCount(): number {
    return (this.selectedDay?.assignments ?? []).filter(item =>
      /\bS\s*\.?\s*V\s*\.?\b|supervisor/i.test(item.assignment)
    ).length;
  }

  onWeekChange(): void {
    this.selectedDayKey = this.selectedWeek?.days?.[0]?.key ?? '';
    this.selectedSector = 'الكل';
    this.searchText = '';
    this.cancelEdit();
  }

  onDayChange(): void {
    this.selectedSector = 'الكل';
    this.searchText = '';
    this.cancelEdit();
  }

  getAssignmentClass(assignment: string): string {
    if (/\boff\b|راحة|اجازة|إجازة|annual|casual/i.test(assignment)) {
      return 'assignment-off';
    }

    if (/\bS\s*\.?\s*V\s*\.?\b|supervisor/i.test(assignment)) {
      return 'assignment-supervisor';
    }

    return 'assignment-normal';
  }

  startEdit(item: ScheduleAssignment): void {
    if (item.id == null) {
      this.saveError = 'هذا السطر لا يحتوي على رقم تعريف من قاعدة البيانات.';
      return;
    }

    this.editingId = item.id;
    this.editDraft = { ...item };
    this.saveError = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editDraft = null;
    this.saveError = '';
  }

  saveEdit(item: ScheduleAssignment): void {
    if (item.id == null || !this.editDraft) {
      return;
    }

    if (
      !this.editDraft.name.trim() ||
      !this.editDraft.sector.trim() ||
      !this.editDraft.assignment.trim()
    ) {
      this.saveError = 'من فضلك املأ الاسم والقطاع والتكليف.';
      return;
    }

    const id = item.id;
    this.savingId = id;
    this.saveError = '';

    this.scheduleService.updateAssignment(id, this.editDraft).subscribe({
      next: updated => {
        // Update the displayed row only after the API confirms saving.
        item.name = updated.name;
        item.sector = updated.sector;
        item.assignment = updated.assignment;

        this.savingId = null;
        this.cancelEdit();
      },
      error: error => {
        console.error('Failed to save assignment:', error);
        this.savingId = null;
        this.saveError =
          'فشل الحفظ. تأكد من الاتصال بالـ API وحاول مرة أخرى.';
      }
    });
  }

  trackByAssignment(index: number, item: ScheduleAssignment): string {
    return item.id != null
      ? `id-${item.id}`
      : `${item.sourceRow ?? index}-${item.name}-${item.sector}`;
  }


  loadAgain(): void {
    this.loadSchedule();
  }
}
