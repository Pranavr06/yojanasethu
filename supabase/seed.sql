-- ========================================================
-- PathPilot Database Seed Script (Nexathon 2026)
-- Team: Team Neural Forge | 18 Students, Realistic Skills & Jobs
-- ========================================================

-- CLEAN SLATE (In dependency order)
TRUNCATE roadmaps, mentor_assignments, job_requirements, projects, student_skills, students, roles, skills, users CASCADE;

-- 1. SEED SKILLS
INSERT INTO skills (id, name, category, description) VALUES
('b0000001-0000-0000-0000-000000000001', 'Python', 'programming', 'Core Python programming, OOP, data structures, and standard libraries'),
('b0000001-0000-0000-0000-000000000002', 'SQL', 'database', 'Relational database querying, joins, indexing, and PostgreSQL/MySQL'),
('b0000001-0000-0000-0000-000000000003', 'PyTorch', 'ai_ml', 'Deep learning framework for neural networks and tensor operations'),
('b0000001-0000-0000-0000-000000000004', 'Data Analysis', 'ai_ml', 'Exploratory data analysis using Pandas, NumPy, and Matplotlib'),
('b0000001-0000-0000-0000-000000000005', 'Git & GitHub', 'cloud_devops', 'Version control, branch management, pull requests, and Git workflows'),
('b0000001-0000-0000-0000-000000000006', 'React.js', 'framework', 'Component-based frontend library, hooks, state management'),
('b0000001-0000-0000-0000-000000000007', 'Next.js', 'framework', 'Full-stack React framework with SSR, App Router, and API routes'),
('b0000001-0000-0000-0000-000000000008', 'Node.js', 'programming', 'Server-side JavaScript runtime, Express, and REST APIs'),
('b0000001-0000-0000-0000-000000000009', 'TypeScript', 'programming', 'Static type system for JavaScript'),
('b0000001-0000-0000-0000-000000000010', 'Docker', 'cloud_devops', 'Containerization, Dockerfiles, and compose configurations'),
('b0000001-0000-0000-0000-000000000011', 'Linux CLI', 'cloud_devops', 'Bash shell scripting, process management, and Unix environment'),
('b0000001-0000-0000-0000-000000000012', 'AWS Fundamentals', 'cloud_devops', 'Basic cloud compute (EC2), storage (S3), and deployment basics'),
('b0000001-0000-0000-0000-000000000013', 'PowerBI & Tableau', 'database', 'Business intelligence dashboards and data storytelling');

