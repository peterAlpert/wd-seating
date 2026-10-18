import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import {
  Incident,
  SectionsService
} from '../../services/sections.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-incidents',

  standalone: true,

  imports: [
    CommonModule, FormsModule
  ],

  templateUrl: './incidents.component.html',

  styleUrl: './incidents.component.css'
})
export class IncidentsComponent implements OnInit {


  incidents: Incident[] = [];

  loading = false;

  searchText: string = '';
  selectedStatus: string = 'All';
  selectedType: string = 'All';


  constructor(
    private service: SectionsService
  ) { }


  ngOnInit(): void {

    this.loadIncidents();

  }


  // =========================================
  // LOAD INCIDENTS
  // =========================================

  loadIncidents(): void {

    this.loading = true;

    this.service
      .getIncidents()
      .subscribe({

        next: (data) => {

          this.incidents = data;

          this.loading = false;

        },

        error: (err) => {

          console.error(
            'Error loading incidents:',
            err
          );

          this.loading = false;

          Swal.fire({

            icon: 'error',

            title: 'خطأ',

            text: 'حدث خطأ أثناء تحميل الحالات',

            confirmButtonText: 'تمام'

          });

        }

      });

  }


  // =========================================
  // COUNTERS
  // =========================================

  getTotalIncidents(): number {

    return this.incidents.length;

  }


  getOpenIncidents(): number {

    return this.incidents.filter(
      i => i.status === 'Open'
    ).length;

  }


  getSearchingIncidents(): number {

    return this.incidents.filter(
      i => i.status === 'Searching'
    ).length;

  }


  getFoundIncidents(): number {

    return this.incidents.filter(
      i => i.status === 'Found'
    ).length;

  }


  getMissingChildren(): number {

    return this.incidents.filter(
      i =>
        i.type === 'MissingChild' &&
        (
          i.status === 'Open' ||
          i.status === 'Searching'
        )
    ).length;

  }


  // =========================================
  // TYPE ARABIC
  // =========================================

  getTypeArabic(type: string): string {

    const types: {
      [key: string]: string
    } = {

      MissingChild: 'طفل مفقود',

      Incident: 'حادثة',

      Injury: 'إصابة',

      Behavior: 'مشكلة سلوكية',

      Other: 'أخرى'

    };

    return types[type] || type;

  }


  // =========================================
  // STATUS ARABIC
  // =========================================

  getStatusArabic(status: string): string {

    const statuses: {
      [key: string]: string
    } = {

      Open: 'بلاغ جديد',

      Searching: 'جاري البحث',

      Found: 'تم العثور',

      Closed: 'مغلقة'

    };

    return statuses[status] || status;

  }


  // =========================================
  // ASSIGNED ARABIC
  // =========================================

  getAssignedToArabic(
    assignedTo: string | null
  ): string {

    const names: {
      [key: string]: string
    } = {

      'Control Team':
        'فريق الكنترول',

      'Garden Control':
        'كنترول الجاردن',

      'Lake Control':
        'كنترول البحيرة',

      'Fields Control':
        'كنترول الملاعب'

    };


    if (!assignedTo) {

      return 'غير محدد';

    }


    return names[assignedTo] || assignedTo;

  }

  // =========================================
  // FILTERS
  // =========================================


