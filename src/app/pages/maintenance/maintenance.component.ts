import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';

import { SectionsService } from '../../services/sections.service';
import { FormsModule } from '@angular/forms';


interface MaintenanceIssue {

  id: number;

  title: string;

  description: string;

  category: string;

  priority: string;

  sector: string;

  sectionId: number | null;

  sectionName: string | null;

  reportedBy: string;

  assignedTo: string | null;

  status: string;

  createdAt: string;

  startedAt: string | null;

  resolvedAt: string | null;
}




@Component({

  selector: 'app-maintenance',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './maintenance.component.html',

  styleUrls: ['./maintenance.component.css']

})


export class MaintenanceComponent
  implements OnInit {


  private service =
    inject(SectionsService);


  issues: MaintenanceIssue[] = [];

  searchText: string = '';

  selectedStatus: string = 'All';

  selectedPriority: string = 'All';

  selectedSector: string = 'All';


  loading = false;


  ngOnInit(): void {

    this.loadIssues();

  }


  loadIssues(): void {

    this.loading = true;

    this.service.getMaintenanceIssues().subscribe({

      next: (res) => {

        this.issues = res;

        this.loading = false;

      },

      error: (err) => {

        console.error(
          'Error loading maintenance issues:',
          err
        );

        this.loading = false;

      }

    });

  }


  getTotalIssues(): number {

    return this.issues.length;

  }


  getNewIssues(): number {

    return this.issues.filter(
      issue => issue.status === 'New'
    ).length;

  }


  getAssignedIssues(): number {

    return this.issues.filter(
      issue => issue.status === 'Assigned'
    ).length;

  }


  getInProgressIssues(): number {

    return this.issues.filter(
      issue => issue.status === 'InProgress'
    ).length;

  }


  getResolvedIssues(): number {

    return this.issues.filter(
      issue => issue.status === 'Resolved'
    ).length;

  }


  getCriticalIssues(): number {

    return this.issues.filter(
      issue => issue.priority === 'Critical'
    ).length;

  }


  addIssue(): void {

    Swal.fire({

      title: 'بلاغ صيانة جديد',

      html: `

      <div class="maintenance-form">

        <div class="form-field">
          <label>عنوان المشكلة</label>

          <input
            id="issue-title"
            class="form-control"
            placeholder="اكتب عنوان المشكلة">
        </div>


        <div class="form-field">
          <label>وصف المشكلة</label>

          <textarea
            id="issue-description"
            class="form-control description"
            placeholder="اكتب وصف مختصر للمشكلة"></textarea>
        </div>


        <div class="form-grid">

          <div class="form-field">
            <label>نوع المشكلة</label>

            <select
              id="issue-category"
              class="form-control">

              <option value="">اختار النوع</option>
              <option value="Electrical">كهرباء</option>
              <option value="Plumbing">سباكة</option>
              <option value="Furniture">أثاث</option>
              <option value="Cleaning">نظافة</option>
              <option value="Equipment">معدات</option>
              <option value="Safety">سلامة</option>
              <option value="Other">أخرى</option>

            </select>
          </div>


          <div class="form-field">
            <label>الأولوية</label>

            <select
              id="issue-priority"
              class="form-control">

              <option value="Low">منخفضة</option>
              <option value="Medium" selected>متوسطة</option>
              <option value="High">عالية</option>
              <option value="Critical">حرجة</option>

            </select>
          </div>

        </div>


        <div class="form-grid">

          <div class="form-field">
            <label>القطاع</label>

            <select
              id="issue-sector"
              class="form-control">

              <option value="">اختار القطاع</option>
              <option value="Lake">البحيرة</option>
              <option value="Garden">الجاردن</option>
              <option value="Fields">الملاعب</option>

            </select>
          </div>


          <div class="form-field">
            <label>المنطقة</label>

            <select
              id="issue-section"
              class="form-control">

              <option value="">اختار المنطقة</option>

            </select>
          </div>

        </div>


        <div class="form-field">
          <label>مقدم البلاغ</label>

          <input
            id="issue-reporter"
            class="form-control"
            placeholder="اسم الـ Controller">
        </div>

      </div>

    `,

      width: '520px',

      showCancelButton: true,

      confirmButtonText: 'تسجيل البلاغ',

      cancelButtonText: 'إلغاء',

      focusConfirm: false,

      customClass: {
        popup: 'clean-maintenance-popup',
        confirmButton: 'clean-confirm-btn',
        cancelButton: 'clean-cancel-btn'
      },


      didOpen: () => {

        const sectionSelect =
          document.getElementById(
            'issue-section'
          ) as HTMLSelectElement;

        this.loadIssueSections(
          sectionSelect
        );

      },


      preConfirm: () => {

        const title =
          (
            document.getElementById(
              'issue-title'
            ) as HTMLInputElement
          )?.value.trim();


        const description =
          (
            document.getElementById(
              'issue-description'
            ) as HTMLTextAreaElement
          )?.value.trim();


        const category =
          (
            document.getElementById(
              'issue-category'
            ) as HTMLSelectElement
          )?.value;


        const priority =
          (
            document.getElementById(
              'issue-priority'
            ) as HTMLSelectElement
          )?.value;


        const sector =
          (
            document.getElementById(
              'issue-sector'
            ) as HTMLSelectElement
          )?.value;


        const sectionId =
          (
            document.getElementById(
              'issue-section'
            ) as HTMLSelectElement
          )?.value;


        const reportedBy =
          (
            document.getElementById(
              'issue-reporter'
            ) as HTMLInputElement
          )?.value.trim();


        if (!title) {
          Swal.showValidationMessage(
            'اكتب عنوان المشكلة'
          );
          return false;
        }


        if (!description) {
          Swal.showValidationMessage(
            'اكتب وصف المشكلة'
          );
          return false;
        }


        if (!category) {
          Swal.showValidationMessage(
            'اختار نوع المشكلة'
          );
          return false;
        }


        if (!sector) {
          Swal.showValidationMessage(
            'اختار القطاع'
          );
          return false;
        }


        if (!sectionId) {
          Swal.showValidationMessage(
            'اختار المنطقة'
          );
          return false;
        }


        if (!reportedBy) {
          Swal.showValidationMessage(
            'اكتب اسم الـ Controller'
          );
          return false;
        }


        return {
          title,
          description,
          category,
          priority,
          sector,
          sectionId: Number(sectionId),
          reportedBy
        };

      }

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }


      this.service
        .createMaintenanceIssue(
          result.value
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'تم تسجيل البلاغ',
              text: 'تم إضافة بلاغ الصيانة بنجاح',
              confirmButtonText: 'تمام'
            });

            this.loadIssues();

          },


          error: (err) => {

            console.error(
              'Error creating maintenance issue:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: 'حدث خطأ أثناء تسجيل البلاغ',
              confirmButtonText: 'تمام'
            });

          }

        });

    });

  }

  updateIssueStatus(
    issue: MaintenanceIssue,
    status: string
  ): void {

    let title = '';
    let text = '';

    if (status === 'InProgress') {
      title = 'بدء العمل؟';
      text = 'سيتم تحويل البلاغ إلى جاري العمل';
    }

    if (status === 'Resolved') {
      title = 'تأكيد حل البلاغ؟';
      text = 'سيتم تسجيل البلاغ كمشكلة تم حلها';
    }

    Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: 'تأكيد',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#facc15',
      cancelButtonColor: '#374151'
    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.service
        .updateMaintenanceStatus(
          issue.id,
          status
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'تم تحديث الحالة',
              confirmButtonText: 'تمام'
            });

            this.loadIssues();
          },

          error: (err) => {

            console.error(
              'Error updating maintenance status:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: 'حدث خطأ أثناء تحديث حالة البلاغ',
              confirmButtonText: 'تمام'
            });

          }

        });

    });

  }

  loadIssueSections(
    select: HTMLSelectElement
  ): void {

    this.service.getAll().subscribe({

      next: (sections) => {

        sections.forEach(section => {

          const option =
            document.createElement('option');

          option.value =
            String(section.id);

          let sectionNameArabic = section.sectionName;

          switch (section.sectionName) {

            // البحيرة
            case 'SocialB-lowCafe':
              sectionNameArabic = 'اللوكافيه ';
              break;

            case 'SocialB-Front':
              sectionNameArabic = 'واجهة المبنى الاجتماعي';
              break;

            case 'SportB-Front':
              sectionNameArabic = 'واجهة المبنى الرياضي';
              break;

            case 'Social-100':
              sectionNameArabic = 'ضلع 100';
              break;

            case 'Social-200':
              sectionNameArabic = 'ضلع 200';
              break;

            case 'Social-300':
              sectionNameArabic = 'ضلع 300';
              break;

            case 'Social-400':
              sectionNameArabic = 'ضلع 400';
              break;

            case 'SportBuilding-WaitHall':
              sectionNameArabic = 'قاعة انتظار المبنى الرياضي';
              break;

            case 'garden1':
              sectionNameArabic = 'جاردن 1';
              break;

            case 'garden2':
              sectionNameArabic = 'جاردن 2';
              break;

            case 'garden3':
              sectionNameArabic = 'جاردن 3';
              break;

            case 'Kiosks':
              sectionNameArabic = 'الكويسكات';
              break;

            case 'Track':
              sectionNameArabic = 'التراك  ';
              break;

            case 'Fitness':
              sectionNameArabic = 'واجهة المبنى الاجتماعي';
              break;

            case 'Phase-2':
              sectionNameArabic = 'المرحله الثانيه  ';
              break;


            // هنا نضيف باقي المناطق بنفس الطريقة

            default:
              sectionNameArabic = section.sectionName;
              break;
          }

          option.textContent =
            `${sectionNameArabic}`;

          select.appendChild(option);

        });

      },

      error: (err) => {

        console.error(
          'Error loading sections:',
          err
        );

      }

    });

  }


  assignIssue(issue: MaintenanceIssue): void {

    Swal.fire({

      title: 'تعيين مسؤول البلاغ',

      html: `
      <div class="maintenance-form">

        <div class="form-field">

          <label>المسؤول</label>

          <select
            id="assigned-to"
            class="form-control">

            <option value="">اختار المسؤول</option>

            <option value="Maintenance Team">
              فريق الصيانة
            </option>

            <option value="Electrical Team">
              فريق الكهرباء
            </option>

            <option value="Plumbing Team">
              فريق السباكة
            </option>

            <option value="Cleaning Team">
              فريق النظافة
            </option>

            <option value="Safety Team">
              فريق السلامة
            </option>

          </select>

        </div>

      </div>
    `,

      width: '450px',

      showCancelButton: true,

      confirmButtonText: 'تعيين',

      cancelButtonText: 'إلغاء',

      focusConfirm: false,

      customClass: {
        popup: 'clean-maintenance-popup',
        confirmButton: 'clean-confirm-btn',
        cancelButton: 'clean-cancel-btn'
      },

      preConfirm: () => {

        const assignedTo =
          (
            document.getElementById(
              'assigned-to'
            ) as HTMLSelectElement
          )?.value;

        if (!assignedTo) {

          Swal.showValidationMessage(
            'اختار المسؤول'
          );

          return false;
        }

        return assignedTo;
      }

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.service
        .assignMaintenanceIssue(
          issue.id,
          result.value
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'تم التعيين',
              text: 'تم تعيين مسؤول البلاغ بنجاح',
              confirmButtonText: 'تمام'
            });

            this.loadIssues();

          },

          error: (err) => {

            console.error(
              'Error assigning maintenance issue:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: 'حدث خطأ أثناء تعيين البلاغ',
              confirmButtonText: 'تمام'
            });

          }

        });

    });

  }



  getPriorityArabic(priority: string): string {

    const priorities: { [key: string]: string } = {
      Low: 'منخفضة',
      Medium: 'متوسطة',
      High: 'عالية',
      Critical: 'حرجة'
    };

    return priorities[priority] || priority;
  }


  getStatusArabic(status: string): string {

    const statuses: { [key: string]: string } = {
      New: 'جديد',
      Assigned: 'تم التعيين',
      InProgress: 'جاري العمل',
      Resolved: 'تم الحل'
    };

    return statuses[status] || status;
  }


  getCategoryArabic(category: string): string {

    const categories: { [key: string]: string } = {
      Electrical: 'كهرباء',
      Plumbing: 'سباكة',
      Furniture: 'أثاث',
      Cleaning: 'نظافة',
      Equipment: 'معدات',
      Safety: 'سلامة',
      Other: 'أخرى'
    };

    return categories[category] || category;
  }


  getSectorArabic(sector: string): string {

    const sectors: { [key: string]: string } = {
      Lake: 'البحيرة',
      Garden: 'الجاردن',
      Fields: 'الملاعب'
    };

    return sectors[sector] || sector;
  }

  getAssignedToArabic(assignedTo: string | null): string {

    const names: { [key: string]: string } = {

      'Maintenance Team': 'فريق الصيانة',
      'Electrical Team': 'فريق الكهرباء',
      'Plumbing Team': 'فريق السباكة',
      'Cleaning Team': 'فريق النظافة',
      'Safety Team': 'فريق السلامة'

    };

    if (!assignedTo) {
      return 'غير محدد';
    }

    return names[assignedTo] || assignedTo;
  }


  getSectionArabic(sectionName: string | null): string {

    const sections: { [key: string]: string } = {

      'SocialB-lowCafe': 'الكافيه السفلي',
      'SocialB-Front': 'واجهة المبنى الاجتماعي',
      'SportB-Front': 'واجهة المبنى الرياضي',
      'Social-100': 'ضلع 100',
      'Social-200': 'ضلع 200',
      'Social-300': 'ضلع 300',
      'Social-400': 'ضلع 400',
      'SportBuilding-WaitHall': 'قاعة انتظار المبنى الرياضي',
      'garden1': 'جاردن 1',
      'garden2': 'جاردن 2',
      'garden3': 'جاردن 3',
      'Kiosks': 'الكويسكات',
      'Track': 'التراك',
      'Fitness': 'الفتنس ',
      'Phase-2': 'المرحلة الثانية'

      // ضيف هنا باقي المناطق اللي عندك

    };

    if (!sectionName) {
      return 'غير محدد';
    }

    return sections[sectionName] || sectionName;
  }

  get filteredIssues(): MaintenanceIssue[] {

    return this.issues.filter(issue => {

      const search =
        this.searchText.trim().toLowerCase();

      const matchesSearch =
        !search ||
        issue.title.toLowerCase().includes(search) ||
        issue.description.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        issue.status === this.selectedStatus;

      const matchesPriority =
        this.selectedPriority === 'All' ||
        issue.priority === this.selectedPriority;

      const matchesSector =
        this.selectedSector === 'All' ||
        issue.sector === this.selectedSector;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesSector
      );

    });

  }

  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = 'All';

    this.selectedPriority = 'All';

    this.selectedSector = 'All';

  }

  getLakeIssues(): number {
    return this.issues.filter(issue => issue.sector === 'Lake').length;
  }

  getGardenIssues(): number {
    return this.issues.filter(issue => issue.sector === 'Garden').length;
  }

  getFieldsIssues(): number {
    return this.issues.filter(issue => issue.sector === 'Fields').length;
  }

  getElectricalIssues(): number {
    return this.issues.filter(issue => issue.category === 'Electrical').length;
  }

  getPlumbingIssues(): number {
    return this.issues.filter(issue => issue.category === 'Plumbing').length;
  }

  getCleaningIssues(): number {
    return this.issues.filter(issue => issue.category === 'Cleaning').length;
  }

  getEquipmentIssues(): number {
    return this.issues.filter(issue => issue.category === 'Equipment').length;
  }

  getSafetyIssues(): number {
    return this.issues.filter(issue => issue.category === 'Safety').length;
  }

  getResolvedPercentage(): number {

    if (!this.issues.length) {
      return 0;
    }

    return Math.round(
      (this.getResolvedIssues() / this.issues.length) * 100
    );

  }
}