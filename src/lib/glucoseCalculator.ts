export type GlucoseStatus = 'critical-low' | 'low' | 'normal' | 'high' | 'very-high' | 'critical-high';

export interface GlucoseReading {
  id: string;
  value: number;
  timestamp: Date;
  recommendation: string;
  status: GlucoseStatus;
  insulinUnits?: number;
}

export interface GlucoseRecommendation {
  message: string;
  status: GlucoseStatus;
  insulinUnits?: number;
  isEmergency: boolean;
  icon: string;
}

export function calculateRecommendation(glucoseValue: number): GlucoseRecommendation {
  if (glucoseValue >= 450) {
    return {
      message: "Tome 4 unidades de insulina humana regular.",
      status: 'critical-high',
      insulinUnits: 4,
      isEmergency: true,
      icon: '🚨'
    };
  }
  
  if (glucoseValue >= 350) {
    return {
      message: "Tome 3 unidades de insulina humana regular.",
      status: 'very-high',
      insulinUnits: 3,
      isEmergency: false,
      icon: '⚠️'
    };
  }
  
  if (glucoseValue >= 250) {
    return {
      message: "Tome 2 unidades de insulina humana regular.",
      status: 'high',
      insulinUnits: 2,
      isEmergency: false,
      icon: '📊'
    };
  }
  
  if (glucoseValue <= 60) {
    return {
      message: "Coma um alimento doce IMEDIATAMENTE e vá ao hospital caso a condição se mantenha.",
      status: 'critical-low',
      isEmergency: true,
      icon: '🆘'
    };
  }
  
  if (glucoseValue < 90) {
    return {
      message: "Coma um alimento doce para elevar a glicemia.",
      status: 'low',
      isEmergency: false,
      icon: '🍬'
    };
  }
  
  return {
    message: "Glicemia estável. Continue monitorando normalmente.",
    status: 'normal',
    isEmergency: false,
    icon: '✅'
  };
}

export function getStatusColor(status: GlucoseStatus): string {
  switch (status) {
    case 'critical-low':
    case 'critical-high':
      return 'danger';
    case 'low':
    case 'very-high':
    case 'high':
      return 'warning';
    case 'normal':
      return 'success';
    default:
      return 'muted';
  }
}

export function getStatusLabel(status: GlucoseStatus): string {
  switch (status) {
    case 'critical-low':
      return 'Hipoglicemia Grave';
    case 'low':
      return 'Hipoglicemia';
    case 'normal':
      return 'Normal';
    case 'high':
      return 'Hiperglicemia';
    case 'very-high':
      return 'Hiperglicemia Alta';
    case 'critical-high':
      return 'Hiperglicemia Grave';
    default:
      return 'Desconhecido';
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
