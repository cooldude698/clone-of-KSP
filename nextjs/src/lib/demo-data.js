import { UPLOADED_FIRS, UPLOADED_SUSPECTS } from './uploadedFirsStore';

const STATIC_FIRS = [
  // ── Additional Bengaluru Urban hotspot FIRs ──────────────────────────────
  { case_number: 'KAR/BEN/2026/1001', date_filed: '2026-07-12', time_filed: '22:10:00', crime_type_code: 'chain_snatching', crime_type: 'Chain Snatching', description: 'Gold chain snatched from woman near Koramangala 80ft Road.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Koramangala PS', location_name: 'Near Koramangala 80ft Road, Bengaluru Urban', investigation_office: 'Insp. Ravi Kumar', accused_name: 'Imran Khan', risk_score: 88 },
  { case_number: 'KAR/BEN/2026/1002', date_filed: '2026-07-13', time_filed: '02:15:00', crime_type_code: 'vehicle_theft', crime_type: 'Vehicle Theft', description: 'Motorcycle stolen from HSR Layout Sector 4 parking lot overnight.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'HSR Layout PS', location_name: 'Near HSR Layout Sector 4, Bengaluru Urban', investigation_office: 'Insp. Priya Sharma', accused_name: 'Ramesh Kumar', risk_score: 91 },
  { case_number: 'KAR/BEN/2026/1003', date_filed: '2026-07-13', time_filed: '03:45:00', crime_type_code: 'vehicle_theft', crime_type: 'Vehicle Theft', description: 'Two-wheelers stolen from HSR parking zone.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'HSR Layout PS', location_name: 'Near HSR Layout Sector 4, Bengaluru Urban', investigation_office: 'Insp. Priya Sharma', accused_name: 'Ramesh Kumar', risk_score: 91 },
  { case_number: 'KAR/BEN/2026/1004', date_filed: '2026-07-14', time_filed: '23:30:00', crime_type_code: 'drug_offence', crime_type: 'Drug Offence', description: 'Ganja seizure at BTM Layout 2nd Stage bar district.', status: 'chargesheeted', case_status: 'chargesheeted', district_name: 'Bengaluru Urban', police_station: 'BTM PS', location_name: 'Near BTM Layout 2nd Stage, Bengaluru Urban', investigation_office: 'Insp. George Gopal', accused_name: 'Imran Khan', risk_score: 90 },
  { case_number: 'KAR/BEN/2026/1005', date_filed: '2026-07-14', time_filed: '01:10:00', crime_type_code: 'assault', crime_type: 'Assault', description: 'Drunken brawl assault near BTM Layout 2nd Stage.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'BTM PS', location_name: 'Near BTM Layout 2nd Stage, Bengaluru Urban', investigation_office: 'Insp. George Gopal', accused_name: 'Mahika Ramachandran', risk_score: 75 },
  { case_number: 'KAR/BEN/2026/1006', date_filed: '2026-07-15', time_filed: '14:30:00', crime_type_code: 'robbery', crime_type: 'Robbery', description: 'ATM robbery at Jayanagar 4th Block.', status: 'under_investigation', case_status: 'under_investigation', district_name: 'Bengaluru Urban', police_station: 'Jayanagar PS', location_name: 'Near Jayanagar 4th Block, Bengaluru Urban', investigation_office: 'Insp. Mohan Das', accused_name: 'Suresh Naidu', risk_score: 93 },
  { case_number: 'KAR/BEN/2026/1007', date_filed: '2026-07-15', time_filed: '15:20:00', crime_type_code: 'robbery', crime_type: 'Robbery', description: 'Bag snatching near Jayanagar 4th Block jewellery shop.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Jayanagar PS', location_name: 'Near Jayanagar 4th Block, Bengaluru Urban', investigation_office: 'Insp. Mohan Das', accused_name: 'Suresh Naidu', risk_score: 91 },
  { case_number: 'KAR/BEN/2026/1008', date_filed: '2026-07-16', time_filed: '08:50:00', crime_type_code: 'hit_and_run', crime_type: 'Hit And Run', description: 'Hit and run on Bannerghatta Road near JP Nagar.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'JP Nagar PS', location_name: 'Near Bannerghatta Road, Bengaluru Urban', investigation_office: 'Insp. Latha Rao', accused_name: 'Vikram Singh', risk_score: 85 },
  { case_number: 'KAR/BEN/2026/1009', date_filed: '2026-07-16', time_filed: '11:15:00', crime_type_code: 'cybercrime', crime_type: 'Cybercrime', description: 'UPI fraud targeting elderly at Electronic City Phase 1.', status: 'under_investigation', case_status: 'under_investigation', district_name: 'Bengaluru Urban', police_station: 'Electronic City PS', location_name: 'Near Electronic City Phase 1, Bengaluru Urban', investigation_office: 'Insp. Anika Din', accused_name: 'Bhavani Karpe', risk_score: 87 },
  { case_number: 'KAR/BEN/2026/1010', date_filed: '2026-07-17', time_filed: '19:40:00', crime_type_code: 'chain_snatching', crime_type: 'Chain Snatching', description: 'Gold chain snatching at Whitefield Hope Farm signal.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Whitefield PS', location_name: 'Near Whitefield Hope Farm, Bengaluru Urban', investigation_office: 'Insp. Rajan Nair', accused_name: 'Imran Khan', risk_score: 89 },
  { case_number: 'KAR/BEN/2026/1011', date_filed: '2026-07-17', time_filed: '20:30:00', crime_type_code: 'chain_snatching', crime_type: 'Chain Snatching', description: 'Second chain snatching at Whitefield Hope Farm same evening.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Whitefield PS', location_name: 'Near Whitefield Hope Farm, Bengaluru Urban', investigation_office: 'Insp. Rajan Nair', accused_name: 'Imran Khan', risk_score: 89 },
  { case_number: 'KAR/BEN/2026/1012', date_filed: '2026-07-17', time_filed: '21:10:00', crime_type_code: 'vehicle_theft', crime_type: 'Vehicle Theft', description: 'Car theft at Whitefield IT park parking.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Whitefield PS', location_name: 'Near Whitefield Hope Farm, Bengaluru Urban', investigation_office: 'Insp. Rajan Nair', accused_name: 'Ramesh Kumar', risk_score: 91 },
  { case_number: 'KAR/BEN/2026/1013', date_filed: '2026-07-18', time_filed: '06:15:00', crime_type_code: 'assault', crime_type: 'Assault', description: 'Assault at Marathahalli Bridge auto stand.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Marathahalli PS', location_name: 'Near Marathahalli Bridge, Bengaluru Urban', investigation_office: 'Insp. Dinesh Kumar', accused_name: 'Mahika Ramachandran', risk_score: 80 },
  { case_number: 'KAR/BEN/2026/1014', date_filed: '2026-07-18', time_filed: '23:55:00', crime_type_code: 'drug_offence', crime_type: 'Drug Offence', description: 'MDMA seized at KR Puram Signal late night rave operation.', status: 'chargesheeted', case_status: 'chargesheeted', district_name: 'Bengaluru Urban', police_station: 'KR Puram PS', location_name: 'Near KR Puram Signal, Bengaluru Urban', investigation_office: 'Insp. George Gopal', accused_name: 'Imran Khan', risk_score: 95 },
  { case_number: 'KAR/BEN/2026/1015', date_filed: '2026-07-19', time_filed: '00:30:00', crime_type_code: 'robbery', crime_type: 'Robbery', description: 'Armed robbery at RT Nagar Main Road grocery store.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'RT Nagar PS', location_name: 'Near RT Nagar Main Road, Bengaluru Urban', investigation_office: 'Insp. Vasana Sastry', accused_name: 'Suresh Naidu', risk_score: 92 },
  { case_number: 'KAR/BEN/2026/1016', date_filed: '2026-07-19', time_filed: '13:20:00', crime_type_code: 'vehicle_theft', crime_type: 'Vehicle Theft', description: 'Two-wheeler stolen from Yeshwanthpur Signal bus stop.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Yeshwanthpur PS', location_name: 'Near Yeshwanthpur Signal, Bengaluru Urban', investigation_office: 'Insp. Ekavir Pingle', accused_name: 'Ramesh Kumar', risk_score: 91 },
  { case_number: 'KAR/BEN/2026/1017', date_filed: '2026-07-19', time_filed: '22:15:00', crime_type_code: 'drug_offence', crime_type: 'Drug Offence', description: 'Brown sugar peddling at Peenya Industrial Area night shift gates.', status: 'under_investigation', case_status: 'under_investigation', district_name: 'Bengaluru Urban', police_station: 'Peenya PS', location_name: 'Near Peenya Industrial Area, Bengaluru Urban', investigation_office: 'Insp. George Gopal', accused_name: 'Imran Khan', risk_score: 93 },
  { case_number: 'KAR/BEN/2026/1018', date_filed: '2026-07-20', time_filed: '03:30:00', crime_type_code: 'vehicle_theft', crime_type: 'Vehicle Theft', description: 'Auto-rickshaw stolen from Kengeri Satellite Town stand.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Kengeri PS', location_name: 'Near Kengeri Satellite Town, Bengaluru Urban', investigation_office: 'Insp. Priya Sharma', accused_name: 'Ramesh Kumar', risk_score: 88 },
  { case_number: 'KAR/BEN/2026/1019', date_filed: '2026-07-20', time_filed: '16:45:00', crime_type_code: 'cybercrime', crime_type: 'Cybercrime', description: 'IT job scam running from Malleshwaram 18th Cross cyber cafe.', status: 'under_investigation', case_status: 'under_investigation', district_name: 'Bengaluru Urban', police_station: 'Malleshwaram PS', location_name: 'Near Malleshwaram 18th Cross, Bengaluru Urban', investigation_office: 'Insp. Anika Din', accused_name: 'Bhavani Karpe', risk_score: 84 },
  { case_number: 'KAR/BEN/2026/1020', date_filed: '2026-07-20', time_filed: '21:10:00', crime_type_code: 'assault', crime_type: 'Assault', description: 'Gang fight at Shivajinagar Bus Stand.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Shivajinagar PS', location_name: 'Near Shivajinagar Bus Stand, Bengaluru Urban', investigation_office: 'Insp. Mohan Das', accused_name: 'Farid Mirza', risk_score: 91 },
  { case_number: 'KAR/BEN/2026/1021', date_filed: '2026-07-21', time_filed: '22:50:00', crime_type_code: 'robbery', crime_type: 'Robbery', description: 'Mugging at MG Road Brigade footpath after midnight.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'MG Road PS', location_name: 'Near MG Road Brigade, Bengaluru Urban', investigation_office: 'Insp. Mohan Das', accused_name: 'Suresh Naidu', risk_score: 90 },
  { case_number: 'KAR/BEN/2026/1022', date_filed: '2026-07-21', time_filed: '01:40:00', crime_type_code: 'assault', crime_type: 'Assault', description: 'Pub brawl assault at Majestic KSRTC Terminal area.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Majestic PS', location_name: 'Near Majestic KSRTC Terminal, Bengaluru Urban', investigation_office: 'Insp. Vasana Sastry', accused_name: 'Farid Mirza', risk_score: 88 },
  { case_number: 'KAR/BEN/2026/1023', date_filed: '2026-07-21', time_filed: '02:30:00', crime_type_code: 'drug_offence', crime_type: 'Drug Offence', description: 'Ecstasy pills seized at Majestic area rave party.', status: 'chargesheeted', case_status: 'chargesheeted', district_name: 'Bengaluru Urban', police_station: 'Majestic PS', location_name: 'Near Majestic KSRTC Terminal, Bengaluru Urban', investigation_office: 'Insp. George Gopal', accused_name: 'Imran Khan', risk_score: 95 },
  { case_number: 'KAR/BEN/2026/1024', date_filed: '2026-07-22', time_filed: '09:20:00', crime_type_code: 'fraud', crime_type: 'Fraud', description: 'Investment cheating fraud near Domlur Flyover.', status: 'under_investigation', case_status: 'under_investigation', district_name: 'Bengaluru Urban', police_station: 'Domlur PS', location_name: 'Near Domlur Flyover, Bengaluru Urban', investigation_office: 'Insp. Bhavani Karpe', accused_name: 'Bhavani Karpe', risk_score: 85 },
  { case_number: 'KAR/BEN/2026/1025', date_filed: '2026-07-22', time_filed: '20:05:00', crime_type_code: 'chain_snatching', crime_type: 'Chain Snatching', description: 'Gold chain snatched at Sarjapur Road IT Cluster bus stop.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Sarjapur PS', location_name: 'Near Sarjapur Road IT Cluster, Bengaluru Urban', investigation_office: 'Insp. Rajan Nair', accused_name: 'Imran Khan', risk_score: 87 },
  { case_number: 'KAR/BEN/2026/1026', date_filed: '2026-07-23', time_filed: '23:00:00', crime_type_code: 'drug_offence', crime_type: 'Drug Offence', description: 'Ganja peddling busted at Bellandur Lake Road.', status: 'chargesheeted', case_status: 'chargesheeted', district_name: 'Bengaluru Urban', police_station: 'Bellandur PS', location_name: 'Near Bellandur Lake Road, Bengaluru Urban', investigation_office: 'Insp. George Gopal', accused_name: 'Imran Khan', risk_score: 92 },
  { case_number: 'KAR/BEN/2026/1027', date_filed: '2026-07-23', time_filed: '11:00:00', crime_type_code: 'robbery', crime_type: 'Robbery', description: 'Cash van robbery attempt at Hebbal Lake Road.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Hebbal PS', location_name: 'Near Hebbal Lake Road, Bengaluru Urban', investigation_office: 'Insp. Vasana Sastry', accused_name: 'Suresh Naidu', risk_score: 94 },
  { case_number: 'KAR/BEN/2026/1028', date_filed: '2026-07-23', time_filed: '12:30:00', crime_type_code: 'robbery', crime_type: 'Robbery', description: 'Second robbery attempt at Hebbal Lake Road same day.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Hebbal PS', location_name: 'Near Hebbal Lake Road, Bengaluru Urban', investigation_office: 'Insp. Vasana Sastry', accused_name: 'Suresh Naidu', risk_score: 94 },
  { case_number: 'KAR/BEN/2026/1029', date_filed: '2026-07-24', time_filed: '07:15:00', crime_type_code: 'hit_and_run', crime_type: 'Hit And Run', description: 'Pedestrian hit at Hosur Road NICE Junction.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Electronic City PS', location_name: 'Near Hosur Road NICE Junction, Bengaluru Urban', investigation_office: 'Insp. Latha Rao', accused_name: 'Vikram Singh', risk_score: 86 },
  { case_number: 'KAR/BEN/2026/1030', date_filed: '2026-07-24', time_filed: '19:00:00', crime_type_code: 'vehicle_theft', crime_type: 'Vehicle Theft', description: 'Motorcycle stolen at Yelahanka New Town market.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Yelahanka PS', location_name: 'Near Yelahanka New Town, Bengaluru Urban', investigation_office: 'Insp. Ekavir Pingle', accused_name: 'Ramesh Kumar', risk_score: 90 },
  { case_number: 'KAR/BEN/2026/1031', date_filed: '2026-07-25', time_filed: '02:20:00', crime_type_code: 'drug_offence', crime_type: 'Drug Offence', description: 'Brown sugar seized at Varthur Main Road late night.', status: 'chargesheeted', case_status: 'chargesheeted', district_name: 'Bengaluru Urban', police_station: 'Varthur PS', location_name: 'Near Varthur Main Road, Bengaluru Urban', investigation_office: 'Insp. George Gopal', accused_name: 'Imran Khan', risk_score: 93 },
  { case_number: 'KAR/BEN/2026/1032', date_filed: '2026-07-25', time_filed: '10:45:00', crime_type_code: 'cybercrime', crime_type: 'Cybercrime', description: 'KYC fraud phishing at Nagawara Circle Axis Bank.', status: 'under_investigation', case_status: 'under_investigation', district_name: 'Bengaluru Urban', police_station: 'Nagawara PS', location_name: 'Near Nagawara Circle, Bengaluru Urban', investigation_office: 'Insp. Anika Din', accused_name: 'Bhavani Karpe', risk_score: 85 },
  { case_number: 'KAR/BEN/2026/1033', date_filed: '2026-07-26', time_filed: '21:30:00', crime_type_code: 'assault', crime_type: 'Assault', description: 'Road rage assault at Bommanahalli Signal junction.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Bommanahalli PS', location_name: 'Near Bommanahalli Signal, Bengaluru Urban', investigation_office: 'Insp. Dinesh Kumar', accused_name: 'Mahika Ramachandran', risk_score: 80 },
  { case_number: 'KAR/BEN/2026/1034', date_filed: '2026-07-26', time_filed: '14:00:00', crime_type_code: 'fraud', crime_type: 'Fraud', description: 'Property fraud at Rajajinagar ISKCON road.', status: 'under_investigation', case_status: 'under_investigation', district_name: 'Bengaluru Urban', police_station: 'Rajajinagar PS', location_name: 'Near Rajajinagar ISKCON, Bengaluru Urban', investigation_office: 'Insp. Vaishnavi Aggarwal', accused_name: 'Bhavani Karpe', risk_score: 86 },
  { case_number: 'KAR/BEN/2026/1035', date_filed: '2026-07-27', time_filed: '03:10:00', crime_type_code: 'vehicle_theft', crime_type: 'Vehicle Theft', description: 'Three vehicles stolen from Nayandahalli Junction overnight.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Nayandahalli PS', location_name: 'Near Nayandahalli Junction, Bengaluru Urban', investigation_office: 'Insp. Priya Sharma', accused_name: 'Ramesh Kumar', risk_score: 93 },
  { case_number: 'KAR/BEN/2026/1036', date_filed: '2026-07-27', time_filed: '04:00:00', crime_type_code: 'vehicle_theft', crime_type: 'Vehicle Theft', description: 'Fourth vehicle stolen from Nayandahalli Junction.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Nayandahalli PS', location_name: 'Near Nayandahalli Junction, Bengaluru Urban', investigation_office: 'Insp. Priya Sharma', accused_name: 'Ramesh Kumar', risk_score: 93 },
  { case_number: 'KAR/BEN/2026/1037', date_filed: '2026-07-28', time_filed: '17:30:00', crime_type_code: 'chain_snatching', crime_type: 'Chain Snatching', description: 'Chain snatching at Basavanagudi NR Road evening rush hour.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Basavanagudi PS', location_name: 'Near Basavanagudi NR Road, Bengaluru Urban', investigation_office: 'Insp. Rajan Nair', accused_name: 'Imran Khan', risk_score: 88 },
  { case_number: 'KAR/BEN/2026/1038', date_filed: '2026-07-28', time_filed: '23:45:00', crime_type_code: 'drug_offence', crime_type: 'Drug Offence', description: 'Ecstasy racket busted at Chamrajpet Market godown.', status: 'chargesheeted', case_status: 'chargesheeted', district_name: 'Bengaluru Urban', police_station: 'Chamrajpet PS', location_name: 'Near Chamrajpet Market, Bengaluru Urban', investigation_office: 'Insp. George Gopal', accused_name: 'Imran Khan', risk_score: 94 },
  { case_number: 'KAR/BEN/2026/1039', date_filed: '2026-07-29', time_filed: '18:00:00', crime_type_code: 'robbery', crime_type: 'Robbery', description: 'Snatch and grab at HBR Layout 4th Block ATM.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'HBR Layout PS', location_name: 'Near HBR Layout 4th Block, Bengaluru Urban', investigation_office: 'Insp. Dinesh Kumar', accused_name: 'Suresh Naidu', risk_score: 91 },
  { case_number: 'KAR/BEN/2026/1040', date_filed: '2026-07-30', time_filed: '00:15:00', crime_type_code: 'assault', crime_type: 'Assault', description: 'Stab wound assault at Horamavu Agara road.', status: 'open', case_status: 'open', district_name: 'Bengaluru Urban', police_station: 'Horamavu PS', location_name: 'Near Horamavu Agara, Bengaluru Urban', investigation_office: 'Insp. Vasana Sastry', accused_name: 'Farid Mirza', risk_score: 93 },
  { case_number: 'KAR/BEN/2026/1041', date_filed: '2026-07-30', time_filed: '00:45:00', crime_type_code: 'drug_offence', crime_type: 'Drug Offence', description: 'Narcotics at Horamavu Agara party zone.', status: 'chargesheeted', case_status: 'chargesheeted', district_name: 'Bengaluru Urban', police_station: 'Horamavu PS', location_name: 'Near Horamavu Agara, Bengaluru Urban', investigation_office: 'Insp. George Gopal', accused_name: 'Imran Khan', risk_score: 94 },
  // ── Karnataka district FIRs ───────────────────────────────────────────────
  { case_number: 'KAR/BEN/2024/0330', date_filed: '2024-06-01', time_filed: '13:09:00', crime_type_code: 'hit_and_run', crime_type: 'Hit And Run', description: 'Speeding vehicle collided with two-wheeler near Murty Circle, Kalaburagi.', status: 'open', case_status: 'open', district_name: 'Kalaburagi', police_station: 'Kalaburagi Rural PS', location_name: 'Near Murty Circle, Kalaburagi', investigation_office: 'Insp. Lohit Lall', accused_name: 'Vikram Singh', risk_score: 88 },
  { case_number: "KAR/KAL/2024/0102", date_filed: "2024-06-01", time_filed: "13:09:00", crime_type_code: "hit_and_run", crime_type: "Hit And Run", description: "Speeding vehicle collided with pedestrian near Murty Circle.", status: "open", case_status: "open", district_name: "Kalaburagi", police_station: "Kalaburagi Rural PS", location_name: "Near Murty Circle, Kalaburagi", investigation_office: "Insp. Lohit Lall", accused_name: "Vikram Singh", risk_score: 88 },
  { case_number: "KAR/RAI/2024/0123", date_filed: "2024-06-01", time_filed: "00:10:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Stolen motorcycle outside Balay Circle, Raichur.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Raichur", police_station: "Raichur Suburban PS", location_name: "Near Balay Circle, Raichur", investigation_office: "Insp. Jonathan Iyengar", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/BEN/2024/1726", date_filed: "2024-06-01", time_filed: "22:52:00", crime_type_code: "drug_offence", crime_type: "Drug Offence", description: "Tactical raid near Wadhwa seizing commercial MDMA payload.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban East PS", location_name: "Near Wadhwa, Bengaluru Urban", investigation_office: "Insp. George Gopal", accused_name: "Imran Khan", risk_score: 96 },
  { case_number: "KAR/UDU/2024/0049", date_filed: "2024-06-01", time_filed: "17:21:00", crime_type_code: "senior_citizen_crime", crime_type: "Senior Citizen Crime", description: "Extortion complaint under Senior Citizen Protection Act near Das Marg.", status: "open", case_status: "open", district_name: "Udupi", police_station: "Udupi Rural PS", location_name: "Near Das Marg, Udupi", investigation_office: "Insp. Saanvi Dara", accused_name: "Saanvi Dara", risk_score: 82 },
  { case_number: "KAR/KAL/2024/0106", date_filed: "2024-06-01", time_filed: "13:09:00", crime_type_code: "hit_and_run", crime_type: "Hit And Run", description: "Hit and run collision logged near Murty Circle.", status: "open", case_status: "open", district_name: "Kalaburagi", police_station: "Kalaburagi Rural PS", location_name: "Near Murty Circle, Kalaburagi", investigation_office: "Insp. Lohit Lall", accused_name: "Vikram Singh", risk_score: 88 },
  { case_number: "KAR/BEN/2024/0380", date_filed: "2024-06-01", time_filed: "22:58:00", crime_type_code: "cybercrime", crime_type: "Cybercrime", description: "Phishing scam mimicking banking portal near Gara Zila.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban Traffic PS", location_name: "Near Gara Zila, Bengaluru Urban", investigation_office: "Insp. Bhavani Karpe", accused_name: "Bhavani Karpe", risk_score: 85 },
  { case_number: "KAR/RAI/2024/0108", date_filed: "2024-06-01", time_filed: "00:10:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Vehicle theft reported near Balay Circle.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Raichur", police_station: "Raichur Suburban PS", location_name: "Near Balay Circle, Raichur", investigation_office: "Insp. Jonathan Iyengar", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/BEN/2024/0109", date_filed: "2024-06-01", time_filed: "22:52:00", crime_type_code: "drug_offence", crime_type: "Drug Offence", description: "Narcotics interception near Wadhwa.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban East PS", location_name: "Near Wadhwa, Bengaluru Urban", investigation_office: "Insp. George Gopal", accused_name: "Imran Khan", risk_score: 96 },
  { case_number: "KAR/BEN/2024/0747", date_filed: "2024-06-01", time_filed: "01:32:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Vehicle theft logged near Keer Circle.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban Central PS", location_name: "Near Keer Circle, Bengaluru Urban", investigation_office: "Insp. Radha Virk", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/CHI/2024/0901", date_filed: "2024-06-01", time_filed: "23:36:00", crime_type_code: "burglary", crime_type: "Burglary", description: "Housebreaking and gold looting near Ganesh Marg.", status: "open", case_status: "open", district_name: "Chikkamagaluru", police_station: "Chikkamagaluru Market PS", location_name: "Near Ganesh Marg, Chikkamagaluru", investigation_office: "Insp. Bhavna Menon", accused_name: "Vikram Reddy", risk_score: 84 },
  { case_number: "KAR/TUM/2024/0774", date_filed: "2024-06-01", time_filed: "10:25:00", crime_type_code: "drug_offence", crime_type: "Drug Offence", description: "Narcotics contraband raid near Bajaj Chowk.", status: "closed", case_status: "closed", district_name: "Tumakuru", police_station: "Tumakuru Town PS", location_name: "Near Bajaj Chowk, Tumakuru", investigation_office: "Insp. Janaki Bhatia", accused_name: "Imran Khan", risk_score: 96 },
  { case_number: "KAR/BEN/2024/0384", date_filed: "2024-06-01", time_filed: "07:54:00", crime_type_code: "assault", crime_type: "Assault", description: "Physical altercation near Padmanabhan Zila.", status: "under_investigation", case_status: "under_investigation", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban West PS", location_name: "Near Padmanabhan Zila, Bengaluru Urban", investigation_office: "Insp. Mahika Ramachandran", accused_name: "Mahika Ramachandran", risk_score: 78 },
  { case_number: "KAR/BEN/2024/0114", date_filed: "2024-06-01", time_filed: "07:54:00", crime_type_code: "assault", crime_type: "Assault", description: "Physical assault reported near Padmanabhan Zila.", status: "under_investigation", case_status: "under_investigation", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban West PS", location_name: "Near Padmanabhan Zila, Bengaluru Urban", investigation_office: "Insp. Mahika Ramachandran", accused_name: "Mahika Ramachandran", risk_score: 78 },
  { case_number: "KAR/KAL/2024/0115", date_filed: "2024-06-01", time_filed: "13:09:00", crime_type_code: "hit_and_run", crime_type: "Hit And Run", description: "Hit and run logged near Murty Circle.", status: "open", case_status: "open", district_name: "Kalaburagi", police_station: "Kalaburagi Rural PS", location_name: "Near Murty Circle, Kalaburagi", investigation_office: "Insp. Lohit Lall", accused_name: "Vikram Singh", risk_score: 88 },
  { case_number: "KAR/KAL/2024/0116", date_filed: "2024-06-01", time_filed: "13:09:00", crime_type_code: "hit_and_run", crime_type: "Hit And Run", description: "Speeding hit and run near Murty Circle.", status: "open", case_status: "open", district_name: "Kalaburagi", police_station: "Kalaburagi Rural PS", location_name: "Near Murty Circle, Kalaburagi", investigation_office: "Insp. Lohit Lall", accused_name: "Vikram Singh", risk_score: 88 },
  { case_number: "KAR/BEN/2024/0117", date_filed: "2024-06-01", time_filed: "07:54:00", crime_type_code: "assault", crime_type: "Assault", description: "Assault reported near Padmanabhan Zila.", status: "under_investigation", case_status: "under_investigation", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban West PS", location_name: "Near Padmanabhan Zila, Bengaluru Urban", investigation_office: "Insp. Mahika Ramachandran", accused_name: "Mahika Ramachandran", risk_score: 78 },
  { case_number: "KAR/BEN/2024/0118", date_filed: "2024-06-01", time_filed: "07:54:00", crime_type_code: "assault", crime_type: "Assault", description: "Assault incident near Padmanabhan Zila.", status: "under_investigation", case_status: "under_investigation", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban West PS", location_name: "Near Padmanabhan Zila, Bengaluru Urban", investigation_office: "Insp. Mahika Ramachandran", accused_name: "Mahika Ramachandran", risk_score: 78 },
  { case_number: "KAR/RAI/2024/0119", date_filed: "2024-06-01", time_filed: "00:10:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Vehicle theft near Balay Circle.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Raichur", police_station: "Raichur Suburban PS", location_name: "Near Balay Circle, Raichur", investigation_office: "Insp. Jonathan Iyengar", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/RAI/2024/0120", date_filed: "2024-06-01", time_filed: "00:10:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Vehicle theft reported near Balay Circle.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Raichur", police_station: "Raichur Suburban PS", location_name: "Near Balay Circle, Raichur", investigation_office: "Insp. Jonathan Iyengar", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/RAI/2024/0121", date_filed: "2024-06-01", time_filed: "00:10:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Stolen two-wheeler near Balay Circle.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Raichur", police_station: "Raichur Suburban PS", location_name: "Near Balay Circle, Raichur", investigation_office: "Insp. Jonathan Iyengar", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/BEN/2024/0122", date_filed: "2024-06-01", time_filed: "22:52:00", crime_type_code: "drug_offence", crime_type: "Drug Offence", description: "Contraband MDMA seizure near Wadhwa.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban East PS", location_name: "Near Wadhwa, Bengaluru Urban", investigation_office: "Insp. George Gopal", accused_name: "Imran Khan", risk_score: 96 },
  { case_number: "KAR/BEN/2024/0123", date_filed: "2024-06-01", time_filed: "07:54:00", crime_type_code: "assault", crime_type: "Assault", description: "Assault altercation near Padmanabhan Zila.", status: "under_investigation", case_status: "under_investigation", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban West PS", location_name: "Near Padmanabhan Zila, Bengaluru Urban", investigation_office: "Insp. Mahika Ramachandran", accused_name: "Mahika Ramachandran", risk_score: 78 },
  { case_number: "KAR/KAL/2024/0124", date_filed: "2024-06-01", time_filed: "13:09:00", crime_type_code: "hit_and_run", crime_type: "Hit And Run", description: "Hit and run logged near Murty Circle.", status: "open", case_status: "open", district_name: "Kalaburagi", police_station: "Kalaburagi Rural PS", location_name: "Near Murty Circle, Kalaburagi", investigation_office: "Insp. Lohit Lall", accused_name: "Vikram Singh", risk_score: 88 },
  { case_number: "KAR/BEN/2024/0125", date_filed: "2024-06-01", time_filed: "07:54:00", crime_type_code: "assault", crime_type: "Assault", description: "Grievous assault near Padmanabhan Zila.", status: "under_investigation", case_status: "under_investigation", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban West PS", location_name: "Near Padmanabhan Zila, Bengaluru Urban", investigation_office: "Insp. Mahika Ramachandran", accused_name: "Mahika Ramachandran", risk_score: 78 },
  { case_number: "KAR/CHI/2024/0126", date_filed: "2024-06-01", time_filed: "23:36:00", crime_type_code: "burglary", crime_type: "Burglary", description: "Residential burglary near Ganesh Marg.", status: "open", case_status: "open", district_name: "Chikkamagaluru", police_station: "Chikkamagaluru Market PS", location_name: "Near Ganesh Marg, Chikkamagaluru", investigation_office: "Insp. Bhavna Menon", accused_name: "Vikram Reddy", risk_score: 84 },
  { case_number: "KAR/CHI/2024/0127", date_filed: "2024-06-01", time_filed: "23:36:00", crime_type_code: "burglary", crime_type: "Burglary", description: "Night break-in near Ganesh Marg.", status: "open", case_status: "open", district_name: "Chikkamagaluru", police_station: "Chikkamagaluru Market PS", location_name: "Near Ganesh Marg, Chikkamagaluru", investigation_office: "Insp. Bhavna Menon", accused_name: "Vikram Reddy", risk_score: 84 },
  { case_number: "KAR/HAS/2024/1961", date_filed: "2024-06-01", time_filed: "11:35:00", crime_type_code: "domestic_violence", crime_type: "Domestic Violence", description: "Domestic abuse complaint near Kumer Nagar.", status: "open", case_status: "open", district_name: "Hassan", police_station: "Hassan Industrial PS", location_name: "Near Kumer Nagar, Hassan", investigation_office: "Insp. Avi Goda", accused_name: "Anand Shinde", risk_score: 90 },
  { case_number: "KAR/RAI/2024/0129", date_filed: "2024-06-01", time_filed: "00:10:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Motorcycle stolen near Balay Circle.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Raichur", police_station: "Raichur Suburban PS", location_name: "Near Balay Circle, Raichur", investigation_office: "Insp. Jonathan Iyengar", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/VIJ/2024/2269", date_filed: "2024-05-31", time_filed: "15:19:00", crime_type_code: "robbery", crime_type: "Robbery", description: "Armed robbery near Karan Marg.", status: "open", case_status: "open", district_name: "Vijayapura", police_station: "Vijayapura Industrial PS", location_name: "Near Karan Marg, Vijayapura", investigation_office: "Insp. Sanya Bora", accused_name: "Suresh Naidu", risk_score: 91 },
  { case_number: "KAR/BEN/2024/0675", date_filed: "2024-05-31", time_filed: "07:40:00", crime_type_code: "robbery", crime_type: "Robbery", description: "Robbery incident near Balan Street.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban East PS", location_name: "Near Balan Street, Bengaluru Urban", investigation_office: "Insp. Yatan Mani", accused_name: "Suresh Naidu", risk_score: 91 },
  { case_number: "KAR/BEN/2024/1840", date_filed: "2024-05-31", time_filed: "12:51:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Vehicle theft near Nagarajan Street.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban East PS", location_name: "Near Nagarajan Street, Bengaluru Urban", investigation_office: "Insp. Ekavir Pingle", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/KAL/2024/0718", date_filed: "2024-05-31", time_filed: "23:43:00", crime_type_code: "assault", crime_type: "Assault", description: "Assault incident near Behl Path.", status: "under_investigation", case_status: "under_investigation", district_name: "Kalaburagi", police_station: "Kalaburagi Industrial PS", location_name: "Near Behl Path, Kalaburagi", investigation_office: "Insp. Yug Varty", accused_name: "Mahika Ramachandran", risk_score: 78 },
  { case_number: "KAR/VIJ/2024/1383", date_filed: "2024-05-31", time_filed: "19:57:00", crime_type_code: "domestic_violence", crime_type: "Domestic Violence", description: "Domestic harassment near Shenoy Zila.", status: "open", case_status: "open", district_name: "Vijayapura", police_station: "Vijayapura Suburban PS", location_name: "Near Shenoy Zila, Vijayapura", investigation_office: "Insp. Meghana Sen", accused_name: "Anand Shinde", risk_score: 90 },
  { case_number: "KAR/TUM/2024/1316", date_filed: "2024-05-31", time_filed: "16:20:00", crime_type_code: "fraud", crime_type: "Fraud", description: "Financial scam near Ramakrishnan Circle.", status: "under_investigation", case_status: "under_investigation", district_name: "Tumakuru", police_station: "Tumakuru Industrial PS", location_name: "Near Ramakrishnan Circle, Tumakuru", investigation_office: "Insp. Imaran Biswas", accused_name: "Bhavani Karpe", risk_score: 85 },
  { case_number: "KAR/CHI/2024/2061", date_filed: "2024-05-31", time_filed: "10:37:00", crime_type_code: "cybercrime", crime_type: "Cybercrime", description: "Phishing attack near Prasad Path.", status: "under_investigation", case_status: "under_investigation", district_name: "Chikkamagaluru", police_station: "Chikkamagaluru Town PS", location_name: "Near Prasad Path, Chikkamagaluru", investigation_office: "Insp. Anika Din", accused_name: "Bhavani Karpe", risk_score: 85 },
  { case_number: "KAR/CHI/2024/0137", date_filed: "2024-05-31", time_filed: "10:37:00", crime_type_code: "cybercrime", crime_type: "Cybercrime", description: "Cyber fraud near Prasad Path.", status: "under_investigation", case_status: "under_investigation", district_name: "Chikkamagaluru", police_station: "Chikkamagaluru Town PS", location_name: "Near Prasad Path, Chikkamagaluru", investigation_office: "Insp. Anika Din", accused_name: "Bhavani Karpe", risk_score: 85 },
  { case_number: "KAR/CHI/2024/0138", date_filed: "2024-05-31", time_filed: "10:37:00", crime_type_code: "cybercrime", crime_type: "Cybercrime", description: "Cyber phishing complaint near Prasad Path.", status: "under_investigation", case_status: "under_investigation", district_name: "Chikkamagaluru", police_station: "Chikkamagaluru Town PS", location_name: "Near Prasad Path, Chikkamagaluru", investigation_office: "Insp. Anika Din", accused_name: "Bhavani Karpe", risk_score: 85 },
  { case_number: "KAR/KOP/2024/0131", date_filed: "2024-05-31", time_filed: "05:28:00", crime_type_code: "drug_offence", crime_type: "Drug Offence", description: "Substance contraband seizure near Mammen Marg.", status: "open", case_status: "open", district_name: "Koppal", police_station: "Koppal Town PS", location_name: "Near Mammen Marg, Koppal", investigation_office: "Insp. Oliver Ramesh", accused_name: "Imran Khan", risk_score: 96 },
  { case_number: "KAR/BID/2024/1595", date_filed: "2024-05-31", time_filed: "05:25:00", crime_type_code: "robbery", crime_type: "Robbery", description: "Robbery logged near Narayan Street.", status: "open", case_status: "open", district_name: "Bidar", police_station: "Bidar Rural PS", location_name: "Near Narayan Street, Bidar", investigation_office: "Insp. Nidhi Dhaliwal", accused_name: "Suresh Naidu", risk_score: 91 },
  { case_number: "KAR/RAI/2024/2205", date_filed: "2024-05-30", time_filed: "05:47:00", crime_type_code: "assault", crime_type: "Assault", description: "Assault incident near Minhas Nagar.", status: "open", case_status: "open", district_name: "Raichur", police_station: "Raichur Industrial PS", location_name: "Near Minhas Nagar, Raichur", investigation_office: "Insp. Sarthak Om", accused_name: "Mahika Ramachandran", risk_score: 78 },
  { case_number: "KAR/BEN/2024/0303", date_filed: "2024-05-30", time_filed: "06:19:00", crime_type_code: "fraud", crime_type: "Fraud", description: "Financial fraud near Prasad Circle.", status: "under_investigation", case_status: "under_investigation", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban Traffic PS", location_name: "Near Prasad Circle, Bengaluru Urban", investigation_office: "Insp. Vaishnavi Aggarwal", accused_name: "Bhavani Karpe", risk_score: 85 },
  { case_number: "KAR/BEN/2024/0822", date_filed: "2024-05-30", time_filed: "05:11:00", crime_type_code: "fraud", crime_type: "Fraud", description: "Cheating fraud near Bhandari Street.", status: "open", case_status: "open", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban North PS", location_name: "Near Bhandari Street, Bengaluru Urban", investigation_office: "Insp. Anamika Sule", accused_name: "Bhavani Karpe", risk_score: 85 },
  { case_number: "KAR/RAI/2024/0144", date_filed: "2024-05-30", time_filed: "05:47:00", crime_type_code: "assault", crime_type: "Assault", description: "Assault complaint near Minhas Nagar.", status: "open", case_status: "open", district_name: "Raichur", police_station: "Raichur Industrial PS", location_name: "Near Minhas Nagar, Raichur", investigation_office: "Insp. Sarthak Om", accused_name: "Mahika Ramachandran", risk_score: 78 },
  { case_number: "KAR/BEN/2024/2250", date_filed: "2024-05-30", time_filed: "20:49:00", crime_type_code: "robbery", crime_type: "Robbery", description: "Armed robbery near Saini.", status: "under_investigation", case_status: "under_investigation", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban North PS", location_name: "Near Saini, Bengaluru Urban", investigation_office: "Insp. Vasana Sastry", accused_name: "Suresh Naidu", risk_score: 91 },
  { case_number: "KAR/KAL/2024/2223", date_filed: "2024-05-30", time_filed: "03:16:00", crime_type_code: "property_crime", crime_type: "Property Crime", description: "Property offense near Thaman.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Kalaburagi", police_station: "Kalaburagi Market PS", location_name: "Near Thaman, Kalaburagi", investigation_office: "Insp. Nidhi Pandey", accused_name: "Chetan Shetty", risk_score: 89 },
  { case_number: "KAR/BID/2024/0897", date_filed: "2024-05-30", time_filed: "02:27:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Vehicle theft near Verma Circle.", status: "open", case_status: "open", district_name: "Bidar", police_station: "Bidar Suburban PS", location_name: "Near Verma Circle, Bidar", investigation_office: "Insp. Yashodhara Konda", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/BID/2024/2425", date_filed: "2024-05-30", time_filed: "09:24:00", crime_type_code: "vehicle_theft", crime_type: "Vehicle Theft", description: "Stolen motorcycle near Kalita Path.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Bidar", police_station: "Bidar Market PS", location_name: "Near Kalita Path, Bidar", investigation_office: "Insp. Timothy Kota", accused_name: "Ramesh Kumar", risk_score: 94 },
  { case_number: "KAR/DAV/2024/2111", date_filed: "2024-05-30", time_filed: "06:35:00", crime_type_code: "hit_and_run", crime_type: "Hit And Run", description: "Hit and run near Sahota Ganj.", status: "chargesheeted", case_status: "chargesheeted", district_name: "Davangere", police_station: "Davangere Market PS", location_name: "Near Sahota Ganj, Davangere", investigation_office: "Insp. Jyoti Kumer", accused_name: "Vikram Singh", risk_score: 88 },
  { case_number: "KAR/BEN/2024/0150", date_filed: "2024-05-30", time_filed: "20:49:00", crime_type_code: "robbery", crime_type: "Robbery", description: "Robbery near Saini, Bengaluru Urban.", status: "under_investigation", case_status: "under_investigation", district_name: "Bengaluru Urban", police_station: "Bengaluru Urban North PS", location_name: "Near Saini, Bengaluru Urban", investigation_office: "Insp. Vasana Sastry", accused_name: "Suresh Naidu", risk_score: 91 }
];

export const DEMO_FIRS = {
  get firs() {
    const raw = [...UPLOADED_FIRS, ...STATIC_FIRS];
    return raw.map((f, idx) => {
      const distId = (f.district_name || '').includes('Bengaluru') ? 443 : 102;
      const unitId = 6;
      const yr = 2026;
      const serialNum = (f.case_number || '').replace(/\D/g, '').slice(-5) || String(idx + 1).padStart(5, '0');
      const crime_no = f.crime_no || `1${String(distId).padStart(4, '0')}${String(unitId).padStart(4, '0')}${yr}${String(serialNum).padStart(5, '0')}`;
      const case_no = f.case_no || `${yr}${String(serialNum).padStart(5, '0')}`;

      return {
        ...f,
        crime_no,
        case_no,
        case_category: f.case_category || (crime_no.startsWith('8') ? 'Zero FIR' : 'FIR'),
        gravity: f.gravity || (parseInt(f.risk_score || 50, 10) > 80 ? 'Heinous' : 'Non-Heinous'),
        accused_name: f.accused_name || 'Vikram Malhotra',
        accused: f.accused || [
          { person_id: 'A1', name: f.accused_name || 'Vikram Malhotra', role: 'Prime Accused', risk_score: f.risk_score || 88 }
        ],
        victims: f.victims || [
          { name: 'Citizen Complainant', age: 35, gender: 'Male', is_police: false }
        ],
        act_sections: f.act_sections || [
          { act: 'IPC', section: '379', desc: 'Punishment for Theft' }
        ],
        chargesheet: f.chargesheet || { cs_type: f.status === 'chargesheeted' ? 'A' : 'C', cs_label: f.status === 'chargesheeted' ? 'Chargesheet Filed' : 'Under Investigation' }
      };
    });
  },
  get total_count() {
    return UPLOADED_FIRS.length + STATIC_FIRS.length;
  }
};

export function aggregateFirsToHotspots(firList) {
  if (!Array.isArray(firList) || firList.length === 0) return [];

  const locationCoords = {
    'Murty Circle': { lat: 17.3354, lng: 76.8412 },
    'Balay Circle': { lat: 16.2112, lng: 77.3510 },
    'Wadhwa': { lat: 12.9621, lng: 77.6432 },
    'Silk Board': { lat: 12.9175, lng: 77.6215 },
    'Silk Board TTMC Parking Bay 3': { lat: 12.9175, lng: 77.6215 },
    'Das Marg': { lat: 13.3480, lng: 74.7512 },
    'Gara Zila': { lat: 12.9782, lng: 77.6102 },
    'Keer Circle': { lat: 12.9645, lng: 77.5890 },
    'Ganesh Marg': { lat: 13.3210, lng: 75.7801 },
    'Bajaj Chowk': { lat: 13.3412, lng: 77.1089 },
    'Padmanabhan Zila': { lat: 12.9234, lng: 77.5712 },
    'Kumer Nagar': { lat: 13.0120, lng: 76.1112 },
    'Whitefield Tech Park Corridor': { lat: 12.9860, lng: 77.7380 },
    'ITPB Main Road': { lat: 12.9860, lng: 77.7380 },
    'Karan Marg': { lat: 16.8350, lng: 75.7189 },
    'Balan Street': { lat: 12.9912, lng: 77.5623 },
    'Nagarajan Street': { lat: 12.9810, lng: 77.5710 },
    'Behl Path': { lat: 17.3190, lng: 76.8201 },
    'Shenoy Zila': { lat: 16.8240, lng: 75.7012 },
    'Ramakrishnan Circle': { lat: 13.3310, lng: 77.0945 },
    'Prasad Path': { lat: 13.3098, lng: 75.7645 },
    'Mammen Marg': { lat: 15.3580, lng: 76.1620 },
    'Narayan Street': { lat: 17.9150, lng: 77.5250 },
    'Minhas Nagar': { lat: 16.1984, lng: 77.3398 },
    'Prasad Circle': { lat: 12.9610, lng: 77.5920 },
    'Bhandari Street': { lat: 12.9940, lng: 77.5840 },
    'Saini': { lat: 12.9980, lng: 77.5690 },
    'Thaman': { lat: 17.3489, lng: 76.8523 },
    'Verma Circle': { lat: 17.9040, lng: 77.5120 },
    'Kalita Path': { lat: 17.9210, lng: 77.5310 },
    'Sahota Ganj': { lat: 14.4690, lng: 75.9280 },
    // ── Bengaluru Urban Hotspot Grid ──────────────────────────────────────
    'Koramangala 80ft Road': { lat: 12.9352, lng: 77.6245 },
    'HSR Layout Sector 4':   { lat: 12.9116, lng: 77.6474 },
    'BTM Layout 2nd Stage':  { lat: 12.9165, lng: 77.6101 },
    'Jayanagar 4th Block':   { lat: 12.9308, lng: 77.5832 },
    'JP Nagar Phase 3':      { lat: 12.9081, lng: 77.5840 },
    'Bannerghatta Road':     { lat: 12.8933, lng: 77.5971 },
    'Electronic City Phase 1': { lat: 12.8458, lng: 77.6592 },
    'Whitefield Hope Farm':  { lat: 12.9698, lng: 77.7500 },
    'Marathahalli Bridge':   { lat: 12.9562, lng: 77.7011 },
    'KR Puram Signal':       { lat: 13.0090, lng: 77.6927 },
    'Hennur Road Junction':  { lat: 13.0449, lng: 77.6268 },
    'RT Nagar Main Road':    { lat: 13.0219, lng: 77.5939 },
    'Rajajinagar 1st Block': { lat: 12.9952, lng: 77.5530 },
    'Yeshwanthpur Signal':   { lat: 13.0255, lng: 77.5499 },
    'Peenya Industrial Area': { lat: 13.0322, lng: 77.5206 },
    'Kengeri Satellite Town': { lat: 12.9063, lng: 77.4843 },
    'Vijayanagar 4th Stage': { lat: 12.9740, lng: 77.5168 },
    'Malleshwaram 18th Cross': { lat: 13.0024, lng: 77.5680 },
    'Shivajinagar Bus Stand': { lat: 12.9850, lng: 77.5990 },
    'MG Road Brigade':       { lat: 12.9760, lng: 77.6070 },
    'Majestic KSRTC Terminal': { lat: 12.9774, lng: 77.5699 },
    'Ulsoor Lake Road':      { lat: 12.9858, lng: 77.6205 },
    'Indiranagar CMH Road':  { lat: 12.9784, lng: 77.6408 },
    'Domlur Flyover':        { lat: 12.9630, lng: 77.6390 },
    'Ejipura Signal':        { lat: 12.9445, lng: 77.6208 },
    'Sarjapur Road IT Cluster': { lat: 12.9121, lng: 77.6881 },
    'HSR BDA Complex':       { lat: 12.9091, lng: 77.6380 },
    'Bellandur Lake Road':   { lat: 12.9263, lng: 77.6990 },
    'Varthur Main Road':     { lat: 12.9397, lng: 77.7437 },
    'Kadugodi Signal':       { lat: 12.9991, lng: 77.7742 },
    'Devarabeesanahalli':    { lat: 12.9620, lng: 77.7120 },
    'Banashankari Temple':   { lat: 12.9256, lng: 77.5475 },
    'Basavanagudi NR Road':  { lat: 12.9453, lng: 77.5742 },
    'Chamrajpet Market':     { lat: 12.9634, lng: 77.5617 },
    'Cottonpet Main Road':   { lat: 12.9724, lng: 77.5624 },
    'Rajajinagar ISKCON':    { lat: 13.0104, lng: 77.5580 },
    'HBR Layout 4th Block':  { lat: 13.0340, lng: 77.6452 },
    'Horamavu Agara':        { lat: 13.0345, lng: 77.6720 },
    'Kalyan Nagar Junction': { lat: 13.0420, lng: 77.6483 },
    'Hebbal Lake Road':      { lat: 13.0490, lng: 77.5988 },
    'Nagawara Circle':       { lat: 13.0487, lng: 77.6208 },
    'Yelahanka New Town':    { lat: 13.1007, lng: 77.5963 },
    'Jakkur Aerodrome Road': { lat: 13.0728, lng: 77.5960 },
    'Bagalur Cross':         { lat: 13.1570, lng: 77.6690 },
    'Hosur Road NICE Junction': { lat: 12.8781, lng: 77.6482 },
    'Bommanahalli Signal':   { lat: 12.8951, lng: 77.6374 },
    'Hulimavu Junction':     { lat: 12.8745, lng: 77.6009 },
    'Uttarahalli Main Road': { lat: 12.8884, lng: 77.5388 },
    'Nayandahalli Junction': { lat: 12.9504, lng: 77.5119 },
  };

  const districtCenterCoords = {
    'Bengaluru Urban': { lat: 12.9716, lng: 77.5946 },
    'Kalaburagi': { lat: 17.3297, lng: 76.8343 },
    'Raichur': { lat: 16.2076, lng: 77.3463 },
    'Udupi': { lat: 13.3409, lng: 74.7421 },
    'Chikkamagaluru': { lat: 13.3161, lng: 75.7720 },
    'Tumakuru': { lat: 13.3392, lng: 77.1014 },
    'Hassan': { lat: 13.0033, lng: 76.1004 },
    'Vijayapura': { lat: 16.8302, lng: 75.7100 },
    'Koppal': { lat: 15.3518, lng: 76.1554 },
    'Bidar': { lat: 17.9104, lng: 77.5199 },
    'Davangere': { lat: 14.4644, lng: 75.9218 },
    'Mysuru': { lat: 12.3051, lng: 76.6551 },
    'Mangaluru': { lat: 12.8703, lng: 74.8427 },
    'Hubballi-Dharwad': { lat: 15.3647, lng: 75.1240 },
    'Belagavi': { lat: 15.8497, lng: 74.5089 },
    'Shivamogga': { lat: 13.9299, lng: 75.5681 },
  };

  const groups = {};
  firList.forEach((f) => {
    const dist = f.district_name || f.district || 'Bengaluru Urban';
    const locRaw = f.location_name || f.location || f.police_station || dist;
    let locClean = locRaw.split(',')[0].replace(/^Near\s+/i, '').trim();
    if (!locClean || locClean.toLowerCase() === dist.toLowerCase()) {
      locClean = f.police_station ? f.police_station.split('/')[0].trim() : `${dist} Central`;
    }

    const key = `${dist}__${locClean}`;
    if (!groups[key]) {
      groups[key] = {
        area_name: locClean,
        district: dist,
        crime_count: 0,
        crime_types_count: {},
        lat: parseFloat(f.location_lat) || 0,
        lng: parseFloat(f.location_lng) || 0,
      };
    }

    const g = groups[key];
    g.crime_count++;
    const crimeCode = (f.crime_type_code || f.crime_type || 'theft').toLowerCase().replace(/\s+/g, '_');
    g.crime_types_count[crimeCode] = (g.crime_types_count[crimeCode] || 0) + 1;
  });

  return Object.values(groups).map((g) => {
    const topCrimes = Object.entries(g.crime_types_count)
      .sort((a, b) => b[1] - a[1])
      .map(([c]) => c);

    let severity = 'low';
    if (g.crime_count >= 3) {
      severity = 'critical';
    } else if (g.crime_count === 2) {
      severity = 'high';
    } else if (g.crime_count === 1) {
      const topC = topCrimes[0] || '';
      if (['robbery', 'drug_offence', 'hit_and_run', 'assault', 'cyber_fraud'].includes(topC)) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
    }

    let lat = g.lat;
    let lng = g.lng;

    if (!lat || !lng || lat === 0 || lng === 0) {
      const lookup = locationCoords[g.area_name];
      if (lookup) {
        lat = lookup.lat;
        lng = lookup.lng;
      } else {
        const distCenter = districtCenterCoords[g.district] || districtCenterCoords['Bengaluru Urban'];
        lat = distCenter.lat;
        lng = distCenter.lng;
      }
    }

    return {
      area_name: g.area_name,
      area: g.area_name,
      district: g.district,
      crime_count: g.crime_count,
      count: g.crime_count,
      severity: severity,
      risk_level: severity,
      primary_crime: topCrimes[0] ? topCrimes[0].replace(/_/g, ' ') : 'Theft',
      top_crime_types: topCrimes,
      lat,
      lng,
    };
  });
}

export const DEMO_HOTSPOTS = {
  get hotspots() {
    return aggregateFirsToHotspots(DEMO_FIRS.firs);
  }
};

export const DEMO_TRENDS = {
  trend_data: [
    { period: "2025-08", count: 142, change_pct: 2.1, is_spike: false },
    { period: "2025-09", count: 128, change_pct: -9.8, is_spike: false },
    { period: "2025-10", count: 165, change_pct: 28.9, is_spike: true },
    { period: "2025-11", count: 139, change_pct: -15.7, is_spike: false },
    { period: "2025-12", count: 184, change_pct: 32.3, is_spike: true },
    { period: "2026-01", count: 191, change_pct: 3.8, is_spike: false },
    { period: "2026-02", count: 172, change_pct: -9.9, is_spike: false },
    { period: "2026-03", count: 210, change_pct: 22.1, is_spike: false },
    { period: "2026-04", count: 245, change_pct: 16.6, is_spike: false },
    { period: "2026-05", count: 268, change_pct: 9.3, is_spike: false },
    { period: "2026-06", count: 289, change_pct: 7.8, is_spike: false },
    { period: "2026-07", count: 312, change_pct: 7.9, is_spike: false }
  ],
  seasonal_insight: "Crime analysis indicates peak vehicle theft frequency during weekend late-night windows (22:00-03:00) near transit hubs.",
  overall_trend: "increasing",
  average_per_period: 203.75,
  spike_periods: ["2025-10", "2025-12"]
};

export const DEMO_UNDERREPORTING = {
  dark_zones: [
    {
      area_name: "KSRTC Satellite Bus Stand Back Alley",
      district: "Bengaluru Urban",
      reported_crimes: 4,
      estimated_actual_crimes: 28,
      underreporting_index: 85.7,
      confidence_score: 92,
      primary_reason: "Lack of lighting & CCTV coverage leading to non-reporting"
    },
    {
      area_name: "Hebbal Flyover Lower Loop",
      district: "Bengaluru Urban",
      reported_crimes: 7,
      estimated_actual_crimes: 34,
      underreporting_index: 79.4,
      confidence_score: 88,
      primary_reason: "Transient victim population hesitant to file FIRs"
    },
    {
      area_name: "Banaswadi Outer Ring Service Road",
      district: "Bengaluru Urban",
      reported_crimes: 12,
      estimated_actual_crimes: 41,
      underreporting_index: 70.7,
      confidence_score: 84,
      primary_reason: "Late night commercial corridor blindspot"
    },
    {
      area_name: "Whitefield Inner Circle Park",
      district: "Bengaluru Urban",
      reported_crimes: 3,
      estimated_actual_crimes: 19,
      underreporting_index: 84.2,
      confidence_score: 89,
      primary_reason: "Low police patrol frequency during midnight hours"
    }
  ]
};

const STATIC_SUSPECTS = [
    {
      suspect_id: 'SUS-8842',
      name: 'Ramesh Kumar',
      alias: 'Bullet Ramesh',
      age: 34,
      gender: 'Male',
      risk_score: 94,
      status: 'ACTIVE_WATCHLIST',
      phone: '+91 98450 12890',
      district_name: 'Bengaluru Urban',
      primary_modus_operandi: 'Organises vehicle theft rings across district borders. Uses stolen motorcycles for resale in Mysuru and Hubballi. Coordinates with chopshops in Yelahanka.',
      last_known_location: 'Silk Board Junction, Bengaluru — 18 Jul 2026 14:22 hrs',
      associated_firs: ['FIR-2026-BL-4921', 'FIR-2026-BL-1104', 'KAR/RAI/2024/0123'],
      known_hangouts: ['Silk Board TTMC', 'Hosur Border Checkpost', 'Yelahanka Auto Market'],
      known_associates: ['Suresh Naidu (SUS-7104)', 'Deepak Shetty (SUS-4401)', 'Manoj Reddy (SUS-1190)'],
      ipc_sections: ['IPC §379', 'IPC §34', 'IPC §411', 'IPC §120B'],
      anpr_hits: 7,
      camera_sightings: ['CAM-BLR-0010', 'CAM-BLR-0012', 'CAM-BLR-0015'],
    },
    {
      suspect_id: 'SUS-9012',
      name: 'Anand Shinde',
      alias: 'Buda Anand',
      age: 34,
      gender: 'Male',
      risk_score: 90,
      status: 'ACTIVE_WATCHLIST',
      phone: '+91 93861 66667',
      district_name: 'Raichur',
      primary_modus_operandi: 'Organises vehicle theft rings across district borders. Uses stolen motorcycles for resale in Mysuru and Hubballi.',
      last_known_location: 'Near Balay Circle, Raichur Suburban PS Jurisdiction, Bengaluru — 19 Jul 2026 08:30 hrs',
      associated_firs: ['KAR/RAI/2024/0123', 'KAR/HAS/2024/1961', 'KAR/VIJ/2024/1383'],
      known_hangouts: ['Near Balay Circle, Raichur', 'Raichur Auto Chopshop Belt', 'Kumer Nagar'],
      known_associates: ['Ramesh Kumar (SUS-8842)', 'Chetan Shetty (SUS-2210)'],
      ipc_sections: ['IPC §379', 'IPC §411', 'IPC §34'],
      anpr_hits: 5,
      camera_sightings: ['CAM-RAI-0012', 'CAM-BLR-0050'],
    },
    {
      suspect_id: 'SUS-3302',
      name: 'Anand Gowda',
      alias: 'Maddur Gowda',
      age: 32,
      gender: 'Male',
      risk_score: 86,
      status: 'ABSCONDING',
      phone: '+91 98452 99104',
      district_name: 'Mandya / Mysuru',
      primary_modus_operandi: 'Inter-district cattle rustling and highway extortion ring operating on NH-275 corridor.',
      last_known_location: 'Maddur Toll Gate, NH-275 — 17 Jul 2026 19:15 hrs',
      associated_firs: ['FIR-2026-MY-4102', 'KAR/BEN/2024/0675'],
      known_hangouts: ['Maddur Toll Gate', 'Ramanagara Market'],
      known_associates: ['Suresh Naidu (SUS-7104)', 'Anand Shinde (SUS-9012)'],
      ipc_sections: ['IPC §379', 'IPC §384', 'IPC §34'],
      anpr_hits: 4,
      camera_sightings: ['CAM-MY-0012'],
    },
    {
      suspect_id: 'SUS-8890',
      name: 'Vikram Malhotra',
      alias: 'Vicky Blade',
      age: 38,
      gender: 'Male',
      risk_score: 88,
      status: 'ABSCONDING',
      phone: '+91 98455 77120',
      district_name: 'Bengaluru Urban',
      primary_modus_operandi: 'High value digital imposter fraud & cyber extortion operations across Whitefield corridor. Account freeze under 1930 Helpline SOP.',
      last_known_location: 'ITPB Main Road, Whitefield Tech Park Corridor, Bengaluru — 18 Jul 2026 18:10 hrs',
      associated_firs: ['FIR-2026-BL-9104', 'KAR/BEN/2024/0380'],
      known_hangouts: ['ITPB Main Road', 'Hope Farm Signal', 'Whitefield Tech Park Corridor'],
      known_associates: ['Ravi Shankar (SUS-9901)', 'Bhavani Karpe (SUS-3401)'],
      ipc_sections: ['IT Act §66D', 'IPC §420', 'IPC §120B'],
      anpr_hits: 4,
      camera_sightings: ['CAM-BLR-0012', 'CAM-BLR-0055'],
    },
    {
      suspect_id: 'SUS-7712',
      name: 'Vikram Singh',
      alias: 'Vicky Singh',
      age: 36,
      gender: 'Male',
      risk_score: 88,
      status: 'ACTIVE_WATCHLIST',
      phone: '+91 97410 55219',
      district_name: 'Kalaburagi',
      primary_modus_operandi: 'Speeding reckless hit-and-run accidents and vehicle collisions near Murty Circle.',
      last_known_location: 'Near Murty Circle, Kalaburagi — 17 Jul 2026 13:09 hrs',
      associated_firs: ['KAR/KAL/2024/0330', 'KAR/KAL/2024/0102', 'KAR/KAL/2024/0106'],
      known_hangouts: ['Murty Circle, Kalaburagi', 'Kalaburagi Ring Road'],
      known_associates: ['Vikram Reddy (SUS-5512)'],
      ipc_sections: ['IPC §279', 'IPC §304A', 'IPC §338'],
      anpr_hits: 6,
      camera_sightings: ['CAM-KAL-001', 'CAM-KAL-004'],
    },
    {
      suspect_id: 'SUS-5512',
      name: 'Vikram Reddy',
      alias: 'Vicky Reddy',
      age: 35,
      gender: 'Male',
      risk_score: 84,
      status: 'ACTIVE_WATCHLIST',
      phone: '+91 96112 33410',
      district_name: 'Chikkamagaluru',
      primary_modus_operandi: 'Housebreaking and gold looting in residential areas near Ganesh Marg.',
      last_known_location: 'Near Ganesh Marg, Chikkamagaluru — 16 Jul 2026 23:36 hrs',
      associated_firs: ['KAR/CHI/2024/0901', 'KAR/CHI/2024/0126', 'KAR/CHI/2024/0127'],
      known_hangouts: ['Ganesh Marg, Chikkamagaluru', 'Chikkamagaluru Market'],
      known_associates: ['Vikram Singh (SUS-7712)'],
      ipc_sections: ['IPC §457', 'IPC §380', 'IPC §34'],
      anpr_hits: 3,
      camera_sightings: ['CAM-CHI-002'],
    },
    {
      suspect_id: 'SUS-3401',
      name: 'Bhavani Karpe',
      alias: 'Karpe Madam',
      age: 41,
      gender: 'Female',
      risk_score: 85,
      status: 'UNDER_SURVEILLANCE',
      phone: '+91 98440 22910',
      district_name: 'Bengaluru Urban',
      primary_modus_operandi: 'Phishing scams mimicking banking portals and financial cheating operations.',
      last_known_location: 'Near Gara Zila, Bengaluru Urban — 15 Jul 2026 22:58 hrs',
      associated_firs: ['KAR/BEN/2024/0380', 'KAR/TUM/2024/1316', 'KAR/CHI/2024/2061'],
      known_hangouts: ['Prasad Circle', 'Bhandari Street'],
      known_associates: ['Vikram Malhotra (SUS-8890)'],
      ipc_sections: ['IPC §420', 'IT Act §66C'],
      anpr_hits: 2,
      camera_sightings: ['CAM-BLR-0010'],
    },
    {
      suspect_id: 'SUS-6091',
      name: 'Farid Mirza',
      alias: 'Chotta Mirza',
      age: 33,
      gender: 'Male',
      risk_score: 92,
      status: 'ABSCONDING',
      phone: '+91 97401 88290',
      district_name: 'Bengaluru Urban',
      primary_modus_operandi: 'Armed dacoity and illegal weapons distribution across Central Bengaluru.',
      last_known_location: 'KSRTC Majestic Terminal 3 Platform — 18 Jul 2026 14:34 hrs',
      associated_firs: ['FIR-2026-BL-3104', 'FIR-2026-BL-5001'],
      known_hangouts: ['Majestic Bus Stand', 'Shivajinagar Market'],
      known_associates: ['Basha Khan (SUS-6633)', 'Ramesh Kumar (SUS-8842)'],
      ipc_sections: ['IPC §395', 'IPC §397', 'Arms Act §25'],
      anpr_hits: 8,
      camera_sightings: ['CAM-BLR-0055', 'CAM-BLR-0010'],
    },
    {
      suspect_id: 'SUS-7801',
      name: 'Mahika Ramachandran',
      alias: 'Mahi Iron',
      age: 34,
      gender: 'Male',
      risk_score: 78,
      status: 'UNDER_INVESTIGATION',
      phone: '+91 98451 44109',
      district_name: 'Bengaluru Urban',
      primary_modus_operandi: 'Physical altercation and assault incidents near Padmanabhan Zila. Operates in Bengaluru Urban West PS jurisdiction.',
      last_known_location: 'Madiwala PS / Silk Board TTMC Command Jurisdiction, Bengaluru — 18 Jul 2026 19:40 hrs',
      associated_firs: ['KAR/BEN/2024/0384', 'KAR/BEN/2024/0114', 'KAR/BEN/2024/0117', 'KAR/BEN/2024/0118'],
      known_hangouts: ['Madiwala PS', 'Silk Board TTMC', 'Padmanabhan Zila'],
      known_associates: ['Suresh Naidu (SUS-7104)', 'Anand Shinde (SUS-9012)'],
      ipc_sections: ['IPC §323', 'IPC §324', 'IPC §34'],
      anpr_hits: 4,
      camera_sightings: ['CAM-BLR-0010', 'CAM-BLR-0015'],
    },
    {
      suspect_id: 'SUS-2223',
      name: 'Chetan Shetty',
      alias: 'Chota Chetan',
      age: 37,
      gender: 'Male',
      risk_score: 89,
      status: 'CHARGESHEETED',
      phone: '+91 97411 99201',
      district_name: 'Kalaburagi',
      primary_modus_operandi: 'Commercial property offences and extortion near Thaman, Kalaburagi.',
      last_known_location: 'Kalaburagi Market PS Jurisdiction — 17 Jul 2026 11:20 hrs',
      associated_firs: ['KAR/KAL/2024/2223'],
      known_hangouts: ['Kalaburagi Market', 'Thaman Corridor'],
      known_associates: ['Vikram Singh (SUS-7712)'],
      ipc_sections: ['IPC §384', 'IPC §457', 'IPC §34'],
      anpr_hits: 5,
      camera_sightings: ['CAM-KAL-002'],
    },
    {
      suspect_id: 'SUS-7104',
      name: 'Suresh Naidu',
      alias: 'Snake Naidu',
      age: 29,
      gender: 'Male',
      risk_score: 88,
      status: 'ABSCONDING',
      phone: '+91 97412 88301',
      district_name: 'Mysuru',
      primary_modus_operandi: 'Armed highway robbery targeting commercial vehicles on NH-275. Uses threat of violence. Known to carry country-made weapons.',
      last_known_location: 'Cubbon Park Fringe, Bengaluru — 16 Jul 2026 21:30 hrs',
      associated_firs: ['FIR-2026-MY-1103', 'FIR-2025-BL-9912'],
      known_hangouts: ['Cubbon Park Fringe', 'Kengeri Toll', 'Mysuru Bus Stand'],
      known_associates: ['Ramesh Kumar (SUS-8842)', 'Imran Khan (SUS-5921)', 'Arun Gowda (SUS-3302)'],
      ipc_sections: ['IPC §392', 'IPC §34', 'IPC §397'],
      anpr_hits: 4,
      camera_sightings: ['CAM-BLR-0042'],
    },
    {
      suspect_id: 'SUS-5921',
      name: 'Imran Khan',
      alias: 'Helmet Imran',
      age: 26,
      gender: 'Male',
      risk_score: 76,
      status: 'ACTIVE_SURVEILLANCE',
      phone: '+91 96110 44512',
      district_name: 'Bengaluru Urban',
      primary_modus_operandi: 'Gold chain snatching targeting women pedestrians near tech parks during evening hours.',
      last_known_location: 'ITPL Main Road, Whitefield — 16 Jul 2026 09:45 hrs',
      associated_firs: ['FIR-2026-BL-4920'],
      known_hangouts: ['ITPL Main Road', 'Hope Farm Signal'],
      known_associates: ['Manoj Reddy (SUS-1190)'],
      ipc_sections: ['IPC §379A', 'IPC §356'],
      anpr_hits: 3,
      camera_sightings: ['CAM-BLR-0091'],
    }
];

export const DEMO_REPEAT_OFFENDERS = {
  get high_risk_count() {
    return 38 + UPLOADED_SUSPECTS.length;
  },
  get suspects() {
    return [...UPLOADED_SUSPECTS, ...STATIC_SUSPECTS];
  }
};

export const DEMO_NETWORK_GRAPH = {
  nodes: [
    // ── GANG-NORTH: Vehicle Theft Syndicate ──────────────────────────────────
    { id: "SUS-8842", label: "Ramesh Kumar",  type: "suspect", risk: 94, role: "Gang Leader",      crime: "vehicle_theft",  district: "South Bengaluru",   gang_id: "GANG-NORTH", size: 26, first_crime_date: "2025-03-10", last_crime_date: "2026-07-18" },
    { id: "SUS-4401", label: "Deepak Shetty", type: "suspect", risk: 71, role: "Weapons Handler",  crime: "vehicle_theft",  district: "Yelahanka",         gang_id: "GANG-NORTH", size: 15, first_crime_date: "2025-04-22", last_crime_date: "2026-06-30" },
    { id: "SUS-2211", label: "Farid Mirza",   type: "suspect", risk: 82, role: "Arms & Contraband Supplier", crime: "assault", district: "Central Bengaluru", gang_id: "GANG-NORTH", size: 20, first_crime_date: "2025-05-15", last_crime_date: "2026-07-01" },
    { id: "SUS-1190", label: "Manoj Reddy",   type: "suspect", risk: 65, role: "Lookout",          crime: "vehicle_theft",  district: "Electronic City",   gang_id: "GANG-NORTH", size: 15, first_crime_date: "2025-06-01", last_crime_date: "2026-05-20" },
    { id: "SUS-9901", label: "Ravi Shankar",  type: "suspect", risk: 88, role: "Finance Handler", crime: "fraud",          district: "Indiranagar",      gang_id: "GANG-NORTH", size: 20, first_crime_date: "2025-07-10", last_crime_date: "2026-07-10" },
    { id: "SUS-6633", label: "Basha Khan",    type: "suspect", risk: 91, role: "Enforcer",        crime: "assault",        district: "Shivajinagar",     gang_id: "GANG-NORTH", size: 20, first_crime_date: "2025-08-05", last_crime_date: "2026-07-15" },

    // ── GANG-SOUTH: Chain Snatching Cell ─────────────────────────────────────
    { id: "SUS-5921", label: "Imran Khan",    type: "suspect", risk: 76, role: "Gang Leader",      crime: "chain_snatching", district: "Whitefield",      gang_id: "GANG-SOUTH", size: 26, first_crime_date: "2025-03-20", last_crime_date: "2026-07-16" },
    { id: "SUS-7104", label: "Suresh Naidu",  type: "suspect", risk: 88, role: "Co-Accused",       crime: "robbery",        district: "Mysuru",          gang_id: "GANG-SOUTH", size: 20, first_crime_date: "2025-04-01", last_crime_date: "2026-06-25" },
    { id: "SUS-3302", label: "Arun Gowda",    type: "suspect", risk: 65, role: "Lookout",          crime: "robbery",        district: "Tumkur",          gang_id: "GANG-SOUTH", size: 15, first_crime_date: "2025-05-10", last_crime_date: "2026-05-30" },
    { id: "SUS-0012", label: "Prakash Nair",  type: "suspect", risk: 67, role: "Intel Mole",       crime: "cybercrime",     district: "Koramangala",     gang_id: "GANG-SOUTH", size: 15, first_crime_date: "2025-09-12", last_crime_date: "2026-07-05" },

    // ── FIR Case Nodes ───────────────────────────────────────────────────────
    { id: "FIR-2026-BL-4921", label: "FIR-4921\nVehicle Theft",  type: "fir", crime: "vehicle_theft",  first_crime_date: "2025-03-10" },
    { id: "FIR-2026-MY-1103", label: "FIR-1103\nArmed Robbery",  type: "fir", crime: "robbery",        first_crime_date: "2025-04-01" },
    { id: "FIR-2026-BL-4920", label: "FIR-4920\nChain Snatching",type: "fir", crime: "chain_snatching",first_crime_date: "2025-03-20" },
    { id: "FIR-2026-BL-5001", label: "FIR-5001\nAssault",        type: "fir", crime: "assault",        first_crime_date: "2025-08-05" },
    { id: "FIR-2026-YL-0234", label: "FIR-0234\nStolen Parts",   type: "fir", crime: "vehicle_theft",  first_crime_date: "2025-04-22" },
  ],
  edges: [
    // ── GANG-NORTH intra-gang edges ─────────────────────────────────────────
    { source: "SUS-8842", target: "FIR-2026-BL-4921", relation: "Primary Accused",          weight: 5, date: "2025-03-10" },
    { source: "SUS-8842", target: "SUS-4401",         relation: "Sells stolen vehicles to", weight: 3, date: "2025-04-22" },
    { source: "SUS-8842", target: "SUS-2211",         relation: "Procures weapons from",    weight: 4, date: "2025-05-15" },
    { source: "SUS-8842", target: "SUS-9901",         relation: "Finances gang ops",        weight: 4, date: "2025-07-10" },
    { source: "SUS-8842", target: "SUS-6633",         relation: "Enforcement unit",         weight: 4, date: "2025-08-05" },
    { source: "SUS-4401", target: "FIR-2026-YL-0234", relation: "Receiver of Stolen Goods", weight: 4, date: "2025-04-22" },
    { source: "SUS-2211", target: "FIR-2026-BL-5001", relation: "Co-Accused",               weight: 3, date: "2025-08-05" },
    { source: "SUS-1190", target: "FIR-2026-BL-4921", relation: "Accessory (Driver)",       weight: 2, date: "2025-06-01" },
    { source: "SUS-6633", target: "SUS-2211",         relation: "Enforcement Partner",      weight: 3, date: "2025-09-01" },
    { source: "SUS-9901", target: "SUS-4401",         relation: "Money Laundering Link",   weight: 3, date: "2025-10-15" },

    // ── GANG-SOUTH intra-gang edges ─────────────────────────────────────────
    { source: "SUS-5921", target: "FIR-2026-BL-4920", relation: "Primary Accused",    weight: 5, date: "2025-03-20" },
    { source: "SUS-5921", target: "SUS-7104",         relation: "Operational Partner", weight: 4, date: "2025-04-01" },
    { source: "SUS-5921", target: "SUS-3302",         relation: "Uses as Lookout",     weight: 2, date: "2025-05-10" },
    { source: "SUS-5921", target: "SUS-0012",         relation: "Intel Sharing",       weight: 3, date: "2025-09-12" },
    { source: "SUS-7104", target: "FIR-2026-MY-1103", relation: "Primary Accused",    weight: 5, date: "2025-04-01" },
    { source: "SUS-7104", target: "SUS-3302",         relation: "Uses as Lookout",     weight: 2, date: "2025-05-15" },
    { source: "SUS-0012", target: "SUS-3302",         relation: "Coordination",        weight: 2, date: "2026-01-20" },

    // ── Cross-gang edges ────────────────────────────────────────────────────
    { source: "SUS-8842", target: "SUS-7104",         relation: "Cross-Gang Intel",    weight: 2, date: "2025-06-15" },
    { source: "SUS-2211", target: "SUS-5921",         relation: "Arms Supply to South", weight: 2, date: "2026-02-10" },
    { source: "SUS-9901", target: "SUS-0012",         relation: "Financial Conduit",   weight: 2, date: "2026-05-01" },
  ]
};

export const DEMO_TRAIL = {
  trail: [
    {
      hop: 1,
      camera_id: "CAM-BLR-0010",
      camera_name: "Vijayanagar TTMC CCTV",
      lat: 12.9651,
      lng: 77.5348,
      timestamp: "2026-07-18T14:22:10Z",
      plate_detected: "KA-01-MJ-8821",
      confidence: 98.4,
      sighting_type: "ANPR Sighting",
      distance_from_crime_km: 0.2
    },
    {
      hop: 2,
      camera_id: "CAM-BLR-0012",
      camera_name: "MG Road BATCS Signal Pole 5",
      lat: 12.9737,
      lng: 77.6138,
      timestamp: "2026-07-18T14:35:45Z",
      plate_detected: "KA-01-MJ-8821",
      confidence: 96.1,
      sighting_type: "ANPR Sighting",
      distance_from_crime_km: 3.4
    },
    {
      hop: 3,
      camera_id: "CAM-BLR-0015",
      camera_name: "Hebbal Flyover Dome 15",
      lat: 13.0064,
      lng: 77.5787,
      timestamp: "2026-07-18T14:52:00Z",
      plate_detected: "KA-01-MJ-8821",
      confidence: 92.8,
      sighting_type: "ANPR Sighting",
      distance_from_crime_km: 7.8
    },
    {
      hop: 4,
      camera_id: "CAM-BLR-0035",
      camera_name: "Silk Board Junction BTP Panning",
      lat: 12.9344,
      lng: 77.6123,
      timestamp: "2026-07-18T15:10:30Z",
      plate_detected: "KA-01-MJ-8821",
      confidence: 89.5,
      sighting_type: "Visual Sweep",
      distance_from_crime_km: 12.1
    }
  ],
  total_hops: 4,
  trail_status: "active",
  last_known_location: {
    lat: 12.9344,
    lng: 77.6123,
    camera_name: "Silk Board Junction BTP Panning"
  },
  total_distance_km: 12.1,
  duration_minutes: 48
};

export const DEMO_ANPR_RESULT = {
  alert: true,
  severity: "CRITICAL",
  plate_number: "KA-01-MJ-8821",
  status: "STOLEN_VEHICLE",
  vehicle_details: {
    make_model: "Bajaj Pulsar 220",
    color: "Black",
    owner_name: "Vikram Sharma"
  },
  fir_match: {
    case_number: "FIR-2026-BL-4921",
    police_station: "HSR Layout PS",
    date_filed: "2026-07-18"
  },
  last_sighting: {
    camera_name: "Vijayanagar TTMC CCTV",
    timestamp: "2026-07-18T14:22:10Z",
    confidence: 98.4
  }
};

export const DEMO_AI_INSIGHTS = [
  {
    insight: "Spike detected in late-night Pulsar motorbikes around Silk Board TTMC corridor. High probability of inter-state fence transport.",
    type: "alert",
    severity: "critical"
  },
  {
    insight: "Suspect Ramesh Kumar (SUS-8842) tracked moving North towards Hebbal Toll approach. Suggest dispatching patrol team.",
    type: "opportunity",
    severity: "high"
  },
  {
    insight: "Dark zone identified at Banaswadi Outer Ring service road — 70% crime underreporting estimated due to missing streetlamps.",
    type: "trend",
    severity: "medium"
  }
];

/**
 * Generate a contextually relevant AI response based on pattern matching user input against DEMO datasets.
 * @param {string} userQuestion 
 * @returns {{ answer: string, source: string, confidence: number }}
 */
export function generateAIResponseFromDemoData(userQuestion = '') {
  const q = userQuestion.toLowerCase().trim();
  const allFirs = DEMO_FIRS.firs || [];
  const allSuspects = DEMO_REPEAT_OFFENDERS.suspects || [];

  // 1. Specific Case Number Check
  const caseMatch = userQuestion.match(/(KAR\/[A-Z0-9]+\/\d+\/\d+|FIR-\d{4}-[A-Z0-9]+-\d+)/i);
  if (caseMatch) {
    const f = allFirs.find(item => item.case_number.toUpperCase().includes(caseMatch[0].toUpperCase()));
    if (f) {
      return {
        answer: `### CCTNS Case Record: ${f.case_number}\n\n- **Crime Category:** ${f.crime_type}\n- **Police Station:** ${f.police_station} (${f.district_name})\n- **Date Filed:** ${f.date_filed}\n- **Accused/Suspect:** ${f.accused_name} (Risk Score: ${f.risk_score}/100)\n- **Status:** ${f.status.toUpperCase()}\n\n**Description:**\n_${f.description}_\n\n*Directives:* Evidence docket active. Checkpoint alert active across ${f.police_station} limits.`,
        source: 'drishti_ai',
        confidence: 0.95
      };
    }
  }

  // 2. Specific Person / Suspect Check
  const suspect = allSuspects.find(s => q.includes(s.name.toLowerCase()) || (s.alias && q.includes(s.alias.toLowerCase())));
  if (suspect) {
    return {
      answer: `### Target Offender Dossier: **${suspect.name}** ("${suspect.alias || 'Suspect'}")\n\n- **Risk Score:** **${suspect.risk_score}/100**\n- **Primary Modus Operandi:** ${suspect.primary_modus_operandi || 'Vehicle Theft & Organized Extortion'}\n- **Last Known Location:** ${suspect.last_known_location || 'Bengaluru Corridor'}\n- **Status:** ${suspect.status || 'Active Watchlist'}\n- **Known Hangouts:** ${(suspect.known_hangouts || []).join(', ') || 'Bengaluru Urban'}\n\n*Tactical Directive:* Monitor ANPR cameras and maintain active checkpoint surveillance.`,
      source: 'drishti_ai',
      confidence: 0.95
    };
  }

  // 3. Specific District Filter
  const districts = ['Bengaluru', 'Kalaburagi', 'Raichur', 'Chikkamagaluru', 'Tumakuru', 'Udupi', 'Hassan', 'Vijayapura', 'Koppal', 'Bidar', 'Davangere', 'Mysuru'];
  const matchedDist = districts.find(d => q.includes(d.toLowerCase()));
  if (matchedDist) {
    const distFirs = allFirs.filter(f => (f.district_name || '').toLowerCase().includes(matchedDist.toLowerCase()));
    const caseList = distFirs.slice(0, 4).map(f => `• **${f.case_number}** (${f.crime_type}): ${f.description} [Status: ${f.status.toUpperCase()}]`).join('\n');
    return {
      answer: `### Active Intelligence for **${matchedDist} District** (${distFirs.length} total cases indexed):\n\n${caseList || 'No active high-risk alerts in this sector.'}\n\n*Recommendation:* All precinct patrol units have been synchronized with the state CCTNS grid.`,
      source: 'drishti_ai',
      confidence: 0.90
    };
  }

  // 4. Specific Crime Filter
  const crimeTypes = [
    { key: 'theft', label: 'Vehicle Theft' },
    { key: 'hit and run', label: 'Hit And Run' },
    { key: 'burglary', label: 'Burglary' },
    { key: 'senior citizen', label: 'Senior Citizen Crime' },
    { key: 'domestic', label: 'Domestic Violence' },
    { key: 'drug', label: 'Drug Offence' },
    { key: 'cyber', label: 'Cybercrime' },
    { key: 'fraud', label: 'Fraud' },
    { key: 'assault', label: 'Assault' },
    { key: 'robbery', label: 'Robbery' }
  ];
  const matchedCrime = crimeTypes.find(c => q.includes(c.key));
  if (matchedCrime) {
    const filtered = allFirs.filter(f => (f.crime_type_code || '').toLowerCase().includes(matchedCrime.key) || (f.crime_type || '').toLowerCase().includes(matchedCrime.key));
    const caseList = filtered.slice(0, 4).map(f => `• **${f.case_number}** (${f.police_station}): ${f.description} [Accused: ${f.accused_name || 'Under Investigation'}]`).join('\n');
    return {
      answer: `### ${matchedCrime.label} Incident Registry (${filtered.length} total cases):\n\n${caseList}\n\n*Tactical Standard:* Follow statutory investigation protocol and preserve digital CCTV evidence.`,
      source: 'drishti_ai',
      confidence: 0.90
    };
  }

  // 5. Vehicle / ANPR Check
  if (q.includes('anpr') || q.includes('plate') || q.includes('stolen') || q.includes('ka-')) {
    const res = DEMO_ANPR_RESULT;
    return {
      answer: `🚨 **ANPR ALERT: ${res.status} DETECTED**\n\n• **Target Plate**: ${res.plate_number}\n• **Vehicle**: ${res.vehicle_details.make_model} (${res.vehicle_details.color})\n• **Matched FIR**: ${res.fir_match.case_number} (${res.fir_match.police_station})\n• **Last CCTV Sighting**: ${res.last_sighting.camera_name} (Confidence: ${res.last_sighting.confidence}%)\n\nAutomated intercept alert broadcasted to nearby patrol units.`,
      source: 'drishti_ai',
      confidence: 0.95
    };
  }

  // 6. General Intelligent Fallback
  return {
    answer: `Sir, DRISHTI AI has analyzed the state CCTNS datastore for "${userQuestion}".\n\n- **Active Synchronization:** ${allFirs.length} live FIRs and ${allSuspects.length} high-risk dossiers indexed across Karnataka.\n- **ANPR Surveillance Grid:** 450+ high-definition cameras active.\n\nYou can query any specific case number (e.g. \`KAR/BEN/2024/0747\`), suspect name (e.g. \`Ramesh Kumar\`), vehicle plate, or district (e.g. \`Kalaburagi\`).`,
    source: 'drishti_ai',
    confidence: 0.85
  };
}

