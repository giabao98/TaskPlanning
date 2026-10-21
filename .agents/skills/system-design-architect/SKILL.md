---
name: system-design-architect
description: Comprehensive methodology for designing large-scale, scalable, and reliable systems based on the System Design Primer. Use this skill to architect distributed systems, design databases, plan caching strategies, and solve scalability bottlenecks.
license: MIT
metadata:
  version: '1.0.0'
  source: 'Inspired by github.com/donnemartin/system-design-primer'
---

# System Design Architect

This Skill provides a structured methodology for designing large-scale, distributed systems based on the concepts from the famous [System Design Primer](https://github.com/donnemartin/system-design-primer). 

## 1. Phương Pháp Tiếp Cận (The Method)

Khi nhận yêu cầu thiết kế kiến trúc hệ thống, **LUÔN LUÔN** tuân theo 4 bước sau (không bao giờ nhảy thẳng vào thiết kế chi tiết):

### Bước 1: Phân tích yêu cầu và ước tính (Understand the goal)
- **Functional Requirements (Tính năng):** Hệ thống cốt lõi cần làm gì? (VD: Đăng bài, Thích bài, Search).
- **Non-Functional Requirements (Phi tính năng):** 
  - Tính khả dụng (Availability) vs Nhất quán (Consistency) theo định lý CAP.
  - Độ trễ (Latency) và Băng thông (Throughput).
- **Scale (Quy mô):** 
  - Bao nhiêu Daily Active Users (DAU)?
  - Tỷ lệ Đọc/Ghi (Read/Write ratio)?
  - Ước tính dung lượng lưu trữ, băng thông mạng, và bộ nhớ (Back-of-the-envelope calculations).

### Bước 2: Thiết kế High-Level (High-level design)
- Vẽ ra bức tranh tổng thể với các component chính.
- Chưa đi sâu vào chi tiết công nghệ. (VD: Client -> Load Balancer -> Web Servers -> Database).
- Phác thảo Data Flow cơ bản. Dùng Mermaid.js để trực quan hóa.

### Bước 3: Đi sâu vào chi tiết (Deep dive into core components)
- **Database:** SQL vs NoSQL? Schema như thế nào? Cần Sharding/Replication không?
- **Caching:** Cache ở đâu (Client, CDN, Server, Database)? Cache eviction policy (LRU, LFU)?
- **Communication:** REST, GraphQL, gRPC, hay Message Queues (Kafka, RabbitMQ) cho xử lý bất đồng bộ?
- Xác định và giải quyết các Bottlenecks (nút thắt cổ chai) trong High-level design.

### Bước 4: Scale và tối ưu (Scale the design)
- Cân nhắc SPOF (Single Point of Failure) và Redundancy.
- Cân bằng tải (Load Balancing Layer 4 vs Layer 7).
- Scale Database (Master-Slave, Federation, Sharding, Denormalization).

## 2. Các Mẫu Thiết Kế Trọng Tâm (Key Concepts)

Khi thiết kế, hãy áp dụng các nguyên tắc sau từ System Design Primer:

### 2.1. Định lý CAP (CAP Theorem)
Trong một hệ thống phân tán, chỉ có thể đảm bảo 2 trong 3 yếu tố:
- **C**onsistency (Nhất quán)
- **A**vailability (Khả dụng)
- **P**artition Tolerance (Chống chịu chia cắt mạng)
*(Thường chọn CP hoặc AP, vì P là bắt buộc phải có).*

### 2.2. Cơ sở dữ liệu (Database)
- **RDBMS (SQL):** Dùng khi cần cấu trúc rõ ràng, ACID transactions, quan hệ phức tạp.
- **NoSQL:** 
  - Key-Value (Redis, DynamoDB): Nhanh, phù hợp cache, session.
  - Document (MongoDB): Data schema linh hoạt, không đồng nhất.
  - Wide-column (Cassandra): Time-series, scale write rất tốt.
  - Graph (Neo4j): Mạng xã hội, hệ thống gợi ý.

### 2.3. Caching
- Giảm tải DB, tăng tốc độ đọc.
- **Chiến lược:** Cache-aside, Write-through, Write-behind, Refresh-ahead.

### 2.4. Bất đồng bộ (Asynchronism)
- Dùng **Message Queues** (Kafka, RabbitMQ) để tách rời (decouple) các component.
- Đẩy các tác vụ nặng, không cần realtime (gửi email, xử lý ảnh) ra background (Worker).

### 2.5. Cân bằng tải (Load Balancing)
- Phân phối traffic đều cho các servers.
- Giúp hệ thống scale theo chiều ngang (Horizontal scaling).

## 3. Output Mong Đợi (Deliverables)

Khi sử dụng skill này để tư vấn cho User, AI CẦN cung cấp:
1. **Tóm tắt yêu cầu & Ước tính hệ thống** (Traffic, Storage).
2. **Kiến trúc High-level** (dùng Mermaid.js diagram).
3. **Thiết kế Database & API**.
4. **Phân tích Đánh đổi (Trade-offs)**: Giải thích TẠI SAO lại chọn công nghệ A thay vì B.
5. **Cách xử lý Bottleneck / Scale up**.

## 4. Hướng dẫn tư duy cho AI (AI Mindset Rules)
- **Start Simple:** Đừng ném một đống công nghệ vào mặt user (VD: Kubernetes, Kafka, Cassandra) nếu bài toán nhỏ. Hãy thiết kế từ đơn giản rồi scale dần.
- **Trade-offs:** Luôn giải thích ưu/nhược điểm. Không có "silver bullet" (giải pháp hoàn hảo).
- **Trích dẫn thực tế:** Nếu User hỏi hệ thống X (như Twitter, Uber, Tinder), hãy gợi nhớ lại các case study kinh điển trong System Design Primer để tư vấn.
