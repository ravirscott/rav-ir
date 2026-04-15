export type GraphMode = '2d' | '3d' | 'geometry';

export interface EquationItem {
  id: string;
  expression: string;
  visible: boolean;
  color: string;
  type: 'cartesian' | 'polar' | 'parametric';
  paramX?: string;
  paramY?: string;
}

export interface SliderConfig {
  variable: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

export interface TablePoint {
  id: string;
  x: number;
  y: number;
}

export interface GeometryPoint {
  id: string;
  x: number;
  y: number;
}

export interface GeometryLine {
  id: string;
  from: string;
  to: string;
}

export interface GeometryCircle {
  id: string;
  center: string;
  radius: number;
}
