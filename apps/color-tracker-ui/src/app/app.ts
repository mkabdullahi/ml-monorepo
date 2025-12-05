import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VideoDisplayComponent } from './components/video-display/video-display.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { StatsDashboardComponent } from './components/stats-dashboard/stats-dashboard.component';

@Component({
  imports: [
    RouterModule,
    VideoDisplayComponent,
    ControlPanelComponent,
    StatsDashboardComponent
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Color Tracker Dashboard';
}
