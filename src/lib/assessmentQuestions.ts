/**
 * Practice Assessment Question Bank & Deterministic Grading Engine
 *
 * IMPORTANT:
 * - These questions are for collegiate skill verification and practice assessments,
 *   NOT official vendor certification examinations (e.g., AWS, Oracle, Google).
 * - Answer keys and grading rationales are strictly retained on the server.
 * - Under no circumstances should correctOptionIndex or rationales be sent to the student during exam taking.
 */

import {
  AssessmentSubject,
  AssessmentQuestion,
  AssessmentQuestionServer,
  StudentAnswerSubmission,
  GradedQuestionResult,
} from '@/types';

export const SUBJECT_METADATA: Record<AssessmentSubject, { label: string; icon: string; description: string }> = {
  python: {
    label: 'Python Programming & Software Engineering',
    icon: 'Code2',
    description: 'Data types, memory management, generators, OOP, and asynchronous paradigms in Python.',
  },
  dsa: {
    label: 'Data Structures & Algorithms',
    icon: 'BrainCircuit',
    description: 'Arrays, trees, graphs, sorting, searching, recursion, and computational complexity (Big-O).',
  },
  cloud_aws: {
    label: 'Cloud Computing & AWS Architecture',
    icon: 'Cloud',
    description: 'Cloud design patterns, VPCs, IAM security, serverless, compute, and high availability.',
  },
  machine_learning: {
    label: 'Machine Learning & Deep Neural Networks',
    icon: 'Cpu',
    description: 'Supervised/unsupervised learning, optimization algorithms, loss functions, CNNs, and Transformers.',
  },
  sql_databases: {
    label: 'SQL & Relational Database Architecture',
    icon: 'Database',
    description: 'ACID transactions, indexing strategies, normalization, joins, and execution plan optimization.',
  },
  web_development: {
    label: 'Modern Full-Stack Web Development',
    icon: 'Globe',
    description: 'React lifecycle, state management, REST APIs, HTTP protocols, DOM performance, and Web security.',
  },
  cybersecurity: {
    label: 'Cybersecurity & Network Defense',
    icon: 'Shield',
    description: 'Cryptographic principles, authentication protocols, OWASP Top 10, penetration basics, and PKI.',
  },
  devops: {
    label: 'DevOps, CI/CD & Container Orchestration',
    icon: 'Layers',
    description: 'Docker containerization, Kubernetes pods, CI/CD pipelines, GitOps, and infrastructure monitoring.',
  },
};

