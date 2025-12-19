import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackerApiService } from '../../services/tracker-api.service';
import { VideoStreamService, VideoFrame } from '../../services/video-stream.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-dashboard">
      <div class="dashboard-header">
        <h2>Detection Statistics</h2>
        <span class="status-badge" [class.active]="isRunning">
          {{ isRunning ? 'Active' : 'Inactive' }}
        </span>
      </div>

      <div class="stats-grid">
        @if (currentMode === 'color') {
          <!-- Color Detection Stats -->
          @for (stat of colorStats; track stat.color) {
            <div class="stat-card">
              <div class="stat-header">
                <div class="color-indicator" [style.background-color]="stat.colorHex"></div>
                <span class="stat-label">{{ stat.color }}</span>
              </div>
              <div class="stat-value">{{ stat.count }}</div>
              <div class="stat-unit">objects</div>
            </div>
          }
        } @else {
          <!-- Object Detection Stats -->
          <div class="stat-card full-width">
            <div class="stat-header">
              <span class="stat-label">Objects Detected</span>
            </div>
            <div class="stat-value">{{ objectCount }}</div>
            <div class="stat-unit">total objects</div>
          </div>
        }

        <!-- FPS Counter -->
        <div class="stat-card fps-card">
          <div class="stat-header">
            <span class="stat-label">FPS</span>
          </div>
          <div class="stat-value">{{ fps }}</div>
          <div class="stat-unit">frames/sec</div>
        </div>
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

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.875rem;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .status-badge.active {
      background: rgba(76, 175, 80, 0.3);
      color: #4caf50;
    }

    .stats-grid {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      border: 1px solid #e9ecef;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-card.full-width {
      grid-column: 1 / -1;
    }

    .stat-card.fps-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      gap: 8px;
    }

    .color-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
      font-weight: 500;
    }

    .fps-card .stat-label {
      color: rgba(255, 255, 255, 0.8);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
      margin: 4px 0;
    }

    .fps-card .stat-value {
      color: white;
    }

    .stat-unit {
      font-size: 0.75rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .fps-card .stat-unit {
      color: rgba(255, 255, 255, 0.8);
    }
  `]
})
export class StatsDashboardComponent implements OnInit, OnDestroy {
  isRunning = false;
  currentMode = 'color';
  fps = 0;
  objectCount = 0;

  colorStats = [
    { color: 'Red', count: 0, colorHex: '#f44336' },
    { color: 'Blue', count: 0, colorHex: '#2196f3' },
    { color: 'Yellow', count: 0, colorHex: '#ffeb3b' },
    { color: 'Green', count: 0, colorHex: '#4caf50' }
  ];

  private subscription?: Subscription;
  private statsSubscription?: Subscription;

  private trackerApi = inject(TrackerApiService);
  private videoStream = inject(VideoStreamService);

  ngOnInit(): void {
    // Subscribe to video stream frames for real-time stats
    this.subscription = this.videoStream.frames$.subscribe({
      next: (frame: VideoFrame) => {
        if (frame.type === 'frame' && frame.stats) {
          this.updateStats(frame.stats);
        }
      },
      error: (error) => console.error('Error in stats subscription:', error)
    });

    // Poll for status updates
    this.statsSubscription = interval(2000).subscribe(() => {
      this.loadStatus();
    });

    this.loadStatus();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.statsSubscription?.unsubscribe();
  }

  loadStatus(): void {
    this.trackerApi.getStatus().subscribe({
      next: (status) => {
        this.isRunning = status.is_running;
        this.currentMode = status.detection_mode;
      },
      error: (error) => console.error('Error loading status:', error)
    });
  }

  updateStats(stats: Record<string, number>): void {
    if (this.currentMode === 'color') {
      this.colorStats.forEach(stat => {
        stat.count = stats[stat.color] || 0;
      });
    } else {
      // For object detection, count total objects
      this.objectCount = Object.values(stats).reduce((sum, count) => sum + count, 0);
    }

    // Update FPS if available
    this.fps = stats['fps'] || 0;
  }
}
