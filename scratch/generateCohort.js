const fs = require('fs');
const path = require('path');

const INSTITUTION_ID = '11111111-0000-0000-0000-000000000001';

const BRANCH_CONFIG = [
  {
    code: 'ISE',
    name: 'Information Science & Engineering',
    deptId: '22222222-0000-0000-0000-000000000001',
    skills: ['Python', 'SQL', 'React.js', 'Node.js', 'Git & GitHub', 'Data Structures'],
    students: [
      { name: 'Preethika', usn: 'NNM24IS174', email: 'preethika@nmamit.in', cgpa: 8.75, backlogs: 0 },
      { name: 'Prajwala Vasudev Gouda', usn: 'NNM24IS156', email: 'prajwala.vg@nmamit.in', cgpa: 8.60, backlogs: 0 },
      { name: 'Pranav R', usn: 'NNM24IS159', email: 'pranav.r@nmamit.in', cgpa: 8.45, backlogs: 0 },
      { name: 'Prathwik Shetty', usn: 'NNM24IS171', email: 'prathwik.shetty@nmamit.in', cgpa: 8.20, backlogs: 0 },
      { name: 'Ravi Kumar', usn: 'NNM24IS082', email: 'ravi.kumar@nmamit.in', cgpa: 6.80, backlogs: 0 },
      { name: 'Vikram Hegde', usn: 'NNM24IS110', email: 'vikram.hegde@nmamit.in', cgpa: 6.95, backlogs: 0 },
      { name: 'Karthik Shenoy', usn: 'NNM24IS045', email: 'karthik.shenoy@nmamit.in', cgpa: 7.65, backlogs: 0 },
      { name: 'Deepika Kamath', usn: 'NNM24IS033', email: 'deepika.kamath@nmamit.in', cgpa: 9.15, backlogs: 0 },
    ],
  },
  {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    deptId: '22222222-0000-0000-0000-000000000002',
    skills: ['C++', 'Python', 'Algorithms', 'Docker', 'SQL', 'Kubernetes'],
    students: [
      { name: 'Ananya Rao', usn: 'NNM24CS012', email: 'ananya.rao@nmamit.in', cgpa: 8.92, backlogs: 0 },
      { name: 'Chinmay Prabhu', usn: 'NNM24CS023', email: 'chinmay.prabhu@nmamit.in', cgpa: 8.10, backlogs: 0 },
      { name: 'Disha Shetty', usn: 'NNM24CS041', email: 'disha.shetty@nmamit.in', cgpa: 7.85, backlogs: 0 },
      { name: 'Gautam Hegde', usn: 'NNM24CS058', email: 'gautam.hegde@nmamit.in', cgpa: 7.20, backlogs: 1 },
      { name: 'Ishita Kamath', usn: 'NNM24CS069', email: 'ishita.kamath@nmamit.in', cgpa: 9.35, backlogs: 0 },
      { name: 'Jatin Rao', usn: 'NNM24CS084', email: 'jatin.rao@nmamit.in', cgpa: 6.70, backlogs: 0 },
      { name: 'Krithi Shenoy', usn: 'NNM24CS095', email: 'krithi.shenoy@nmamit.in', cgpa: 8.40, backlogs: 0 },
      { name: 'Lokesh Pai', usn: 'NNM24CS112', email: 'lokesh.pai@nmamit.in', cgpa: 7.90, backlogs: 0 },
    ],
  },
  {
    code: 'AIML',
    name: 'Artificial Intelligence & Machine Learning',
    deptId: '22222222-0000-0000-0000-000000000003',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'Data Analysis', 'NLP', 'Computer Vision'],
    students: [
      { name: 'Sneha Bhat', usn: 'NNM24AI088', email: 'sneha.bhat@nmamit.in', cgpa: 7.40, backlogs: 1 },
      { name: 'Ayush Hegde', usn: 'NNM24AI015', email: 'ayush.hegde@nmamit.in', cgpa: 8.85, backlogs: 0 },
      { name: 'Meera Shenoy', usn: 'NNM24AI027', email: 'meera.shenoy@nmamit.in', cgpa: 8.30, backlogs: 0 },
      { name: 'Rahul Kamath', usn: 'NNM24AI039', email: 'rahul.kamath@nmamit.in', cgpa: 7.15, backlogs: 0 },
      { name: 'Ananya K', usn: 'NNM24AI051', email: 'ananya.k@nmamit.in', cgpa: 9.05, backlogs: 0 },
      { name: 'Sandeep Rao', usn: 'NNM24AI064', email: 'sandeep.rao@nmamit.in', cgpa: 6.85, backlogs: 0 },
      { name: 'Pooja Nayak', usn: 'NNM24AI076', email: 'pooja.nayak@nmamit.in', cgpa: 8.50, backlogs: 0 },
      { name: 'Vignesh Pai', usn: 'NNM24AI092', email: 'vignesh.pai@nmamit.in', cgpa: 7.75, backlogs: 0 },
    ],
  },
  {
    code: 'AIDS',
    name: 'Artificial Intelligence & Data Science',
    deptId: '22222222-0000-0000-0000-000000000004',
    skills: ['Python', 'Pandas', 'SQL', 'Tableau', 'Scikit-Learn', 'BigQuery'],
    students: [
      { name: 'Aditya Bhat', usn: 'NNM24AD011', email: 'aditya.bhat@nmamit.in', cgpa: 8.65, backlogs: 0 },
      { name: 'Bhavana Shetty', usn: 'NNM24AD024', email: 'bhavana.shetty@nmamit.in', cgpa: 7.95, backlogs: 0 },
      { name: 'Darshan Hegde', usn: 'NNM24AD037', email: 'darshan.hegde@nmamit.in', cgpa: 8.20, backlogs: 0 },
      { name: 'Gayatri Kamath', usn: 'NNM24AD049', email: 'gayatri.kamath@nmamit.in', cgpa: 9.10, backlogs: 0 },
      { name: 'Harsha Shenoy', usn: 'NNM24AD062', email: 'harsha.shenoy@nmamit.in', cgpa: 6.75, backlogs: 0 },
      { name: 'Kavita Rao', usn: 'NNM24AD075', email: 'kavita.rao@nmamit.in', cgpa: 7.45, backlogs: 0 },
      { name: 'Manish Prabhu', usn: 'NNM24AD088', email: 'manish.prabhu@nmamit.in', cgpa: 8.80, backlogs: 0 },
      { name: 'Neha Nayak', usn: 'NNM24AD099', email: 'neha.nayak@nmamit.in', cgpa: 7.30, backlogs: 0 },
    ],
  },
  {
    code: 'CSCY',
    name: 'Computer Science & Engineering (Cyber Security)',
    deptId: '22222222-0000-0000-0000-000000000005',
    skills: ['Network Security', 'Cryptography', 'Python', 'Wireshark', 'Linux Security', 'Ethical Hacking'],
    students: [
      { name: 'Akash Poojary', usn: 'NNM24CY010', email: 'akash.poojary@nmamit.in', cgpa: 8.40, backlogs: 0 },
      { name: 'Chaitra Kamath', usn: 'NNM24CY023', email: 'chaitra.kamath@nmamit.in', cgpa: 7.60, backlogs: 0 },
      { name: 'Deepak Shenoy', usn: 'NNM24CY036', email: 'deepak.shenoy@nmamit.in', cgpa: 8.95, backlogs: 0 },
      { name: 'Girish Hegde', usn: 'NNM24CY048', email: 'girish.hegde@nmamit.in', cgpa: 6.90, backlogs: 0 },
      { name: 'Hitha Shetty', usn: 'NNM24CY061', email: 'hitha.shetty@nmamit.in', cgpa: 8.15, backlogs: 0 },
      { name: 'Kiran Rao', usn: 'NNM24CY074', email: 'kiran.rao@nmamit.in', cgpa: 7.80, backlogs: 0 },
      { name: 'Mithun Nayak', usn: 'NNM24CY087', email: 'mithun.nayak@nmamit.in', cgpa: 9.05, backlogs: 0 },
      { name: 'Prathiksha Bhat', usn: 'NNM24CY099', email: 'prathiksha.bhat@nmamit.in', cgpa: 7.25, backlogs: 1 },
    ],
  },
  {
    code: 'CSFSD',
    name: 'Computer Science (Full Stack Development)',
    deptId: '22222222-0000-0000-0000-000000000006',
    skills: ['React.js', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    students: [
      { name: 'Ankit Shenoy', usn: 'NNM24FS012', email: 'ankit.shenoy@nmamit.in', cgpa: 8.70, backlogs: 0 },
      { name: 'Bhavyashree K', usn: 'NNM24FS025', email: 'bhavya.k@nmamit.in', cgpa: 7.90, backlogs: 0 },
      { name: 'Chetan Prabhu', usn: 'NNM24FS038', email: 'chetan.prabhu@nmamit.in', cgpa: 8.35, backlogs: 0 },
      { name: 'Divya Hegde', usn: 'NNM24FS050', email: 'divya.hegde@nmamit.in', cgpa: 9.20, backlogs: 0 },
      { name: 'Harsha Kumar', usn: 'NNM24FS063', email: 'harsha.kumar@nmamit.in', cgpa: 6.85, backlogs: 0 },
      { name: 'Keerthi Kamath', usn: 'NNM24FS076', email: 'keerthi.kamath@nmamit.in', cgpa: 7.50, backlogs: 0 },
      { name: 'Naveen Rao', usn: 'NNM24FS089', email: 'naveen.rao@nmamit.in', cgpa: 8.60, backlogs: 0 },
      { name: 'Pallavi Shetty', usn: 'NNM24FS099', email: 'pallavi.shetty@nmamit.in', cgpa: 8.05, backlogs: 0 },
    ],
  },
  {
    code: 'CCE',
    name: 'Computer & Communication Engineering',
    deptId: '22222222-0000-0000-0000-000000000007',
    skills: ['Computer Networks', 'Wireless Comm', 'C++', 'Python', 'TCP/IP', 'Linux'],
    students: [
      { name: 'Abhinav Bhat', usn: 'NNM24CC014', email: 'abhinav.bhat@nmamit.in', cgpa: 8.55, backlogs: 0 },
      { name: 'Chaithra Rao', usn: 'NNM24CC027', email: 'chaithra.rao@nmamit.in', cgpa: 7.75, backlogs: 0 },
      { name: 'Dhanush Shenoy', usn: 'NNM24CC040', email: 'dhanush.shenoy@nmamit.in', cgpa: 8.10, backlogs: 0 },
      { name: 'Ishani Hegde', usn: 'NNM24CC052', email: 'ishani.hegde@nmamit.in', cgpa: 9.00, backlogs: 0 },
      { name: 'Karthik Poojary', usn: 'NNM24CC065', email: 'karthik.p@nmamit.in', cgpa: 6.95, backlogs: 0 },
      { name: 'Meghana Nayak', usn: 'NNM24CC078', email: 'meghana.nayak@nmamit.in', cgpa: 8.30, backlogs: 0 },
      { name: 'Prashanth Kamath', usn: 'NNM24CC090', email: 'prashanth.k@nmamit.in', cgpa: 7.40, backlogs: 1 },
      { name: 'Rakshitha Shetty', usn: 'NNM24CC099', email: 'rakshitha.shetty@nmamit.in', cgpa: 8.65, backlogs: 0 },
    ],
  },
  {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    deptId: '22222222-0000-0000-0000-000000000008',
    skills: ['Embedded C', 'MATLAB', 'VLSI Basics', 'Signal Processing', 'ARM Cortex', 'IoT'],
    students: [
      { name: 'Adarsh Shetty', usn: 'NNM24EC015', email: 'adarsh.shetty@nmamit.in', cgpa: 8.80, backlogs: 0 },
      { name: 'Bhoomika Rao', usn: 'NNM24EC028', email: 'bhoomika.rao@nmamit.in', cgpa: 7.55, backlogs: 0 },
      { name: 'Chirag Kamath', usn: 'NNM24EC041', email: 'chirag.kamath@nmamit.in', cgpa: 8.25, backlogs: 0 },
      { name: 'Deepa Shenoy', usn: 'NNM24EC054', email: 'deepa.shenoy@nmamit.in', cgpa: 9.15, backlogs: 0 },
      { name: 'Ganesh Hegde', usn: 'NNM24EC067', email: 'ganesh.hegde@nmamit.in', cgpa: 6.70, backlogs: 0 },
      { name: 'Harshitha Nayak', usn: 'NNM24EC080', email: 'harshitha.n@nmamit.in', cgpa: 7.85, backlogs: 0 },
      { name: 'Kishore Prabhu', usn: 'NNM24EC092', email: 'kishore.prabhu@nmamit.in', cgpa: 8.45, backlogs: 0 },
      { name: 'Lavanya Poojary', usn: 'NNM24EC099', email: 'lavanya.p@nmamit.in', cgpa: 7.10, backlogs: 0 },
    ],
  },
  {
    code: 'VLSI',
    name: 'Electronics Engineering (VLSI Design & Technology)',
    deptId: '22222222-0000-0000-0000-000000000009',
    skills: ['Verilog HDL', 'Cadence Virtuoso', 'FPGA Prototyping', 'Static Timing Analysis', 'CMOS Design'],
    students: [
      { name: 'Abhishek Nayak', usn: 'NNM24VL011', email: 'abhishek.nayak@nmamit.in', cgpa: 8.90, backlogs: 0 },
      { name: 'Bindu Shenoy', usn: 'NNM24VL023', email: 'bindu.shenoy@nmamit.in', cgpa: 7.80, backlogs: 0 },
      { name: 'Charan Hegde', usn: 'NNM24VL036', email: 'charan.hegde@nmamit.in', cgpa: 8.50, backlogs: 0 },
      { name: 'Deeksha Kamath', usn: 'NNM24VL049', email: 'deeksha.kamath@nmamit.in', cgpa: 9.40, backlogs: 0 },
      { name: 'Guruprasad Rao', usn: 'NNM24VL062', email: 'guruprasad.rao@nmamit.in', cgpa: 6.80, backlogs: 0 },
      { name: 'Jyothi Shetty', usn: 'NNM24VL075', email: 'jyothi.shetty@nmamit.in', cgpa: 7.65, backlogs: 0 },
      { name: 'Kiran Poojary', usn: 'NNM24VL088', email: 'kiran.poojary@nmamit.in', cgpa: 8.15, backlogs: 0 },
      { name: 'Manasa Prabhu', usn: 'NNM24VL099', email: 'manasa.prabhu@nmamit.in', cgpa: 7.35, backlogs: 1 },
    ],
  },
  {
    code: 'ACT',
    name: 'ECE (Advanced Communication Technology)',
    deptId: '22222222-0000-0000-0000-000000000010',
    skills: ['5G / 6G Systems', 'RF Engineering', 'Antenna Design', 'Optical Comm', 'SDR', 'MATLAB Comm'],
    students: [
      { name: 'Ajay Shenoy', usn: 'NNM24AC012', email: 'ajay.shenoy@nmamit.in', cgpa: 8.60, backlogs: 0 },
      { name: 'Bhavya Hegde', usn: 'NNM24AC025', email: 'bhavya.hegde@nmamit.in', cgpa: 7.45, backlogs: 0 },
      { name: 'Chetan Rao', usn: 'NNM24AC038', email: 'chetan.r@nmamit.in', cgpa: 8.30, backlogs: 0 },
      { name: 'Divyashree Kamath', usn: 'NNM24AC051', email: 'divyashree.k@nmamit.in', cgpa: 9.05, backlogs: 0 },
      { name: 'Hemanth Nayak', usn: 'NNM24AC064', email: 'hemanth.nayak@nmamit.in', cgpa: 6.90, backlogs: 0 },
      { name: 'Kavitha Shetty', usn: 'NNM24AC077', email: 'kavitha.shetty@nmamit.in', cgpa: 7.70, backlogs: 0 },
      { name: 'Nikhil Poojary', usn: 'NNM24AC089', email: 'nikhil.poojary@nmamit.in', cgpa: 8.75, backlogs: 0 },
      { name: 'Prerna Prabhu', usn: 'NNM24AC099', email: 'prerna.prabhu@nmamit.in', cgpa: 7.20, backlogs: 0 },
    ],
  },
  {
    code: 'EEE',
    name: 'Electrical & Electronics Engineering',
    deptId: '22222222-0000-0000-0000-000000000011',
    skills: ['Power Systems', 'PLC & SCADA', 'MATLAB Simulink', 'Power Electronics', 'Electric Vehicles', 'Embedded C'],
    students: [
      { name: 'Ashok Kumar', usn: 'NNM24EE013', email: 'ashok.kumar@nmamit.in', cgpa: 8.45, backlogs: 0 },
      { name: 'Deepika Rao', usn: 'NNM24EE026', email: 'deepika.rao@nmamit.in', cgpa: 7.90, backlogs: 0 },
      { name: 'Gautam Shenoy', usn: 'NNM24EE039', email: 'gautam.shenoy@nmamit.in', cgpa: 8.15, backlogs: 0 },
      { name: 'Harini Hegde', usn: 'NNM24EE052', email: 'harini.hegde@nmamit.in', cgpa: 8.95, backlogs: 0 },
      { name: 'Jagadish Kamath', usn: 'NNM24EE065', email: 'jagadish.k@nmamit.in', cgpa: 6.85, backlogs: 0 },
      { name: 'Kavya Poojary', usn: 'NNM24EE078', email: 'kavya.poojary@nmamit.in', cgpa: 7.55, backlogs: 0 },
      { name: 'Mahesh Nayak', usn: 'NNM24EE091', email: 'mahesh.nayak@nmamit.in', cgpa: 8.65, backlogs: 0 },
      { name: 'Pavitra Shetty', usn: 'NNM24EE099', email: 'pavitra.shetty@nmamit.in', cgpa: 7.30, backlogs: 1 },
    ],
  },
  {
    code: 'RAI',
    name: 'Robotics & Artificial Intelligence Engineering',
    deptId: '22222222-0000-0000-0000-000000000012',
    skills: ['ROS 2', 'Robot Kinematics', 'Computer Vision', 'Python', 'C++', 'SLAM Algorithms'],
    students: [
      { name: 'Manish Hegde', usn: 'NNM24RI015', email: 'manish.hegde@nmamit.in', cgpa: 8.75, backlogs: 0 },
      { name: 'Ankita Rao', usn: 'NNM24RI027', email: 'ankita.rao@nmamit.in', cgpa: 7.80, backlogs: 0 },
      { name: 'Darshan Kamath', usn: 'NNM24RI040', email: 'darshan.kamath@nmamit.in', cgpa: 8.40, backlogs: 0 },
      { name: 'Hamsika Shenoy', usn: 'NNM24RI053', email: 'hamsika.shenoy@nmamit.in', cgpa: 9.25, backlogs: 0 },
      { name: 'Ishan Prabhu', usn: 'NNM24RI066', email: 'ishan.prabhu@nmamit.in', cgpa: 7.00, backlogs: 0 },
      { name: 'Kiran Nayak', usn: 'NNM24RI079', email: 'kiran.nayak@nmamit.in', cgpa: 8.10, backlogs: 0 },
      { name: 'Pooja Poojary', usn: 'NNM24RI091', email: 'pooja.poojary@nmamit.in', cgpa: 8.90, backlogs: 0 },
      { name: 'Suhas Shetty', usn: 'NNM24RI099', email: 'suhas.shetty@nmamit.in', cgpa: 7.15, backlogs: 0 },
    ],
  },
  {
    code: 'MECH',
    name: 'Mechanical Engineering',
    deptId: '22222222-0000-0000-0000-000000000013',
    skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Thermodynamics', 'Manufacturing', 'Python for Engg'],
    students: [
      { name: 'Ajay Poojary', usn: 'NNM24ME014', email: 'ajay.poojary@nmamit.in', cgpa: 8.20, backlogs: 0 },
      { name: 'Bindu Shetty', usn: 'NNM24ME026', email: 'bindu.shetty@nmamit.in', cgpa: 7.45, backlogs: 0 },
      { name: 'Chetan Hegde', usn: 'NNM24ME039', email: 'chetan.hegde@nmamit.in', cgpa: 8.65, backlogs: 0 },
      { name: 'Deepak Nayak', usn: 'NNM24ME051', email: 'deepak.nayak@nmamit.in', cgpa: 6.75, backlogs: 0 },
      { name: 'Eashan Shenoy', usn: 'NNM24ME064', email: 'eashan.shenoy@nmamit.in', cgpa: 9.10, backlogs: 0 },
      { name: 'Farhan Ali', usn: 'NNM24ME076', email: 'farhan.ali@nmamit.in', cgpa: 7.80, backlogs: 0 },
      { name: 'Gururaj Kamath', usn: 'NNM24ME088', email: 'gururaj.k@nmamit.in', cgpa: 8.00, backlogs: 0 },
      { name: 'Hemant Rao', usn: 'NNM24ME099', email: 'hemant.rao@nmamit.in', cgpa: 7.10, backlogs: 1 },
    ],
  },
  {
    code: 'CIV',
    name: 'Civil Engineering',
    deptId: '22222222-0000-0000-0000-000000000014',
    skills: ['AutoCAD Civil', 'STAAD Pro', 'Structural Analysis', 'Surveying', 'Revit', 'GIS Mapping'],
    students: [
      { name: 'Rajesh Kulal', usn: 'NNM24CV012', email: 'rajesh.kulal@nmamit.in', cgpa: 8.10, backlogs: 0 },
      { name: 'Soumya Shetty', usn: 'NNM24CV025', email: 'soumya.shetty@nmamit.in', cgpa: 7.30, backlogs: 0 },
      { name: 'Ganesh Prabhu', usn: 'NNM24CV038', email: 'ganesh.prabhu@nmamit.in', cgpa: 8.55, backlogs: 0 },
      { name: 'Kavya Acharya', usn: 'NNM24CV050', email: 'kavya.acharya@nmamit.in', cgpa: 6.85, backlogs: 0 },
      { name: 'Harish Poojary', usn: 'NNM24CV063', email: 'harish.poojary@nmamit.in', cgpa: 8.90, backlogs: 0 },
      { name: 'Shweta Kamath', usn: 'NNM24CV075', email: 'shweta.kamath@nmamit.in', cgpa: 7.70, backlogs: 0 },
      { name: 'Nitin Rao', usn: 'NNM24CV087', email: 'nitin.rao@nmamit.in', cgpa: 8.25, backlogs: 0 },
      { name: 'Archana Bhat', usn: 'NNM24CV099', email: 'archana.bhat@nmamit.in', cgpa: 7.00, backlogs: 0 },
    ],
  },
  {
    code: 'BT',
    name: 'Biotechnology Engineering',
    deptId: '22222222-0000-0000-0000-000000000015',
    skills: ['Bioinformatics', 'Bioprocess Engg', 'Python for Biology', 'Molecular Biology', 'Genomics', 'R Programming'],
    students: [
      { name: 'Divya Poojary', usn: 'NNM24BT010', email: 'divya.poojary@nmamit.in', cgpa: 8.65, backlogs: 0 },
      { name: 'Ashwin Kumar', usn: 'NNM24BT022', email: 'ashwin.kumar@nmamit.in', cgpa: 7.80, backlogs: 0 },
      { name: 'Rashmi Gowda', usn: 'NNM24BT035', email: 'rashmi.gowda@nmamit.in', cgpa: 8.40, backlogs: 0 },
      { name: 'Siddharth Shenoy', usn: 'NNM24BT048', email: 'siddharth.s@nmamit.in', cgpa: 6.90, backlogs: 0 },
      { name: 'Lavanya R', usn: 'NNM24BT060', email: 'lavanya.r@nmamit.in', cgpa: 9.30, backlogs: 0 },
      { name: 'Manoj Bhat', usn: 'NNM24BT073', email: 'manoj.bhat@nmamit.in', cgpa: 7.15, backlogs: 0 },
      { name: 'Anusha Hegde', usn: 'NNM24BT085', email: 'anusha.hegde@nmamit.in', cgpa: 8.05, backlogs: 0 },
      { name: 'Chetan Rao', usn: 'NNM24BT097', email: 'chetan.rao@nmamit.in', cgpa: 7.55, backlogs: 1 },
    ],
  },
];

