import { Component } from '@angular/core';
import { ReportPanelComponent } from '../components/report-panel.component';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [ReportPanelComponent],
  template: '<app-report-panel></app-report-panel>',
})
export class ReportsPageComponent {}
