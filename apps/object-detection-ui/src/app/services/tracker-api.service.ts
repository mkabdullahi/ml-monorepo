import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrackerStatus {
    is_running: boolean;
    detection_mode: string;
    enabled_colors: string[];
    camera_index: number;
    min_area: number;
}

export interface DetectionModes {
    modes: string[];
    current_mode: string;
}

export interface ModeResponse {
    mode: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class TrackerApiService {
    private readonly API_URL = 'http://localhost:8000/api';
    private readonly http = inject(HttpClient);

    getStatus(): Observable<TrackerStatus> {
        return this.http.get<TrackerStatus>(`${this.API_URL}/status`);
    }

    startTracking(): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.API_URL}/start`, {});
    }

    stopTracking(): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.API_URL}/stop`, {});
    }

    toggleColor(color: string): Observable<any> {
        return this.http.post(`${this.API_URL}/colors/toggle/${color}`, {});
    }

    getStats(): Observable<any> {
        return this.http.get(`${this.API_URL}/stats`);
    }

    updateSettings(minArea: number, cameraIndex: number): Observable<any> {
        return this.http.post(`${this.API_URL}/settings`, null, {
            params: { min_area: minArea.toString(), camera_index: cameraIndex.toString() }
        });
    }

    setDetectionMode(mode: string): Observable<ModeResponse> {
        return this.http.post<ModeResponse>(`${this.API_URL}/mode/${mode}`, {});
    }

    getAvailableModes(): Observable<DetectionModes> {
        return this.http.get<DetectionModes>(`${this.API_URL}/modes`);
    }
}
