import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoStreamService, VideoFrame } from '../../services/video-stream.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-video-display',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="video-container">
      <div class="video-header">
        <h2>Live Video Stream</h2>
        <span class="status-indicator" [class.connected]="isConnected">
          {{ isConnected ? '● Live' : '○ Disconnected' }}
        </span>
      </div>

      <div class="video-wrapper">
        @if (currentFrame) {
          <img
            [src]="'data:image/jpeg;base64,' + currentFrame"
            alt="Video stream"
            class="video-frame"
          />
        } @else {
          <div class="no-video">
            <p>{{ statusMessage }}</p>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    .video-container {
      background: #1e1e1e;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .video-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .video-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .status-indicator {
      font-size: 0.875rem;
      padding: 4px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .status-indicator.connected {
      background: rgba(76, 175, 80, 0.3);
      color: #4caf50;
    }

    .video-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      background: #000;
    }

    .video-frame {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .no-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #888;
      font-size: 1.125rem;
    }
  `]
})
export class VideoDisplayComponent implements OnInit, OnDestroy {
    currentFrame: string | null = null;
    isConnected = false;
    statusMessage = 'Waiting for video stream...';
    private subscription?: Subscription;

    private videoStreamService = inject(VideoStreamService);

    ngOnInit(): void {
        this.subscription = this.videoStreamService.frames$.subscribe({
            next: (frame: VideoFrame) => {
                if (frame.type === 'frame' && frame.data) {
                    this.currentFrame = frame.data;
                    this.isConnected = true;
                } else if (frame.type === 'status') {
                    this.statusMessage = frame.message || 'Tracker not running';
                    this.currentFrame = null;
                } else if (frame.type === 'error') {
                    this.statusMessage = frame.message || 'Error occurred';
                    this.currentFrame = null;
                }
            },
            error: (error) => {
                console.error('Video stream error:', error);
                this.isConnected = false;
                this.statusMessage = 'Connection error';
            }
        });

        this.isConnected = this.videoStreamService.isConnected;
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}
