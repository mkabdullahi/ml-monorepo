import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { TrackerApiService } from '../../services/tracker-api.service';
import { VideoStreamService } from '../../services/video-stream.service';

interface ColorToggle {
  name: string;
  displayName: string;
  color: string;
  enabled: boolean;
}

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSliderModule,
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

        <!-- Color Toggles -->
        <div class="control-section">
          <h3>Detect Colors</h3>
          <div class="color-toggles">
            @for (color of colors; track color.name) {
              <div class="color-toggle-item">
                <mat-slide-toggle
                  [(ngModel)]="color.enabled"
                  (change)="toggleColor(color.name)"
                  [color]="'primary'">
                  <span class="color-dot" [style.background-color]="color.color"></span>
                  {{ color.displayName }}
                </mat-slide-toggle>
              </div>
            }
          </div>
        </div>

        <!-- Settings -->
        <div class="control-section">
          <h3>Settings</h3>
          
          <div class="setting-item">
            <label>Min Detection Area: {{ minArea }}</label>
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
            <label>Camera Index: {{ cameraIndex }}</label>
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

    .color-toggles {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .color-toggle-item {
      padding: 8px;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .color-toggle-item:hover {
      background-color: #f5f5f5;
    }

    .color-dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
      vertical-align: middle;
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

  colors: ColorToggle[] = [
    { name: 'red', displayName: 'Red', color: '#f44336', enabled: true },
    { name: 'blue', displayName: 'Blue', color: '#2196f3', enabled: true },
    { name: 'yellow', displayName: 'Yellow', color: '#ffeb3b', enabled: true },
    { name: 'green', displayName: 'Green', color: '#4caf50', enabled: true }
  ];

  constructor(
    private trackerApi: TrackerApiService,
    private videoStream: VideoStreamService
  ) { }

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.trackerApi.getStatus().subscribe({
      next: (status) => {
        this.isRunning = status.is_running;
        this.minArea = status.min_area;
        this.cameraIndex = status.camera_index;

        // Update color toggles based on enabled colors
        this.colors.forEach(color => {
          color.enabled = status.enabled_colors.includes(
            color.name.charAt(0).toUpperCase() + color.name.slice(1)
          );
        });
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

  toggleColor(colorName: string): void {
    this.trackerApi.toggleColor(colorName).subscribe({
      next: (response) => {
        console.log(`Color ${colorName} ${response.action}`);
      },
      error: (error) => console.error('Error toggling color:', error)
    });
  }

  updateSettings(): void {
    this.trackerApi.updateSettings(this.minArea, this.cameraIndex).subscribe({
      next: () => console.log('Settings updated'),
      error: (error) => console.error('Error updating settings:', error)
    });
  }
}
