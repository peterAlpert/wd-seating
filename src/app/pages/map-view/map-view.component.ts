import { Component, HostListener, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionsService } from '../../services/sections.service';
import { Router } from '@angular/router';
import { Section } from '../../interfaces/section';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

interface MapArea {
  name: string;
  sectionName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  polygon?: string;
}

interface Gate {
  name: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, CdkDrag, FormsModule],
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements OnInit {

  private service = inject(SectionsService);
  private router = inject(Router);

  attendanceCount = 1;
  showCapacityEditor = false;

  newCapacity = 0;

  private cdr = inject(ChangeDetectorRef);
  mapFitScale = 1;



  private initialPinchDistance = 0;
  private initialPinchZoom = 1;
  private lastTouchCenterX = 0;
  private lastTouchCenterY = 0;
  private isPinching = false;


  sections: Section[] = [];
  selectedSection: Section | null = null;

  loading = false;
  attendanceUpdating = false;

  isEditMode = false;

  private originalMapAreas: MapArea[] = [];

  /*
   * الصورة الحقيقية للنادي هنحط مسارها هنا
   * مؤقتًا استخدم أي صورة عندك للتجربة
   */
  mapImage = 'assets/club-map.jpg';

  zoomLevel = 1;

  offsetX = 0;
  offsetY = 0;

  isDragging = false;

  dragStartX = 0;
  dragStartY = 0;

  dragMoved = false;

  private lastPointerX = 0;
  private lastPointerY = 0;

  tooltip = {
    visible: false,
    x: 0,
    y: 0,
    content: ''
  };

  onWheel(event: WheelEvent): void {

    event.preventDefault();

    const zoomStep = 0.1;

    if (event.deltaY < 0) {

      this.zoomLevel += zoomStep;

    } else {

      this.zoomLevel -= zoomStep;

    }

    if (this.zoomLevel < 0.6) {
      this.zoomLevel = 0.6;
    }

    if (this.zoomLevel > 3) {
      this.zoomLevel = 3;
    }

  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }


  mapAreas: MapArea[] = [

    {
      name: 'ضلع 100',
      sectionName: 'Social-100',
      x: 30,
      y: 10,
      width: 19,
      height: 10
    },

    {
      name: ' الضلع الاجتماعي',
      sectionName: 'Social-200',
      x: 30,
      y: 22,
      width: 16,
      height: 20
    },

    {
      name: 'الضلع الرياضي',
      sectionName: 'Social-300',
      x: 55,
      y: 22,
      width: 16,
      height: 20
    },

    {
      name: 'ضلع 400',
      sectionName: 'Social-400',
      x: 52,
      y: 10,
      width: 19,
      height: 10
    },

    {
      name: 'المبني الرياضي',
      sectionName: 'SportBuilding-WaitHall',
      x: 79,
      y: 10,
      width: 12,
      height: 50
    },

    {
      name: 'امام المبني',
      sectionName: 'SportB-Front',
      x: 73,
      y: 20,
      width: 5,
      height: 35
    },

    {
      name: 'المبني الاجتماعي',
      sectionName: 'SocialB-lowCafe',
      x: 10,
      y: 10,
      width: 12,
      height: 30
    },

    {
      name: 'امام المبني',
      sectionName: 'SocialB-Front',
      x: 23,
      y: 15,
      width: 3,
      height: 25
    },

    {
      name: 'دار الفنون',
      sectionName: 'ArtHouse',
      x: 10,
      y: 42,
      width: 15,
      height: 5
    },


    {
      name: 'جاردن 1',
      sectionName: 'garden1',
      x: 10,
      y: 48,
      width: 19,
      height: 15
    },

    {
      name: 'جاردن 2',
      sectionName: 'garden2',
      x: 31,
      y: 48,
      width: 19,
      height: 15
    },

    {
      name: 'جاردن 3',
      sectionName: 'garden3',
      x: 51,
      y: 48,
      width: 19,
      height: 15
    },

    {
      name: 'كويسكات',
      sectionName: 'Kiosks',
      x: 10,
      y: 66,
      width: 61,
      height: 10
    },

    {
      name: 'ملعب 1',
      sectionName: 'Five-A-Side-1',
      x: 45,
      y: 80,
      width: 10,
      height: 6
    },
    {
      name: 'ملعب 2',
      sectionName: 'Five-A-Side-2',
      x: 45,
      y: 87,
      width: 10,
      height: 6
    },
    {
      name: 'ملعب 3',
      sectionName: 'Five-A-Side-3',
      x: 55,
      y: 80,
      width: 10,
      height: 6
    },
    {
      name: 'ملعب 4',
      sectionName: 'Five-A-Side-4',
      x: 55,
      y: 87,
      width: 10,
      height: 6
    },

    {
      name: 'الفتنس',
      sectionName: 'Fitness',
      x: 38,
      y: 94,
      width: 36,
      height: 9
    },

    {
      name: 'التراك',
      sectionName: 'Track',
      x: 76,
      y: 80,
      width: 16,
      height: 23
    },

    {
      name: 'المرحلة الثانية',
      sectionName: 'Phase-2',
      x: 10,
      y: 80,
      width: 26,
      height: 23
    },


    {
      name: '',
      sectionName: 'Viewing-Benches',
      x: 39,
      y: 80,
      width: 5,
      height: 13
    },

    {
      name: '',
      sectionName: 'Viewing-Benches2',
      x: 66,
      y: 80,
      width: 5,
      height: 13
    },

    {
      name: 'معمورتي',
      sectionName: 'Mamourty',
      x: 72,
      y: 61,
      width: 6,
      height: 12
    },

    {
      name: ' سرايا',
      sectionName: 'Saraya-Restaurant',
      x: 15,
      y: 96,
      width: 16,
      height: 6
    },

  ];

  gates: Gate[] = [

    {
      name: 'البوابة الرئيسية',
      x: 50,
      y: 0
    },

    {
      name: 'بوابة الأنشطة',
      x: 95,
      y: 70
    },

    {
      name: 'بوابة العاملين',
      x: 50,
      y: 110
    }

  ];

  ngOnInit(): void {

    this.loadSavedMapLayout();

    this.loadData();

    setInterval(() => {
      this.loadData();
    }, 10000);
  }


  loadData(): void {

    this.loading = true;

    this.service.getAll().subscribe({

      next: (res) => {

        this.sections = res;
        console.table(this.sections);

        // تحديث الـ Panel لو مفتوح
        if (this.selectedSection) {

          const updatedSection = this.getSection(
            this.selectedSection.sectionName
          );

          if (updatedSection) {

            this.selectedSection = updatedSection;

          }

        }

        this.loading = false;

        console.log('Map data:', this.sections);

      },
      error: (err) => {

        this.loading = false;

        console.error('Error loading map data:', err);

      }

    });

  }

  selectArea(name: string): void {

    const area = this.mapAreas.find(
      a => a.name.trim() === name.trim()
    );

    if (!area) return;

    const section = this.getSection(area.sectionName);

    if (!section) {
      this.selectedSection = {
        id: 0,
        sectorName: '',
        sectionName: area.sectionName,
        capacity: 0,
        currentAttendance: 0,
        noData: true
      };

      return;
    }

    this.selectedSection = section;
  }


  closePanel(): void {

    this.selectedSection = null;

  }

  getSection(sectionName: string): Section | null {
    if (!sectionName) return null;

    return this.sections.find(
      section => section.sectionName?.trim() === sectionName.trim()
    ) ?? null;
  }

  getPercentage(area: MapArea): number {
    const section = this.getSection(area.sectionName);

    if (!section || !section.capacity || section.capacity <= 0) {
      return 0;
    }

    const percentage =
      (section.currentAttendance / section.capacity) * 100;

    return Math.min(Math.round(percentage), 100);
  }

  getColor(area: MapArea): string {
    const section = this.getSection(area.sectionName);

    if (!section) {
      return '#64748b';
    }

    const percentage = this.getPercentage(area);

    if (percentage < 50) return '#22c55e';
    if (percentage < 80) return '#f59e0b';

    return '#ef4444';
  }

  getBackgroundColor(area: MapArea): string {
    const section = this.getSection(area.sectionName);

    if (!section) {
      return 'rgba(100,116,139,0.35)';
    }

    return this.getColor(area) + '66';
  }

  showTooltip(event: MouseEvent, area: MapArea): void {
    const section = this.getSection(area.sectionName);

    if (!section) {
      this.tooltip = {
        visible: true,
        x: event.clientX + 15,
        y: event.clientY + 15,
        content: `${area.name}: لا توجد بيانات`
      };
      return;
    }

    this.tooltip = {
      visible: true,
      x: event.clientX + 15,
      y: event.clientY + 15,
      content:
        `${area.name} | ` +
        `${section.currentAttendance}/${section.capacity} | ` +
        `${this.getPercentage(area)}%`
    };
  }

  moveTooltip(event: MouseEvent): void {

    if (!this.tooltip.visible) {
      return;
    }

    this.tooltip.x = event.clientX + 15;
    this.tooltip.y = event.clientY + 15;

  }

  hideTooltip(): void {

    this.tooltip.visible = false;

  }

  zoomIn(): void {

    this.zoomLevel += 0.2;

    if (this.zoomLevel > 3) {
      this.zoomLevel = 3;
    }

  }

  zoomOut(): void {

    this.zoomLevel -= 0.2;

    if (this.zoomLevel < 0.6) {
      this.zoomLevel = 0.6;
    }

  }


  resetZoom(): void {
    this.zoomLevel = 1;
    this.updateMapFitScale();
  }


  startDrag(event: PointerEvent): void {

    // أثناء تعديل الخريطة:
    // السحب يكون للمنطقة فقط وليس للخريطة
    if (this.isEditMode) {
      return;
    }

    // لو الضغط على زر أو Panel
    if (
      (event.target as HTMLElement)?.closest(
        '.map-controls, .section-panel, .dashboard-btn, .edit-map-btn, .map-editor-controls'
      )
    ) {
      return;
    }

    this.isDragging = true;
    this.dragMoved = false;

    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
  }

  drag(event: PointerEvent): void {

    if (!this.isDragging) {
      return;
    }

    const deltaX =
      event.clientX - this.lastPointerX;

    const deltaY =
      event.clientY - this.lastPointerY;

    // نعتبره Drag فعلي بعد حركة بسيطة
    if (
      Math.abs(deltaX) > 2 ||
      Math.abs(deltaY) > 2
    ) {
      this.dragMoved = true;
    }

    this.offsetX += deltaX;
    this.offsetY += deltaY;

    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;

  }

  stopDrag(): void {

    this.isDragging = false;

  }

  onAreaClick(
    name: string,
    event: MouseEvent
  ): void {

    event.stopPropagation();

    // أثناء تعديل الخريطة:
    // الضغط على المنطقة لا يفتح التفاصيل
    if (this.isEditMode) {
      return;
    }

    // لو حصل Drag بالفعل
    if (this.dragMoved) {
      this.dragMoved = false;
      return;
    }

    this.selectArea(name);
  }

  getPercentageBySection(section: Section): number {
    if (!section || section.capacity <= 0) {
      return 0;
    }

    return Math.min(
      Math.round(
        (section.currentAttendance / section.capacity) * 100
      ),
      100
    );
  }

  getColorBySection(section: Section): string {
    const percentage = this.getPercentageBySection(section);

    if (percentage < 50) return '#22c55e';
    if (percentage < 80) return '#f59e0b';

    return '#ef4444';
  }

  enterSection(): void {

    if (!this.selectedSection) return;

    const count = this.attendanceCount;

    if (count <= 0) {
      return;
    }

    const available =
      this.selectedSection.capacity -
      this.selectedSection.currentAttendance;

    if (count > available) {
      alert(
        `المتاح للدخول ${available} أشخاص فقط`
      );

      return;
    }

    if (this.attendanceUpdating) {
      return;
    }

    this.attendanceUpdating = true;

    this.service
      .enter(
        this.selectedSection.id,
        count
      )
      .subscribe({

        next: (updatedSection) => {

          this.selectedSection =
            updatedSection;

          const index =
            this.sections.findIndex(
              s =>
                s.id ===
                updatedSection.id
            );

          if (index !== -1) {

            this.sections[index] =
              updatedSection;

          }

          this.attendanceUpdating =
            false;

          this.attendanceCount = 1;
        },

        error: (err) => {

          console.error(
            'Error entering section:',
            err
          );

          this.attendanceUpdating =
            false;

          alert(
            err?.error?.message ||
            'حدث خطأ أثناء تسجيل الدخول'
          );
        }

      });
  }
  exitSection(): void {

    if (!this.selectedSection) {
      return;
    }

    const count =
      this.attendanceCount;

    if (count <= 0) {
      return;
    }

    if (
      count >
      this.selectedSection.currentAttendance
    ) {

      alert(
        `الموجود حاليًا ${this.selectedSection.currentAttendance} أشخاص فقط`
      );

      return;
    }

    if (this.attendanceUpdating) {
      return;
    }

    this.attendanceUpdating = true;

    this.service
      .exit(
        this.selectedSection.id,
        count
      )
      .subscribe({

        next: (updatedSection) => {

          this.selectedSection =
            updatedSection;

          const index =
            this.sections.findIndex(
              s =>
                s.id ===
                updatedSection.id
            );

          if (index !== -1) {

            this.sections[index] =
              updatedSection;

          }

          this.attendanceUpdating =
            false;

          this.attendanceCount = 1;
        },

        error: (err) => {

          console.error(
            'Error exiting section:',
            err
          );

          this.attendanceUpdating =
            false;

          alert(
            err?.error?.message ||
            'حدث خطأ أثناء تسجيل الخروج'
          );
        }

      });
  }

  ////////////////////////////////////////////
  //////////// editor Functions /////////////
  ///////////////////////////////////////////
  toggleEditMode(): void {

    if (!this.isEditMode) {

      // حفظ نسخة من الوضع الحالي قبل التعديل
      this.originalMapAreas =
        this.mapAreas.map(area => ({
          ...area
        }));

      this.isEditMode = true;

      return;
    }

    this.saveMapLayout();
  }


  cancelMapEdit(): void {

    if (!this.isEditMode) {
      return;
    }

    this.mapAreas =
      this.originalMapAreas.map(area => ({
        ...area
      }));

    this.isEditMode = false;
  }


  saveMapLayout(): void {

    localStorage.setItem(
      'wd-map-layout',
      JSON.stringify(this.mapAreas)
    );

    this.isEditMode = false;

    console.log(
      'Map layout saved:',
      this.mapAreas
    );
  }


  onAreaDragEnd(
    event: CdkDragEnd,
    area: MapArea
  ): void {

    if (!this.isEditMode) {
      return;
    }

    const position =
      event.source.getFreeDragPosition();

    const mapElement =
      document.querySelector('.map-wrapper') as HTMLElement;

    if (!mapElement) {
      event.source.reset();
      return;
    }

    const mapWidth = mapElement.clientWidth;
    const mapHeight = mapElement.clientHeight;



    const deltaX =
      (position.x / this.zoomLevel / mapWidth) * 100;

    const deltaY =
      (position.y / this.zoomLevel / mapHeight) * 100;


    area.x += deltaX;
    area.y += deltaY;


    /*
     * منع المنطقة من الخروج خارج الخريطة
     */

    area.x = Math.max(
      0,
      Math.min(area.x, 100 - area.width)
    );

    area.y = Math.max(
      0,
      Math.min(area.y, 100 - area.height)
    );


    /*
     * Reset لحركة CDK المؤقتة
     * لأننا حفظنا المكان الجديد
     * داخل x و y
     */

    event.source.reset();


    console.log(
      'Map Area Updated:',
      area.name,
      {
        x: area.x,
        y: area.y
      }
    );
  }

  loadSavedMapLayout(): void {

    const savedLayout =
      localStorage.getItem('wd-map-layout');

    if (!savedLayout) {
      return;
    }

    try {

      const parsedLayout =
        JSON.parse(savedLayout);

      if (
        !Array.isArray(parsedLayout) ||
        parsedLayout.length === 0
      ) {
        return;
      }

      /*
       * نحتفظ بالخريطة الحالية الموجودة في الكود
       * لأنها تحتوي على أي مناطق جديدة أضفناها.
       */
      const defaultMapAreas =
        this.mapAreas.map(area => ({
          ...area
        }));


      /*
       * المناطق المحفوظة في LocalStorage
       * نستخدم منها المكان والتعديلات اليدوية.
       */
      const savedAreas =
        parsedLayout.map((area: MapArea) => ({
          ...area
        }));


      /*
       * ندمج الاثنين:
       *
       * - لو المنطقة موجودة في LocalStorage
       *   نستخدم مكانها المحفوظ.
       *
       * - لو منطقة جديدة ومش موجودة في LocalStorage
       *   نضيفها من mapAreas الحالية.
       */
      const mergedAreas: MapArea[] =
        defaultMapAreas.map(defaultArea => {

          const savedArea =
            savedAreas.find(
              (saved: MapArea) =>
                saved.sectionName === defaultArea.sectionName
            );

          if (savedArea) {

            return {
              ...defaultArea,
              ...savedArea
            };

          }

          return {
            ...defaultArea
          };

        });


      this.mapAreas = mergedAreas;


      console.log(
        'Merged map layout:',
        this.mapAreas
      );

    } catch (error) {

      console.error(
        'Invalid saved map layout:',
        error
      );

    }
  }


  increaseAttendanceCount(): void {

    if (!this.selectedSection) {
      return;
    }

    const max =
      Math.max(
        1,
        this.getAvailableForEntry()
      );

    if (this.attendanceCount < max) {
      this.attendanceCount++;
    }
  }


  decreaseAttendanceCount(): void {

    if (this.attendanceCount > 1) {
      this.attendanceCount--;
    }
  }

  getAvailableForEntry(): number {

    if (!this.selectedSection) {
      return 0;
    }

    return Math.max(
      0,
      this.selectedSection.capacity -
      this.selectedSection.currentAttendance
    );
  }

  toggleCapacityEditor(): void {

    if (!this.selectedSection) {
      return;
    }

    this.showCapacityEditor =
      !this.showCapacityEditor;

    if (this.showCapacityEditor) {

      this.newCapacity =
        this.selectedSection.capacity;

    }
  }

  saveCapacity(): void {

    if (!this.selectedSection) {
      return;
    }

    if (
      this.newCapacity <= 0 ||
      this.newCapacity <
      this.selectedSection.currentAttendance
    ) {

      alert(
        `السعة لا يمكن أن تكون أقل من الحضور الحالي (${this.selectedSection.currentAttendance})`
      );

      return;
    }

    if (this.attendanceUpdating) {
      return;
    }

    this.attendanceUpdating = true;

    this.service
      .updateCapacity(
        this.selectedSection.id,
        this.newCapacity
      )
      .subscribe({

        next: (updatedSection) => {

          this.selectedSection =
            updatedSection;

          const index =
            this.sections.findIndex(
              s =>
                s.id ===
                updatedSection.id
            );

          if (index !== -1) {

            this.sections[index] =
              updatedSection;

          }

          this.attendanceUpdating =
            false;

          this.showCapacityEditor =
            false;

        },

        error: (err) => {

          console.error(
            'Error updating capacity:',
            err
          );

          this.attendanceUpdating =
            false;

          alert(
            err?.error?.message ||
            'حدث خطأ أثناء تعديل السعة'
          );
        }

      });
  }





  private updateMapFitScale(): void {
    const container = document.querySelector(
      '.map-container'
    ) as HTMLElement | null;

    // نستخدم أبعاد حاوية الخريطة الفعلية
    const screenWidth =
      container?.clientWidth || window.innerWidth;

    const screenHeight =
      container?.clientHeight || window.innerHeight;

    const mapWidth = 1100;
    const mapHeight = 700;
    const padding = 16;

    // الكمبيوتر يفضل بنفس الحجم والتنسيق الحالي
    if (screenWidth > 700 && screenHeight > 500) {
      this.mapFitScale = 1;
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }

    // المساحة المتاحة بعد ترك هامش بسيط
    const availableWidth = Math.max(
      1,
      screenWidth - padding
    );

    const availableHeight = Math.max(
      1,
      screenHeight - padding
    );

    // تصغير متناسب يحافظ على شكل الخريطة بالكامل
    const fitScale = Math.min(
      availableWidth / mapWidth,
      availableHeight / mapHeight
    );

    this.mapFitScale = Math.min(fitScale, 1);

    // توسيط الخريطة داخل الشاشة
    this.offsetX =
      (screenWidth - mapWidth * this.mapFitScale) / 2;

    this.offsetY =
      (screenHeight - mapHeight * this.mapFitScale) / 2;
  }




  ngAfterViewInit(): void {
    this.updateMapFitScale();
    this.cdr.detectChanges();
  }
  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateMapFitScale();
  }




  private getTouchDistance(event: TouchEvent): number {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];

    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length !== 2) {
      return;
    }

    event.preventDefault();
    this.isPinching = true;
    this.isDragging = false;

    this.initialPinchDistance = this.getTouchDistance(event);
    this.initialPinchZoom = this.zoomLevel;

    this.lastTouchCenterX =
      (event.touches[0].clientX + event.touches[1].clientX) / 2;

    this.lastTouchCenterY =
      (event.touches[0].clientY + event.touches[1].clientY) / 2;
  }

  onTouchMove(event: TouchEvent): void {
    if (event.touches.length !== 2 || !this.isPinching) {
      return;
    }

    event.preventDefault();

    const distance = this.getTouchDistance(event);

    if (this.initialPinchDistance <= 0) {
      return;
    }

    const ratio = distance / this.initialPinchDistance;

    this.zoomLevel = Math.max(
      0.6,
      Math.min(3, this.initialPinchZoom * ratio)
    );
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.touches.length < 2) {
      this.isPinching = false;
      this.initialPinchDistance = 0;
    }
  }

}