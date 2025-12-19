import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface VideoFrame {
    type: 'frame' | 'status' | 'error';
    data?: string; // base64 encoded image
    stats?: Record<string, number>; // Flexible stats for different detection modes
    timestamp?: number;
    message?: string;
    narration?: string;
}

@Injectable({
    providedIn: 'root'
})
export class VideoStreamService {
    private readonly WS_URL = 'ws://localhost:8000/ws/video';
    private socket: WebSocket | null = null;
    private frameSubject = new Subject<VideoFrame>();

    public frames$: Observable<VideoFrame> = this.frameSubject.asObservable();
    public isConnected = false;

    connect(): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('WebSocket already connected');
            return;
        }

        this.socket = new WebSocket(this.WS_URL);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.isConnected = true;
        };

        this.socket.onmessage = (event) => {
            try {
                const frame: VideoFrame = JSON.parse(event.data);
                this.frameSubject.next(frame);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.isConnected = false;
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
        };
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }

    reconnect(): void {
        this.disconnect();
        setTimeout(() => this.connect(), 1000);
    }
}
