'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Search,
  Navigation,
  Download,
  Clock,
  Activity,
  Camera,
  Radio,
  Shield,
  Video,
  AlertTriangle,
  Zap,
  TrendingUp,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Car,
  Layers,
  Check,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';

// Dynamically import Leaflet map component to prevent SSR issues
const TrailMapView = dynamic(() => import('./TrailMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-steel-700/50 animate-pulse rounded-xl flex items-center justify-center text-paper-100/50 font-mono text-xs">
      Initializing Tactical Map Grid...
    </div>
  ),
});

// ── MOCK MULTI-VEHICLE ANPR DATABASE (10 DISTINCT SCENARIOS) ──────────────────
const MOCK_VEHICLE_TRAILS = {
  // 1. CLEAN HIGH-CONFIDENCE TRAIL (5 HOPS, NO ANOMALIES)
  'KA-05-HB-3342': {
    target: 'Suresh Reddy (Highway Transit)',
    crime_linked: 'FIR-2026-BL-0199 (Cargo Hijack Routine Surveillance)',
    trail_status: 'active',
    duration_minutes: 35,
    total_distance_km: 10.4,
    vehicle_type: 'Mahindra Bolero Pickup (White)',
    related_vehicles: [
      { plate: 'KA-05-MH-1102', camera: 'Domlur Flyover BATCS Camera 14', time: '09:32 IST', delta: '+2m' },
      { plate: 'KA-53-P-9941', camera: 'Marathahalli Bridge Checkpost', time: '09:51 IST', delta: '+1m' },
    ],
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-BLR-0301',
        camera_name: 'Koramangala 80ft Road ANPR Cam #02',
        lat: 12.9352,
        lng: 77.6245,
        timestamp: '2026-07-26T09:15:00Z',
        plate_detected: 'KA-05-HB-3342',
        confidence: 98.7,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.3,
      },
      {
        hop: 2,
        camera_id: 'CAM-BLR-0305',
        camera_name: 'Intermediate Ring Road Signal Junction',
        lat: 12.9512,
        lng: 77.6321,
        timestamp: '2026-07-26T09:23:00Z',
        plate_detected: 'KA-05-HB-3342',
        confidence: 97.2,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 2.1,
      },
      {
        hop: 3,
        camera_id: 'CAM-BLR-0310',
        camera_name: 'Domlur Flyover BATCS Camera 14',
        lat: 12.9601,
        lng: 77.6382,
        timestamp: '2026-07-26T09:30:00Z',
        plate_detected: 'KA-05-HB-3342',
        confidence: 96.5,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 3.5,
      },
      {
        hop: 4,
        camera_id: 'CAM-BLR-0318',
        camera_name: 'Old Airport Road Surveillance Post',
        lat: 12.9592,
        lng: 77.6541,
        timestamp: '2026-07-26T09:38:00Z',
        plate_detected: 'KA-05-HB-3342',
        confidence: 95.8,
        sighting_type: 'CCTV Sweep',
        distance_from_crime_km: 5.8,
      },
      {
        hop: 5,
        camera_id: 'CAM-BLR-0325',
        camera_name: 'Marathahalli Bridge Checkpost',
        lat: 12.9564,
        lng: 77.6982,
        timestamp: '2026-07-26T09:50:00Z',
        plate_detected: 'KA-05-HB-3342',
        confidence: 97.9,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 10.4,
      },
    ],
  },

  // 2. LOW-CONFIDENCE HOP + PROJECTED VECTOR (4 HOPS)
  'KA-01-MJ-8821': {
    target: 'Ramesh Kumar (Bullet Ramesh)',
    crime_linked: 'FIR-2026-BL-0492 (Vehicle Theft & Armed Robbery)',
    trail_status: 'active',
    duration_minutes: 48,
    total_distance_km: 12.1,
    vehicle_type: 'Hyundai Creta SUV (Silver)',
    related_vehicles: [
      { plate: 'KA-04-EZ-4410', camera: 'MG Road BATCS Signal Pole 5', time: '14:37 IST', delta: '+2m' },
      { plate: 'KA-03-HA-4512', camera: 'Silk Board Toll Plaza Checkpost', time: '14:48 IST', delta: '+2m' },
    ],
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-BLR-0010',
        camera_name: 'Vijayanagar TTMC CCTV Camera #10',
        lat: 12.9651,
        lng: 77.5348,
        timestamp: '2026-07-26T14:22:10Z',
        plate_detected: 'KA-01-MJ-8821',
        confidence: 98.4,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.2,
      },
      {
        hop: 2,
        camera_id: 'CAM-BLR-0012',
        camera_name: 'MG Road BATCS Signal Pole 5',
        lat: 12.9737,
        lng: 77.6138,
        timestamp: '2026-07-26T14:35:45Z',
        plate_detected: 'KA-01-MJ-8821',
        confidence: 96.1,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 3.4,
      },
      {
        hop: 3,
        camera_id: 'CAM-BLR-0015',
        camera_name: 'Hebbal Flyover Dome ANPR 15',
        lat: 13.0064,
        lng: 77.5787,
        timestamp: '2026-07-26T14:41:00Z',
        plate_detected: 'KA-01-MJ-8821',
        confidence: 88.2,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 7.8,
      },
      {
        hop: 4,
        camera_id: 'CAM-BLR-0035',
        camera_name: 'Silk Board Toll Plaza Checkpost',
        lat: 12.9344,
        lng: 77.6123,
        timestamp: '2026-07-26T14:46:30Z',
        plate_detected: 'KA-01-MJ-8821',
        confidence: 95.5,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 12.1,
      },
    ],
  },

  // 3. SUSPICIOUS GAP TRAIL (4 HOPS, 45 MINUTE UNUSUAL GAP OVER 1.8 KM)
  'KA-09-RT-7765': {
    target: 'Manjunath B. (SUS-9921)',
    crime_linked: 'FIR-2026-BL-0732 (Commercial Burglary)',
    trail_status: 'flagged',
    duration_minutes: 64,
    total_distance_km: 7.2,
    vehicle_type: 'Maruti Swift Dzire (Dark Gray)',
    related_vehicles: [
      { plate: 'KA-02-AB-9901', camera: 'Orion Mall Back Gate CCTV Sweep', time: '15:55 IST', delta: '+2m' },
    ],
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-BLR-0401',
        camera_name: 'Malleshwaram 18th Cross ANPR #01',
        lat: 13.0031,
        lng: 77.5684,
        timestamp: '2026-07-26T15:00:00Z',
        plate_detected: 'KA-09-RT-7765',
        confidence: 96.8,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.4,
      },
      {
        hop: 2,
        camera_id: 'CAM-BLR-0405',
        camera_name: 'Rajajinagar 1st Block BATCS Junction',
        lat: 12.9912,
        lng: 77.5542,
        timestamp: '2026-07-26T15:08:00Z',
        plate_detected: 'KA-09-RT-7765',
        confidence: 94.5,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 2.1,
      },
      {
        hop: 3,
        camera_id: 'CAM-BLR-0412',
        camera_name: 'Orion Mall Back Gate CCTV Sweep',
        lat: 12.9972,
        lng: 77.5582,
        timestamp: '2026-07-26T15:53:00Z',
        plate_detected: 'KA-09-RT-7765',
        confidence: 89.1,
        sighting_type: 'CCTV Sweep',
        distance_from_crime_km: 3.9,
      },
      {
        hop: 4,
        camera_id: 'CAM-BLR-0420',
        camera_name: 'Yeshwanthpur Railway Station Checkpost',
        lat: 13.0234,
        lng: 77.5501,
        timestamp: '2026-07-26T16:04:00Z',
        plate_detected: 'KA-09-RT-7765',
        confidence: 96.2,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 7.2,
      },
    ],
  },

  // 4. LONG TRAIL (8 HOPS, WIDER GEOGRAPHIC SPREAD TO WHITEFIELD)
  'KA-03-KL-1190': {
    target: 'Vikramaditya Hegde (Interstate Syndicate)',
    crime_linked: 'FIR-2026-BL-1502 (Grand Theft & Smuggling)',
    trail_status: 'active',
    duration_minutes: 95,
    total_distance_km: 28.5,
    vehicle_type: 'Toyota Fortuner SUV (Black)',
    related_vehicles: [
      { plate: 'KA-51-MD-7700', camera: 'Trinity Circle Junction CCTV', time: '07:56 IST', delta: '+2m' },
      { plate: 'KA-04-EZ-4410', camera: 'Whitefield ITPL Main Entrance ANPR', time: '08:55 IST', delta: '+3m' },
    ],
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-BLR-0501',
        camera_name: 'Majestic KSRTC Bus Stand ANPR Cam #01',
        lat: 12.9767,
        lng: 77.5713,
        timestamp: '2026-07-26T07:30:00Z',
        plate_detected: 'KA-03-KL-1190',
        confidence: 98.1,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.2,
      },
      {
        hop: 2,
        camera_id: 'CAM-BLR-0505',
        camera_name: 'Corporation Circle BATCS Signal',
        lat: 12.9654,
        lng: 77.5891,
        timestamp: '2026-07-26T07:42:00Z',
        plate_detected: 'KA-03-KL-1190',
        confidence: 96.4,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 2.8,
      },
      {
        hop: 3,
        camera_id: 'CAM-BLR-0510',
        camera_name: 'Trinity Circle Junction CCTV',
        lat: 12.9731,
        lng: 77.6172,
        timestamp: '2026-07-26T07:54:00Z',
        plate_detected: 'KA-03-KL-1190',
        confidence: 95.0,
        sighting_type: 'CCTV Sweep',
        distance_from_crime_km: 6.1,
      },
      {
        hop: 4,
        camera_id: 'CAM-BLR-0518',
        camera_name: 'Indiranagar 100ft Road Dome Cam',
        lat: 12.9784,
        lng: 77.6408,
        timestamp: '2026-07-26T08:08:00Z',
        plate_detected: 'KA-03-KL-1190',
        confidence: 97.5,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 9.3,
      },
      {
        hop: 5,
        camera_id: 'CAM-BLR-0524',
        camera_name: 'HAL Main Gate BATCS Signal',
        lat: 12.9572,
        lng: 77.6681,
        timestamp: '2026-07-26T08:22:00Z',
        plate_detected: 'KA-03-KL-1190',
        confidence: 94.8,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 13.7,
      },
      {
        hop: 6,
        camera_id: 'CAM-BLR-0530',
        camera_name: 'Kundalahalli Gate Surveillance Post',
        lat: 12.9712,
        lng: 77.7152,
        timestamp: '2026-07-26T08:38:00Z',
        plate_detected: 'KA-03-KL-1190',
        confidence: 96.1,
        sighting_type: 'CCTV Sweep',
        distance_from_crime_km: 19.8,
      },
      {
        hop: 7,
        camera_id: 'CAM-BLR-0538',
        camera_name: 'Whitefield ITPL Main Entrance ANPR',
        lat: 12.9864,
        lng: 77.7381,
        timestamp: '2026-07-26T08:52:00Z',
        plate_detected: 'KA-03-KL-1190',
        confidence: 97.9,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 24.2,
      },
      {
        hop: 8,
        camera_id: 'CAM-BLR-0545',
        camera_name: 'Hoodi Junction Checkpost',
        lat: 12.9942,
        lng: 77.7171,
        timestamp: '2026-07-26T09:05:00Z',
        plate_detected: 'KA-03-KL-1190',
        confidence: 98.6,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 28.5,
      },
    ],
  },

  // 5. SINGLE HOP EDGE CASE (1 SIGHTING ONLY)
  'KA-19-MN-4456': {
    target: 'Praveen Poojary (Local Offender)',
    crime_linked: 'FIR-2026-MNG-0211 (Chain Snatching Intercept)',
    trail_status: 'flagged',
    duration_minutes: 0,
    total_distance_km: 0.0,
    vehicle_type: 'Hero Splendor Motorcycle (Black)',
    related_vehicles: [
      { plate: 'KA-19-P-2020', camera: 'Mangaluru KSRTC Bus Stand ANPR', time: '08:32 IST', delta: '+2m' },
    ],
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-MNG-0101',
        camera_name: 'Mangaluru KSRTC Bus Stand ANPR Cam #01',
        lat: 12.8703,
        lng: 74.8427,
        timestamp: '2026-07-26T08:30:00Z',
        plate_detected: 'KA-19-MN-4456',
        confidence: 97.4,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.0,
      },
    ],
  },

  // 6. TWO-WHEELER DENSE URBAN TRAIL (6 HOPS IN SMALL RADIUS)
  'KA-02-VS-9981': {
    target: 'Kiran Kumar (Snatch-and-Run)',
    crime_linked: 'FIR-2026-BL-0931 (Phone Snatching Pursuit)',
    trail_status: 'active',
    duration_minutes: 24,
    total_distance_km: 5.8,
    vehicle_type: 'TVS Jupiter Scooter (Matte Blue)',
    related_vehicles: [
      { plate: 'KA-05-EV-9012', camera: 'Jayanagar 4th Block Complex ANPR', time: '17:02 IST', delta: '+2m' },
    ],
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-BLR-0601',
        camera_name: 'Jayanagar 4th Block Complex ANPR',
        lat: 12.9298,
        lng: 77.5826,
        timestamp: '2026-07-26T17:00:00Z',
        plate_detected: 'KA-02-VS-9981',
        confidence: 98.2,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.1,
      },
      {
        hop: 2,
        camera_id: 'CAM-BLR-0605',
        camera_name: 'Jayanagar 9th Block BATCS Signal',
        lat: 12.9212,
        lng: 77.5901,
        timestamp: '2026-07-26T17:04:00Z',
        plate_detected: 'KA-02-VS-9981',
        confidence: 97.5,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 1.1,
      },
      {
        hop: 3,
        camera_id: 'CAM-BLR-0610',
        camera_name: 'BTM 2nd Stage 100ft Road CCTV',
        lat: 12.9166,
        lng: 77.6001,
        timestamp: '2026-07-26T17:09:00Z',
        plate_detected: 'KA-02-VS-9981',
        confidence: 96.8,
        sighting_type: 'CCTV Sweep',
        distance_from_crime_km: 2.3,
      },
      {
        hop: 4,
        camera_id: 'CAM-BLR-0615',
        camera_name: 'BTM Water Tank Signal Junction',
        lat: 12.9123,
        lng: 77.6082,
        timestamp: '2026-07-26T17:14:00Z',
        plate_detected: 'KA-02-VS-9981',
        confidence: 95.9,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 3.4,
      },
      {
        hop: 5,
        camera_id: 'CAM-BLR-0620',
        camera_name: 'Silk Board Flyover Entry ANPR',
        lat: 12.9178,
        lng: 77.6180,
        timestamp: '2026-07-26T17:18:00Z',
        plate_detected: 'KA-02-VS-9981',
        confidence: 97.1,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 4.6,
      },
      {
        hop: 6,
        camera_id: 'CAM-BLR-0625',
        camera_name: 'HSR Layout 27th Main Checkpost',
        lat: 12.9112,
        lng: 77.6382,
        timestamp: '2026-07-26T17:24:00Z',
        plate_detected: 'KA-02-VS-9981',
        confidence: 98.0,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 5.8,
      },
    ],
  },

  // 7. CROSS-DISTRICT STATEWIDE TRAIL (MYSURU -> MANDYA -> RAMANAGARA -> BENGALURU)
  'KA-25-BG-3310': {
    target: 'Ganesh Shetty (Inter-District Gang)',
    crime_linked: 'FIR-2026-MYS-0412 (Interstate Gold Heist)',
    trail_status: 'active',
    duration_minutes: 260,
    total_distance_km: 132.6,
    vehicle_type: 'Mahindra Scorpio SUV (White)',
    related_vehicles: [
      { plate: 'KA-09-MA-7001', camera: 'Mandya Highway Toll Plaza ANPR', time: '07:18 IST', delta: '+3m' },
      { plate: 'KA-42-R-8833', camera: 'Kengeri Satellite Town CCTV Sweep', time: '09:44 IST', delta: '+4m' },
    ],
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-MYS-0101',
        camera_name: 'Mysuru Suburban Bus Stand ANPR',
        lat: 12.3087,
        lng: 76.6575,
        timestamp: '2026-07-26T06:00:00Z',
        plate_detected: 'KA-25-BG-3310',
        confidence: 98.5,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.5,
      },
      {
        hop: 2,
        camera_id: 'CAM-MND-0205',
        camera_name: 'Mandya Highway Toll Plaza ANPR',
        lat: 12.5218,
        lng: 76.8951,
        timestamp: '2026-07-26T07:15:00Z',
        plate_detected: 'KA-25-BG-3310',
        confidence: 96.8,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 45.2,
      },
      {
        hop: 3,
        camera_id: 'CAM-RMG-0310',
        camera_name: 'Ramanagara Bypass Signal BATCS',
        lat: 12.7210,
        lng: 77.2814,
        timestamp: '2026-07-26T08:30:00Z',
        plate_detected: 'KA-25-BG-3310',
        confidence: 95.4,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 92.8,
      },
      {
        hop: 4,
        camera_id: 'CAM-BLR-0715',
        camera_name: 'Kengeri Satellite Town CCTV Sweep',
        lat: 12.9082,
        lng: 77.4821,
        timestamp: '2026-07-26T09:40:00Z',
        plate_detected: 'KA-25-BG-3310',
        confidence: 94.2,
        sighting_type: 'CCTV Sweep',
        distance_from_crime_km: 118.4,
      },
      {
        hop: 5,
        camera_id: 'CAM-BLR-0725',
        camera_name: 'Bengaluru City Town Hall Checkpost',
        lat: 12.9634,
        lng: 77.5812,
        timestamp: '2026-07-26T10:20:00Z',
        plate_detected: 'KA-25-BG-3310',
        confidence: 97.6,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 132.6,
      },
    ],
  },

  // 8. RICH RELATED VEHICLES CASE (3 CO-OCCURRENCES ACROSS HOPS)
  'KA-14-JP-6602': {
    target: 'Shivaram Hegde (Contraband Trafficking)',
    crime_linked: 'FIR-2026-SMG-0188 (Illicit Goods Seizure)',
    trail_status: 'active',
    duration_minutes: 130,
    total_distance_km: 98.4,
    vehicle_type: 'Tata Nexon EV (Teal)',
    related_vehicles: [
      { plate: 'KA-14-M-5001', camera: 'Shivamogga Bus Terminal ANPR', time: '11:03 IST', delta: '+3m' },
      { plate: 'KA-18-B-9920', camera: 'Bhadravathi Bypass Signal', time: '11:24 IST', delta: '+2m' },
      { plate: 'KA-13-N-4411', camera: 'Hassan Highway Checkpost', time: '13:12 IST', delta: '+2m' },
    ],
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-SMG-0101',
        camera_name: 'Shivamogga Bus Terminal ANPR',
        lat: 13.9299,
        lng: 75.5681,
        timestamp: '2026-07-26T11:00:00Z',
        plate_detected: 'KA-14-JP-6602',
        confidence: 98.9,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.4,
      },
      {
        hop: 2,
        camera_id: 'CAM-SMG-0108',
        camera_name: 'Bhadravathi Bypass Signal',
        lat: 13.8421,
        lng: 75.7021,
        timestamp: '2026-07-26T11:22:00Z',
        plate_detected: 'KA-14-JP-6602',
        confidence: 97.4,
        sighting_type: 'Traffic Signal',
        distance_from_crime_km: 18.2,
      },
      {
        hop: 3,
        camera_id: 'CAM-CKM-0215',
        camera_name: 'Kadur Junction CCTV Sweep',
        lat: 13.5542,
        lng: 76.0121,
        timestamp: '2026-07-26T12:15:00Z',
        plate_detected: 'KA-14-JP-6602',
        confidence: 96.1,
        sighting_type: 'CCTV Sweep',
        distance_from_crime_km: 58.6,
      },
      {
        hop: 4,
        camera_id: 'CAM-HSN-0320',
        camera_name: 'Hassan Highway Checkpost',
        lat: 13.0072,
        lng: 76.1012,
        timestamp: '2026-07-26T13:10:00Z',
        plate_detected: 'KA-14-JP-6602',
        confidence: 97.8,
        sighting_type: 'Toll Checkpoint',
        distance_from_crime_km: 98.4,
      },
    ],
  },

  // 9. ALL-ANPR CAMERA TRAIL (EVERY HOP USES ANPR)
  'KA-33-EC-8847': {
    target: 'Basavaraj Patil (Border Smuggling)',
    crime_linked: 'FIR-2026-YDG-0055 (Illegal Timber Transport)',
    trail_status: 'flagged',
    duration_minutes: 270,
    total_distance_km: 165.2,
    vehicle_type: 'Eicher Commercial Truck (Yellow)',
    related_vehicles: [
      { plate: 'KA-32-TR-1100', camera: 'Kalaburagi Ring Road ANPR Cam #04', time: '05:22 IST', delta: '+2m' },
    ],
    trail: [
      {
        hop: 1,
        camera_id: 'CAM-YDG-0101',
        camera_name: 'Yadgir Highway ANPR Cam #01',
        lat: 16.7612,
        lng: 77.1378,
        timestamp: '2026-07-26T04:00:00Z',
        plate_detected: 'KA-33-EC-8847',
        confidence: 99.1,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 0.5,
      },
      {
        hop: 2,
        camera_id: 'CAM-KLB-0204',
        camera_name: 'Kalaburagi Ring Road ANPR Cam #04',
        lat: 17.3297,
        lng: 76.8343,
        timestamp: '2026-07-26T05:20:00Z',
        plate_detected: 'KA-33-EC-8847',
        confidence: 98.4,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 42.1,
      },
      {
        hop: 3,
        camera_id: 'CAM-BDR-0302',
        camera_name: 'Humnabad Toll Plaza ANPR Cam #02',
        lat: 17.7712,
        lng: 77.1291,
        timestamp: '2026-07-26T06:40:00Z',
        plate_detected: 'KA-33-EC-8847',
        confidence: 97.8,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 98.3,
      },
      {
        hop: 4,
        camera_id: 'CAM-BDR-0308',
        camera_name: 'Bidar Highway Checkpost ANPR Cam #08',
        lat: 17.9104,
        lng: 77.5199,
        timestamp: '2026-07-26T07:45:00Z',
        plate_detected: 'KA-33-EC-8847',
        confidence: 98.6,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 135.0,
      },
      {
        hop: 5,
        camera_id: 'CAM-BDR-0315',
        camera_name: 'Bhalki Border Checkpost ANPR Cam #05',
        lat: 18.0421,
        lng: 77.2104,
        timestamp: '2026-07-26T08:30:00Z',
        plate_detected: 'KA-33-EC-8847',
        confidence: 99.0,
        sighting_type: 'ANPR Sighting',
        distance_from_crime_km: 165.2,
      },
    ],
  },
};