-- 2. SEED ROLES
INSERT INTO roles (id, title, category, description, min_cgpa_recommended, required_skills) VALUES
(
    'c0000001-0000-0000-0000-000000000001',
    'AI/ML Intern',
    'Artificial Intelligence & Machine Learning',
    'Develop machine learning pipelines, evaluate models, clean datasets, and deploy inference endpoints.',
    7.0,
    '[
        {"skill_id": "b0000001-0000-0000-0000-000000000001", "name": "Python", "importance": "mandatory", "weight": 3},
        {"skill_id": "b0000001-0000-0000-0000-000000000002", "name": "SQL", "importance": "mandatory", "weight": 2},
        {"skill_id": "b0000001-0000-0000-0000-000000000003", "name": "PyTorch", "importance": "preferred", "weight": 2},
        {"skill_id": "b0000001-0000-0000-0000-000000000004", "name": "Data Analysis", "importance": "mandatory", "weight": 2},
        {"skill_id": "b0000001-0000-0000-0000-000000000005", "name": "Git & GitHub", "importance": "preferred", "weight": 1}
    ]'::jsonb
),
(
    'c0000001-0000-0000-0000-000000000002',
    'Full-Stack Developer',
    'Software Engineering',
    'Build production-ready web applications with modern frontend frameworks and robust backend APIs.',
    6.75,
    '[
        {"skill_id": "b0000001-0000-0000-0000-000000000006", "name": "React.js", "importance": "mandatory", "weight": 3},
        {"skill_id": "b0000001-0000-0000-0000-000000000008", "name": "Node.js", "importance": "mandatory", "weight": 3},
        {"skill_id": "b0000001-0000-0000-0000-000000000002", "name": "SQL", "importance": "mandatory", "weight": 2},
        {"skill_id": "b0000001-0000-0000-0000-000000000009", "name": "TypeScript", "importance": "preferred", "weight": 1},
        {"skill_id": "b0000001-0000-0000-0000-000000000005", "name": "Git & GitHub", "importance": "mandatory", "weight": 1}
    ]'::jsonb
),
(
    'c0000001-0000-0000-0000-000000000003',
    'Data Analyst',
    'Analytics & BI',
    'Extract actionable insights from raw business databases, write optimized SQL, and build dashboards.',
    6.5,
    '[
        {"skill_id": "b0000001-0000-0000-0000-000000000002", "name": "SQL", "importance": "mandatory", "weight": 3},
        {"skill_id": "b0000001-0000-0000-0000-000000000001", "name": "Python", "importance": "mandatory", "weight": 2},
        {"skill_id": "b0000001-0000-0000-0000-000000000004", "name": "Data Analysis", "importance": "mandatory", "weight": 2},
        {"skill_id": "b0000001-0000-0000-0000-000000000013", "name": "PowerBI & Tableau", "importance": "preferred", "weight": 2}
    ]'::jsonb
),
(
    'c0000001-0000-0000-0000-000000000004',
    'Cloud & DevOps Intern',
    'Infrastructure & Cloud',
    'Automate CI/CD pipelines, containerize backend microservices, and manage cloud environments.',
    6.5,
    '[
        {"skill_id": "b0000001-0000-0000-0000-000000000011", "name": "Linux CLI", "importance": "mandatory", "weight": 3},
        {"skill_id": "b0000001-0000-0000-0000-000000000010", "name": "Docker", "importance": "mandatory", "weight": 3},
        {"skill_id": "b0000001-0000-0000-0000-000000000005", "name": "Git & GitHub", "importance": "mandatory", "weight": 2},
        {"skill_id": "b0000001-0000-0000-0000-000000000012", "name": "AWS Fundamentals", "importance": "preferred", "weight": 2}
    ]'::jsonb
);

