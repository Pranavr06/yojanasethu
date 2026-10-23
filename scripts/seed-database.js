const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
let url = '', key = '';
lines.forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim();
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = l.split('=')[1].trim();
});

console.log('Seeding Supabase at:', url);
const sb = createClient(url, key, { auth: { persistSession: false } });

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
      { name: 'Rohan Rao', usn: 'NNM24IS082', email: 'rohan.rao@nmamit.in', cgpa: 6.80, backlogs: 0 },
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

async function seed() {
  console.log('1. Upserting Institution...');
  const { error: instErr } = await sb.from('institutions').upsert({
    id: INSTITUTION_ID,
    name: 'NMAM Institute of Technology, Nitte',
    short_name: 'NMAMIT',
    code: 'NMAMIT',
    slug: 'nmamit-nitte',
    website: 'https://nmamit.nitte.edu.in',
    is_active: true,
  });
  if (instErr) console.error('Institution error:', instErr);

  console.log('2. Upserting Departments (15 Branches)...');
  const depts = BRANCH_CONFIG.map(b => ({
    id: b.deptId,
    institution_id: INSTITUTION_ID,
    code: b.code,
    name: b.name,
    total_intake: 120,
  }));
  const { error: deptErr } = await sb.from('departments').upsert(depts);
  if (deptErr) console.error('Dept error:', deptErr);

  console.log('3. Upserting Staff Profiles...');
  const staff = [
    {
      id: 'f0000001-0000-0000-0000-000000000001',
      institution_id: INSTITUTION_ID,
      department_id: '22222222-0000-0000-0000-000000000001',
      role: 'faculty',
      full_name: 'Dr. K. Sharma',
      email: 'sharma.faculty@nmamit.in',
      designation: 'Associate Professor & Placement Mentor',
    },
    {
      id: 'f0000002-0000-0000-0000-000000000001',
      institution_id: INSTITUTION_ID,
      department_id: '22222222-0000-0000-0000-000000000002',
      role: 'faculty',
      full_name: 'Dr. Rajesh Shetty',
      email: 'shetty.faculty@nmamit.in',
      designation: 'Professor & Head of Department (CSE)',
    },
    {
      id: 'f0000003-0000-0000-0000-000000000001',
      institution_id: INSTITUTION_ID,
      department_id: '22222222-0000-0000-0000-000000000003',
      role: 'faculty',
      full_name: 'Dr. Anitha Prabhu',
      email: 'prabhu.faculty@nmamit.in',
      designation: 'Associate Professor (AIML)',
    },
    {
      id: 'c0000001-0000-0000-0000-000000000001',
      institution_id: INSTITUTION_ID,
      role: 'recruiter',
      full_name: 'Priya Nair',
      email: 'priya.nair@nexusai.com',
      company_name: 'Nexus AI Technologies',
      recruiter_title: 'University Talent Partner',
    },
    {
      id: 'd0000001-0000-0000-0000-000000000001',
      institution_id: INSTITUTION_ID,
      role: 'admin',
      full_name: 'Prof. Sudesh Rao',
      email: 'tpo@nmamit.in',
      designation: 'Head - Department of Training & Placement (TPO)',
    },
  ];
  const { error: staffErr } = await sb.from('profiles').upsert(staff);
  if (staffErr) console.error('Staff profile error:', staffErr);

  console.log('4. Generating 120 Student Profiles & Contineo ERP Records...');
  const studentProfiles = [];
  const academicRecords = [];
  const semesterMarks = [];
  const skillPassports = [];

  let counter = 1;
  for (const b of BRANCH_CONFIG) {
    for (const s of b.students) {
      const hexNum = String(counter).padStart(7, '0');
      const studentId = `a${hexNum}-0000-0000-0000-000000000001`;
      const arId = `b${hexNum}-0000-0000-0000-000000000001`;
      const githubUser = s.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-nmam';

      studentProfiles.push({
        id: studentId,
        institution_id: INSTITUTION_ID,
        department_id: b.deptId,
        role: 'student',
        full_name: s.name,
        email: s.email,
        usn: s.usn,
        semester: 6,
        graduation_year: 2026,
        github_username: githubUser,
        linkedin_url: `https://linkedin.com/in/${githubUser}`,
        portfolio_url: `https://${githubUser}.dev`,
        recruiter_consent: true,
      });

      academicRecords.push({
        id: arId,
        institution_id: INSTITUTION_ID,
        student_id: studentId,
        usn: s.usn,
        batch: '2022-2026',
        cgpa: s.cgpa,
        total_earned_credits: 120,
        active_backlogs: s.backlogs,
        history_of_backlogs: s.backlogs,
        source_system: 'NMAMIT Autonomous Examination Cell (Contineo ERP)',
        is_verified_by_exam_cell: true,
      });

      for (let sem = 1; sem <= 6; sem++) {
        const variation = ((sem % 3) - 1) * 0.2;
        const semSgpa = Math.min(10.0, Math.max(5.5, Number((s.cgpa + variation).toFixed(2))));
        const smId = `c${String(counter).padStart(4, '0')}${String(sem).padStart(3, '0')}-0000-0000-0000-000000000001`;
        semesterMarks.push({
          id: smId,
          academic_record_id: arId,
          semester: sem,
          sgpa: semSgpa,
          credits_registered: 20,
          credits_earned: 20,
          backlogs: 0,
          exam_month_year: `${sem % 2 === 1 ? 'Jan' : 'July'} ${2023 + Math.floor((sem - 1) / 2)}`,
        });
      }

      b.skills.slice(0, 3).forEach((skillName, skIdx) => {
        const isEvidenced = skIdx === 0 || (skIdx === 1 && s.cgpa >= 7.5);
        const skillId = `e${String(counter).padStart(4, '0')}${String(skIdx + 1).padStart(3, '0')}-0000-0000-0000-000000000001`;
        skillPassports.push({
          id: skillId,
          student_id: studentId,
          skill_name: skillName,
          category: b.code === 'ISE' || b.code === 'CSE' ? 'programming' : 'engineering',
          tier: isEvidenced ? 'faculty_verified' : 'self_declared',
          confidence_score: isEvidenced ? 90 + (skIdx * 2) : 60,
          evidence_source: isEvidenced ? 'Faculty Review (Dr. K. Sharma)' : 'Resume Claim',
          evidence_date: '2026-10-01',
          verification_badge: isEvidenced,
        });
      });

      counter++;
    }
  }

  console.log(`Inserting ${studentProfiles.length} student profiles...`);
  const { error: spErr } = await sb.from('profiles').upsert(studentProfiles);
  if (spErr) console.error('Student profile error:', spErr);

  console.log(`Inserting ${academicRecords.length} academic records...`);
  const { error: arErr } = await sb.from('academic_records').upsert(academicRecords);
  if (arErr) console.error('Academic records error:', arErr);

  console.log(`Inserting ${semesterMarks.length} semester marks...`);
  // batch insert semester marks (chunks of 100)
  for (let i = 0; i < semesterMarks.length; i += 100) {
    const chunk = semesterMarks.slice(i, i + 100);
    const { error: smErr } = await sb.from('semester_marks').upsert(chunk);
    if (smErr) console.error('Semester marks chunk error:', smErr);
  }

  console.log(`Inserting ${skillPassports.length} skill passports...`);
  for (let i = 0; i < skillPassports.length; i += 100) {
    const chunk = skillPassports.slice(i, i + 100);
    const { error: skErr } = await sb.from('student_skill_passport').upsert(chunk);
    if (skErr) console.error('Skill passport chunk error:', skErr);
  }

  console.log('5. Upserting Companies & Placement Drives...');
  const companies = [
    { id: '90000001-0000-0000-0000-000000000001', name: 'Nexus AI Technologies', website: 'https://nexusai.com', tier: 'Tier 1', headquarters: 'Bengaluru' },
    { id: '90000001-0000-0000-0000-000000000002', name: 'CloudScale Systems', website: 'https://cloudscale.dev', tier: 'Tier 1', headquarters: 'Mangaluru' },
    { id: '90000001-0000-0000-0000-000000000003', name: 'Cisco Systems', website: 'https://cisco.com', tier: 'Tier 1', headquarters: 'Bengaluru' },
    { id: '90000001-0000-0000-0000-000000000004', name: 'Oracle Financial Services', website: 'https://oracle.com', tier: 'Tier 1', headquarters: 'Bengaluru' },
  ];
  await sb.from('companies').upsert(companies);

  const drives = [
    {
      id: '80000001-0000-0000-0000-000000000001',
      institution_id: INSTITUTION_ID,
      company_id: '90000001-0000-0000-0000-000000000001',
      role_title: 'AI/ML Engineering Intern (Graduating Batch 2026)',
      ctc_lpa: 14.50,
      stipend_per_month: 45000,
      job_location: 'Bengaluru (Hybrid)',
      job_description: 'Develop scalable ML feature pipelines and inference profiling.',
      eligible_branches: ['ISE', 'CSE', 'AIML', 'AIDS', 'CSCY', 'CSFSD', 'CCE'],
      min_cgpa: 7.00,
      max_active_backlogs: 0,
      batch_year: 2026,
      recruitment_status: 'published',
      registration_deadline: '2026-11-15T23:59:59Z',
    },
    {
      id: '80000001-0000-0000-0000-000000000002',
      institution_id: INSTITUTION_ID,
      company_id: '90000001-0000-0000-0000-000000000002',
      role_title: 'Full-Stack Developer Trainee',
      ctc_lpa: 9.00,
      stipend_per_month: 35000,
      job_location: 'Mangaluru / Remote',
      job_description: 'Build responsive Next.js frontend applications and Node.js REST APIs.',
      eligible_branches: ['ISE', 'CSE', 'AIML', 'AIDS', 'CSCY', 'CSFSD', 'CCE', 'ECE', 'ACT', 'VLSI', 'EEE'],
      min_cgpa: 6.50,
      max_active_backlogs: 1,
      batch_year: 2026,
      recruitment_status: 'published',
      registration_deadline: '2026-11-20T23:59:59Z',
    },
  ];
  await sb.from('placement_drives').upsert(drives);

  console.log('6. Seeding Evidence Submissions for Mentor Desk Queue...');
  // Add some realistic pending and verified submissions
  const sampleSubmissions = [
    {
      id: '71000001-0000-0000-0000-000000000001',
      institution_id: INSTITUTION_ID,
      student_id: 'a0000003-0000-0000-0000-000000000001', // Pranav R
      title: 'PathPilot Verification Gateway & Full-Stack Platform',
      type: 'project',
      description: 'Autonomous ERP sync, deterministic SGPA calculator, and verified skill passport engine built with Next.js 14 and PostgreSQL.',
      issue_date: '2026-10-20',
      issuer_or_organization: 'GitHub Repository',
      github_repo_url: 'https://github.com/pranav-r-nmam/pathpilot-platform',
      live_demo_url: 'https://pathpilot.nmamit.in',
      technologies: ['Next.js', 'PostgreSQL', 'Tailwind CSS', 'TypeScript'],
      associated_skills: ['React.js', 'Node.js', 'SQL'],
      claimed_role: 'Lead Architect',
      team_size: 4,
      status: 'pending',
    },
    {
      id: '71000001-0000-0000-0000-000000000002',
      institution_id: INSTITUTION_ID,
      student_id: 'a0000001-0000-0000-0000-000000000001', // Preethika
      title: 'High-Performance PyTorch Transformer for Clinical Notes',
      type: 'project',
      description: 'Fine-tuned BioBERT on medical consultation notes with 94.2% entity extraction F1 score and ONNX model quantization.',
      issue_date: '2026-10-18',
      issuer_or_organization: 'GitHub Repository',
      github_repo_url: 'https://github.com/preethika-nmam/clinical-transformer',
      technologies: ['PyTorch', 'Python', 'HuggingFace', 'Docker'],
      associated_skills: ['Python'],
      claimed_role: 'ML Engineer',
      team_size: 2,
      status: 'pending',
    },
    {
      id: '71000001-0000-0000-0000-000000000003',
      institution_id: INSTITUTION_ID,
      student_id: 'a0000002-0000-0000-0000-000000000001', // Prajwala
      title: 'Distributed Event-Driven Ledger in Rust & Kafka',
      type: 'project',
      description: 'Decentralized consensus log processing 45,000 transactions/sec with zero packet loss and Raft consensus.',
      issue_date: '2026-10-19',
      issuer_or_organization: 'GitHub Repository',
      github_repo_url: 'https://github.com/prajwala-vasudev-gouda-nmam/distributed-ledger',
      technologies: ['Rust', 'Apache Kafka', 'Docker'],
      associated_skills: ['Data Structures', 'SQL'],
      claimed_role: 'Backend Systems Engineer',
      team_size: 1,
      status: 'pending',
    },
    {
      id: '71000001-0000-0000-0000-000000000004',
      institution_id: INSTITUTION_ID,
      student_id: 'a0000004-0000-0000-0000-000000000001', // Prathwik Shetty
      title: 'AWS Certified Solutions Architect Associate',
      type: 'certificate',
      description: 'Official AWS credential validating cloud compute, VPC networking, RDS multi-region redundancy, and S3 lifecycle rules.',
      issue_date: '2026-09-15',
      issuer_or_organization: 'Amazon Web Services',
      credential_url: 'https://aws.amazon.com/verification/AWS-SAA-2026-9812',
      technologies: ['AWS Cloud', 'Docker', 'Kubernetes'],
      associated_skills: ['Git & GitHub'],
      claimed_role: 'Cloud Architect',
      team_size: 1,
      status: 'pending',
    },
    {
      id: '71000001-0000-0000-0000-000000000005',
      institution_id: INSTITUTION_ID,
      student_id: 'a0000009-0000-0000-0000-000000000001', // Ananya Rao (CSE)
      title: 'Distributed Key-Value Store with LSM Tree',
      type: 'project',
      description: 'Implemented Log-Structured Merge Tree in C++ with MemTable flush, SSTables compaction, and Bloom filter lookups.',
      issue_date: '2026-10-15',
      issuer_or_organization: 'GitHub Repository',
      github_repo_url: 'https://github.com/ananya-rao-nmam/lsm-kv-store',
      technologies: ['C++', 'Algorithms', 'Linux'],
      associated_skills: ['C++', 'Algorithms'],
      claimed_role: 'Sole Developer',
      team_size: 1,
      status: 'verified',
      faculty_feedback: 'Outstanding C++ implementation of LSM-Trees and Bloom filters. Code quality is industry-grade.',
    },
  ];
  const { error: subErr } = await sb.from('evidence_submissions').upsert(sampleSubmissions);
  if (subErr) console.error('Evidence submissions error:', subErr);

  console.log('7. Seeding Academic Correction Requests...');
  const correctionRequests = [
    {
      student_id: 'a0000003-0000-0000-0000-000000000001', // Pranav R
      subject_or_semester: 'Semester 5 - Advanced DBMS (22IS502)',
      claimed_value: 'Grade S (9.5 SGPA)',
      official_value: 'Grade A (8.45 SGPA)',
      reason: 'Revaluation marks update from Autonomous Exam Cell not synced into Contineo ERP yet.',
      status: 'pending',
    },
    {
      student_id: 'a0000004-0000-0000-0000-000000000001', // Prathwik Shetty
      subject_or_semester: 'Semester 4 - Operating Systems (22IS401)',
      claimed_value: 'Cleared in Makeup Exam (0 Active Backlogs)',
      official_value: '1 Active Backlog recorded',
      reason: 'Makeup exam result announced on Oct 10th cleared the backlog. Requesting ERP sync before Cisco drive.',
      status: 'pending',
    },
  ];
  const { error: corErr } = await sb.from('academic_correction_requests').upsert(correctionRequests);
  if (corErr) console.error('Correction requests error:', corErr);

  console.log('Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Seed fatal error:', err);
  process.exit(1);
});
