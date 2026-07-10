 # 在线预约系统 — 后端技术文档

 > 文档生成日期：2026-07-08
 > 项目路径：`D:\MyPro\online-booking-system\backend`

 ---

 ## 目录

 1. [数据库物理设计（DDL）](#一数据库物理设计ddl)
 2. [后端体系架构与类设计](#二后端体系架构与类设计)
 3. [核心冲突算法设计](#三核心冲突算法设计)
 4. [API 接口设计](#四api-接口设计)

 ---

 ## 一、数据库物理设计（DDL）

 **数据库名：** `db_online_reservation`  
 **MySQL 版本：** 8.0+  
 **字符集：** `utf8mb4` / `utf8mb4_unicode_ci`  
 **建表脚本位置：** `backend/src/main/resources/sql/init_schema.sql`

 共 5 张表，所有外键均为 `ON DELETE CASCADE`。

 ---

 ### 1.1 T_User — 用户表

 | 字段 | 类型 | 约束 | 说明 |
 |---|---|---|---|
 | user_id | INT | PK, AUTO_INCREMENT | 用户唯一标识 |
 | username | VARCHAR(50) | NOT NULL, UNIQUE | 登录账号（手机号） |
 | password_hash | CHAR(64) | NOT NULL | SHA256 哈希密码 |
 | phone | VARCHAR(20) | NOT NULL | 联系电话 |
 | register_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 注册时间 |
 | role | VARCHAR(20) | NOT NULL, DEFAULT 'USER' | 角色：USER / MERCHANT / ADMIN |

 ```sql
 CREATE TABLE IF NOT EXISTS T_User (
     user_id       INT AUTO_INCREMENT COMMENT '用户唯一标识',
     username      VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户账号/手机号',
     password_hash CHAR(64)     NOT NULL COMMENT '密码哈希(SHA256)',
     phone         VARCHAR(20)  NOT NULL COMMENT '用户联系手机号',
     register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
     role          VARCHAR(20)  NOT NULL DEFAULT 'USER' COMMENT '角色分类(USER/MERCHANT/ADMIN)',
     PRIMARY KEY (user_id)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基础表';
 ```

 ---

 ### 1.2 T_Service — 服务项目表

 | 字段 | 类型 | 约束 | 说明 |
 |---|---|---|---|
 | service_id | INT | PK, AUTO_INCREMENT | 服务唯一标识 |
 | service_name | VARCHAR(100) | NOT NULL | 服务名称 |
 | description | TEXT | — | 详细描述 |
 | price | DECIMAL(10,2) | NOT NULL, DEFAULT 0.00 | 价格 |
 | category | VARCHAR(50) | — | 分类标签 |
 | merchant_id | INT | NOT NULL, FK → T_User(user_id) | 商家用户 ID |

 ```sql
 CREATE TABLE IF NOT EXISTS T_Service (
     service_id   INT AUTO_INCREMENT COMMENT '服务项目唯一标识',
     service_name VARCHAR(100) NOT NULL COMMENT '服务名称',
     description  TEXT COMMENT '服务详细描述',
     price        DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '服务收费价格',
     category     VARCHAR(50) COMMENT '服务分类',
     merchant_id  INT NOT NULL COMMENT '发布服务的商家用户ID',
     PRIMARY KEY (service_id),
     CONSTRAINT fk_service_merchant FOREIGN KEY (merchant_id) REFERENCES T_User(user_id) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务项目表';
 ```

 ---

 ### 1.3 T_Schedule — 排班时间段表

 | 字段 | 类型 | 约束 | 说明 |
 |---|---|---|---|
 | schedule_id | INT | PK, AUTO_INCREMENT | 排班唯一标识 |
 | service_id | INT | NOT NULL, FK → T_Service(service_id) | 关联服务 ID |
 | start_time | DATETIME | NOT NULL | 时段开始时间 |
 | end_time | DATETIME | NOT NULL | 时段结束时间 |
 | capacity | INT | NOT NULL, DEFAULT 1 | 最大可预约人数 |
 | booked_count | INT | NOT NULL, DEFAULT 0 | 已预约人数 |

 ```sql
 CREATE TABLE IF NOT EXISTS T_Schedule (
     schedule_id  INT AUTO_INCREMENT COMMENT '排班唯一标识',
     service_id   INT NOT NULL COMMENT '关联的服务ID',
     start_time   DATETIME NOT NULL COMMENT '排班开始时间',
     end_time     DATETIME NOT NULL COMMENT '排班结束时间',
     capacity     INT NOT NULL DEFAULT 1 COMMENT '该时段最大可预约人数上限',
     booked_count INT NOT NULL DEFAULT 0 COMMENT '已预约成功名额',
     PRIMARY KEY (schedule_id),
     CONSTRAINT fk_schedule_service FOREIGN KEY (service_id) REFERENCES T_Service(service_id) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排班名额时间段表';
 ```

 ---

 ### 1.4 T_Appointment — 预约订单表

 | 字段 | 类型 | 约束 | 说明 |
 |---|---|---|---|
 | appointment_id | INT | PK, AUTO_INCREMENT | 订单唯一标识 |
 | user_id | INT | NOT NULL, FK → T_User(user_id) | 预约用户 ID |
 | service_id | INT | NOT NULL, FK → T_Service(service_id) | 预约服务 ID |
 | schedule_id | INT | NOT NULL, FK → T_Schedule(schedule_id) | 预约排班 ID |
 | status | TINYINT | NOT NULL, DEFAULT 1 | 1待确认 2已确认 3已拒绝 4已取消 5已完成 |
 | create_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 下单时间 |

 ```sql
 CREATE TABLE IF NOT EXISTS T_Appointment (
     appointment_id INT AUTO_INCREMENT COMMENT '预约订单唯一标识',
     user_id        INT NOT NULL COMMENT '预约的普通用户ID',
     service_id     INT NOT NULL COMMENT '预约的服务ID',
     schedule_id    INT NOT NULL COMMENT '预约的排班时段ID',
     status         TINYINT NOT NULL DEFAULT 1 COMMENT '状态码(1待确认 2已确认 3已拒绝 4已取消 5已完成)',
     create_time    DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
     PRIMARY KEY (appointment_id),
     CONSTRAINT fk_appointment_user     FOREIGN KEY (user_id)     REFERENCES T_User(user_id)     ON DELETE CASCADE,
     CONSTRAINT fk_appointment_service  FOREIGN KEY (service_id)  REFERENCES T_Service(service_id) ON DELETE CASCADE,
     CONSTRAINT fk_appointment_schedule FOREIGN KEY (schedule_id) REFERENCES T_Schedule(schedule_id) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约订单流水表';
 ```

 ---

 ### 1.5 T_Comment — 评价表

 | 字段 | 类型 | 约束 | 说明 |
 |---|---|---|---|
 | comment_id | INT | PK, AUTO_INCREMENT | 评价唯一标识 |
 | appointment_id | INT | NOT NULL, UNIQUE, FK → T_Appointment(appointment_id) | 关联订单 ID |
 | rating_star | TINYINT | NOT NULL, DEFAULT 5 | 1-5 星 |
 | content | TEXT | — | 评语内容 |
 | comment_time | DATETIME | DEFAULT CURRENT_TIMESTAMP | 发表时间 |

 ```sql
 CREATE TABLE IF NOT EXISTS T_Comment (
     comment_id     INT AUTO_INCREMENT COMMENT '评价唯一标识',
     appointment_id INT NOT NULL UNIQUE COMMENT '关联的预约订单ID',
     rating_star    TINYINT NOT NULL DEFAULT 5 COMMENT '评价星级(1至5星)',
     content        TEXT COMMENT '评语详细文本内容',
     comment_time   DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发表时间',
     PRIMARY KEY (comment_id),
     CONSTRAINT fk_comment_appointment FOREIGN KEY (appointment_id) REFERENCES T_Appointment(appointment_id) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户服务评价表';
 ```

 ---

 ## 二、后端体系架构与类设计

 ### 2.1 整体架构

 采用 **Spring Boot 经典三层架构**：

 ```
 ┌─────────────────────────────────────────┐
 │        Controller 层（接收HTTP请求）      │
 │  Auth / Service / Schedule / Appointment │
 │  Comment / Stats                        │
 ├─────────────────────────────────────────┤
 │         Service 层（业务逻辑 + 事务）      │
 │  User / Service / Schedule / Appointment │
 │  Comment / Stats                        │
 ├─────────────────────────────────────────┤
 │      Mapper/DAO 层（MyBatis-Plus ORM）    │
 │  UserMapper / ServiceMapper / Schedule   │
 │  AppointmentMapper / CommentMapper       │
 ├─────────────────────────────────────────┤
 │         Entity 实体类（表映射）            │
 │  User / ServiceItem / Schedule /         │
 │  Appointment / Comment                   │
 └─────────────────────────────────────────┘
 ```

 **包结构一览：**

 ```
 com.booking
 ├── OnlineBookingApplication.java        ← 启动入口
 ├── config/                              ← 配置层
 │   ├── MyBatisPlusConfig.java           ← 分页插件
 │   ├── MyMetaObjectHandler.java         ← 自动填充时间戳
 │   └── WebMvcConfig.java                ← CORS 跨域配置
 ├── common/                              ← 公共组件
 │   ├── ApiResponse.java                 ← 统一响应封装
 │   ├── AppointmentStatus.java           ← 状态常量（1-5）
 │   ├── BusinessException.java           ← 业务异常体系
 │   └── GlobalExceptionHandler.java      ← 全局异常处理器
 ├── controller/                          ← Controller 层
 │   ├── AuthController.java
 │   ├── ServiceController.java
 │   ├── ScheduleController.java
 │   ├── AppointmentController.java
 │   ├── CommentController.java
 │   └── StatsController.java
 ├── service/                             ← Service 层
 │   ├── UserService.java
 │   ├── ServiceService.java
 │   ├── ScheduleService.java
 │   ├── AppointmentService.java
 │   ├── CommentService.java
 │   └── StatsService.java
 ├── mapper/                              ← Mapper/DAO 层
 │   ├── UserMapper.java
 │   ├── ServiceMapper.java
 │   ├── ScheduleMapper.java
 │   ├── AppointmentMapper.java
 │   └── CommentMapper.java
 ├── entity/                              ← Entity 实体类
 │   ├── User.java
 │   ├── ServiceItem.java
 │   ├── Schedule.java
 │   ├── Appointment.java
 │   └── Comment.java
 ├── dto/                                 ← DTO 数据传输对象
 │   ├── LoginRequest.java
 │   ├── LoginResponse.java（内嵌 UserInfo）
 │   ├── RegisterRequest.java
 │   ├── ServiceListQuery.java
 │   ├── ServiceDetailResponse.java（内嵌 ScheduleItem）
 │   ├── CreateAppointmentRequest.java
 │   └── SubmitCommentRequest.java
 └── util/                                ← 工具类
     ├── JwtUtil.java
     └── PasswordUtil.java
 ```

 **技术栈：**

 | 组件 | 选型 |
 |---|---|
 | 框架 | Spring Boot 3.3.5 |
 | JDK | 21 |
 | ORM | MyBatis-Plus 3.5.7 |
 | 数据库连接池 | Druid 1.2.23 |
 | 数据库 | MySQL 8.0+ (H2 用于测试) |
 | JWT | JJWT 0.12.6 |
 | API 文档 | Knife4j 4.5.0 |
 | 工具 | Lombok, Hutool 5.8.32 |

 ---

 ### 2.2 Entity 实体层（供 UML 类图参考）

 所有属性均为 `- private`，使用 `@Data` 自动生成 getter/setter。

 **User**
 ```
 - userId: Integer
 - username: String
 - passwordHash: String
 - phone: String
 - registerTime: LocalDateTime
 - role: String                     // USER | MERCHANT | ADMIN
 ```
 表映射：`@TableName("T_User")`，主键：`@TableId(type = IdType.AUTO)`

 **ServiceItem**
 ```
 - serviceId: Integer
 - serviceName: String
 - description: String
 - price: BigDecimal
 - category: String
 - merchantId: Integer
 ```
 表映射：`@TableName("T_Service")`

 **Schedule**
 ```
 - scheduleId: Integer
 - serviceId: Integer
 - startTime: LocalDateTime
 - endTime: LocalDateTime
 - capacity: Integer
 - bookedCount: Integer
 ```
 表映射：`@TableName("T_Schedule")`

 **Appointment**
 ```
 - appointmentId: Integer
 - userId: Integer
 - serviceId: Integer
 - scheduleId: Integer
 - status: Integer                  // 1=待确认 2=已确认 3=已拒绝 4=已取消 5=已完成
 - createTime: LocalDateTime
 ```
 表映射：`@TableName("T_Appointment")`

 **Comment**
 ```
 - commentId: Integer
 - appointmentId: Integer
 - ratingStar: Integer              // 1-5 星
 - content: String
 - commentTime: LocalDateTime
 ```
 表映射：`@TableName("T_Comment")`

 ---

 ### 2.3 Controller 层（供 UML 类图参考）

 所有方法均为 `+ public`。

 | 类 | 方法 | HTTP 路由 |
 |---|---|---|
 | AuthController | +login(LoginRequest): ApiResponse\<LoginResponse\> | POST /api/auth/login |
 | AuthController | +register(RegisterRequest): ApiResponse\<LoginResponse\> | POST /api/auth/register |
 | ServiceController | +listServices(ServiceListQuery): ApiResponse\<List\<ServiceDetailResponse\>\> | GET /api/services |
 | ServiceController | +getServiceDetail(Integer): ApiResponse\<ServiceDetailResponse\> | GET /api/services/{serviceId} |
 | ScheduleController | +getSchedules(Integer): ApiResponse\<List\<ScheduleItem\>\> | GET /api/schedules?serviceId= |
 | AppointmentController | +create(CreateAppointmentRequest, Integer): ApiResponse\<AppointmentVo\> | POST /api/appointments |
 | AppointmentController | +getUserAppointments(Integer): ApiResponse\<List\<AppointmentVo\>\> | GET /api/appointments/user/{userId} |
 | AppointmentController | +getMerchantAppointments(Integer): ApiResponse\<List\<AppointmentVo\>\> | GET /api/appointments/merchant/{merchantId} |
 | AppointmentController | +cancel(Integer, Integer): ApiResponse\<Void\> | PUT /api/appointments/{id}/cancel |
 | AppointmentController | +confirm(Integer): ApiResponse\<Void\> | PUT /api/appointments/{id}/confirm |
 | AppointmentController | +reject(Integer): ApiResponse\<Void\> | PUT /api/appointments/{id}/reject |
 | CommentController | +submit(SubmitCommentRequest): ApiResponse\<Comment\> | POST /api/comments |
 | StatsController | +getMerchantStats(Integer): ApiResponse\<MerchantStatsVo\> | GET /api/stats/merchant/{merchantId} |

 ---

 ### 2.4 Service 层（供 UML 类图参考）

 所有方法均为 `+ public`，使用 `@Transactional` 标注关键业务方法。

 | 类 | 方法 |
 |---|---|
 | UserService | +login(String, String): LoginResponse |
 | UserService | +register(RegisterRequest): LoginResponse |
 | ServiceService | +listServices(ServiceListQuery): List\<ServiceDetailResponse\> |
 | ServiceService | +getServiceDetail(Integer): ServiceDetailResponse |
 | ScheduleService | +getSchedules(Integer): List\<ScheduleItem\> |
 | ScheduleService | +lockSlot(Integer): void |
 | ScheduleService | +releaseSlot(Integer): void |
 | AppointmentService | +create(Integer, Integer, Integer): AppointmentVo |
 | AppointmentService | +cancel(Integer, Integer): void |
 | AppointmentService | +confirm(Integer): void |
 | AppointmentService | +reject(Integer): void |
 | AppointmentService | +getUserAppointments(Integer): List\<AppointmentVo\> |
 | AppointmentService | +getMerchantAppointments(Integer): List\<AppointmentVo\> |
 | CommentService | +getAverageRating(Integer): Double |
 | CommentService | +getReviewCount(Integer): Integer |
 | StatsService | +getMerchantStats(Integer): MerchantStatsVo |

 ---

 ## 三、核心冲突算法设计

 ### 3.1 设计思路

 预约时间冲突判断**不是**在 Java 内存层面做时间段交集运算，而是通过 **T_Schedule 表的 slot（排班时段）+ 原子名额计数** 来规避冲突：

 1. **商家预定义不可再分的时间段**：T_Schedule 的一行就是一个原子 slot，如 `2026-07-10 14:00~15:00`
 2. **同服务同时段的预约共享同一个 schedule_id**，共用 capacity 上限
 3. **下单时用原子 SQL 抢名额**，条件是 `booked_count < capacity`

 **为什么要这样设计？**

 - **避免"查出所有时段 → 逐条比较区间碰撞"的 O(n) 内存循环开销**
 - **MySQL 行锁保证并发安全**，不会超卖
 - **基于 slot 的售罄即止**，无需额外时间区间校验

 ---

 ### 3.2 核心代码

 关键方法位于 `ScheduleService.lockSlot()`：

 ```java
 @Transactional
 public void lockSlot(Integer scheduleId) {
     // 1. 读出当前记录（含 capacity 和 booked_count）
     Schedule schedule = getById(scheduleId);
     if (schedule == null) {
         throw BusinessException.notFound("排班时段");
     }
     if (schedule.getBookedCount() >= schedule.getCapacity()) {
         throw BusinessException.slotFull();
     }
     // 2. 原子 SQL：booked_count = booked_count + 1
     //    条件 booked_count < capacity（防并发超卖）
     boolean updated = lambdaUpdate()
             .eq(Schedule::getScheduleId, scheduleId)
             .lt(Schedule::getBookedCount, schedule.getCapacity())
             .setSql("booked_count = booked_count + 1")
             .update();
     if (!updated) {
         throw BusinessException.slotFull();  // 并发兜底
     }
 }
 ```

 **释放名额（取消/拒绝时调用）：**

 ```java
 @Transactional
 public void releaseSlot(Integer scheduleId) {
     lambdaUpdate()
             .eq(Schedule::getScheduleId, scheduleId)
             .gt(Schedule::getBookedCount, 0)
             .setSql("booked_count = booked_count - 1")
             .update();
 }
 ```

 ---

 ### 3.3 标准伪代码

 ```
 FUNCTION lockSlot(scheduleId):
     schedule ← SELECT * FROM T_Schedule
                WHERE schedule_id = scheduleId

     IF schedule == null:
         THROW "排班时段不存在"

     IF schedule.booked_count >= schedule.capacity:
         THROW "当前时段预约名额已售罄"

     // ★ 原子 UPDATE：MySQL 行锁保证并发安全
     rowsAffected ← UPDATE T_Schedule
                    SET booked_count = booked_count + 1
                    WHERE schedule_id = scheduleId
                      AND booked_count < capacity

     IF rowsAffected == 0:
         THROW "当前时段预约名额已售罄"    // 并发兜底

     RETURN success
 ```

 ---

 ### 3.4 完整预约下单流程

 ```
 AppointmentService.create(userId, serviceId, scheduleId)
 │
 ├── 1. 校验服务存在性
 │      → serviceService.getById(serviceId)
 │
 ├── 2. 抢占排班名额（★ 冲突判断核心）
 │      → scheduleService.lockSlot(scheduleId)
 │
 ├── 3. 创建预约订单，status = 1 (PENDING)
 │      → save(appointment)
 │
 └── 4. 返回组装好的 AppointmentVo

 以上 4 步在同一个 @Transactional 内，原子提交或回滚。
 ```

 ---

 ## 四、API 接口设计

 ### 4.1 统一响应格式

 所有接口统一返回 `ApiResponse<T>` 结构：

 ```json
 {
   "code": 200,
   "message": "success",
   "data": { ... }
 }
 ```

 状态码说明：

 | code | 含义 |
 |---|---|
 | 200 | 成功 |
 | 400 | 业务错误（如名额已满、参数校验失败） |
 | 401 | 未认证（登录失败） |
 | 403 | 无权限 |
 | 404 | 资源不存在 |
 | 409 | 状态冲突 |
 | 500 | 服务器内部错误 |

 ---

 ### 4.2 认证接口

 #### 登录

 ```
 POST /api/auth/login
 Content-Type: application/json

 RequestBody:
 {
   "username": "13800138000",
   "password": "abc123"
 }

 Response 200:
 {
   "code": 200,
   "data": {
     "token": "eyJhbGciOiJIUzI1NiJ9...",
     "user": {
       "userId": 1,
       "username": "13800138000",
       "phone": "13800138000",
       "role": "USER",
       "registerTime": "2026-06-01 10:00:00"
     }
   }
 }

 Response 401:
 { "code": 401, "message": "账号或密码错误", "data": null }
 ```

 #### 注册

 ```
 POST /api/auth/register
 Content-Type: application/json

 RequestBody:
 {
   "username": "13800138001",
   "password": "abc123",
   "phone": "13800138001",
   "role": "USER"
 }

 Response 200: 同登录响应，自动返回 token

 Response 400:
 { "code": 400, "message": "该账号已被注册", "data": null }
 ```

 ---

 ### 4.3 服务接口

 #### 服务列表（支持搜索、分类、排序）

 ```
 GET /api/services?keyword=理发&category=美容&sortBy=price

 参数说明（皆可选）：
   keyword  — 关键词（模糊匹配名称和描述）
   category — 分类过滤
   sortBy   — 排序：price（价格升序）| rating（评分降序）

 Response 200:
 {
   "code": 200,
   "data": [
     {
       "serviceId": 1,
       "serviceName": "男士理发",
       "description": "专业理发服务",
       "price": 68.00,
       "category": "美容",
       "merchantId": 2,
       "merchantName": "老王理发",
       "merchantPhone": "13900139000",
       "rating": 4.5,
       "reviewCount": 0,
       "schedules": [
         {
           "scheduleId": 1,
           "startTime": "2026-07-10 14:00:00",
           "endTime": "2026-07-10 15:00:00",
           "capacity": 3,
           "bookedCount": 1,
           "available": true
         }
       ]
     }
   ]
 }
 ```

 #### 服务详情

 ```
 GET /api/services/{serviceId}

 Response 200: data 为单个 ServiceDetailResponse 对象（同上结构）
 Response 404: { "code": 404, "message": "服务项目不存在" }
 ```

 ---

 ### 4.4 排班时段接口

 ```
 GET /api/schedules?serviceId=1

 Response 200:
 {
   "code": 200,
   "data": [
     {
       "scheduleId": 1,
       "startTime": "2026-07-10 14:00:00",
       "endTime": "2026-07-10 15:00:00",
       "capacity": 3,
       "bookedCount": 1,
       "available": true
     }
   ]
 }
 ```

 说明：只返回 `startTime >= NOW()` 的未来时段，按开始时间升序排列。

 ---

 ### 4.5 预约订单接口（核心）

 #### 提交预约

 ```
 POST /api/appointments?userId=1
 Content-Type: application/json

 RequestBody:
 {
   "serviceId": 1,
   "scheduleId": 1
 }

 Response 200:
 {
   "code": 200,
   "message": "预约申请已提交，等待商家审核",
   "data": {
     "appointmentId": 1,
     "userId": 1,
     "username": "13800138000",
     "serviceId": 1,
     "serviceName": "男士理发",
     "merchantName": "老王理发",
     "scheduleId": 1,
     "startTime": "2026-07-10 14:00:00",
     "endTime": "2026-07-10 15:00:00",
     "price": 68.00,
     "status": 1,
     "createTime": "2026-07-08 16:30:00"
   }
 }

 Response 400（满额）:
 { "code": 400, "message": "当前时段预约名额已售罄，请重新选择其他时段" }
 ```

 #### 用户订单列表

 ```
 GET /api/appointments/user/{userId}
 Response 200: data 为 AppointmentVo 数组
 ```

 #### 商家订单列表

 ```
 GET /api/appointments/merchant/{merchantId}
 Response 200: data 为 AppointmentVo 数组
 ```

 #### 取消预约

 ```
 PUT /api/appointments/{id}/cancel?userId=1
 Response 200: { "code": 200, "message": "预约已取消" }
 ```

 #### 商家确认预约

 ```
 PUT /api/appointments/{id}/confirm
 Response 200: { "code": 200, "message": "预约已确认" }
 ```

 #### 商家拒绝预约

 ```
 PUT /api/appointments/{id}/reject
 Response 200: { "code": 200, "message": "预约已拒绝" }
 ```

 ---

 ### 4.6 评价接口

 ```
 POST /api/comments
 Content-Type: application/json

 RequestBody:
 {
   "appointmentId": 1,
   "ratingStar": 5,
   "content": "服务很好！"
 }

 Response 200:
 { "code": 200, "message": "评价成功", "data": { commentId: 1, ... } }
 ```

 参数校验：ratingStar 范围为 1-5，appointmentId 必填。

 ---

 ### 4.7 商家统计接口

 ```
 GET /api/stats/merchant/{merchantId}

 Response 200:
 {
   "code": 200,
   "data": {
     "totalAppointments": 42,
     "completedAppointments": 35,
     "cancelledAppointments": 3,
     "averageRating": 4.5,
     "dailyTrend": [
       { "date": "2026-06-24", "count": 3 },
       { "date": "2026-06-25", "count": 5 }
     ]
   }
 }
 ```

 ---

 ### 4.8 Knife4j 交互式文档

 项目已集成 Knife4j（基于 Swagger/OpenAPI 3.0），开发环境启动后端后访问：

 > `http://localhost:8080/doc.html`

 即可在浏览器中查看所有接口的交互式文档，支持在线调试。
