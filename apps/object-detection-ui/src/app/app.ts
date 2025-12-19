import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoDisplayComponent } from './components/video-display/video-display.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { StatsDashboardComponent } from './components/stats-dashboard/stats-dashboard.component';
import { NarratorComponent } from './components/narrator/narrator.component';
import { VideoStreamService } from './services/video-stream.service';
import { VideoFrame } from './services/video-stream.service';
import { Subscription } from 'rxjs';

@Component({
  imports: [
    RouterOutlet,
    VideoDisplayComponent,
    ControlPanelComponent,
    StatsDashboardComponent,
    NarratorComponent
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = 'Object Detection Dashboard';
  protected currentNarration = '';
  private readonly videoStream = inject(VideoStreamService);
  private frameSubscription?: Subscription;

  ngOnInit(): void {
    this.frameSubscription = this.videoStream.frames$.subscribe({
      next: (frame: VideoFrame) => {
        if (frame.narration) {
          this.currentNarration = frame.narration;
        }
      },
      error: (error) => {
        console.error('Error receiving video frames:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.frameSubscription?.unsubscribe();
  }
}
