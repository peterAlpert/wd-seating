import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';

import {
  SectionsService,
  ControllerCoverageResponse,
  ControllerCoverageItem,
  ClubController
} from '../../services/sections.service';

import { Section } from '../../interfaces/section';

@Component({
  selector: 'app-controller-coverage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './controller-coverage.component.html',
  styleUrls: ['./controller-coverage.component.css']
})
export class ControllerCoverageComponent
  implements OnInit {

  private service = inject(SectionsService);

  coverage: ControllerCoverageResponse | null = null;

  controllers: ClubController[] = [];

  sections: Section[] = [];

  loading = false;

  managementLoading = false;
  // =========================
  // Controller Filters
  // =========================

  selectedControllerSector = 'all';

  selectedControllerStatus = 'all';

  selectedFilter:
    | 'all'
    | 'Covered'
    | 'NeedsSupport'
    | 'NoCoverage' = 'all';



  ngOnInit(): void {

    this.loadCoverage();

    this.loadManagementData();

    setInterval(() => {
      this.loadCoverage();
      this.loadManagementData();
    }, 10000);
  }

  // =========================
  // Coverage
  // =========================

  loadCoverage(): void {

    this.loading = true;

    this.service
      .getControllerCoverage()
      .subscribe({
        next: (res) => {

          this.coverage = res;

          this.loading = false;
        },

        error: (err) => {

          console.error(
            'Error loading controller coverage:',
            err
          );

          this.loading = false;
        }
      });
  }

  // =========================
  // Management Data
  // =========================

  loadManagementData(): void {

    this.managementLoading = true;

    this.service
      .getControllers()
      .subscribe({
        next: (res) => {

          this.controllers = res;

          this.loadSections();
        },

        error: (err) => {

          console.error(
            'Error loading controllers:',
            err
          );

          this.managementLoading = false;
        }
      });
  }

  loadSections(): void {

    this.service
      .getAll()
      .subscribe({
        next: (res) => {

          this.sections = res;

          this.managementLoading = false;
        },

        error: (err) => {

          console.error(
            'Error loading sections:',
            err
          );

          this.managementLoading = false;
        }
      });
  }

  // =========================
  // Add Controller
  // =========================

  addController(): void {

    Swal.fire({
      title: 'إضافة Controller جديد',

      html: `
        <input
          id="controller-name"
          class="swal2-input"
          placeholder="اسم الـ Controller">

        <input
          id="controller-code"
          class="swal2-input"
          placeholder="الكود مثال C005">

        <select
          id="controller-sector"
          class="swal2-select">

          <option value="">اختار القطاع</option>
          <option value="Lake">البحيرة</option>
          <option value="Garden">الجاردن</option>
          <option value="Fields">الملاعب</option>

        </select>
      `,

      confirmButtonText: 'إضافة',
      cancelButtonText: 'إلغاء',

      showCancelButton: true,

      focusConfirm: false,

      preConfirm: () => {

        const name = (
          document.getElementById(
            'controller-name'
          ) as HTMLInputElement
        )?.value.trim();

        const code = (
          document.getElementById(
            'controller-code'
          ) as HTMLInputElement
        )?.value.trim();

        const sector = (
          document.getElementById(
            'controller-sector'
          ) as HTMLSelectElement
        )?.value;

        if (!name || !code || !sector) {

          Swal.showValidationMessage(
            'من فضلك أكمل كل البيانات'
          );

          return false;
        }

        return {
          name,
          code,
          sector
        };
      }

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.service
        .addController(result.value)
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'تمت الإضافة',
              text: 'تم إضافة الـ Controller بنجاح',
              confirmButtonText: 'تمام'
            });

            this.loadManagementData();
            this.loadCoverage();
          },

          error: (err) => {

            console.error(
              'Error adding controller:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: 'حدث خطأ أثناء إضافة الـ Controller',
              confirmButtonText: 'تمام'
            });
          }

        });
    });
  }

  // =========================
  // Edit Controller
  // =========================

  editController(
    controller: ClubController
  ): void {

    Swal.fire({

      title: 'تعديل بيانات Controller',

      html: `
      <input
        id="edit-controller-name"
        class="swal2-input"
        placeholder="اسم الـ Controller"
        value="${controller.name}">

      <input
        id="edit-controller-code"
        class="swal2-input"
        placeholder="الكود"
        value="${controller.code}">

      <select
        id="edit-controller-sector"
        class="swal2-select">

        <option value="Lake"
          ${controller.sector === 'Lake' || controller.sector === 'Leak' ? 'selected' : ''}>
          البحيرة
        </option>

        <option value="Garden"
          ${controller.sector === 'Garden' ? 'selected' : ''}>
          الجاردن
        </option>

        <option value="Fields"
          ${controller.sector === 'Fields' ? 'selected' : ''}>
          الملاعب
        </option>

      </select>
    `,

      showCancelButton: true,

      confirmButtonText: 'حفظ التعديلات',
      cancelButtonText: 'إلغاء',

      focusConfirm: false,

      preConfirm: () => {

        const name = (
          document.getElementById(
            'edit-controller-name'
          ) as HTMLInputElement
        )?.value.trim();

        const code = (
          document.getElementById(
            'edit-controller-code'
          ) as HTMLInputElement
        )?.value.trim();

        const sector = (
          document.getElementById(
            'edit-controller-sector'
          ) as HTMLSelectElement
        )?.value;

        if (!name || !code || !sector) {

          Swal.showValidationMessage(
            'من فضلك أكمل كل البيانات'
          );

          return false;
        }

        return {
          name,
          code,
          sector
        };
      }

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.service
        .updateController(
          controller.id,
          {
            name: result.value.name,
            code: result.value.code,
            sector: result.value.sector,

            // نحافظ على الحالة الحالية
            status: controller.status,

            // نحافظ على حالة التوفر الحالية
            isAvailable: controller.isAvailable
          }
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'تم الحفظ',
              text: 'تم تعديل بيانات الـ Controller بنجاح',
              confirmButtonText: 'تمام'
            });

            this.loadManagementData();
            this.loadCoverage();
          },

          error: (err) => {

            console.error(
              'Error updating controller:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: 'حدث خطأ أثناء تعديل البيانات',
              confirmButtonText: 'تمام'
            });

          }

        });

    });
  }


  // =========================
  // Change Controller Status
  // =========================

  changeControllerStatus(
    controller: ClubController
  ): void {

    Swal.fire({

      title: 'تغيير حالة Controller',

      html: `
      <div style="text-align:right">

        <p style="margin-bottom:15px">
          <strong>${controller.name}</strong>
          (${controller.code})
        </p>

        <select
          id="controller-status"
          class="swal2-select"
          style="width:90%">

          <option value="Available"
            ${controller.status === 'Available' ? 'selected' : ''}>
            🟢 متاح
          </option>

          <option value="Busy"
            ${controller.status === 'Busy' ? 'selected' : ''}>
            🟠 مشغول
          </option>

          <option value="Break"
            ${controller.status === 'Break' ? 'selected' : ''}>
            ☕ راحة
          </option>

          <option value="Off"
            ${controller.status === 'Off' ? 'selected' : ''}>
            🔴 خارج الخدمة
          </option>

        </select>

      </div>
    `,

      showCancelButton: true,

      confirmButtonText: 'حفظ',
      cancelButtonText: 'إلغاء',

      preConfirm: () => {

        const status = (
          document.getElementById(
            'controller-status'
          ) as HTMLSelectElement
        )?.value;

        if (!status) {

          Swal.showValidationMessage(
            'من فضلك اختار الحالة'
          );

          return false;
        }

        return status;
      }

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.service
        .updateControllerStatus(
          controller.id,
          result.value
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'تم التحديث',
              text: 'تم تغيير حالة الـ Controller',
              confirmButtonText: 'تمام'
            });

            this.loadManagementData();
            this.loadCoverage();
          },

          error: (err) => {

            console.error(
              'Error updating controller status:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: 'حدث خطأ أثناء تغيير الحالة',
              confirmButtonText: 'تمام'
            });

          }

        });

    });
  }


  // =========================
  // Assign Controller
  // =========================

  assignController(
    controller: ClubController
  ): void {

    if (!this.sections.length) {

      Swal.fire(
        'تنبيه',
        'لا توجد Sections متاحة',
        'warning'
      );

      return;
    }

    const options = this.sections
      .map(section => {

        const sector =
          this.getSectorName(section.sectorName);

        const sectionName =
          this.getSectionName(section.sectionName);

        return `
          <option value="${section.id}">
            ${sector} - ${sectionName}
          </option>
        `;
      })
      .join('');

    Swal.fire({

      title: 'توزيع Controller',

      html: `
        <div style="text-align:right">

          <p style="margin-bottom:10px">
            <strong>${controller.name}</strong>
            (${controller.code})
          </p>

          <select
            id="assign-section"
            class="swal2-select"
            style="width:90%">

            <option value="">
              اختار المنطقة
            </option>

            ${options}

          </select>

        </div>
      `,

      showCancelButton: true,

      confirmButtonText: 'توزيع',
      cancelButtonText: 'إلغاء',

      preConfirm: () => {

        const sectionId = (
          document.getElementById(
            'assign-section'
          ) as HTMLSelectElement
        )?.value;

        if (!sectionId) {

          Swal.showValidationMessage(
            'من فضلك اختار المنطقة'
          );

          return false;
        }

        return Number(sectionId);
      }

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.service
        .assignController(
          controller.id,
          result.value
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'تم التوزيع',
              text: 'تم توزيع الـ Controller على المنطقة',
              confirmButtonText: 'تمام'
            });

            this.loadManagementData();
            this.loadCoverage();
          },

          error: (err) => {

            console.error(
              'Error assigning controller:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: 'حدث خطأ أثناء توزيع الـ Controller',
              confirmButtonText: 'تمام'
            });
          }

        });
    });
  }


  // =========================
  // Smart Assign Controller
  // =========================

  smartAssignController(
    section: ControllerCoverageItem
  ): void {

    // Controllers available for assignment
    const availableControllers =
      this.controllers.filter(controller =>
        controller.isAvailable &&
        !controller.currentSectionId &&
        (
          controller.sector === section.sectorName ||
          (
            section.sectorName === 'Leak' &&
            controller.sector === 'Lake'
          )
        )
      );

    // If no controller from same sector
    if (availableControllers.length === 0) {

      Swal.fire({
        icon: 'warning',

        title: 'لا يوجد Controller متاح',

        html: `
        <div style="text-align:right">

          <p>
            المنطقة:
            <strong>
              ${this.getSectionName(section.sectionName)}
            </strong>
          </p>

          <p>
            لا يوجد Controller متاح حاليًا
            من قطاع
            <strong>
              ${this.getSectorName(section.sectorName)}
            </strong>
          </p>

        </div>
      `,

        confirmButtonText: 'تمام'
      });

      return;
    }


    // First available controller
    const controller =
      availableControllers[0];


    Swal.fire({

      icon: 'question',

      title: 'توزيع Controller الآن؟',

      html: `
      <div style="text-align:right">

        <p>
          المنطقة المحتاجة للدعم:
        </p>

        <strong>
          ${this.getSectionName(section.sectionName)}
        </strong>

        <hr>

        <p>
          سيتم توزيع:
        </p>

        <strong>
          👮‍♂️ ${controller.name}
        </strong>

        <small>
          ${controller.code}
        </small>

        <hr>

        <p>
          الإشغال الحالي:
          <strong>
            ${section.percentage}%
          </strong>
        </p>

      </div>
    `,

      showCancelButton: true,

      confirmButtonText: '📍 توزيع الآن',

      cancelButtonText: 'إلغاء'

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }


      this.service
        .assignController(
          controller.id,
          section.sectionId
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',

              title: 'تم التوزيع',

              html: `
              تم توزيع
              <strong>
                ${controller.name}
              </strong>
              على
              <strong>
                ${this.getSectionName(section.sectionName)}
              </strong>
            `,

              confirmButtonText: 'تمام'
            });

            this.loadManagementData();
            this.loadCoverage();
          },

          error: (err) => {

            console.error(
              'Error smart assigning controller:',
              err
            );

            Swal.fire({
              icon: 'error',

              title: 'فشل التوزيع',

              text:
                'حدث خطأ أثناء توزيع الـ Controller',

              confirmButtonText: 'تمام'
            });

          }

        });

    });
  }

  // =========================
  // Unassign Controller
  // =========================

  unassignController(
    controller: ClubController
  ): void {

    Swal.fire({

      title: 'إلغاء التوزيع؟',

      text:
        `هل تريد إزالة ${controller.name} من المنطقة الحالية؟`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'نعم، إلغاء التوزيع',
      cancelButtonText: 'إلغاء'

    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.service
        .unassignController(controller.id)
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'تم',
              text: 'تم إلغاء توزيع الـ Controller',
              confirmButtonText: 'تمام'
            });

            this.loadManagementData();
            this.loadCoverage();
          },

          error: (err) => {

            console.error(
              'Error unassigning controller:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: 'حدث خطأ أثناء إلغاء التوزيع',
              confirmButtonText: 'تمام'
            });
          }

        });
    });
  }

  // =========================
  // Helpers
  // =========================

  get filteredSections(): ControllerCoverageItem[] {

    if (!this.coverage) {
      return [];
    }

    if (this.selectedFilter === 'all') {
      return this.coverage.sections;
    }

    return this.coverage.sections.filter(
      section =>
        section.coverageStatus ===
        this.selectedFilter
    );
  }

  setFilter(
    filter:
      | 'all'
      | 'Covered'
      | 'NeedsSupport'
      | 'NoCoverage'
  ): void {

    this.selectedFilter = filter;
  }

  // =========================
  // Filtered Controllers
  // =========================

  get filteredControllers(): ClubController[] {

    let result = [...this.controllers];

    if (this.selectedControllerSector !== 'all') {

      result = result.filter(controller =>
        controller.sector === this.selectedControllerSector ||
        (
          this.selectedControllerSector === 'Lake' &&
          controller.sector === 'Leak'
        )
      );
    }

    if (this.selectedControllerStatus !== 'all') {

      result = result.filter(controller =>
        controller.status === this.selectedControllerStatus
      );
    }

    return result;
  }

  // =========================
  // Controller Statistics
  // =========================

  get totalControllersCount(): number {
    return this.controllers.length;
  }

  get availableControllersCount(): number {
    return this.controllers.filter(
      controller => controller.isAvailable
    ).length;
  }

  get assignedControllersCount(): number {
    return this.controllers.filter(
      controller => controller.currentSectionId !== null
    ).length;
  }

  get unassignedControllersCount(): number {
    return this.controllers.filter(
      controller => controller.currentSectionId === null
    ).length;
  }

  get busyControllersCount(): number {
    return this.controllers.filter(
      controller =>
        controller.status === 'Busy'
    ).length;
  }

  get breakControllersCount(): number {
    return this.controllers.filter(
      controller =>
        controller.status === 'Break'
    ).length;
  }

  get offControllersCount(): number {
    return this.controllers.filter(
      controller =>
        controller.status === 'Off'
    ).length;
  }

  setControllerSectorFilter(
    sector: string
  ): void {

    this.selectedControllerSector = sector;
  }

  setControllerStatusFilter(
    status: string
  ): void {

    this.selectedControllerStatus = status;
  }

  getSectorName(sector: string): string {

    const translations: Record<string, string> = {

      Leak: 'البحيرة',
      Lake: 'البحيرة',

      Garden: 'الجاردن',

      Fields: 'الملاعب',
      Courts: 'الملاعب'
    };

    return translations[sector] || sector;
  }

  getSectionName(name: string): string {

    const translations: Record<string, string> = {

      'SocialB-lowCafe': 'اللو كافيه',
      'SportBuilding-WaitHall': 'قاعة الانتظار',
      'SocialB-Front': 'أمام المبنى الاجتماعي',
      'SportB-Front': 'أمام المبنى الرياضي',

      'Social-100': 'ضلع 100',
      'Social-200': 'ضلع 200',
      'Social-300': 'ضلع 300',
      'Social-400': 'ضلع 400',

      garden1: 'جاردن 1',
      garden2: 'جاردن 2',
      garden3: 'جاردن 3',

      Kiosks: 'الكويشكات',
      'Phase-2': 'المرحلة الثانية',
      Fitness: 'الفيتنس',
      Track: 'التراك'
    };

    return translations[name] || name;
  }

  getCoverageText(
    status:
      | 'Covered'
      | 'NeedsSupport'
      | 'NoCoverage'
  ): string {

    switch (status) {

      case 'Covered':
        return 'مغطاة';

      case 'NeedsSupport':
        return 'تحتاج دعم';

      case 'NoCoverage':
        return 'بدون تغطية';

      default:
        return status;
    }
  }

  getCoverageIcon(
    status:
      | 'Covered'
      | 'NeedsSupport'
      | 'NoCoverage'
  ): string {

    switch (status) {

      case 'Covered':
        return '🟢';

      case 'NeedsSupport':
        return '🟠';

      case 'NoCoverage':
        return '🔴';

      default:
        return '⚪';
    }
  }

  getPercentageClass(
    percentage: number
  ): string {

    if (percentage >= 90) {
      return 'critical';
    }

    if (percentage >= 80) {
      return 'high';
    }

    if (percentage >= 70) {
      return 'medium';
    }

    return 'normal';
  }
}