// Generate TypeScript Output
let tsOutput = `// Generated 120 NMAMIT Student Records across all 15 Autonomous Engineering Branches
import { Profile, AcademicRecord, SemesterMark, StudentSkillPassport, Department } from '@/types';

export const INSTITUTION_ID = '${INSTITUTION_ID}';

export const ALL_DEPARTMENTS: Department[] = ${JSON.stringify(
  BRANCH_CONFIG.map(b => ({
    id: b.deptId,
    institution_id: INSTITUTION_ID,
    code: b.code,
    name: b.name,
    total_intake: 120,
  })),
  null,
  2
)};

export const ALL_COHORT_PROFILES: Profile[] = [
`;

let academicRecordsOutput = `export const ALL_ACADEMIC_RECORDS: AcademicRecord[] = [\n`;
let skillPassportsOutput = `export const ALL_SKILL_PASSPORTS: StudentSkillPassport[] = [\n`;
let semesterMarksOutput = `export const ALL_SEMESTER_MARKS: SemesterMark[] = [\n`;

// Generate Production-Ready Supabase SQL Output
let sqlOutput = `-- ========================================================
-- PathPilot Complete Supabase Seed Script
-- NMAMIT Autonomous Placement & Career Intelligence Gateway
-- 15 Engineering Branches, 120 Students, ERP Records & Drives
-- ========================================================

-- STEP 0: ENSURE ROLES ENUM HAS 'placement' AND 'faculty'
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'placement';
        ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'faculty';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'placement';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'faculty';
    END IF;
END $$;

-- STEP 1: INSERT INSTITUTION (NMAMIT AUTONOMOUS)
INSERT INTO institutions (id, name, short_name, code, slug, website, is_active) VALUES
  ('${INSTITUTION_ID}', 'NMAM Institute of Technology, Nitte', 'NMAMIT', 'NMAMIT', 'nmamit-nitte', 'https://nmamit.nitte.edu.in', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  code = EXCLUDED.code,
  slug = EXCLUDED.slug;

-- STEP 2: INSERT DEPARTMENTS (ALL 15 BRANCHES)
INSERT INTO departments (id, institution_id, code, name, total_intake) VALUES
` + BRANCH_CONFIG.map(b => `  ('${b.deptId}', '${INSTITUTION_ID}', '${b.code}', '${b.name}', 120)`).join(',\n') + `
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, total_intake = EXCLUDED.total_intake;

-- STEP 3: INSERT EVALUATOR & ADMINISTRATIVE PROFILES
INSERT INTO profiles (id, institution_id, department_id, role, full_name, email, designation, recruiter_consent) VALUES
  ('f0000001-0000-0000-0000-000000000001', '${INSTITUTION_ID}', '22222222-0000-0000-0000-000000000001', 'faculty', 'Dr. K. Sharma', 'sharma.faculty@nmamit.in', 'Associate Professor & Placement Mentor', false),
  ('c0000001-0000-0000-0000-000000000001', '${INSTITUTION_ID}', NULL, 'recruiter', 'Priya Nair', 'priya.nair@nexusai.com', 'University Talent Partner', false),
  ('d0000001-0000-0000-0000-000000000001', '${INSTITUTION_ID}', NULL, 'placement', 'Prof. Sudesh Rao', 'tpo@nmamit.in', 'Head - Department of Training & Placement (TPO)', false)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- STEP 4: INSERT 120 STUDENT PROFILES
INSERT INTO profiles (id, institution_id, department_id, role, full_name, email, usn, semester, graduation_year, github_username, recruiter_consent) VALUES
`;

