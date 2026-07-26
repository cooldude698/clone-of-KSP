import { UPLOADED_FIRS, UPLOADED_SUSPECTS } from './uploadedFirsStore';

const STATIC_FIRS = [
  { case_number: "KAR/KAL/2024/0330", date_filed: "2024-06-01", time_filed: "13:09:00", crime_type_code: "hit_and_run", crime_type: "Hit And Run", description: "Speeding vehicle collided with two-wheeler near Murty Circle, Kalaburagi.", status: "open", case_status: "open", district_name: "Kalaburagi", police_station: "Kalaburagi Rural PS", location_name: "Near Murty Circle, Kalaburagi", investigation_office: "Insp. Lohit Lall", accused_name: "Vikram Singh", risk_score: 88 },
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
    return [...UPLOADED_FIRS, ...STATIC_FIRS];
  },
  get total_count() {
    return UPLOADED_FIRS.length + STATIC_FIRS.length;
  }
};

export const DEMO_HOTSPOTS = {
  hotspots: [
    {
      area_name: "Silk Board Junction Corridor",
      district: "Bengaluru Urban",
      crime_count: 48,
      severity_score: 9.5,
      risk_level: "critical",
      primary_crime: "Vehicle Theft & Extortion",
      lat: 12.9175,
      lng: 77.6215
    },
    {
      area_name: "MG Road Signal Approach",
      district: "Bengaluru Urban",
      crime_count: 32,
      severity_score: 8.2,
      risk_level: "high",
      primary_crime: "Armed Robbery & Snatching",
      lat: 12.9762,
      lng: 77.6033
    },
    {
      area_name: "Mysuru Palace West Gate",
      district: "Mysuru",
      crime_count: 24,
      severity_score: 7.1,
      risk_level: "high",
      primary_crime: "Tourist Pickpocketing",
      lat: 12.3051,
      lng: 76.6551
    },
    {
      area_name: "Hubballi Old Town Railway Approach",
      district: "Hubballi-Dharwad",
      crime_count: 18,
      severity_score: 5.8,
      risk_level: "medium",
      primary_crime: "Commercial Burglary",
      lat: 15.3647,
      lng: 75.1240
    },
    {
      area_name: "Mangaluru Port Container Yard",
      district: "Mangaluru",
      crime_count: 12,
      severity_score: 4.2,
      risk_level: "medium",
      primary_crime: "Cargo Pilferage",
      lat: 12.9141,
      lng: 74.8560
    }
  ]
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
      associated_firs: ['FIR-2026-BL-4921', 'FIR-2026-BL-1104', 'FIR-2025-MY-892'],
      known_hangouts: ['Silk Board TTMC', 'Hosur Border Checkpost', 'Yelahanka Auto Market'],
      known_associates: ['Suresh Naidu (SUS-7104)', 'Deepak Shetty (SUS-4401)', 'Manoj Reddy (SUS-1190)'],
      ipc_sections: ['IPC §379', 'IPC §34', 'IPC §411', 'IPC §120B'],
      anpr_hits: 7,
      camera_sightings: ['CAM-BLR-0010', 'CAM-BLR-0012', 'CAM-BLR-0015'],
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
    { id: "SUS-8842", label: "Ramesh Kumar", type: "suspect", risk: 94, role: "Gang Leader", crime: "vehicle_theft", district: "South Bengaluru" },
    { id: "SUS-7104", label: "Suresh Naidu", type: "suspect", risk: 88, role: "Co-Accused", crime: "robbery", district: "Mysuru" },
    { id: "SUS-5921", label: "Imran Khan", type: "suspect", risk: 76, role: "Snatcher", crime: "chain_snatching", district: "Whitefield" },
    { id: "SUS-4401", label: "Deepak Shetty", type: "suspect", risk: 71, role: "Vehicle Fence", crime: "vehicle_theft", district: "Yelahanka" },
    { id: "SUS-3302", label: "Arun Gowda", type: "suspect", risk: 65, role: "Lookout", crime: "robbery", district: "Tumkur" },
    { id: "SUS-2211", label: "Farid Mirza", type: "suspect", risk: 82, role: "Weapons Source", crime: "assault", district: "Central Bengaluru" },
    { id: "SUS-1190", label: "Manoj Reddy", type: "suspect", risk: 59, role: "Driver", crime: "vehicle_theft", district: "Electronic City" },
    { id: "FIR-2026-BL-4921", label: "FIR-4921\nVehicle Theft", type: "fir", crime: "vehicle_theft" },
    { id: "FIR-2026-MY-1103", label: "FIR-1103\nArmed Robbery", type: "fir", crime: "robbery" },
    { id: "FIR-2026-BL-4920", label: "FIR-4920\nChain Snatching", type: "fir", crime: "chain_snatching" },
    { id: "FIR-2026-BL-5001", label: "FIR-5001\nAssault", type: "fir", crime: "assault" },
    { id: "FIR-2026-YL-0234", label: "FIR-0234\nStolen Parts", type: "fir", crime: "vehicle_theft" },
  ],
  edges: [
    { source: "SUS-8842", target: "FIR-2026-BL-4921", relation: "Primary Accused", weight: 5 },
    { source: "SUS-8842", target: "SUS-7104", relation: "Gang Associate", weight: 4 },
    { source: "SUS-8842", target: "SUS-4401", relation: "Sells stolen vehicles to", weight: 3 },
    { source: "SUS-8842", target: "SUS-2211", relation: "Procures weapons from", weight: 4 },
    { source: "SUS-7104", target: "FIR-2026-MY-1103", relation: "Primary Accused", weight: 5 },
    { source: "SUS-7104", target: "SUS-5921", relation: "Operational Partner", weight: 4 },
    { source: "SUS-7104", target: "SUS-3302", relation: "Uses as Lookout", weight: 2 },
    { source: "SUS-5921", target: "FIR-2026-BL-4920", relation: "Primary Accused", weight: 5 },
    { source: "SUS-5921", target: "SUS-1190", relation: "Getaway Driver", weight: 3 },
    { source: "SUS-4401", target: "FIR-2026-YL-0234", relation: "Receiver of Stolen Goods", weight: 4 },
    { source: "SUS-2211", target: "FIR-2026-BL-5001", relation: "Co-Accused", weight: 3 },
    { source: "SUS-3302", target: "FIR-2026-MY-1103", relation: "Accessory", weight: 2 },
    { source: "SUS-1190", target: "FIR-2026-BL-4921", relation: "Accessory (Driver)", weight: 2 },
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

  // Pattern 1: Hotspots / Top Crimes / High Risk Areas
  if (q.includes('hotspot') || q.includes('top crime') || q.includes('high risk area') || q.includes('where is crime')) {
    const topHotspots = DEMO_HOTSPOTS.hotspots.slice(0, 3).map((h, i) => 
      `${i + 1}) **${h.area_name}** (${h.district}) — ${h.crime_count} incidents logged (Severity Score: ${h.severity_score}/10). Primary offense: ${h.primary_crime}.`
    ).join('\n');
    return {
      answer: `Based on active DRISHTI analytics, here are the primary crime hotspots across Karnataka:\n\n${topHotspots}\n\n*Recommendation*: Increase beat patrol frequency along the Silk Board & MG Road corridors.`,
      source: 'demo_ai',
      confidence: 0.88
    };
  }

  // Pattern 2: Specific Location / District (Silk Board, MG Road, Bengaluru, Mysuru, Hubballi)
  if (q.includes('silk board') || q.includes('mg road') || q.includes('bengaluru') || q.includes('mysuru') || q.includes('district')) {
    const matchingCases = DEMO_FIRS.firs.filter(f => 
      q.includes(f.district_name.toLowerCase()) || 
      q.includes(f.location_name.toLowerCase()) || 
      q.includes('bengaluru')
    ).slice(0, 3);

    const caseList = (matchingCases.length > 0 ? matchingCases : DEMO_FIRS.firs.slice(0, 3)).map(f => 
      `• **${f.case_number}** (${f.crime_type}): ${f.description} [Status: ${f.status.toUpperCase()}]`
    ).join('\n');

    return {
      answer: `Here are the active cases recorded for the requested sector:\n\n${caseList}\n\nAll units in the sector have been alerted to watch for suspicious vehicle activity.`,
      source: 'demo_ai',
      confidence: 0.85
    };
  }

  // Pattern 3: Repeat Offenders / High-Risk Suspects
  if (q.includes('suspect') || q.includes('offender') || q.includes('repeat') || q.includes('criminal') || q.includes('gang')) {
    const suspectList = DEMO_REPEAT_OFFENDERS.suspects.map((s, i) => 
      `${i + 1}) **${s.name}** ("${s.alias}") — Risk Score: **${s.risk_score}/100**\n   • Modus Operandi: ${s.primary_modus_operandi}\n   • Known Hangouts: ${s.known_hangouts.join(', ')}\n   • Status: ${s.status}`
    ).join('\n\n');

    return {
      answer: `DRISHTI Repeat Offender Matrix identifies **${DEMO_REPEAT_OFFENDERS.high_risk_count} high-risk targets**. Top active suspects:\n\n${suspectList}`,
      source: 'demo_ai',
      confidence: 0.90
    };
  }

  // Pattern 4: Trends / Analytics / Monthly Patterns
  if (q.includes('trend') || q.includes('analytic') || q.includes('pattern') || q.includes('monthly') || q.includes('spike')) {
    return {
      answer: `**Crime Trend Analysis (12-Month Window)**:\n\n• **Overall Direction**: ${DEMO_TRENDS.overall_trend.toUpperCase()}\n• **Average Per Period**: ${DEMO_TRENDS.average_per_period} incidents/month\n• **Recent Peak**: July 2026 recorded 312 FIRs.\n\n*Key Seasonal Insight*: ${DEMO_TRENDS.seasonal_insight}`,
      source: 'demo_ai',
      confidence: 0.86
    };
  }

  // Pattern 5: ANPR / Plate Search / Stolen Vehicles
  if (q.includes('anpr') || q.includes('plate') || q.includes('stolen') || q.includes('vehicle') || q.includes('ka-')) {
    const res = DEMO_ANPR_RESULT;
    return {
      answer: `🚨 **ANPR ALERT: ${res.status} DETECTED**\n\n• **Target Plate**: ${res.plate_number}\n• **Vehicle**: ${res.vehicle_details.make_model} (${res.vehicle_details.color})\n• **Matched FIR**: ${res.fir_match.case_number} (${res.fir_match.police_station})\n• **Last CCTV Sighting**: ${res.last_sighting.camera_name} (Confidence: ${res.last_sighting.confidence}%)\n\nAutomated intercept alert broadcasted to nearby patrol units.`,
      source: 'demo_ai',
      confidence: 0.95
    };
  }

  // Pattern 6: Geo Trail / Sightings / Cameras
  if (q.includes('trail') || q.includes('sighting') || q.includes('camera') || q.includes('movement') || q.includes('route')) {
    const trailHops = DEMO_TRAIL.trail.map(h => 
      `• **Hop ${h.hop}** (${h.timestamp.split('T')[1].slice(0,8)}): ${h.camera_name} — Distance from crime: ${h.distance_from_crime_km}km [${h.sighting_type}]`
    ).join('\n');

    return {
      answer: `**Vehicle Geo-Trail Timeline for KA-01-MJ-8821**:\n\n${trailHops}\n\n**Total Distance**: ${DEMO_TRAIL.total_distance_km}km across ${DEMO_TRAIL.total_hops} camera checkpoints. Last known location: ${DEMO_TRAIL.last_known_location.camera_name}.`,
      source: 'demo_ai',
      confidence: 0.92
    };
  }

  // Fallback for general or unrecognized questions
  const insightsSummary = DEMO_AI_INSIGHTS.map(i => `• [${i.severity.toUpperCase()}] ${i.insight}`).join('\n');
  return {
    answer: `Based on active DRISHTI intelligence, here is the current operational brief:\n\n${insightsSummary}\n\nFeel free to ask me about specific **hotspots**, **FIR records**, **suspect profiles**, **ANPR vehicle lookups**, or **geo-trails**.`,
    source: 'demo_ai',
    confidence: 0.75
  };
}

