export type NavTab = 
  | 'landing'
  | 'dashboard' 
  | 'reports' 
  | 'history' 
  | 'analytics' 
  | 'settings' 
  | 'about' 
  | 'profile' 
  | 'login';

export interface VehicleDetection {
  id: string;
  type: 'CAR' | 'TRUCK' | 'SUV' | 'BUS' | 'MOTORCYCLE';
  confidence: number;
  speed: number;
  lane: number;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  width: number;
  height: number;
  direction: 'inbound' | 'outbound';
  color: string;
}

export interface ArchiveSession {
  id: string;
  filename: string;
  timestamp: string;
  date: string;
  timeRange: string;
  totalCount: number;
  peakDensity: number; // percentage e.g. 98
  densityLevel: 'High Density' | 'Med Density' | 'Low Density';
  avgSpeed: number;
  duration: string;
  startTime: string;
  endTime: string;
  cameraName: string;
  eventsCount: number;
  sedanCount: number;
  suvCount: number;
  truckCount: number;
  motoCount: number;
  busCount: number;
}

export interface TrafficEvent {
  id: string;
  timestamp: string;
  eventType: 'Density Spike' | 'Critical Density' | 'Flow Normal' | 'Anomaly';
  density: number; // v/m
  speedAvg: string;
  systemNote: string;
}

export interface SystemConfig {
  amberThreshold: number; // v/m default 45
  redThreshold: number; // v/m default 80
  countingLineY: number; // 0-100 percentage default 65
  smoothingWindow: number; // seconds default 15
  enableEmailAlerts: boolean;
  autoExportDailyLog: boolean;
  detectionSensitivity: number; // 0-100
  showHeatmap: boolean;
  showBoundingBoxes: boolean;
  showCountingLine: boolean;
  showSpeedLabels: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  videosAnalyzed: number;
  vehiclesCounted: string;
  memberSince: string;
}
