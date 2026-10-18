import { Component, OnInit, inject } from '@angular/core';
import { SectionsService } from '../../services/sections.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit {

  private service = inject(SectionsService);

  sections: any[] = [];

  ngOnInit() {
    this.loadData();

    // تحديث تلقائي كل 10 ثواني
    setInterval(() => {
      this.loadData();
    }, 10000);
  }

  loadData() {
    this.service.getAll().subscribe(res => {
      this.sections = res;
    });
  }

  getPercentage(section: any) {
    return Math.round((section.currentAttendance / section.capacity) * 100);
  }

  getColor(section: any) {
    const p = this.getPercentage(section);
    if (p < 50) return '#22c55e';
    if (p < 80) return '#f59e0b';
    return '#ef4444';
  }
}
