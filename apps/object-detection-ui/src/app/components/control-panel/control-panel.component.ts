import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TrackerApiService } from '../../services/tracker-api.service';
import { VideoStreamService } from '../../services/video-stream.service';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSliderModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="control-panel">
      <div class="panel-header">
        <h2>Control Panel</h2>
      </div>

      <div class="panel-content">
        <!-- Start/Stop Controls -->
        <div class="control-section">
          <h3>Tracker Controls</h3>
          <div class="button-group">
            <button
              mat-raised-button
              color="primary"
              (click)="startTracking()"
              [disabled]="isRunning"
              class="control-button">
              <mat-icon>play_arrow</mat-icon>
              Start
            </button>
            <button
              mat-raised-button
              color="warn"
              (click)="stopTracking()"
              [disabled]="!isRunning"
              class="control-button">
              <mat-icon>stop</mat-icon>
              Stop
            </button>
          </div>
        </div>

        <!-- Detection Mode Selection -->
        <div class="control-section">
          <h3>Detection Mode</h3>
          <mat-select
            [(ngModel)]="selectedMode"
            (selectionChange)="changeMode()"
            class="mode-select">
            <mat-option value="color">Color Detection</mat-option>
            <mat-option value="object">Object Detection (MobileNet SSD)</mat-option>
            <mat-option value="object_yolo">Object Detection (YOLOv8)</mat-option>
          </mat-select>
          <p class="mode-description">
            @if (selectedMode === 'color') {
              Detects primary colors: Red, Blue, Yellow, Green
            } @else if (selectedMode === 'object') {
              Uses MobileNet SSD to detect various objects (person, car, dog, etc.) - Fast
            } @else {
              Uses YOLOv8 to detect various objects (person, car, dog, etc.) - More Accurate
            }
          </p>
        </div>

        <!-- Settings -->
        <div class="control-section">
          <h3>Settings</h3>

          <div class="setting-item">
            <span>Min Detection Area: {{ minArea }}</span>
            <mat-slider
              [min]="100"
              [max]="2000"
              [step]="50"
              [(ngModel)]="minArea"
              (change)="updateSettings()"
              color="primary">
              <input matSliderThumb>
            </mat-slider>
          </div>

          <div class="setting-item">
            <span>Camera Index: {{ cameraIndex }}</span>
            <mat-slider
              [min]="0"
              [max]="3"
              [step]="1"
              [(ngModel)]="cameraIndex"
              (change)="updateSettings()"
              color="primary">
              <input matSliderThumb>
            </mat-slider>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .control-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .panel-header {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
      padding: 16px 20px;
    }

    .panel-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .panel-content {
      padding: 20px;
    }

    .control-section {
      margin-bottom: 24px;
    }

    .control-section:last-child {
      margin-bottom: 0;
    }

    .control-section h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 12px 0;
    }

    .button-group {
      display: flex;
      gap: 12px;
    }

    .control-button {
      flex: 1;
      height: 48px;
      font-size: 1rem;
    }

    .mode-select {
      width: 100%;
      margin-bottom: 8px;
    }

    .mode-description {
      font-size: 0.875rem;
      color: #666;
      margin: 0;
      line-height: 1.4;
    }

    .setting-item {
      margin-bottom: 20px;
    }

    .setting-item label {
      display: block;
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 8px;
    }

    mat-slider {
      width: 100%;
    }
  `]
})
export class ControlPanelComponent implements OnInit {
  isRunning = false;
  minArea = 500;
  cameraIndex = 0;
  selectedMode = 'color';

  private trackerApi = inject(TrackerApiService);
  private videoStream = inject(VideoStreamService);

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.trackerApi.getStatus().subscribe({
      next: (status) => {
        this.isRunning = status.is_running;
        this.minArea = status.min_area;
        this.cameraIndex = status.camera_index;
        this.selectedMode = status.detection_mode;
      },
      error: (error) => console.error('Error loading status:', error)
    });
  }

  startTracking(): void {
    this.trackerApi.startTracking().subscribe({
      next: () => {
        this.isRunning = true;
        this.videoStream.connect();
      },
      error: (error) => console.error('Error starting tracker:', error)
    });
  }

  stopTracking(): void {
    this.trackerApi.stopTracking().subscribe({
      next: () => {
        this.isRunning = false;
        this.videoStream.disconnect();
      },
      error: (error) => console.error('Error stopping tracker:', error)
    });
  }

  changeMode(): void {
    this.trackerApi.setDetectionMode(this.selectedMode).subscribe({
      next: () => {
        console.log(`Detection mode changed to ${this.selectedMode}`);
      },
      error: (error) => console.error('Error changing detection mode:', error)
    });
  }

  updateSettings(): void {
    this.trackerApi.updateSettings(this.minArea, this.cameraIndex).subscribe({
      next: () => console.log('Settings updated'),
      error: (error) => console.error('Error updating settings:', error)
    });
  }
}