-- 3. SEED USERS (Password for all: 'password123' hashed with bcrypt)
-- bcrypt hash for 'password123': $2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa
INSERT INTO users (id, email, password_hash, name, role) VALUES
('a0000001-0000-0000-0000-000000000001', 'pranav.r@nmamit.in', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Pranav R', 'student'),
('a0000001-0000-0000-0000-000000000002', 'sharma.faculty@nmamit.in', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Dr. K. Sharma (Faculty Mentor)', 'mentor'),
('a0000001-0000-0000-0000-000000000003', 'priya.nair@nexustech.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'Priya Nair (Talent Partner)', 'recruiter');

-- 4. SEED 18 REALISTIC ENGINEERING STUDENTS
INSERT INTO students (id, user_id, name, usn, branch, semester, grad_year, current_cgpa, target_cgpa, completed_credits, total_credits, active_backlogs, target_role_id, discoverable, bio, github_url) VALUES
-- FEATURED LIVE DEMO PERSONA: Pranav R
('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Pranav R', 'NNM24IS159', 'ISE', 6, 2026, 8.45, 8.80, 120, 160, 0, 'c0000001-0000-0000-0000-000000000001', true, 'ISE 6th Sem student passionate about full-stack architecture and applied AI systems.', 'https://github.com/pranav-r-nmam'),

-- Other diverse cohort students across ISE, CSE, AIML
('d0000001-0000-0000-0000-000000000002', NULL, 'Ananya Rao', 'NNM24CS012', 'CSE', 6, 2026, 8.92, 9.20, 120, 160, 0, 'c0000001-0000-0000-0000-000000000001', true, 'Deep learning researcher and competitive programmer.', 'https://github.com/ananya-rao'),
('d0000001-0000-0000-0000-000000000003', NULL, 'Karthik Shenoy', 'NNM24IS045', 'ISE', 6, 2026, 7.85, 8.20, 120, 160, 0, 'c0000001-0000-0000-0000-000000000002', true, 'Full stack web developer and open source enthusiast.', 'https://github.com/karthik-shenoy'),
('d0000001-0000-0000-0000-000000000004', NULL, 'Sneha Bhat', 'NNM24AI088', 'AIML', 6, 2026, 7.40, 8.00, 120, 160, 1, 'c0000001-0000-0000-0000-000000000001', true, 'AIML undergrad; 1 backlog in Math 3.', 'https://github.com/sneha-bhat'),
('d0000001-0000-0000-0000-000000000005', NULL, 'Vikram Hegde', 'NNM24IS110', 'ISE', 6, 2026, 6.95, 7.50, 120, 160, 0, 'c0000001-0000-0000-0000-000000000003', true, 'Data analyst in the making, loves PowerBI.', 'https://github.com/vikram-hegde'),
('d0000001-0000-0000-0000-000000000006', NULL, 'Divya Shetty', 'NNM24CS044', 'CSE', 6, 2026, 8.45, 8.70, 120, 160, 0, 'c0000001-0000-0000-0000-000000000002', true, 'MERN stack developer, built campus event portal.', 'https://github.com/divya-shetty'),
('d0000001-0000-0000-0000-000000000007', NULL, 'Mohammad Farhan', 'NNM24AI029', 'AIML', 6, 2026, 8.10, 8.50, 120, 160, 0, 'c0000001-0000-0000-0000-000000000001', true, 'Computer vision hobbyist, OpenCV and PyTorch.', 'https://github.com/farhan-ml'),
('d0000001-0000-0000-0000-000000000008', NULL, 'Pooja Nayak', 'NNM24IS092', 'ISE', 6, 2026, 6.40, 7.00, 120, 160, 2, 'c0000001-0000-0000-0000-000000000003', true, 'Working hard on DSA and SQL.', 'https://github.com/pooja-nayak'),
('d0000001-0000-0000-0000-000000000009', NULL, 'Gautham Pai', 'NNM24CS103', 'CSE', 6, 2026, 7.60, 8.00, 120, 160, 0, 'c0000001-0000-0000-0000-000000000004', true, 'Cloud enthusiast, AWS certified cloud practitioner.', 'https://github.com/gautham-cloud'),
('d0000001-0000-0000-0000-000000000010', NULL, 'Rashmi Prabhu', 'NNM24IS140', 'ISE', 6, 2026, 8.25, 8.60, 120, 160, 0, 'c0000001-0000-0000-0000-000000000001', true, 'NLP enthusiast working on Kannada translation models.', 'https://github.com/rashmi-p'),
('d0000001-0000-0000-0000-000000000011', NULL, 'Aditya Kulkarni', 'NNM24CS003', 'CSE', 6, 2026, 6.70, 7.20, 120, 160, 0, 'c0000001-0000-0000-0000-000000000002', true, 'Frontend engineer skilled in Next.js and Tailwind.', 'https://github.com/aditya-k'),
('d0000001-0000-0000-0000-000000000012', NULL, 'Meghana Bhat', 'NNM24AI055', 'AIML', 6, 2026, 7.90, 8.30, 120, 160, 0, 'c0000001-0000-0000-0000-000000000001', true, 'Data scientist, Kaggle notebook expert.', 'https://github.com/meghana-bhat'),
('d0000001-0000-0000-0000-000000000013', NULL, 'Nikhil Acharya', 'NNM24IS077', 'ISE', 6, 2026, 7.15, 7.80, 120, 160, 0, 'c0000001-0000-0000-0000-000000000004', true, 'DevOps practitioner, Docker and Kubernetes learner.', 'https://github.com/nikhil-ops'),
('d0000001-0000-0000-0000-000000000014', NULL, 'Bhavana Alva', 'NNM24CS031', 'CSE', 6, 2026, 8.60, 9.00, 120, 160, 0, 'c0000001-0000-0000-0000-000000000001', true, 'Generative AI researcher, transformer architectures.', 'https://github.com/bhavana-alva'),
('d0000001-0000-0000-0000-000000000015', NULL, 'Sudarshan Poojary', 'NNM24IS165', 'ISE', 6, 2026, 6.20, 7.00, 120, 160, 1, 'c0000001-0000-0000-0000-000000000002', false, 'Building React web apps; private profile toggle tested.', 'https://github.com/sudarshan-p'),
('d0000001-0000-0000-0000-000000000016', NULL, 'Shreya Mendonca', 'NNM24AI099', 'AIML', 6, 2026, 9.15, 9.40, 120, 160, 0, 'c0000001-0000-0000-0000-000000000001', true, 'Gold medalist aspirant, research paper published.', 'https://github.com/shreya-m'),
('d0000001-0000-0000-0000-000000000017', NULL, 'Harshith Gowda', 'NNM24CS068', 'CSE', 6, 2026, 7.30, 7.80, 120, 160, 0, 'c0000001-0000-0000-0000-000000000003', true, 'BI and ETL data pipelines.', 'https://github.com/harshith-g'),
('d0000001-0000-0000-0000-000000000018', NULL, 'Tanvi Kamat', 'NNM24IS180', 'ISE', 6, 2026, 8.05, 8.50, 120, 160, 0, 'c0000001-0000-0000-0000-000000000002', true, 'Full stack engineer with AWS backend experience.', 'https://github.com/tanvi-k');

-- 5. SEED STUDENT SKILLS (Highlighting Pranav R's starting claimed state and verified peers)
INSERT INTO student_skills (student_id, skill_id, status, proficiency_level, evidence_title, evidence_url, evidence_type, verified_by, verified_at) VALUES
-- PRANAV R:
-- Python is 'self_declared' (Needs proof!)
('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'self_declared', 'intermediate', NULL, NULL, NULL, NULL, NULL),
-- Git is 'evidenced' (Faculty Mentor verified)
('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000005', 'evidenced', 'advanced', 'GitHub Portfolio & CI Automation', 'https://github.com/pranav-r-nmam/pathpilot', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '10 days'),
-- PyTorch is 'self_declared'
('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000003', 'self_declared', 'beginner', NULL, NULL, NULL, NULL, NULL),
-- Note: Ravi is MISSING SQL and Data Analysis (highlights the Skill Gap engine!)

-- ANANYA RAO (High rank candidate)
('d0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'evidenced', 'advanced', 'Kaggle Grandmaster Notebook', 'https://github.com/ananya-rao/transformer-nlp', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days'),
('d0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 'evidenced', 'advanced', 'Database Optimization Paper', 'https://github.com/ananya-rao/sql-bench', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days'),
('d0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000003', 'evidenced', 'advanced', 'Vision Transformer Repo', 'https://github.com/ananya-rao/vit-pytorch', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days'),
('d0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000004', 'evidenced', 'advanced', 'Medical Imaging EDA', 'https://github.com/ananya-rao/eda-medical', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days'),

-- MOHAMMAD FARHAN (Strong AIML candidate)
('d0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000001', 'evidenced', 'advanced', 'OpenCV Face Mesh', 'https://github.com/farhan-ml/face-mesh', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days'),
('d0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000003', 'evidenced', 'intermediate', 'YOLO Object Detection', 'https://github.com/farhan-ml/yolo-v8', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days'),

-- SNEHA BHAT (Has 1 backlog, so hard filter will separate her)
('d0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000001', 'evidenced', 'intermediate', 'Predictive House Pricing', 'https://github.com/sneha-bhat/house-price', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days'),
('d0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000002', 'self_declared', 'intermediate', NULL, NULL, NULL, NULL, NULL),

-- KARTHIK SHENOY (Full stack developer)
('d0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000006', 'evidenced', 'advanced', 'E-commerce React Storefront', 'https://github.com/karthik-shenoy/storefront', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '7 days'),
('d0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000008', 'evidenced', 'intermediate', 'Node.js Auth API Service', 'https://github.com/karthik-shenoy/auth-service', 'github_repo', 'a0000001-0000-0000-0000-000000000002', NOW() - INTERVAL '7 days');

-- 6. SEED RECRUITER JOB REQUIREMENTS
INSERT INTO job_requirements (id, recruiter_id, title, company_name, target_role_id, min_cgpa, target_grad_year, allowed_branches, max_backlogs, required_skills, job_type, stipend_or_ctc) VALUES
(
    'e0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000003',
    'AI/ML Engineering Intern (Summer 2026)',
    'Nexus AI Technologies',
    'c0000001-0000-0000-0000-000000000001',
    7.0,
    2026,
    ARRAY['ISE', 'CSE', 'AIML'],
    0,
    '[
        {"name": "Python", "importance": "mandatory", "weight": 3},
        {"name": "SQL", "importance": "mandatory", "weight": 2},
        {"name": "PyTorch", "importance": "preferred", "weight": 2},
        {"name": "Data Analysis", "importance": "mandatory", "weight": 2}
    ]'::jsonb,
    'Internship',
    'Rs. 45,000 / month'
),
(
    'e0000001-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000003',
    'Full-Stack Developer Trainee',
    'CloudScale Systems',
    'c0000001-0000-0000-0000-000000000002',
    6.5,
    2026,
    ARRAY['ISE', 'CSE', 'AIML', 'ECE'],
    1,
    '[
        {"name": "React.js", "importance": "mandatory", "weight": 3},
        {"name": "Node.js", "importance": "mandatory", "weight": 3},
        {"name": "SQL", "importance": "mandatory", "weight": 2},
        {"name": "Git & GitHub", "importance": "mandatory", "weight": 1}
    ]'::jsonb,
    'Intern + FTE',
    'Rs. 35,000 / mo + 8.5 LPA'
);

-- 7. SEED 30-DAY ROADMAP (Pranav's Personalized Learning Plan for AI/ML Intern)
INSERT INTO roadmaps (id, student_id, target_role_id, week_number, title, description, action_items, resource_urls, is_completed) VALUES
(
    'f0000001-0000-0000-0000-000000000001',
    'd0000001-0000-0000-0000-000000000001',
    'c0000001-0000-0000-0000-000000000001',
    1,
    'Week 1: Advanced Python & Vectorized Operations',
    'Master list comprehensions, generators, and NumPy array operations required for fast data preprocessing.',
    '["Implement custom generator for batch processing", "Solve 5 array manipulation problems in NumPy", "Submit first mini-script to mentor"]'::jsonb,
    '[{"title": "FreeCodeCamp Advanced Python", "url": "https://www.freecodecamp.org", "type": "video"}]'::jsonb,
    true
),
(
    'f0000001-0000-0000-0000-000000000002',
    'd0000001-0000-0000-0000-000000000001',
    'c0000001-0000-0000-0000-000000000001',
    2,
    'Week 2: SQL For Data Science & Relational Modeling',
    'Bridge the identified SQL gap: write complex CTEs, window functions (ROW_NUMBER, RANK), and aggregations.',
    '["Complete LeetCode Top 20 SQL questions", "Build schema with foreign keys for customer analytics", "Run benchmark queries"]'::jsonb,
    '[{"title": "Mode Analytics SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "interactive"}]'::jsonb,
    false
),
(
    'f0000001-0000-0000-0000-000000000003',
    'd0000001-0000-0000-0000-000000000001',
    'c0000001-0000-0000-0000-000000000001',
    3,
    'Week 3: Exploratory Data Analysis & Feature Engineering',
    'Analyze real-world Kaggle datasets using Pandas; handle null values, outliers, and categorical encoding.',
    '["Perform EDA on Churn dataset", "Create seaborn correlation heatmaps", "Document findings in Jupyter Notebook"]'::jsonb,
    '[{"title": "Kaggle Data Cleaning Course", "url": "https://www.kaggle.com/learn/data-cleaning", "type": "course"}]'::jsonb,
    false
),
(
    'f0000001-0000-0000-0000-000000000004',
    'd0000001-0000-0000-0000-000000000001',
    'c0000001-0000-0000-0000-000000000001',
    4,
    'Week 4: End-to-End ML Pipeline Project & Proof Submission',
    'Build and train an ML classification model, push clean code to GitHub repository, and submit URL for mentor review.',
    '["Write modular Python classes for train/test split", "Evaluate using Precision, Recall and ROC-AUC", "Submit repo link to PathPilot for mentor verification"]'::jsonb,
    '[{"title": "Scikit-Learn Official User Guide", "url": "https://scikit-learn.org", "type": "documentation"}]'::jsonb,
    false
);

-- 8. SEED MENTOR ASSIGNMENT
INSERT INTO mentor_assignments (mentor_id, student_id, notes) VALUES
('a0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 'Mentee Ravi needs to focus on SQL and project evidence to meet summer placement cutoffs.');
