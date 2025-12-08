import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TrackerStatus {
    is_running: boolean;
    enabled_colors: string[];
    camera_index: number;
    min_area: number;
}

export interface DetectionStats {
    red: number;
    blue: number;
    yellow: number;
    green: number;
    fps: number;
    is_running: boolean;
}

export interface ColorToggleResponse {
    color: string;
    action: string;
    enabled_colors: string[];
}

@Injectable({
    providedIn: 'root'
})
export class TrackerApiService {
    private readonly API_URL = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    getStatus(): Observable<TrackerStatus> {
        return this.http.get<TrackerStatus>(`${this.API_URL}/status`);
    }

    startTracking(): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.API_URL}/start`, {});
    }

    stopTracking(): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.API_URL}/stop`, {});
    }

    toggleColor(color: string): Observable<ColorToggleResponse> {
        return this.http.post<ColorToggleResponse>(`${this.API_URL}/colors/toggle/${color}`, {});
    }

    getStats(): Observable<DetectionStats> {
        return this.http.get<DetectionStats>(`${this.API_URL}/stats`);
    }

    updateSettings(minArea: number, cameraIndex: number): Observable<any> {
        return this.http.post(`${this.API_URL}/settings`, null, {
            params: { min_area: minArea.toString(), camera_index: cameraIndex.toString() }
        });
    }
}
