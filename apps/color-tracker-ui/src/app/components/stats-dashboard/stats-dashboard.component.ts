import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TrackerApiService, DetectionStats } from '../../services/tracker-api.service';
import { VideoStreamService } from '../../services/video-stream.service';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-stats-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule],
    template: `
    <div class="stats-dashboard">
      <div class="dashboard-header">
        <h2>Detection Statistics</h2>
        <span class="fps-counter">{{ stats.fps.toFixed(1) }} FPS</span>
      </div>

      <div class="stats-grid">
        <div class="stat-card red">
          <div class="stat-icon">
            <mat-icon>circle</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Red Objects</div>
            <div class="stat-value">{{ stats.red }}</div>
          </div>
        </div>

        <div class="stat-card blue">
          <div class="stat-icon">
            <mat-icon>circle</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Blue Objects</div>
            <div class="stat-value">{{ stats.blue }}</div>
          </div>
        </div>

        <div class="stat-card yellow">
          <div class="stat-icon">
            <mat-icon>circle</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Yellow Objects</div>
            <div class="stat-value">{{ stats.yellow }}</div>
          </div>
        </div>

        <div class="stat-card green">
          <div class="stat-icon">
            <mat-icon>circle</mat-icon>
          </div>
          <div class="stat-content">
            <div class="stat-label">Green Objects</div>
            <div class="stat-value">{{ stats.green }}</div>
          </div>
        </div>
      </div>

      <div class="total-section">
        <div class="total-label">Total Detected</div>
        <div class="total-value">{{ getTotalDetections() }}</div>
      </div>
    </div>
  `,
    styles: [`
    .stats-dashboard {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .dashboard-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .fps-counter {
      font-size: 1rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 12px;
    }

    .stats-grid {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 16px;
      border-radius: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: default;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-card.red {
      background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
      border-left: 4px solid #f44336;
    }

    .stat-card.red .stat-icon {
      color: #f44336;
    }

    .stat-card.blue {
      background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
      border-left: 4px solid #2196f3;
    }

    .stat-card.blue .stat-icon {
      color: #2196f3;
    }

    .stat-card.yellow {
      background: linear-gradient(135deg, #fffef0 0%, #fff9c4 100%);
      border-left: 4px solid #ffc107;
    }

    .stat-card.yellow .stat-icon {
      color: #ffc107;
    }

    .stat-card.green {
      background: linear-gradient(135deg, #f1f8f4 0%, #e8f5e9 100%);
      border-left: 4px solid #4caf50;
    }

    .stat-card.green .stat-icon {
      color: #4caf50;
    }

    .stat-icon {
      font-size: 2rem;
      margin-right: 16px;
    }

    .stat-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
    }

    .total-section {
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      background: #fafafa;
    }

    .total-label {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 8px;
    }

    .total-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `]
})
export class StatsDashboardComponent implements OnInit, OnDestroy {
    stats: DetectionStats = {
        red: 0,
        blue: 0,
        yellow: 0,
        green: 0,
        fps: 0,
        is_running: false
    };

    private subscription?: Subscription;
    private statsSubscription?: Subscription;

    constructor(
        private trackerApi: TrackerApiService,
        private videoStream: VideoStreamService
    ) { }

    ngOnInit(): void {
        // Update stats from video stream
        this.subscription = this.videoStream.frames$.subscribe({
            next: (frame) => {
                if (frame.type === 'frame' && frame.stats) {
                    this.stats.red = frame.stats.Red || 0;
                    this.stats.blue = frame.stats.Blue || 0;
                    this.stats.yellow = frame.stats.Yellow || 0;
                    this.stats.green = frame.stats.Green || 0;
                }
            }
        });

        // Poll stats API every 2 seconds
        this.statsSubscription = interval(2000).subscribe(() => {
            this.trackerApi.getStats().subscribe({
                next: (stats) => {
                    this.stats = stats;
                },
                error: (error) => console.error('Error fetching stats:', error)
            });
        });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
        this.statsSubscription?.unsubscribe();
    }

    getTotalDetections(): number {
        return this.stats.red + this.stats.blue + this.stats.yellow + this.stats.green;
    }
}
