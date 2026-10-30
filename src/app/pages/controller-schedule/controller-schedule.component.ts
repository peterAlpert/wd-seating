
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
  successMessage = '';

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
    // لا نعيد تحميل البيانات أثناء وجود تعديل قيد الحفظ.
    if (this.savingId !== null) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.saveError = '';
    this.successMessage = '';

    this.scheduleService.getSchedule().subscribe({
      next: (data) => {
        if (data?.weeks?.length) {
          this.setSchedule(data);
          this.loading = false;
          return;
        }

        this.importFromJson();
      },
      error: (error) => {
        console.error('Error loading schedule:', error);
        this.errorMessage =
          'تعذر الاتصال بقاعدة البيانات. تأكد من أن الـ API يعمل وأن عنوانه صحيح.';
        this.loading = false;
      }
    });
  }

  private importFromJson(): void {
    this.importing = true;

    this.scheduleService.getSourceJson().subscribe({
      next: (data) => {
        if (!data?.weeks?.length) {
          this.showError(
            'ملف JSON موجود لكنه لا يحتوي على أسابيع للتوزيعة.'
          );
          return;
        }

        this.scheduleService.importSchedule(data).subscribe({
          next: () => this.reloadAfterImport(),
          error: (error: HttpErrorResponse) => {
            // قد تكون البيانات موجودة بالفعل؛ نقرأها ولا نكرر الاستيراد.
            if (error.status === 409) {
              this.reloadAfterImport();
              return;
            }

            console.error('Error importing schedule:', error);
            this.showError(
              'تعذر استيراد التوزيعة إلى قاعدة البيانات. راجع رسالة الخطأ في الـ API.'
            );
          }
        });
      },
      error: (error) => {
        console.error('Error loading schedule JSON:', error);
        this.showError(
          'تعذر العثور على ملف src/assets/controller-schedule.json.'
        );
      }
    });
  }

  private reloadAfterImport(): void {
    this.scheduleService.getSchedule().subscribe({
      next: (data) => {
        if (!data?.weeks?.length) {
          this.showError(
            'لم يتم العثور على بيانات بعد الاستيراد.'
          );
          return;
        }

        this.setSchedule(data);
        this.loading = false;
        this.importing = false;
      },
      error: (error) => {
        console.error('Error reloading imported schedule:', error);
        this.showError(
          'تمت محاولة الاستيراد، لكن تعذرت قراءة البيانات.'
        );
      }
    });
  }

  private setSchedule(data: ControllerScheduleData): void {
    this.weeks = data.weeks ?? [];
    this.source = data.source ?? '';

    if (!this.weeks.some(week => week.id === this.selectedWeekId)) {
      this.selectedWeekId = this.weeks[0]?.id ?? '';
    }

    const days = this.selectedWeek?.days ?? [];

    if (!days.some(day => day.key === this.selectedDayKey)) {
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
      /\bS\.?\s*V\.?\b|supervisor/i.test(item.assignment)
    ).length;
  }

  onWeekChange(): void {
    if (this.savingId !== null) {
      return;
    }

    this.selectedDayKey = this.selectedWeek?.days?.[0]?.key ?? '';
    this.selectedSector = 'الكل';
    this.searchText = '';
    this.cancelEdit();
  }

  onDayChange(): void {
    if (this.savingId !== null) {
      return;
    }

    this.selectedSector = 'الكل';
    this.searchText = '';
    this.cancelEdit();
  }

  getAssignmentClass(assignment: string): string {
    if (/\boff\b|راحة|اجازة|إجازة|annual|casual/i.test(assignment)) {
      return 'assignment-off';
    }

    if (/\bS\.?\s*V\.?\b|supervisor/i.test(assignment)) {
      return 'assignment-supervisor';
    }

    return 'assignment-normal';
  }

  startEdit(item: ScheduleAssignment): void {
    if (this.savingId !== null) {
      return;
    }

    if (item.id == null) {
      this.saveError =
        'هذا السطر لا يحتوي على رقم تعريف من قاعدة البيانات.';
      this.successMessage = '';
      return;
    }

    this.editingId = item.id;
    this.editDraft = { ...item };
    this.saveError = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    // لا نسمح بإلغاء التعديل بينما الطلب قيد التنفيذ.
    if (this.savingId !== null) {
      return;
    }

    this.editingId = null;
    this.editDraft = null;
    this.saveError = '';
  }
  goMap(): void {
    window.location.href = '/controller-map';
  }

  saveEdit(item: ScheduleAssignment): void {
    if (
      this.savingId !== null ||
      item.id == null ||
      this.editingId !== item.id ||
      !this.editDraft
    ) {
      return;
    }

    const name = this.editDraft.name?.trim() ?? '';
    const sector = this.editDraft.sector?.trim() ?? '';
    const assignment = this.editDraft.assignment?.trim() ?? '';

    if (!name || !sector || !assignment) {
      this.saveError = 'من فضلك املأ الاسم والقطاع والتكليف.';
      this.successMessage = '';
      return;
    }

    const id = item.id;

    // نرسل نسخة من القيم بعد إزالة المسافات الزائدة.
    const payload: ScheduleAssignment = {
      ...this.editDraft,
      name,
      sector,
      assignment
    };

    this.savingId = id;
    this.saveError = '';
    this.successMessage = '';

    this.scheduleService.updateAssignment(id, payload).subscribe({
      next: (updated) => {
        // لا نحدّث الجدول إلا بعد نجاح استجابة الـ API.
        item.name = updated.name;
        item.sector = updated.sector;
        item.assignment = updated.assignment;

        this.savingId = null;
        this.editingId = null;
        this.editDraft = null;
        this.saveError = '';
        this.successMessage = 'تم حفظ التعديلات بنجاح.';
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error saving schedule assignment:', error);

        this.savingId = null;
        this.saveError =
          error.status === 0
            ? 'تعذر الاتصال بالخادم. تحقق من الاتصال وحاول مرة أخرى.'
            : error.status === 404
              ? 'لم يتم العثور على هذا السطر في قاعدة البيانات. أعد تحميل التوزيعة.'
              : error.status === 400
                ? 'الخادم رفض البيانات المرسلة. راجع الاسم والقطاع والتكليف.'
                : 'فشل الحفظ. لم يتم تحديث الجدول محليًا؛ حاول مرة أخرى.';

        this.successMessage = '';
      }
    });
  }

  trackByAssignment(
    index: number,
    item: ScheduleAssignment
  ): string {
    return item.id != null
      ? `id-${item.id}`
      : `${item.sourceRow ?? index}-${item.name}-${item.sector}`;
  }

  loadAgain(): void {
    this.loadSchedule();
  }
}