export const SERVER_QUESTION_BANK: Record<AssessmentSubject, AssessmentQuestionServer[]> = {
  python: [
    {
      id: 'py-01',
      subject: 'python',
      question: 'In Python, what is the key difference between a list and a tuple in terms of memory and mutability?',
      options: [
        'Lists are immutable and allocate less memory; tuples are mutable and over-allocate.',
        'Lists are mutable and over-allocate memory for dynamic resizing; tuples are immutable and memory-compact.',
        'Both are mutable, but tuples only support numeric data types.',
        'Lists are stored in contiguous memory; tuples are stored as linked nodes.',
      ],
      correctOptionIndex: 1,
      explanation: 'Lists in Python are mutable sequences that over-allocate memory to achieve amortized O(1) appends, whereas tuples are fixed-size immutable structures.',
      gradingRationale: 'Correctly identifies memory allocation strategy and mutability contract in CPython.',
    },
    {
      id: 'py-02',
      subject: 'python',
      question: 'What is the primary purpose of the Global Interpreter Lock (GIL) in CPython?',
      options: [
        'To prevent race conditions between independent OS processes.',
        'To optimize just-in-time machine code compilation for numerical loops.',
        'To ensure thread safety for CPython memory management and reference counting.',
        'To enforce strict type declarations at runtime.',
      ],
      correctOptionIndex: 2,
      explanation: 'The GIL is a mutex that prevents multiple native threads from executing Python bytecodes at once, safeguarding reference counting from race conditions.',
      gradingRationale: 'Core knowledge of CPython concurrency limitations and multithreading behavior.',
    },
    {
      id: 'py-03',
      subject: 'python',
      question: 'How do Python generators conserve memory when iterating over large datasets compared to standard list comprehensions?',
      options: [
        'Generators compress data into gzip buffers before iterating.',
        'Generators yield elements lazily on demand rather than allocating the entire sequence in memory.',
        'Generators offload array storage to disk swap partitions.',
        'Generators automatically parallelize iteration across all available CPU cores.',
      ],
      correctOptionIndex: 1,
      explanation: 'Generators produce values lazily using the iterator protocol, retaining only one item in memory at any given point.',
      gradingRationale: 'Evaluates understanding of lazy evaluation and generator function mechanics (yield keyword).',
    },
    {
      id: 'py-04',
      subject: 'python',
      question: 'What occurs when a mutable object (such as a list) is used as a default parameter in a Python function definition?',
      options: [
        'Python raises a SyntaxError during code compilation.',
        'A fresh copy of the list is instantiated each time the function is called.',
        'The list is evaluated once at definition time and shared across subsequent function invocations.',
        'The parameter is automatically converted into an immutable tuple.',
      ],
      correctOptionIndex: 2,
      explanation: 'Default argument expressions in Python are evaluated once when the function definition is executed, leading to persistent mutations across calls.',
      gradingRationale: 'Classic Python gotcha testing knowledge of function object namespace binding.',
    },
    {
      id: 'py-05',
      subject: 'python',
      question: 'Which method resolution order (MRO) algorithm does Python 3 utilize for multiple inheritance?',
      options: [
        'Depth-First Search (DFS) with leftmost precedence.',
        'C3 Supercomputing Linearization algorithm.',
        'Breadth-First Search (BFS) with rightmost precedence.',
        'Round-robin interface resolution.',
      ],
      correctOptionIndex: 1,
      explanation: 'Python 3 utilizes the C3 Linearization algorithm to calculate a monotonic and consistent MRO in multiple inheritance hierarchies.',
      gradingRationale: 'Advanced OOP mastery in Python.',
    },
  ],

  dsa: [
    {
      id: 'dsa-01',
      subject: 'dsa',
      question: 'What is the tight worst-case time complexity of QuickSort when using a naive leftmost pivot selection on an already sorted array?',
      options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
      correctOptionIndex: 2,
      explanation: 'Selecting the leftmost element of an already sorted array results in completely unbalanced partitions of size 0 and n-1, producing O(n²) recursion depth.',
      gradingRationale: 'Fundamental understanding of partitioning degenerate cases and time complexity.',
    },
    {
      id: 'dsa-02',
      subject: 'dsa',
      question: 'Which self-balancing binary search tree guarantees that the heights of two sibling subtrees never differ by more than 1?',
      options: ['Red-Black Tree', 'AVL Tree', 'B+ Tree', 'Splay Tree'],
      correctOptionIndex: 1,
      explanation: 'AVL trees strictly enforce the balance factor criterion: |height(left) - height(right)| <= 1 for every node.',
      gradingRationale: 'Distinguishes strict height-balanced trees (AVL) from color-balanced trees (Red-Black).',
    },
    {
      id: 'dsa-03',
      subject: 'dsa',
      question: 'What is the optimal time and auxiliary space complexity to detect a cycle in a singly linked list using Floyd’s Cycle-Finding Algorithm?',
      options: [
        'Time: O(n), Auxiliary Space: O(1)',
        'Time: O(n log n), Auxiliary Space: O(n)',
        'Time: O(n²), Auxiliary Space: O(1)',
        'Time: O(n), Auxiliary Space: O(n)',
      ],
      correctOptionIndex: 0,
      explanation: 'Floyds Tortoise and Hare algorithm traverses the list with two pointers at 1x and 2x speeds, requiring O(n) steps and constant O(1) space.',
      gradingRationale: 'Two-pointer technique and auxiliary space awareness.',
    },
    {
      id: 'dsa-04',
      subject: 'dsa',
      question: 'In Dijkstra’s shortest path algorithm implemented with a Min-Heap (priority queue), what is the time complexity for a graph with V vertices and E edges?',
      options: ['O(V²)', 'O((V + E) log V)', 'O(V * E)', 'O(E² log V)'],
      correctOptionIndex: 1,
      explanation: 'With a min-heap, extracting min takes O(V log V) and updating edge relaxation takes O(E log V), yielding O((V + E) log V).',
      gradingRationale: 'Graph algorithm analysis with priority queue optimization.',
    },
    {
      id: 'dsa-05',
      subject: 'dsa',
      question: 'Which collision resolution strategy in Hash Tables places colliding keys into sequential open slots within the primary array?',
      options: ['Separate Chaining with Linked Lists', 'Open Addressing (Linear Probing)', 'Consistent Hashing', 'Robin Hood External Bucketing'],
      correctOptionIndex: 1,
      explanation: 'Linear probing searches sequentially (index + 1) % capacity for the next empty array index upon collision.',
      gradingRationale: 'Hash table collision handling fundamentals.',
    },
  ],

  cloud_aws: [
    {
      id: 'cloud-01',
      subject: 'cloud_aws',
      question: 'In an AWS Virtual Private Cloud (VPC), how do EC2 instances in a private subnet route outbound traffic to the Internet for software updates while blocking inbound Internet connections?',
      options: [
        'By attaching an Internet Gateway directly to the private subnet route table.',
        'By configuring a NAT Gateway in a public subnet and routing 0.0.0.0/0 from the private subnet to it.',
        'By enabling VPC Peering with another account.',
        'By assigning public Elastic IP addresses directly to each private instance.',
      ],
      correctOptionIndex: 1,
      explanation: 'A NAT Gateway residing in a public subnet allows outbound egress for private instances without permitting unsolicited ingress from the Internet.',
      gradingRationale: 'Core AWS networking, VPC design, and subnet security isolation.',
    },
    {
      id: 'cloud-02',
      subject: 'cloud_aws',
      question: 'Which AWS Identity and Access Management (IAM) best practice should be applied when granting EC2 instances permissions to access an Amazon S3 bucket?',
      options: [
        'Hardcode IAM user access keys and secret keys inside the application configuration file.',
        'Attach an IAM Role with least-privilege permissions directly to the EC2 Instance Profile.',
        'Make the S3 bucket public with read-write ACLs.',
        'Store root credentials in an environment variable on the server.',
      ],
      correctOptionIndex: 1,
      explanation: 'IAM Roles provide short-lived temporary security credentials that rotate automatically via the instance metadata service (IMDSv2).',
      gradingRationale: 'Cloud security posture and credential management hygiene.',
    },
    {
      id: 'cloud-03',
      subject: 'cloud_aws',
      question: 'What AWS service provides a fully managed, serverless event-driven compute engine where code runs in response to HTTP requests or system events?',
      options: ['Amazon EC2', 'AWS Lambda', 'Amazon Elastic Beanstalk', 'AWS Outposts'],
      correctOptionIndex: 1,
      explanation: 'AWS Lambda runs stateless function code on demand without provisioning or managing servers, scaling automatically.',
      gradingRationale: 'Serverless architecture and execution models.',
    },
    {
      id: 'cloud-04',
      subject: 'cloud_aws',
      question: 'What is the primary architectural difference between Amazon S3 and Amazon EBS?',
      options: [
        'S3 is block storage attached to a single instance; EBS is regional object storage.',
        'S3 is regional object storage accessed via HTTP REST; EBS is high-performance block storage attached to EC2.',
        'S3 only supports structured SQL tables; EBS stores static images and videos.',
        'EBS automatically replicates across three global AWS continents; S3 is local to one server rack.',
      ],
      correctOptionIndex: 1,
      explanation: 'Amazon S3 is an object store accessible via HTTP APIs from anywhere; Amazon EBS provides block storage volumes for EC2 instances.',
      gradingRationale: 'Storage tier categorization in cloud systems.',
    },
    {
      id: 'cloud-05',
      subject: 'cloud_aws',
      question: 'To achieve high availability and fault tolerance across a region, how should an application tier be deployed?',
      options: [
        'Deploy all instances inside a single Availability Zone for minimal network latency.',
        'Deploy instances across at least two Availability Zones behind an Application Load Balancer.',
        'Run instances solely on spot pricing in one data center.',
        'Disable Auto Scaling to prevent unexpected infrastructure changes.',
      ],
      correctOptionIndex: 1,
      explanation: 'Distributing compute instances across multiple Availability Zones protects the workload against single-data-center physical outages.',
      gradingRationale: 'Cloud architecture design for resilience and zero-downtime failover.',
    },
  ],

  machine_learning: [
    {
      id: 'ml-01',
      subject: 'machine_learning',
      question: 'In deep neural networks, how does Batch Normalization accelerate training and improve convergence?',
      options: [
        'By reducing the precision of floating-point weights from 32-bit to 8-bit.',
        'By normalizing layer inputs to zero mean and unit variance, mitigating internal covariate shift.',
        'By pruning zero-weight neurons after each backward pass.',
        'By guaranteeing that the loss function is mathematically convex.',
      ],
      correctOptionIndex: 1,
      explanation: 'Batch Normalization standardizes mini-batch layer activations, stabilizing weight gradients and allowing higher learning rates.',
      gradingRationale: 'Understanding deep learning optimization and gradient stabilization techniques.',
    },
    {
      id: 'ml-02',
      subject: 'machine_learning',
      question: 'What is the fundamental difference between L1 (Lasso) and L2 (Ridge) regularization?',
      options: [
        'L1 penalizes squared weights; L2 penalizes absolute weights.',
        'L1 promotes sparsity by driving non-critical feature coefficients to exact zero; L2 shrinks weights uniformly.',
        'L1 is used only for classification; L2 is used only for regression.',
        'L2 prevents gradient descent from reaching global minima.',
      ],
      correctOptionIndex: 1,
      explanation: 'L1 regularization uses the diamond-shaped L1 ball penalty, which intersects parameter axes at zero, generating sparse models.',
      gradingRationale: 'Core statistical learning and feature selection concepts.',
    },
    {
      id: 'ml-03',
      subject: 'machine_learning',
      question: 'In Transformer models, why is Scaled Dot-Product Attention scaled by the square root of the key dimension (1 / sqrt(d_k))?',
      options: [
        'To speed up GPU matrix multiplication speed.',
        'To prevent large dot products from pushing softmax into regions with vanishingly small gradients.',
        'To enforce strict orthnormality of query and key projections.',
        'To limit the maximum context window length.',
      ],
      correctOptionIndex: 1,
      explanation: 'For large vector dimensions d_k, dot products grow large in magnitude, saturating softmax with near-zero gradients during backpropagation.',
      gradingRationale: 'Modern attention mechanisms and Transformer mathematics.',
    },
    {
      id: 'ml-04',
      subject: 'machine_learning',
      question: 'When evaluating a disease diagnostic model where false negatives are dangerous, which metric should be prioritized?',
      options: ['Precision', 'Recall (Sensitivity)', 'Specificity', 'Accuracy'],
      correctOptionIndex: 1,
      explanation: 'Recall measures TP / (TP + FN). Maximizing recall minimizes false negatives, ensuring sick patients are not missed.',
      gradingRationale: 'Classification metric selection based on real-world cost functions.',
    },
    {
      id: 'ml-05',
      subject: 'machine_learning',
      question: 'What occurs during the phenomenon known as "Overfitting" in supervised learning?',
      options: [
        'The model learns noise and idiosyncratic training patterns, leading to low training error but high test error.',
        'The model has too few parameters and fails to capture underlying patterns on both train and test sets.',
        'The optimizer diverges to infinity due to exploding learning rates.',
        'The dataset contains too many training examples for the model architecture.',
      ],
      correctOptionIndex: 0,
      explanation: 'Overfitting occurs when high-capacity models memorize noise in the training set, failing to generalize to unseen test distributions.',
      gradingRationale: 'Bias-variance tradeoff fundamentals.',
    },
  ],

  sql_databases: [
    {
      id: 'sql-01',
      subject: 'sql_databases',
      question: 'In relational database systems, what does the "Isolation" property of ACID transactions guarantee?',
      options: [
        'That transactions are committed to persistent physical disk immediately.',
        'That concurrent transactions execute without interfering with one another, preventing dirty or unrepeatable reads based on isolation level.',
        'That foreign key constraints are never evaluated until table shutdown.',
        'That all database tables are stored in separate files.',
      ],
      correctOptionIndex: 1,
      explanation: 'Isolation ensures that concurrent transactions operate as if executing serially, guarding against anomalies according to the configured isolation level.',
      gradingRationale: 'ACID transaction semantics and concurrency control.',
    },
    {
      id: 'sql-02',
      subject: 'sql_databases',
      question: 'What is the primary structural difference between a Clustered Index and a Non-Clustered (Secondary) Index in PostgreSQL/MySQL?',
      options: [
        'A clustered index dictates the physical on-disk sort order of table rows; a non-clustered index stores pointers to rows.',
        'A table can possess up to 16 clustered indexes but only one non-clustered index.',
        'Clustered indexes are stored in RAM; non-clustered indexes are stored on SSD.',
        'Non-clustered indexes do not support B-Tree structures.',
      ],
      correctOptionIndex: 0,
      explanation: 'A clustered index determines the physical order of data on disk (only one allowed per table), while secondary indexes store search keys with pointers to heap rows.',
      gradingRationale: 'Database storage layout and index engineering.',
    },
    {
      id: 'sql-03',
      subject: 'sql_databases',
      question: 'Which SQL construct is best suited to calculate running totals or row numbers without collapsing rows into a single aggregation?',
      options: ['GROUP BY with HAVING', 'Window Functions (e.g. OVER (PARTITION BY ... ORDER BY ...))', 'CROSS JOIN', 'UNION ALL'],
      correctOptionIndex: 1,
      explanation: 'Window functions perform calculations across a set of table rows related to the current row without aggregating rows into a single output row.',
      gradingRationale: 'Advanced SQL analytical querying proficiency.',
    },
    {
      id: 'sql-04',
      subject: 'sql_databases',
      question: 'What database normalization requirement defines Third Normal Form (3NF)?',
      options: [
        'Every column contains atomic values only (1NF).',
        'It is in 2NF and contains no transitive functional dependencies of non-key attributes on the primary key.',
        'All relations are stored in separate schema namespaces.',
        'Every candidate key is composite.',
      ],
      correctOptionIndex: 1,
      explanation: '3NF requires that all non-prime attributes depend solely and directly on the primary key, eliminating transitive dependencies.',
      gradingRationale: 'Relational database schema normalization theory.',
    },
    {
      id: 'sql-05',
      subject: 'sql_databases',
      question: 'What type of lock in PostgreSQL prevents concurrent writes to a table while permitting concurrent SELECT queries?',
      options: ['ACCESS EXCLUSIVE', 'SHARE Lock', 'ROW EXCLUSIVE Lock', 'EXCLUSIVE Lock'],
      correctOptionIndex: 1,
      explanation: 'A SHARE lock protects the table against concurrent modifications (INSERT/UPDATE/DELETE) while allowing other sessions to acquire read locks.',
      gradingRationale: 'PostgreSQL concurrency control and lock hierarchy.',
    },
  ],

  web_development: [
    {
      id: 'web-01',
      subject: 'web_development',
      question: 'What is the core distinction between Server-Side Rendering (SSR) and Client-Side Rendering (CSR) in modern web frameworks?',
      options: [
        'SSR generates full HTML on the server per request, providing fast initial paint and SEO; CSR downloads an empty HTML shell and renders DOM via JavaScript.',
        'SSR runs exclusively without JavaScript; CSR requires WebAssembly.',
        'CSR is faster for initial page loads on 3G mobile networks than SSR.',
        'SSR cannot connect to databases, while CSR connects directly to PostgreSQL.',
      ],
      correctOptionIndex: 0,
      explanation: 'SSR produces pre-rendered HTML on the server before sending it over the network, whereas CSR relies on the browser to execute JS bundles to construct DOM elements.',
      gradingRationale: 'Modern web rendering strategies and performance tradeoffs.',
    },
    {
      id: 'web-02',
      subject: 'web_development',
      question: 'How does the browser enforce the Same-Origin Policy (SOP), and what mechanism allows cross-origin resource sharing?',
      options: [
        'SOP restricts communication to matching protocol, domain, and port; CORS headers (e.g., Access-Control-Allow-Origin) negotiate exceptions.',
        'SOP requires HTTPS on all domains; HTTP/2 allows cross-origin requests by default.',
        'SOP is implemented entirely on DNS servers.',
        'CORS is an encryption protocol that encrypts JSON payloads with AES-256.',
      ],
      correctOptionIndex: 0,
      explanation: 'Same-Origin Policy restricts scripts on one origin from accessing data on another origin unless the server explicitly returns appropriate CORS headers.',
      gradingRationale: 'Web application security and browser sandbox enforcement.',
    },
    {
      id: 'web-03',
      subject: 'web_development',
      question: 'In React, why must hooks (like useState and useEffect) be called at the top level of a component rather than inside conditionals or loops?',
      options: [
        'Because JavaScript does not permit functions to be invoked inside if statements.',
        'Because React relies on consistent call order across renders to link hook state to the component Fiber node.',
        'Because hooks are converted into global window variables at runtime.',
        'To avoid memory leaks in the browser V8 garbage collector.',
      ],
      correctOptionIndex: 1,
      explanation: 'React maintains an internal linked list of hook state records for each fiber; altering hook invocation order breaks state mapping.',
      gradingRationale: 'React Fiber architecture and rules of hooks.',
    },
    {
      id: 'web-04',
      subject: 'web_development',
      question: 'What HTTP response status code should be returned when a client attempts to access a protected resource without valid authentication credentials?',
      options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
      correctOptionIndex: 1,
      explanation: '401 Unauthorized indicates the request lacks valid authentication credentials, whereas 403 Forbidden indicates the server understands the identity but refuses authorization.',
      gradingRationale: 'HTTP specification and REST API status semantics.',
    },
    {
      id: 'web-05',
      subject: 'web_development',
      question: 'What is the primary security vulnerability mitigated by utilizing Content Security Policy (CSP) headers?',
      options: [
        'Cross-Site Scripting (XSS) and unauthorized code injection.',
        'Distributed Denial of Service (DDoS) bandwidth saturation.',
        'SQL injection in relational backend databases.',
        'Memory buffer overflows in C-based backend daemons.',
      ],
      correctOptionIndex: 0,
      explanation: 'CSP restricts the sources from which scripts, styles, and assets can be loaded or executed by the browser, neutralizing most XSS attacks.',
      gradingRationale: 'Frontend application security architecture.',
    },
  ],

  cybersecurity: [
    {
      id: 'sec-01',
      subject: 'cybersecurity',
      question: 'What is the primary cryptographic difference between symmetric and asymmetric encryption algorithms?',
      options: [
        'Symmetric encryption uses the same secret key for both encryption and decryption; asymmetric uses a public/private key pair.',
        'Symmetric encryption is only used for hashing passwords; asymmetric is used for disk encryption.',
        'Symmetric encryption is quantum-proof; asymmetric encryption has zero computational overhead.',
        'Asymmetric encryption requires physical hardware dongles for every operation.',
      ],
      correctOptionIndex: 0,
      explanation: 'Symmetric algorithms (e.g. AES-256) utilize one shared secret key, whereas asymmetric algorithms (e.g. RSA, ECC) utilize mathematical public-private key pairs.',
      gradingRationale: 'Fundamental cryptography principles.',
    },
    {
      id: 'sec-02',
      subject: 'cybersecurity',
      question: 'How does an attacker execute a Cross-Site Request Forgery (CSRF) attack against a victim?',
      options: [
        'By stealing the victim’s password hash directly from the database server.',
        'By tricking the victim’s authenticated browser into submitting an unauthorized request to a trusted application where the victim has an active session.',
        'By intercepting raw Wi-Fi packets using a rogue DNS server.',
        'By brute-forcing SSH keys on port 22.',
      ],
      correctOptionIndex: 1,
      explanation: 'CSRF exploits the browser’s automatic inclusion of session cookies with cross-site requests to execute unauthorized state-changing operations.',
      gradingRationale: 'Web application vulnerability mechanisms and CSRF token defenses.',
    },
    {
      id: 'sec-03',
      subject: 'cybersecurity',
      question: 'Which hashing algorithm is recommended for securely storing user passwords with intentional work factors to resist GPU brute-forcing?',
      options: ['MD5', 'SHA-256', 'bcrypt or Argon2id', 'CRC32'],
      correctOptionIndex: 2,
      explanation: 'Algorithms like bcrypt, scrypt, and Argon2id feature configurable work factors and memory-hardness to defeat accelerated hardware brute-forcing.',
      gradingRationale: 'Password storage cryptography and salting/stretching techniques.',
    },
    {
      id: 'sec-04',
      subject: 'cybersecurity',
      question: 'What is the role of a Certificate Authority (CA) in the Public Key Infrastructure (PKI) system for HTTPS?',
      options: [
        'To act as a reverse proxy load balancer routing incoming web traffic.',
        'To cryptographically sign and vouch for the authenticity of domain public keys.',
        'To decrypt all consumer web traffic on behalf of government agencies.',
        'To store and host website database tables in secure data centers.',
      ],
      correctOptionIndex: 1,
      explanation: 'A CA verifies domain ownership and cryptographically signs SSL/TLS certificates, establishing a trusted chain of identity.',
      gradingRationale: 'PKI infrastructure and transport layer security (TLS).',
    },
    {
      id: 'sec-05',
      subject: 'cybersecurity',
      question: 'What security model assumes that threats exist both inside and outside the network perimeter, requiring continuous verification at every access point?',
      options: ['Defense in Depth', 'Zero Trust Architecture', 'Air-Gapped Isolation', 'Demilitarized Zone (DMZ)'],
      correctOptionIndex: 1,
      explanation: 'Zero Trust adheres to "never trust, always verify", validating identity, device posture, and authorization on every transaction.',
      gradingRationale: 'Modern enterprise security paradigms.',
    },
  ],

  devops: [
    {
      id: 'devops-01',
      subject: 'devops',
      question: 'What is the fundamental difference between a Docker container and a traditional Virtual Machine (VM)?',
      options: [
        'Containers share the host OS kernel and isolate user space; VMs run a full guest OS on top of a hypervisor.',
        'Containers cannot run Linux processes; VMs only run Docker images.',
        'Containers require specialized hardware hypervisors (Type 1).',
        'VMs are lightweight processes that start in milliseconds, while containers take minutes.',
      ],
      correctOptionIndex: 0,
      explanation: 'Containers leverage Linux kernel namespaces and cgroups to isolate processes sharing the host kernel, yielding lightweight execution.',
      gradingRationale: 'Containerization principles vs hypervisor virtualization.',
    },
    {
      id: 'devops-02',
      subject: 'devops',
      question: 'In Kubernetes, what is the smallest deployable computing unit that can be created and managed?',
      options: ['Node', 'Pod', 'Cluster', 'Namespace'],
      correctOptionIndex: 1,
      explanation: 'A Pod represents a single instance of a running process in a cluster, encapsulating one or more tightly coupled containers with shared storage/network.',
      gradingRationale: 'Kubernetes architecture fundamentals.',
    },
    {
      id: 'devops-03',
      subject: 'devops',
      question: 'What deployment strategy routes a small percentage (e.g. 5%) of live production traffic to a new version to verify stability before complete rollout?',
      options: ['Recreate Deployment', 'Canary Deployment', 'Shadow Deployment', 'Blue/Green Flip'],
      correctOptionIndex: 1,
      explanation: 'Canary deployments release updates to an incremental subset of users, monitoring telemetry and error budgets before widespread promotion.',
      gradingRationale: 'Progressive delivery and deployment pattern mastery.',
    },
    {
      id: 'devops-04',
      subject: 'devops',
      question: 'What is the core principle of Infrastructure as Code (IaC) tools like Terraform?',
      options: [
        'Configuring servers by remoting in via SSH and running bash scripts manually.',
        'Defining and managing cloud infrastructure declaratively in version-controlled configuration files.',
        'Storing application source code inside database BLOB columns.',
        'Automating employee salary payroll systems through YAML files.',
      ],
      correctOptionIndex: 1,
      explanation: 'IaC defines infrastructure state declaratively, enabling repeatable, automated, auditable provisioning via version control.',
      gradingRationale: 'Cloud automation and GitOps principles.',
    },
    {
      id: 'devops-05',
      subject: 'devops',
      question: 'In CI/CD pipelines, what is the primary purpose of the "Continuous Integration" phase?',
      options: [
        'To automatically bill customers for software subscriptions.',
        'To regularly merge code changes into a shared repository, verified by automated builds and test suites.',
        'To immediately deploy every git commit directly to production servers without testing.',
        'To manage developer project management sprint boards.',
      ],
      correctOptionIndex: 1,
      explanation: 'CI ensures that developer branch changes are continuously integrated, compiled, and tested to detect defects and regressions early.',
      gradingRationale: 'CI/CD pipeline lifecycle and quality gates.',
    },
  ],
};

