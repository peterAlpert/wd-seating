import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DisplayComponent } from './pages/display/display.component';
import { MapViewComponent } from './pages/map-view/map-view.component';
import { SectionDetailsComponent } from './pages/section-details/section-details.component';
import { HistoryComponent } from './pages/history/history.component';
import { HeatMapComponent } from './pages/heat-map/heat-map.component';
import { AlertsComponent } from './pages/alerts/alerts.component';
import { ControllerCoverageComponent } from './pages/controller-coverage/controller-coverage.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { IncidentsComponent } from './pages/incidents/incidents.component';

export const routes: Routes = [
    { path: '', component: MapViewComponent, pathMatch: 'full' },
    { path: 'display', component: DisplayComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'section/:id', component: SectionDetailsComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'heat-map', component: HeatMapComponent },
    { path: 'alerts', component: AlertsComponent },
    { path: 'coverage', component: ControllerCoverageComponent },
    { path: 'maintenance', component: MaintenanceComponent },
    { path: 'incidents', component: IncidentsComponent },
    { path: '**', redirectTo: '' }
];