// ── UTILITY FUNCTIONS ─────────────────────────────────────────────────────────

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getCameraTypeDetails(cameraName = '') {
  const name = cameraName.toUpperCase();
  if (name.includes('ANPR')) {
    return { type: 'ANPR', label: 'ANPR Camera', icon: Camera, badgeVariant: 'info' };
  }
  if (name.includes('BATCS') || name.includes('SIGNAL') || name.includes('JUNCTION')) {
    return { type: 'BATCS', label: 'Traffic Signal', icon: Radio, badgeVariant: 'default' };
  }
  if (name.includes('TOLL') || name.includes('CHECKPOST') || name.includes('PLAZA')) {
    return { type: 'TOLL', label: 'Toll Checkpoint', icon: Shield, badgeVariant: 'warning' };
  }
  return { type: 'CCTV', label: 'CCTV Sweep', icon: Video, badgeVariant: 'default' };
}

function analyzeHopInsights(hop, prevHop) {
  if (!prevHop || !hop.timestamp || !prevHop.timestamp) {
    return { speedKmh: null, diffMinutes: null, anomaly: null };
  }

  const t1 = new Date(prevHop.timestamp).getTime();
  const t2 = new Date(hop.timestamp).getTime();
  const diffMinutes = Math.max(1, Math.round((t2 - t1) / (1000 * 60)));

  const distKm = calculateDistance(prevHop.lat, prevHop.lng, hop.lat, hop.lng);
  const hours = diffMinutes / 60;
  const speedKmh = Math.round(distKm / hours);

  let anomaly = null;
  if (speedKmh > 85) {
    anomaly = {
      type: 'speed',
      label: `HIGH SPEED (${speedKmh} km/h)`,
      variant: 'critical',
      detail: `Implied speed of ${speedKmh} km/h exceeds urban road limits. Check for potential fake plate swap.`,
    };
  } else if (diffMinutes > 40 && distKm < 4) {
    anomaly = {
      type: 'gap',
      label: `UNUSUAL GAP (${diffMinutes}m)`,
      variant: 'warning',
      detail: `${diffMinutes} minute gap over only ${distKm.toFixed(1)} km. Possible stopover or hideout area.`,
    };
  }

  return { speedKmh, diffMinutes, anomaly };
}

