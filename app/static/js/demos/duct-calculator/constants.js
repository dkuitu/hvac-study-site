/**
 * Duct Friction Calculator Constants
 */

// Constants for calculations
export const AIR_DENSITY = 0.075; // lbs/ft³ at standard conditions
export const DEFAULT_FRICTION_RATE = 0.1; // in.wc per 100 ft
export const DEFAULT_VELOCITY_LIMIT = 1000; // fpm

// Standard round duct sizes in inches
export const STANDARD_ROUND_SIZES = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 42, 44, 46, 48];

// Standard rectangular dimensions in inches (width)
export const STANDARD_RECT_WIDTHS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 42, 44, 46, 48, 52, 56, 60];

// Standard rectangular dimensions in inches (height)
export const STANDARD_RECT_HEIGHTS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

// Common duct materials with relative roughness factors
export const DUCT_MATERIALS = [
    { id: 'galvanized', name: 'Galvanized Steel', roughness: 1.0 },
    { id: 'flexible', name: 'Flexible Duct', roughness: 1.35 },
    { id: 'fibrous', name: 'Fibrous Glass Duct Board', roughness: 1.2 },
    { id: 'spiral', name: 'Spiral Duct', roughness: 0.95 }
];
