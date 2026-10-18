
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'wd-seating';

  constructor(
    public router: Router,
    private location: Location
  ) { }

  get showFloatingNavigation(): boolean {
    const currentUrl = this.router.url.split('?')[0].split('#')[0];

    // إخفاء الأيقونات في صفحة الخريطة الرئيسية
    return currentUrl !== '/' && currentUrl !== '';
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.goToDashboard();
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
