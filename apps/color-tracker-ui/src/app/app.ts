import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VideoDisplayComponent } from './components/video-display/video-display.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { StatsDashboardComponent } from './components/stats-dashboard/stats-dashboard.component';
import { NarratorComponent } from './components/narrator/narrator.component';
import { VideoStreamService } from './services/video-stream.service';

@Component({
  imports: [
    RouterModule,
    VideoDisplayComponent,
    ControlPanelComponent,
    StatsDashboardComponent,
    NarratorComponent
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Color Tracker Dashboard';
  protected currentNarration = '';

  constructor(private videoStream: VideoStreamService) {
    this.videoStream.frames$.subscribe(frame => {
      if (frame.narration) {
        this.currentNarration = frame.narration;
      }
    });
  }
}