let sqlProfileRows = [];
let sqlAcademicRows = [];
let sqlSkillRows = [];

let studentCounter = 1;

BRANCH_CONFIG.forEach((branch) => {
  branch.students.forEach((s) => {
    // Standard 36-char compliant hex UUIDs (starts with 'a' for profiles, 'b' for academics, etc.)
    const hexNum = String(studentCounter).padStart(7, '0');
    const studentId = `a${hexNum}-0000-0000-0000-000000000001`;
    const arId = `b${hexNum}-0000-0000-0000-000000000001`;
    const githubUser = s.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-nmam';

    // TypeScript Profile
    tsOutput += `  {
    id: '${studentId}',
    institution_id: INSTITUTION_ID,
    department_id: '${branch.deptId}',
    department_code: '${branch.code}',
    role: 'student',
    full_name: '${s.name}',
    email: '${s.email}',
    usn: '${s.usn}',
    semester: 6,
    graduation_year: 2026,
    github_username: '${githubUser}',
    linkedin_url: 'https://linkedin.com/in/${githubUser}',
    portfolio_url: 'https://${githubUser}.dev',
    recruiter_consent: true,
  },\n`;

    // SQL Profile (Notice: No department_code column in Supabase profiles schema!)
    sqlProfileRows.push(
      `  ('${studentId}', '${INSTITUTION_ID}', '${branch.deptId}', 'student', '${s.name}', '${s.email}', '${s.usn}', 6, 2026, '${githubUser}', true)`
    );

    // TypeScript Academic Record
    academicRecordsOutput += `  {
    id: '${arId}',
    institution_id: INSTITUTION_ID,
    student_id: '${studentId}',
    usn: '${s.usn}',
    batch: '2022-2026',
    cgpa: ${s.cgpa},
    total_earned_credits: 120,
    active_backlogs: ${s.backlogs},
    history_of_backlogs: ${s.backlogs},
    source_system: 'NMAMIT Autonomous Examination Cell (Contineo ERP)',
    is_verified_by_exam_cell: true,
  },\n`;

    // SQL Academic Record
    sqlAcademicRows.push(
      `  ('${arId}', '${INSTITUTION_ID}', '${studentId}', '${s.usn}', '2022-2026', ${s.cgpa}, 120, ${s.backlogs}, ${s.backlogs}, 'NMAMIT Autonomous Examination Cell (Contineo ERP)', true)`
    );

    // Semester marks (semesters 1 to 6)
    for (let sem = 1; sem <= 6; sem++) {
      const variation = ((sem % 3) - 1) * 0.2;
      const semSgpa = Math.min(10.0, Math.max(5.5, Number((s.cgpa + variation).toFixed(2))));
      const smId = `c${String(studentCounter).padStart(4, '0')}${String(sem).padStart(3, '0')}-0000-0000-0000-000000000001`;
      semesterMarksOutput += `  {
    id: '${smId}',
    academic_record_id: '${arId}',
    semester: ${sem},
    sgpa: ${semSgpa},
    credits_registered: 20,
    credits_earned: 20,
    backlogs: 0,
    exam_month_year: '${sem % 2 === 1 ? 'Jan' : 'July'} ${2023 + Math.floor((sem - 1) / 2)}',
  },\n`;
    }

    // Skills (2-3 skills per student)
    branch.skills.slice(0, 3).forEach((skillName, skIdx) => {
      const isEvidenced = skIdx === 0 || (skIdx === 1 && s.cgpa >= 7.5);
      const skillId = `e${String(studentCounter).padStart(4, '0')}${String(skIdx + 1).padStart(3, '0')}-0000-0000-0000-000000000001`;
      skillPassportsOutput += `  {
    id: '${skillId}',
    student_id: '${studentId}',
    skill_name: '${skillName}',
    category: '${branch.code === 'ISE' || branch.code === 'CSE' ? 'programming' : 'engineering'}',
    tier: '${isEvidenced ? 'evidenced' : 'self_declared'}',
    confidence_score: ${isEvidenced ? 90 + (skIdx * 2) : 60},
    evidence_source: '${isEvidenced ? 'Faculty Review (Dr. K. Sharma)' : 'Resume Claim'}',
    evidence_date: '2026-10-0${(skIdx % 5) + 1}',
    verification_badge: ${isEvidenced},
    evidence_url: ${isEvidenced ? `'https://github.com/${githubUser}/${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}'` : 'null'},
    verified_by_name: ${isEvidenced ? `'Dr. K. Sharma (Faculty Mentor)'` : 'null'},
  },\n`;

      sqlSkillRows.push(
        `  ('${skillId}', '${studentId}', '${skillName}', '${branch.code === 'ISE' || branch.code === 'CSE' ? 'programming' : 'engineering'}', '${isEvidenced ? 'evidenced' : 'self_declared'}', ${isEvidenced ? 90 : 60}, '${isEvidenced ? 'Faculty Review' : 'Resume Claim'}', '2026-10-01', ${isEvidenced})`
      );
    });

    studentCounter++;
  });
});