  get filteredIncidents(): Incident[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    return this.incidents.filter(incident => {

      const matchesSearch =
        !search ||
        incident.childName
          .toLowerCase()
          .includes(search) ||

        incident.title
          .toLowerCase()
          .includes(search) ||

        incident.lastSeenLocation
          .toLowerCase()
          .includes(search) ||

        incident.reportedBy
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        this.selectedStatus === 'All' ||
        incident.status === this.selectedStatus;

      const matchesType =
        this.selectedType === 'All' ||
        incident.type === this.selectedType;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }

  clearFilters(): void {

    this.searchText = '';

    this.selectedStatus = 'All';

    this.selectedType = 'All';

  }

  // =========================================
  // CREATE MISSING CHILD
  // =========================================

  addMissingChild(): void {

    Swal.fire({

      title: '🚨 بلاغ طفل مفقود',

      html: `

        <div class="incident-form">

          <div class="form-field">

            <label>اسم الطفل</label>

            <input
              id="child-name"
              class="form-control"
              placeholder="اسم الطفل"
            />

          </div>


          <div class="form-grid">

            <div class="form-field">

              <label>العمر</label>

              <input
                id="child-age"
                type="number"
                min="1"
                max="18"
                class="form-control"
                placeholder="العمر"
              />

            </div>


            <div class="form-field">

              <label>النوع</label>

              <select
                id="child-gender"
                class="form-control">

                <option value="">
                  اختار
                </option>

                <option value="Male">
                  ولد
                </option>

                <option value="Female">
                  بنت
                </option>

              </select>

            </div>

          </div>


          <div class="form-field">

            <label>وصف الملابس</label>

            <textarea
              id="clothing"
              class="form-control"
              placeholder="مثال: تيشيرت أصفر وشورت أسود">
            </textarea>

          </div>


          <div class="form-field">

            <label>آخر مكان شوهد فيه</label>

            <input
              id="last-location"
              class="form-control"
              placeholder="مثال: Garden 2"
            />

          </div>


          <div class="form-field">

            <label>وصف إضافي</label>

            <textarea
              id="description"
              class="form-control"
              placeholder="أي معلومات تساعد في العثور على الطفل">
            </textarea>

          </div>


          <div class="form-field">

            <label>المُبلّغ</label>

            <input
              id="reported-by"
              class="form-control"
              placeholder="اسم أو جهة المُبلّغ"
            />

          </div>

        </div>

      `,

      width: '520px',

      showCancelButton: true,

      confirmButtonText: '🚨 تسجيل البلاغ',

      cancelButtonText: 'إلغاء',

      focusConfirm: false,

      customClass: {

        popup: 'clean-incident-popup',

        confirmButton: 'clean-confirm-btn',

        cancelButton: 'clean-cancel-btn'

      },


      preConfirm: () => {

        const childName =
          (
            document.getElementById(
              'child-name'
            ) as HTMLInputElement
          )?.value.trim();


        const childAgeValue =
          (
            document.getElementById(
              'child-age'
            ) as HTMLInputElement
          )?.value;


        const childGender =
          (
            document.getElementById(
              'child-gender'
            ) as HTMLSelectElement
          )?.value;


        const clothingDescription =
          (
            document.getElementById(
              'clothing'
            ) as HTMLTextAreaElement
          )?.value.trim();


        const lastSeenLocation =
          (
            document.getElementById(
              'last-location'
            ) as HTMLInputElement
          )?.value.trim();


        const description =
          (
            document.getElementById(
              'description'
            ) as HTMLTextAreaElement
          )?.value.trim();


        const reportedBy =
          (
            document.getElementById(
              'reported-by'
            ) as HTMLInputElement
          )?.value.trim();


        if (!childName) {

          Swal.showValidationMessage(
            'اكتب اسم الطفل'
          );

          return false;

        }


        if (!childAgeValue) {

          Swal.showValidationMessage(
            'اكتب عمر الطفل'
          );

          return false;

        }


        if (!childGender) {

          Swal.showValidationMessage(
            'اختار نوع الطفل'
          );

          return false;

        }


        if (!clothingDescription) {

          Swal.showValidationMessage(
            'اكتب وصف الملابس'
          );

          return false;

        }


        if (!lastSeenLocation) {

          Swal.showValidationMessage(
            'اكتب آخر مكان شوهد فيه الطفل'
          );

          return false;

        }


        return {

          type: 'MissingChild',

          title:
            `طفل مفقود - ${childName}`,

          description,

          childName,

          childAge:
            Number(childAgeValue),

          childGender,

          clothingDescription,

          lastSeenLocation,

          reportedBy

        };

      }

    }).then(result => {


      if (!result.isConfirmed) {

        return;

      }


      this.service
        .createIncident(result.value)
        .subscribe({

          next: () => {

            Swal.fire({

              icon: 'success',

              title: 'تم تسجيل البلاغ',

              text:
                'تم تسجيل بلاغ الطفل المفقود وبدء المتابعة',

              confirmButtonText: 'تمام'

            });


            this.loadIncidents();

          },


          error: (err) => {

            console.error(
              'Error creating incident:',
              err
            );


            Swal.fire({

              icon: 'error',

              title: 'خطأ',

              text:
                'حدث خطأ أثناء تسجيل البلاغ',

              confirmButtonText: 'تمام'

            });

          }

        });

    });

  }


  // =========================================
  // UPDATE STATUS
  // =========================================

  updateStatus(
    incident: Incident,
    status: string
  ): void {

    let message = '';

    if (status === 'Searching') {

      message =
        'هل تريد بدء البحث عن الطفل؟';

    }

    if (status === 'Found') {

      message =
        'هل تم العثور على الطفل بالفعل؟';

    }

    if (status === 'Closed') {

      message =
        'هل تريد إغلاق الحالة؟';

    }


    Swal.fire({

      icon: 'question',

      title: 'تأكيد الإجراء',

      text: message,

      showCancelButton: true,

      confirmButtonText: 'تأكيد',

      cancelButtonText: 'إلغاء',

      customClass: {

        confirmButton: 'clean-confirm-btn',

        cancelButton: 'clean-cancel-btn'

      }

    }).then(result => {


      if (!result.isConfirmed) {

        return;

      }


      this.service
        .updateIncidentStatus(
          incident.id,
          status
        )
        .subscribe({

          next: () => {

            this.loadIncidents();

          },

          error: (err) => {

            console.error(
              'Error updating incident:',
              err
            );

          }

        });

    });

  }


  // =========================================
  // ASSIGN
  // =========================================

  assignIncident(
    incident: Incident
  ): void {

    Swal.fire({

      title: '👤 تعيين مسؤول البحث',

      html: `

        <div class="incident-form">

          <div class="form-field">

            <label>المسؤول</label>

            <select
              id="incident-assigned-to"
              class="form-control">

              <option value="">
                اختار المسؤول
              </option>

              <option value="Control Team">
                فريق الكنترول
              </option>

              <option value="Garden Control">
                كنترول الجاردن
              </option>

              <option value="Lake Control">
                كنترول البحيرة
              </option>

              <option value="Fields Control">
                كنترول الملاعب
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

        popup: 'clean-incident-popup',

        confirmButton: 'clean-confirm-btn',

        cancelButton: 'clean-cancel-btn'

      },


      preConfirm: () => {

        const assignedTo =
          (
            document.getElementById(
              'incident-assigned-to'
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
        .assignIncident(
          incident.id,
          result.value
        )
        .subscribe({

          next: () => {

            Swal.fire({

              icon: 'success',

              title: 'تم التعيين',

              text:
                'تم تعيين مسؤول البحث',

              confirmButtonText: 'تمام'

            });


            this.loadIncidents();

          },

          error: (err) => {

            console.error(
              'Error assigning incident:',
              err
            );

          }

        });

    });

  }


  deleteIncident(
    incident: Incident
  ): void {

    Swal.fire({
      icon: 'warning',
      title: 'حذف الحالة',
      text: 'هل أنت متأكد من حذف هذه الحالة؟',
      showCancelButton: true,
      confirmButtonText: 'حذف',
      cancelButtonText: 'إلغاء',
      customClass: {
        confirmButton: 'clean-delete-btn',
        cancelButton: 'clean-cancel-btn'
      }
    }).then(result => {

      if (!result.isConfirmed) {
        return;
      }

      this.service
        .deleteIncident(incident.id)
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'تم الحذف',
              text: 'تم حذف الحالة بنجاح',
              confirmButtonText: 'تمام'
            });

            this.loadIncidents();
          },

          error: (err) => {

            console.error(
              'Error deleting incident:',
              err
            );

            Swal.fire({
              icon: 'error',
              title: 'خطأ',
              text: 'حدث خطأ أثناء حذف الحالة',
              confirmButtonText: 'تمام'
            });

          }

        });

    });
  }
}