function computeProjectedPath(trail) {
  if (!trail || trail.length < 2) return null;

  const h1 = trail[trail.length - 2];
  const h2 = trail[trail.length - 1];

  const dLat = h2.lat - h1.lat;
  const dLng = h2.lng - h1.lng;

  const projLat = h2.lat + dLat * 0.65;
  const projLng = h2.lng + dLng * 0.65;

  const t1 = new Date(h1.timestamp).getTime();
  const t2 = new Date(h2.timestamp).getTime();
  const diffMs = Math.max(t2 - t1, 5 * 60 * 1000);
  const projTime = new Date(t2 + diffMs * 0.65).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    fromLat: h2.lat,
    fromLng: h2.lng,
    lat: projLat,
    lng: projLng,
    projectedTime: projTime,
    label: 'Projected Heading (Unconfirmed)',
  };
}

// ── MAIN GEOTRAIL PAGE COMPONENT ──────────────────────────────────────────────

export default function GeoTrailPage() {
  const [searchQuery, setSearchQuery] = useState('KA-01-MJ-8821');
  const [searchedPlate, setSearchedPlate] = useState('KA-01-MJ-8821');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [trailData, setTrailData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [highlightedHop, setHighlightedHop] = useState(null);
  const [visibleHopsCount, setVisibleHopsCount] = useState(1);
  const [shareToast, setShareToast] = useState(false);

  // SCRUBBER PLAYBACK STATE & SPEED MULTIPLIER
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [scrubberPercent, setScrubberPercent] = useState(0);

  // COMPUTED SPARKLINE DATA POINTS (SAFE ON 1-HOP SCENARIOS)
  const speedSparklinePoints = useMemo(() => {
    if (!trailData || trailData.length < 2) return [];
    const points = [];
    for (let i = 1; i < trailData.length; i++) {
      const prev = trailData[i - 1];
      const curr = trailData[i];
      const { speedKmh, anomaly } = analyzeHopInsights(curr, prev);
      points.push({
        hop: curr.hop,
        speed: speedKmh || 30,
        isAnomaly: !!anomaly,
        label: `Hop ${prev.hop}→${curr.hop}`,
      });
    }
    return points;
  }, [trailData]);

  // COMPUTED AVERAGE MATCH PERCENTAGE (SAFE ON 1-HOP)
  const averageMatchPercent = useMemo(() => {
    if (!trailData || trailData.length === 0) return 0;
    const total = trailData.reduce((acc, h) => acc + (h.confidence || 95), 0);
    return (total / trailData.length).toFixed(1);
  }, [trailData]);

  // PROPORTIONAL TIMESTAMP INTERPOLATION FOR GHOST MARKER
  const ghostPosition = useMemo(() => {
    if (!trailData || trailData.length < 2 || scrubberPercent <= 0) return null;

    const tStart = new Date(trailData[0].timestamp).getTime();
    const tEnd = new Date(trailData[trailData.length - 1].timestamp).getTime();
    const totalDurationMs = tEnd - tStart;

    if (totalDurationMs <= 0) return null;

    const currentMs = tStart + (scrubberPercent / 100) * totalDurationMs;
    const currentTimeStr = new Date(currentMs).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    let k = 0;
    for (let i = 0; i < trailData.length - 1; i++) {
      const tHop = new Date(trailData[i].timestamp).getTime();
      const tNext = new Date(trailData[i + 1].timestamp).getTime();
      if (currentMs >= tHop && currentMs <= tNext) {
        k = i;
        break;
      }
      if (i === trailData.length - 2 && currentMs > tNext) {
        k = i;
      }
    }

    const h1 = trailData[k];
    const h2 = trailData[Math.min(k + 1, trailData.length - 1)];

    const t1 = new Date(h1.timestamp).getTime();
    const t2 = new Date(h2.timestamp).getTime();

    let ratio = 0;
    if (t2 > t1) {
      ratio = Math.min(1, Math.max(0, (currentMs - t1) / (t2 - t1)));
    }

    const lat = h1.lat + ratio * (h2.lat - h1.lat);
    const lng = h1.lng + ratio * (h2.lng - h1.lng);

    return { lat, lng, percent: scrubberPercent, currentTimeStr, activeHop: h1.hop };
  }, [trailData, scrubberPercent]);

  // PLAYBACK SCRUBBER TIMER EFFECT
  useEffect(() => {
    if (!isPlaying) return;

    const step = (50 / 8000) * 100 * playbackSpeed;
    const timer = setInterval(() => {
      setScrubberPercent((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return Math.min(100, prev + step);
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Load target trail by plate number
  const loadTrailForPlate = useCallback(async (plateNumber) => {
    const cleanPlate = plateNumber.trim().toUpperCase();
    setSearchedPlate(cleanPlate);
    setLoading(true);
    setNotFound(false);
    setHighlightedHop(null);
    setScrubberPercent(0);
    setIsPlaying(false);

    const mockEntry = MOCK_VEHICLE_TRAILS[cleanPlate];

    try {
      const fallbackPayload = mockEntry
        ? {
            trail: mockEntry.trail,
            total_hops: mockEntry.trail.length,
            total_distance_km: mockEntry.total_distance_km,
            trail_status: mockEntry.trail_status,
            duration_minutes: mockEntry.duration_minutes,
            target: mockEntry.target,
            crime_linked: mockEntry.crime_linked,
            vehicle_type: mockEntry.vehicle_type,
            related_vehicles: mockEntry.related_vehicles,
          }
        : null;

      if (!fallbackPayload) {
        setNotFound(true);
        setTrailData([]);
        setMetadata(null);
        setLoading(false);
        return;
      }

      const { data } = await fetchWithFallback('trail', fallbackPayload, {
        method: 'POST',
        body: { plate: cleanPlate },
      });

      const activeTrail = data?.trail || fallbackPayload.trail;
      setTrailData(activeTrail);
      setMetadata({
        totalHops: data?.total_hops || fallbackPayload.total_hops,
        totalDistance: data?.total_distance_km ?? fallbackPayload.total_distance_km,
        status: data?.trail_status || fallbackPayload.trail_status,
        duration: data?.duration_minutes ?? fallbackPayload.duration_minutes,
        target: data?.target || fallbackPayload.target,
        crimeLinked: data?.crime_linked || fallbackPayload.crime_linked,
        vehicleType: data?.vehicle_type || fallbackPayload.vehicle_type || 'Commercial Vehicle',
        relatedVehicles: data?.related_vehicles || fallbackPayload.related_vehicles || [],
        lastUpdated: new Date().toLocaleTimeString('en-IN'),
      });
    } catch {
      if (mockEntry) {
        setTrailData(mockEntry.trail);
        setMetadata({
          totalHops: mockEntry.trail.length,
          totalDistance: mockEntry.total_distance_km,
          status: mockEntry.trail_status,
          duration: mockEntry.duration_minutes,
          target: mockEntry.target,
          crimeLinked: mockEntry.crime_linked,
          vehicleType: mockEntry.vehicle_type || 'Commercial Vehicle',
          relatedVehicles: mockEntry.related_vehicles || [],
          lastUpdated: new Date().toLocaleTimeString('en-IN'),
        });
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Check URL query param or load default on mount
  useEffect(() => {
    let plateParam = 'KA-01-MJ-8821';
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPlate = urlParams.get('plate');
      if (urlPlate) plateParam = urlPlate.toUpperCase();
    }
    setSearchQuery(plateParam);
    loadTrailForPlate(plateParam);
  }, [loadTrailForPlate]);

  // Hop-by-hop delayed trail animation with reduced motion check
  useEffect(() => {
    if (!trailData || trailData.length === 0) {
      setVisibleHopsCount(0);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setVisibleHopsCount(trailData.length);
      return;
    }

    setVisibleHopsCount(1);
    const interval = setInterval(() => {
      setVisibleHopsCount((prev) => {
        if (prev >= trailData.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [trailData]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadTrailForPlate(searchQuery);
    }
  };

  const handleShareReport = () => {
    if (!metadata || trailData.length === 0) return;

    const summaryText = `[DRISHTI POLICE CO-PILOT] GEO-TRAIL SUMMARY FOR ${searchedPlate}\nTarget: ${metadata.target}\nVehicle: ${metadata.vehicleType}\nHops: ${metadata.totalHops} | Dist: ${metadata.totalDistance} km | Duration: ${metadata.duration}m | Avg Match: ${averageMatchPercent}%\nLast Seen: ${trailData[trailData.length - 1].camera_name} at ${new Date(trailData[trailData.length - 1].timestamp).toLocaleTimeString('en-IN')} IST`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  // Export Trail Report
  const handleExportReport = () => {
    if (!metadata || trailData.length === 0) return;

    const reportText =
      `=======================================================\n` +
      `DRISHTI — KARNATAKA STATE POLICE CO-PILOT\n` +
      `SUSPECT GEO-TRAIL TACTICAL REPORT\n` +
      `=======================================================\n\n` +
      `Target Plate:     ${searchedPlate}\n` +
      `Vehicle Type:     ${metadata.vehicleType || 'N/A'}\n` +
      `Suspect Linked:   ${metadata.target || 'Under Investigation'}\n` +
      `Linked Case:      ${metadata.crimeLinked || 'FIR-2026-BL-0492'}\n` +
      `Trail Status:     ${metadata.status.toUpperCase()}\n` +
      `Total Hops:       ${metadata.totalHops}\n` +
      `Avg Match %:      ${averageMatchPercent}%\n` +
      `Total Distance:   ${metadata.totalDistance} km\n` +
      `Total Duration:   ${metadata.duration} minutes\n` +
      `Generated At:     ${new Date().toLocaleString('en-IN')} IST\n\n` +
      `-------------------------------------------------------\n` +
      `CHRONOLOGICAL ANPR & CCTV SIGHTINGS TIMELINE:\n` +
      `-------------------------------------------------------\n` +
      trailData
        .map((hop, i) => {
          const prev = i > 0 ? trailData[i - 1] : null;
          const { speedKmh, diffMinutes, anomaly } = analyzeHopInsights(hop, prev);
          const camType = getCameraTypeDetails(hop.camera_name);
          const speedStr = speedKmh ? ` | Speed: ${speedKmh} km/h` : '';
          const anomalyStr = anomaly ? ` [ANOMALY: ${anomaly.label}]` : '';

          return (
            `[HOP ${hop.hop}] ${new Date(hop.timestamp).toLocaleString('en-IN')}\n` +
            `  Camera:      ${hop.camera_name} (${camType.label})\n` +
            `  Coordinates: ${hop.lat.toFixed(4)}, ${hop.lng.toFixed(4)}\n` +
            `  Confidence:  ${hop.confidence}% Match\n` +
            `  Distance:    ${hop.distance_from_crime_km} km from origin${speedStr}${anomalyStr}\n\n`
          );
        })
        .join('') +
      `-------------------------------------------------------\n` +
      `PROJECTED VECTOR ANALYSIS:\n` +
      `-------------------------------------------------------\n` +
      `Next Projected Heading: Extrapolated from Hop ${trailData.length - 1} -> Hop ${trailData.length}\n` +
      `Status: UNCONFIRMED PROJECTION (Tactical surveillance recommended)\n` +
      `=======================================================\n`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DRISHTI_GeoTrail_${searchedPlate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const projectedPath = useMemo(() => {
    return computeProjectedPath(trailData);
  }, [trailData]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-[var(--text-primary)] font-sans">
      {/* ── HEADER ROW ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase font-semibold">
              TACTICAL ANPR RECONSTRUCTION
            </span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight mt-1 flex items-center gap-2.5">
            <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            Suspect Geo-Trail Tracker
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Trace vehicle movements, analyze time-speed gaps, and project escape heading vectors.
          </p>
        </div>

        {/* Search Input Form with Helper Quick Links */}
        <div className="flex flex-col gap-1.5 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Plate (e.g. KA-19-MN-4456, KA-25-BG-3310)..."
                className="w-full px-3.5 py-2 pl-9 rounded-xl bg-steel-700 border border-steel-600/50 text-xs font-mono text-paper-100 placeholder:text-paper-100/40 focus:outline-none focus:border-phosphor-500 transition-all shadow-md"
              />
              <Search className="w-4 h-4 text-paper-100/40 absolute left-3 top-2.5" />
            </div>
            <Button type="submit" variant="primary" size="sm" className="font-mono text-xs shrink-0 rounded-xl">
              Search
            </Button>
          </form>

          {/* Search Helper Quick Links (10 Scenarios) */}
          <div className="flex items-center flex-wrap gap-1 text-[10px] font-mono text-paper-100/50 px-0.5 max-w-xl">
            <span className="text-paper-100/40 font-semibold">Try:</span>
            {[
              { plate: 'KA-05-HB-3342', label: 'Clean 5-Hop' },
              { plate: 'KA-01-MJ-8821', label: 'Vector' },
              { plate: 'KA-09-RT-7765', label: 'Gap Anomaly' },
              { plate: 'KA-03-KL-1190', label: '8-Hop Long' },
              { plate: 'KA-19-MN-4456', label: '1-Hop Edge' },
              { plate: 'KA-02-VS-9981', label: '2-Wheeler' },
              { plate: 'KA-25-BG-3310', label: 'Statewide' },
              { plate: 'KA-14-JP-6602', label: '3 Co-Occur' },
              { plate: 'KA-33-EC-8847', label: 'All-ANPR' },
              { plate: 'KA-07-DD-0021', label: 'Not Found' },
            ].map((item, idx) => (
              <span key={item.plate} className="inline-flex items-center gap-1">
                {idx > 0 && <span className="text-paper-100/20">•</span>}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(item.plate);
                    loadTrailForPlate(item.plate);
                  }}
                  className="hover:text-phosphor-500 hover:underline transition-colors focus:outline-none cursor-pointer"
                >
                  {item.plate} ({item.label})
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* SUSPECT SUMMARY CARD */}
      {metadata && !notFound && (
        <Card className="p-4 border border-steel-600/50 bg-steel-700/40 rounded-xl shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-steel-600/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-steel-700 border border-steel-600/60 text-phosphor-500 shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-paper-100/50 uppercase tracking-wider block">
                  VEHICLE SPEC
                </span>
                <span className="text-xs font-mono font-bold text-paper-100 block truncate">
                  {metadata.vehicleType || 'Sedan / Commercial'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4">
              <div className="p-2.5 rounded-lg bg-steel-700 border border-steel-600/60 text-phosphor-500 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-paper-100/50 uppercase tracking-wider block">
                  TOTAL HOPS
                </span>
                <span className="text-xs font-mono font-bold text-paper-100 block">
                  {metadata.totalHops} {metadata.totalHops === 1 ? 'Sighting' : 'Hops Captured'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4">
              <div className="p-2.5 rounded-lg bg-steel-700 border border-steel-600/60 text-phosphor-500 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-paper-100/50 uppercase tracking-wider block">
                  AVG MATCH %
                </span>
                <span className="text-xs font-mono font-bold text-phosphor-500 block">
                  {averageMatchPercent}% Confidence
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4">
              <div className="p-2.5 rounded-lg bg-steel-700 border border-steel-600/60 text-phosphor-500 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-paper-100/50 uppercase tracking-wider block">
                  DURATION
                </span>
                <span className="text-xs font-mono font-bold text-paper-100 block">
                  {metadata.totalHops === 1 ? '0m (Single Point)' : `${metadata.duration} mins (${metadata.totalDistance} km)`}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── NOT FOUND STATE ────────────────────────────────────────────────── */}
      {notFound ? (
        <EmptyState
          icon={Search}
          title={`No Sightings Found for Plate "${searchedPlate}"`}
          description="No automated camera hits or CCTV sightings detected in the ANPR matrix for this plate."
          className="py-16 bg-steel-700/20 border border-steel-600/30 rounded-xl"
        >
          <div className="mt-4 flex flex-col items-center gap-3">
            <p className="text-xs font-mono text-paper-100/60">Try searching active sample watchlists:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['KA-05-HB-3342', 'KA-01-MJ-8821', 'KA-09-RT-7765', 'KA-19-MN-4456', 'KA-25-BG-3310'].map((plate) => (
                <button
                  key={plate}
                  onClick={() => {
                    setSearchQuery(plate);
                    loadTrailForPlate(plate);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-steel-700 hover:bg-steel-600 border border-steel-600/60 text-xs font-mono text-phosphor-500 transition-all cursor-pointer shadow-sm"
                >
                  {plate}
                </button>
              ))}
            </div>
          </div>
        </EmptyState>
      ) : (
        /* ── MAIN DUAL-PANEL GRID ─────────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[620px] items-stretch">
          {/* ── LEFT: LEAFLET MAP & SCRUBBER PANEL (7 COLS) ─────────────────── */}
          <div className="lg:col-span-7 flex flex-col min-h-[480px] lg:min-h-[620px] relative space-y-3">
            <Card className="flex-1 p-2 relative overflow-hidden flex flex-col border border-steel-600/50 bg-steel-700/30 min-h-[450px] rounded-xl shadow-md">
              {loading && (
                <div className="absolute inset-0 z-50 bg-void-000/80 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Spinner size="lg" />
                  <p className="text-xs font-mono text-paper-100/70 mt-3 animate-pulse">
                    Reconstructing ANPR Spatial Vector Grid...
                  </p>
                </div>
              )}

              {/* Map Canvas */}
              <div className="w-full h-full min-h-[440px] rounded-lg overflow-hidden relative">
                <TrailMapView
                  trailData={trailData}
                  visibleHopsCount={visibleHopsCount}
                  highlightedHop={highlightedHop}
                  projectedPath={projectedPath}
                  ghostPosition={ghostPosition}
                  onHopSelect={(h) => setHighlightedHop(h)}
                />

                {/* Map Overlay Top HUD Badge */}
                {metadata && (
                  <div className="absolute top-3 left-3 z-[500] flex flex-wrap items-center gap-2 pointer-events-none">
                    <div className="bg-[#1E2733]/95 backdrop-blur-md border border-[#48596D] rounded-lg px-3 py-1.5 shadow-xl flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#EFEAE4]/70 uppercase tracking-wider font-semibold">
                        TARGET:
                      </span>
                      <span className="text-xs font-mono font-bold text-[#4A8B6F]">
                        {searchedPlate}
                      </span>
                    </div>

                    <div className="bg-[#1E2733]/95 backdrop-blur-md border border-[#48596D] rounded-lg px-3 py-1.5 shadow-xl flex items-center gap-3 font-mono text-xs">
                      <div>
                        <span className="text-[#EFEAE4]/70 text-[10px] font-mono uppercase tracking-wider">
                          DISTANCE:
                        </span>{' '}
                        <span className="font-semibold text-[#EFEAE4] font-mono">
                          {metadata.totalHops === 1 ? '0.0 km' : `${metadata.totalDistance} km`}
                        </span>
                      </div>
                      <span className="text-[#48596D]">|</span>
                      <div>
                        <span className="text-[#EFEAE4]/70 text-[10px] font-mono uppercase tracking-wider">
                          DURATION:
                        </span>{' '}
                        <span className="font-semibold text-[#EFEAE4] font-mono">
                          {metadata.totalHops === 1 ? '0m' : `${metadata.duration}m`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* REPLAY SCRUBBER PANEL (HIDDEN SAFELY ON 1-HOP TRAIL) */}
            {trailData.length > 1 && (
              <Card className="p-3.5 border border-steel-600/50 bg-steel-700/40 space-y-2.5 shrink-0 rounded-xl shadow-md">
                <div className="flex items-center justify-between font-mono text-xs text-paper-100/70">
                  <div className="flex items-center gap-2">
                    <span className="text-phosphor-500 font-bold uppercase tracking-wider text-[11px] font-sans flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-phosphor-500" />
                      REPLAY VECTOR SCRUBBER
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Speed Multiplier Buttons */}
                    <div className="flex items-center gap-1 bg-steel-600/30 p-0.5 rounded-lg border border-steel-600/40">
                      {[1, 2, 4].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                            playbackSpeed === spd
                              ? 'bg-phosphor-500 text-void-000 font-bold'
                              : 'text-paper-100/60 hover:text-paper-100'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] text-phosphor-500 font-mono font-bold">
                      {ghostPosition ? `${ghostPosition.currentTimeStr} IST` : '14:22:10 IST'}
                    </span>
                  </div>
                </div>

                {/* Scrubber Controls Row */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (scrubberPercent >= 100) setScrubberPercent(0);
                      setIsPlaying(!isPlaying);
                    }}
                    className="p-2 rounded-lg bg-steel-600 hover:bg-steel-600/80 text-paper-100 transition-all shrink-0 focus:outline-none focus:border-phosphor-500 active:scale-95 shadow cursor-pointer"
                    title={isPlaying ? 'Pause Replay' : 'Play Replay'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-phosphor-500" />
                    ) : (
                      <Play className="w-4 h-4 text-phosphor-500 fill-phosphor-500" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      console.log('[GeoTrail Debug] BUTTON 3 CLICKED: Resetting scrubber to start, clearing highlighted hop, resetting visible hops');
                      setScrubberPercent(0);
                      setIsPlaying(false);
                      setHighlightedHop(null);
                      if (trailData.length > 0) {
                        setVisibleHopsCount(1);
                      }
                    }}
                    className="p-2 rounded-lg bg-steel-600/50 hover:bg-steel-600 text-paper-100/70 hover:text-paper-100 transition-all shrink-0 cursor-pointer"
                    title="Reset Trail & Scrubber to Start"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Scrubber Progress Slider */}
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={scrubberPercent}
                      onChange={(e) => setScrubberPercent(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-steel-600/50 appearance-none cursor-pointer accent-phosphor-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-paper-100/40 px-1">
                  <span>Start: {new Date(trailData[0].timestamp).toLocaleTimeString('en-IN')} IST</span>
                  <span>Proportional Timestamp Interpolation</span>
                  <span>End: {new Date(trailData[trailData.length - 1].timestamp).toLocaleTimeString('en-IN')} IST</span>
                </div>
              </Card>
            )}
          </div>

          {/* ── RIGHT: SIGHTINGS TIMELINE & INSIGHTS PANEL (5 COLS) ─────────── */}
          <div className="lg:col-span-5 flex flex-col min-h-[480px] space-y-4">
            <Card className="flex-1 flex flex-col p-4 border border-steel-600/50 bg-steel-700/30 justify-between space-y-4 rounded-xl shadow-md">
              {/* Timeline Header & Export / Share Buttons */}
              <div className="flex items-center justify-between pb-3 border-b border-steel-600/30">
                <div>
                  <h3 className="text-sm font-bold text-paper-100 flex items-center gap-2 font-sans">
                    <Clock className="w-4 h-4 text-phosphor-500" />
                    Sighting Timeline & Insights
                  </h3>
                  {metadata && (
                    <p className="text-[11px] font-mono text-paper-100/50 mt-0.5">
                      {metadata.target} • {metadata.totalHops} {metadata.totalHops === 1 ? 'Sighting' : 'Hops Captured'}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 relative">
                  {shareToast && (
                    <span className="absolute -top-7 right-0 text-[10px] font-mono text-phosphor-500 bg-steel-700 border border-phosphor-500/50 px-2 py-0.5 rounded shadow-lg animate-fade-in flex items-center gap-1">
                      <Check className="w-3 h-3 text-phosphor-500" /> Copied!
                    </span>
                  )}
                  <Button
                    onClick={handleShareReport}
                    variant="secondary"
                    size="sm"
                    className="font-mono text-xs flex items-center gap-1 rounded-lg"
                    title="Copy Summary Report to Clipboard"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </Button>

                  <Button
                    onClick={handleExportReport}
                    variant="secondary"
                    size="sm"
                    className="font-mono text-xs flex items-center gap-1 rounded-lg"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>

              {/* Hop Timeline List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
                {trailData.map((hop, idx) => {
                  const prevHop = idx > 0 ? trailData[idx - 1] : null;
                  const { speedKmh, diffMinutes, anomaly } = analyzeHopInsights(hop, prevHop);
                  const camDetails = getCameraTypeDetails(hop.camera_name);
                  const CamIcon = camDetails.icon;
                  const isLowConf = hop.confidence < 90;
                  const isHighlighted = highlightedHop === hop.hop;
                  const isReplayActive = ghostPosition?.activeHop === hop.hop;

                  return (
                    <div
                      key={hop.hop}
                      onClick={() => setHighlightedHop(hop.hop)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isHighlighted || isReplayActive
                          ? 'bg-steel-700 border-phosphor-500 shadow-md ring-1 ring-phosphor-500/40'
                          : 'bg-steel-700/50 border-steel-600/40 hover:border-steel-600'
                      }`}
                    >
                      {/* Top Row: Hop Badge + Camera Type + Timestamp */}
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={idx === 0 ? 'success' : idx === trailData.length - 1 ? 'critical' : 'info'}>
                            Hop {hop.hop}
                          </Badge>

                          <span className="flex items-center gap-1 text-[11px] font-mono text-paper-100/60 bg-steel-600/20 px-2 py-0.5 rounded-md">
                            <CamIcon className="w-3 h-3 text-phosphor-500" />
                            <span>{camDetails.label}</span>
                          </span>
                        </div>

                        <span className="text-[11px] font-mono text-paper-100/50">
                          {new Date(hop.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Camera Location Name */}
                      <h4 className="text-xs font-semibold text-paper-100 line-clamp-1">
                        {hop.camera_name}
                      </h4>

                      {/* Speed Anomaly Badge or Speed Detail */}
                      {anomaly ? (
                        <div className="mt-2 p-2 rounded-lg bg-steel-700/80 border border-steel-600/50 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle
                              className={`w-3.5 h-3.5 ${
                                anomaly.variant === 'critical' ? 'text-critical-500' : 'text-warn-500'
                              }`}
                            />
                            <Badge variant={anomaly.variant}>{anomaly.label}</Badge>
                          </div>
                          <p className="text-[10px] font-mono text-paper-100/60 leading-snug">
                            {anomaly.detail}
                          </p>
                        </div>
                      ) : (
                        speedKmh && (
                          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-paper-100/50">
                            <Zap className="w-3 h-3 text-phosphor-500/70" />
                            <span>Implied Speed: {speedKmh} km/h ({diffMinutes}m elapsed)</span>
                          </div>
                        )
                      )}

                      {/* Bottom Row: Confidence & Distance */}
                      <div className="mt-3 pt-2 border-t border-steel-600/30 flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-phosphor-500" />
                          <Badge variant={isLowConf ? 'warning' : 'success'}>
                            {hop.confidence}% Match {isLowConf ? '(Low Confidence)' : ''}
                          </Badge>
                        </div>
                        <span className="text-paper-100/50">
                          {hop.distance_from_crime_km} km from origin
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Projected Path Card on Timeline */}
                {projectedPath && (
                  <div className="p-3.5 rounded-lg border border-dashed border-warn-500/40 bg-warn-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-warn-500" />
                        <Badge variant="warning">PROJECTED HEADING</Badge>
                      </div>
                      <span className="text-[11px] font-mono text-warn-500">
                        ~{projectedPath.projectedTime} IST
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-paper-100/90">
                      Estimated Escape Corridor (Unconfirmed)
                    </p>
                    <p className="text-[11px] font-mono text-paper-100/60 leading-snug">
                      Extrapolated continuation vector derived from velocity & heading of final 2 sightings.
                    </p>
                  </div>
                )}
              </div>

              {/* SPEED SPARKLINE CHART (SAFE ON 1-HOP CASE) */}
              <div className="pt-3 border-t border-steel-600/30 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-paper-100/60">
                  <span className="flex items-center gap-1 uppercase tracking-wider font-semibold">
                    <Zap className="w-3 h-3 text-phosphor-500" />
                    Inter-Hop Velocity Profile
                  </span>
                  <span>
                    {speedSparklinePoints.length > 0
                      ? `Max: ${Math.max(...speedSparklinePoints.map((p) => p.speed))} km/h`
                      : 'Single Sighting'}
                  </span>
                </div>

                {speedSparklinePoints.length > 0 ? (
                  <div className="h-10 w-full bg-steel-700/60 border border-steel-600/40 rounded-lg p-1.5 flex items-end justify-between relative overflow-hidden">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <line x1="0" y1="15" x2="100" y2="15" stroke="#48596D" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
                      <polyline
                        fill="none"
                        stroke="#4A8B6F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={speedSparklinePoints
                          .map((pt, idx) => {
                            const x = (idx / Math.max(1, speedSparklinePoints.length - 1)) * 100;
                            const maxSpd = Math.max(100, ...speedSparklinePoints.map((p) => p.speed));
                            const y = 28 - (pt.speed / maxSpd) * 24;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                      {speedSparklinePoints.map((pt, idx) => {
                        const x = (idx / Math.max(1, speedSparklinePoints.length - 1)) * 100;
                        const maxSpd = Math.max(100, ...speedSparklinePoints.map((p) => p.speed));
                        const y = 28 - (pt.speed / maxSpd) * 24;
                        const color = pt.isAnomaly ? '#D97706' : pt.speed > 85 ? '#B91C1C' : '#4A8B6F';

                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={color}
                            stroke="#1E2733"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <div className="h-9 w-full bg-steel-700/40 border border-steel-600/30 rounded-lg flex items-center justify-center text-[10px] font-mono text-paper-100/50">
                    Single Hop Sighting — Inter-Hop Velocity Profile Unavailable
                  </div>
                )}
              </div>

              {/* RELATED VEHICLES CO-OCCURRENCE PANEL */}
              {metadata?.relatedVehicles && metadata.relatedVehicles.length > 0 && (
                <div className="pt-3 border-t border-steel-600/30 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-paper-100/60">
                    <span className="uppercase tracking-wider font-semibold flex items-center gap-1">
                      <Car className="w-3 h-3 text-phosphor-500" />
                      Related Vehicles (Co-Occurrences Near Route)
                    </span>
                    <span>{metadata.relatedVehicles.length} Spotted</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {metadata.relatedVehicles.map((rel) => (
                      <button
                        key={rel.plate}
                        type="button"
                        onClick={() => {
                          console.log('[GeoTrail Debug] Related vehicle chip clicked:', rel.plate);
                          setSearchQuery(rel.plate);
                          loadTrailForPlate(rel.plate);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-steel-700 hover:bg-steel-600 border border-steel-600/60 text-xs font-mono text-phosphor-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group"
                        title={`Spotted at ${rel.camera} at ${rel.time} (${rel.delta})`}
                      >
                        <span className="font-bold group-hover:underline">{rel.plate}</span>
                        <span className="text-[10px] text-paper-100/40">({rel.delta})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Target Meta Footer */}
              {metadata && (
                <div className="pt-3 border-t border-steel-600/30 flex items-center justify-between text-[11px] font-mono text-paper-100/60">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-phosphor-500" />
                    <span>Case: {metadata.crimeLinked || 'FIR-2026-BL-0492'}</span>
                  </div>
                  <span className="text-phosphor-500 uppercase font-semibold">
                    Status: {metadata.status}
                  </span>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