tsOutput += `];\n\n` + academicRecordsOutput + `];\n\n` + semesterMarksOutput + `];\n\n` + skillPassportsOutput + `];\n`;

sqlOutput += sqlProfileRows.join(',\n') + `\nON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, usn = EXCLUDED.usn;\n\n`;
sqlOutput += `-- STEP 5: INSERT 120 ACADEMIC RECORDS (CONTINEO ERP)\nINSERT INTO academic_records (id, institution_id, student_id, usn, batch, cgpa, total_earned_credits, active_backlogs, history_of_backlogs, source_system, is_verified_by_exam_cell) VALUES\n` + sqlAcademicRows.join(',\n') + `\nON CONFLICT (id) DO UPDATE SET cgpa = EXCLUDED.cgpa, active_backlogs = EXCLUDED.active_backlogs;\n\n`;
sqlOutput += `-- STEP 6: INSERT STUDENT SKILL PASSPORTS\nINSERT INTO student_skill_passport (id, student_id, skill_name, category, tier, confidence_score, evidence_source, evidence_date, verification_badge) VALUES\n` + sqlSkillRows.join(',\n') + `\nON CONFLICT (id) DO UPDATE SET verification_badge = EXCLUDED.verification_badge;\n\n`;

// Companies & Placement Drives
sqlOutput += `-- STEP 7: INSERT RECRUITER COMPANIES
INSERT INTO companies (id, name, website, tier, headquarters) VALUES
  ('90000001-0000-0000-0000-000000000001', 'Nexus AI Technologies', 'https://nexusai.com', 'Tier 1', 'Bengaluru'),
  ('90000001-0000-0000-0000-000000000002', 'CloudScale Systems', 'https://cloudscale.dev', 'Tier 1', 'Mangaluru'),
  ('90000001-0000-0000-0000-000000000003', 'Cisco Systems', 'https://cisco.com', 'Tier 1', 'Bengaluru'),
  ('90000001-0000-0000-0000-000000000004', 'Oracle Financial Services', 'https://oracle.com', 'Tier 1', 'Bengaluru'),
  ('90000001-0000-0000-0000-000000000005', 'Bosch Mobility & Embedded Systems', 'https://bosch.com', 'Tier 1', 'Bengaluru'),
  ('90000001-0000-0000-0000-000000000006', 'L&T Heavy Infrastructure', 'https://larsentoubro.com', 'Tier 1', 'Mumbai'),
  ('90000001-0000-0000-0000-000000000007', 'Biocon Biologics', 'https://biocon.com', 'Tier 1', 'Bengaluru'),
  ('90000001-0000-0000-0000-000000000008', 'Tata Advanced Systems', 'https://tata.com', 'Tier 1', 'Hyderabad')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- STEP 8: INSERT CAMPUS PLACEMENT DRIVES
INSERT INTO placement_drives (id, institution_id, company_id, role_title, ctc_lpa, stipend_per_month, job_location, job_description, eligible_branches, min_cgpa, max_active_backlogs, batch_year, recruitment_status, registration_deadline) VALUES
  ('80000001-0000-0000-0000-000000000001', '${INSTITUTION_ID}', '90000001-0000-0000-0000-000000000001', 'AI/ML Engineering Intern (Graduating Batch 2026)', 14.50, 45000, 'Bengaluru (Hybrid)', 'Develop scalable ML feature pipelines and inference profiling.', ARRAY['ISE', 'CSE', 'AIML', 'AIDS', 'CSCY', 'CSFSD', 'CCE'], 7.00, 0, 2026, 'published', '2026-11-15T23:59:59Z'),
  ('80000001-0000-0000-0000-000000000002', '${INSTITUTION_ID}', '90000001-0000-0000-0000-000000000002', 'Full-Stack Developer Trainee', 9.00, 35000, 'Mangaluru / Remote', 'Build responsive Next.js frontend applications and Node.js REST APIs.', ARRAY['ISE', 'CSE', 'AIML', 'AIDS', 'CSCY', 'CSFSD', 'CCE', 'ECE', 'ACT', 'VLSI', 'EEE'], 6.50, 1, 2026, 'published', '2026-11-20T23:59:59Z'),
  ('80000001-0000-0000-0000-000000000003', '${INSTITUTION_ID}', '90000001-0000-0000-0000-000000000003', 'Cloud & Network Software Engineer', 18.00, 60000, 'Bengaluru', 'Design distributed networking services and high-throughput data planes.', ARRAY['ISE', 'CSE', 'CSCY', 'CCE', 'ECE'], 7.50, 0, 2026, 'ongoing', '2026-11-25T23:59:59Z'),
  ('80000001-0000-0000-0000-000000000004', '${INSTITUTION_ID}', '90000001-0000-0000-0000-000000000004', 'Associate Applications Developer', 12.00, 40000, 'Bengaluru / Pune', 'Develop enterprise financial transaction engines and relational databases.', ARRAY['ISE', 'CSE', 'AIML', 'AIDS'], 7.00, 0, 2026, 'published', '2026-12-05T23:59:59Z'),
  ('80000001-0000-0000-0000-000000000005', '${INSTITUTION_ID}', '90000001-0000-0000-0000-000000000005', 'Embedded Systems & Firmware Engineer', 11.50, 38000, 'Bengaluru / Coimbatore', 'Develop automotive firmware and microcontrollers interface protocols.', ARRAY['ECE', 'VLSI', 'ACT', 'EEE', 'RAI', 'MECH'], 7.00, 0, 2026, 'published', '2026-12-10T23:59:59Z'),
  ('80000001-0000-0000-0000-000000000006', '${INSTITUTION_ID}', '90000001-0000-0000-0000-000000000006', 'Graduate Engineer Trainee (Structures)', 8.50, 30000, 'Chennai / Sites', 'Structural modeling, stress analysis, and site execution coordination.', ARRAY['CIV', 'MECH'], 6.80, 0, 2026, 'published', '2026-12-12T23:59:59Z'),
  ('80000001-0000-0000-0000-000000000007', '${INSTITUTION_ID}', '90000001-0000-0000-0000-000000000007', 'Bioinformatics & Computational Biology', 9.50, 32000, 'Bengaluru', 'Genomic sequence analysis and statistical modeling in R/Python.', ARRAY['BT'], 7.00, 0, 2026, 'published', '2026-12-15T23:59:59Z'),
  ('80000001-0000-0000-0000-000000000008', '${INSTITUTION_ID}', '90000001-0000-0000-0000-000000000008', 'Robotics & Automation Engineer', 13.00, 42000, 'Pune / Hyderabad', 'Autonomous robotics path planning (ROS 2) and industrial kinematics.', ARRAY['RAI', 'MECH', 'ECE', 'EEE', 'AIML'], 7.20, 0, 2026, 'published', '2026-12-18T23:59:59Z')
ON CONFLICT (id) DO UPDATE SET role_title = EXCLUDED.role_title;

-- STEP 9: INSERT PLACEMENT APPLICATIONS (MULTI-BRANCH SPREAD)
INSERT INTO drive_applications (id, drive_id, student_id, stage, notes, applied_at) VALUES
  ('70000001-0000-0000-0000-000000000001', '80000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'selected', 'Preethika: High technical assessment and PyTorch code repository.', '2026-10-06T10:00:00Z'),
  ('70000001-0000-0000-0000-000000000002', '80000001-0000-0000-0000-000000000003', 'a0000002-0000-0000-0000-000000000001', 'interview_scheduled', 'Prajwala: Round 2 Systems & Distributed Data Architecture.', '2026-10-07T09:30:00Z'),
  ('70000001-0000-0000-0000-000000000003', '80000001-0000-0000-0000-000000000002', 'a0000003-0000-0000-0000-000000000001', 'selected', 'Pranav R: Full-stack Next.js/PostgreSQL architecture with verified proof.', '2026-10-07T14:00:00Z'),
  ('70000001-0000-0000-0000-000000000004', '80000001-0000-0000-0000-000000000002', 'a0000004-0000-0000-0000-000000000001', 'shortlisted', 'Prathwik Shetty: Microservices and container orchestration proofs.', '2026-10-08T15:00:00Z'),
  ('70000001-0000-0000-0000-000000000005', '80000001-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000001', 'applied', 'Ravi Kumar: CI/CD Docker proof awaiting mentor review.', '2026-10-09T12:30:00Z'),
  ('70000001-0000-0000-0000-000000000006', '80000001-0000-0000-0000-000000000003', 'a0000009-0000-0000-0000-000000000001', 'selected', 'Ananya Rao: 8.92 CGPA with verified PyTorch repository.', '2026-10-06T10:00:00Z'),
  ('70000001-0000-0000-0000-000000000007', '80000001-0000-0000-0000-000000000005', 'a0000097-0000-0000-0000-000000000001', 'selected', 'Eashan Shenoy (MECH): 9.10 CGPA with FEA repository.', '2026-10-10T10:00:00Z'),
  ('70000001-0000-0000-0000-000000000008', '80000001-0000-0000-0000-000000000006', 'a0000109-0000-0000-0000-000000000001', 'selected', 'Harish Poojary (CIV): 8.90 CGPA and STAAD Pro models.', '2026-10-10T11:00:00Z'),
  ('70000001-0000-0000-0000-000000000009', '80000001-0000-0000-0000-000000000007', 'a0000113-0000-0000-0000-000000000001', 'selected', 'Divya Poojary (BT): 8.65 CGPA with genomics algorithms.', '2026-10-10T14:30:00Z')
ON CONFLICT (id) DO UPDATE SET stage = EXCLUDED.stage;
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/cohortData.ts'), tsOutput);
fs.writeFileSync(path.join(__dirname, '../supabase_seed_cohort.sql'), sqlOutput);

console.log(`Successfully generated ${studentCounter - 1} student records across 15 branches with valid hex UUIDs and complete Supabase tables!`);