/**
 * Returns practice questions for students, stripping all answer keys and explanations.
 */
export function getSubjectQuestionsForClient(subject: AssessmentSubject): AssessmentQuestion[] {
  const serverQuestions = SERVER_QUESTION_BANK[subject] || SERVER_QUESTION_BANK.python;
  return serverQuestions.map((q) => ({
    id: q.id,
    subject: q.subject,
    question: q.question,
    options: q.options,
  }));
}

/**
 * Deterministically grades student answer submissions using the server answer key.
 * Formula: Percentage = (number of correct answers / number of graded questions) * 100.
 *
 * Prevents client score tampering or fabricated percentages.
 */
export function gradeAssessmentSubmission(
  subject: AssessmentSubject,
  submissions: StudentAnswerSubmission[]
): {
  score_percentage: number;
  total_questions: number;
  correct_answers: number;
  answers: GradedQuestionResult[];
} {
  const serverQuestions = SERVER_QUESTION_BANK[subject] || SERVER_QUESTION_BANK.python;
  const questionMap = new Map(serverQuestions.map((q) => [q.id, q]));

  let correctCount = 0;
  const gradedResults: GradedQuestionResult[] = [];

  for (const q of serverQuestions) {
    const studentAns = submissions.find((s) => s.questionId === q.id);
    const selectedIdx = studentAns !== undefined ? studentAns.selectedOptionIndex : -1;
    const isCorrect = selectedIdx === q.correctOptionIndex;

    if (isCorrect) {
      correctCount++;
    }

    gradedResults.push({
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      selectedOptionIndex: selectedIdx,
      correctOptionIndex: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation,
    });
  }

  const total = serverQuestions.length;
  const score_percentage = total > 0 ? Number(((correctCount / total) * 100).toFixed(2)) : 0;

  return {
    score_percentage,
    total_questions: total,
    correct_answers: correctCount,
    answers: gradedResults,
  };
}
