import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-narrator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (narration) {
      <div class="narrator-card">
        <div class="header">
          <span class="icon">🤖</span>
          <h3>AI Narrator</h3>
        </div>
        <p class="content">{{ narration }}</p>
      </div>
    }
  `,
  styles: [`
    .narrator-card {
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 1rem;
      color: white;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.7);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }

    .header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      .icon {
        font-size: 1.5rem;
      }

      h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 500;
        background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .content {
      margin: 0;
      font-size: 1.1rem;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.9);
    }
  `]
})
export class NarratorComponent {
  @Input() narration = '';
}
