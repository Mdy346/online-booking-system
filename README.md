# 在线预约系统（Online Booking System）

> 大一课程设计项目 —— 一个前后端分离的在线服务预约平台。

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![JDK](https://img.shields.io/badge/JDK-21-orange)](https://openjdk.org/projects/jdk/21/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1)](https://www.mysql.com/)

---

## 📖 项目简介

在线预约系统是一个面向服务行业的预约管理平台，支持**普通用户**浏览服务并预约，以及**商家**管理服务、排班和订单。

### 适用场景

理发店、美容院、健身房、家教、家政保洁、维修服务等需要提前预约的服务行业。

### 核心功能

| 角色 | 功能 |
|------|------|
| **普通用户** | 注册/登录、浏览服务（搜索/筛选/排序）、查看服务详情与排班时段、提交预约、查看我的预约、取消预约、评价已完成的订单、接收预约通知 |
| **商家** | 数据概览（统计面板+趋势图）、服务管理（发布/编辑/删除）、排班管理（时段增删）、预约管理（确认/拒绝/完成）、接收新预约通知 |

---

## 🛠 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| React 18 | UI 框架（函数组件 + Hooks） |
| TypeScript 5.5 | 类型安全的 JavaScript |
| Vite 5 | 构建工具（极速热更新） |
| Tailwind CSS 3 | 原子化 CSS 框架 |
| React Router v6 | 前端路由 |
| Zustand 4 | 轻量级状态管理 |
| Lucide React | 图标库 |

### 后端

| 技术 | 说明 |
|------|------|
| Spring Boot 3.3.5 | Java Web 框架 |
| MyBatis-Plus 3.5.7 | ORM 数据库访问 |
| MySQL 8.0 | 关系型数据库 |
| Druid 1.2 | 数据库连接池 |
| JWT (JJWT 0.12) | 用户认证（24h Token） |
| Knife4j 4.5 | API 交互式文档 |
| Maven | 项目构建与依赖管理 |

---

## 📁 项目结构

```
online-booking-system/
│
├── index.html                  # HTML 入口
├── package.json                # 前端依赖配置
├── vite.config.ts              # Vite 构建配置（含代理配置）
├── tailwind.config.js          # Tailwind 样式配置
├── tsconfig.json               # TypeScript 配置
│
├── public/                     # 静态资源
│   └── favicon.svg
│
├── src/                        # 📦 前端源码
│   ├── main.tsx                # 应用入口
│   ├── App.tsx                 # 根组件（路由配置）
│   ├── index.css               # 全局样式
│   │
│   ├── types/index.ts          # TypeScript 类型定义
│   ├── store/index.ts          # Zustand 全局状态
│   ├── utils/index.ts          # 工具函数
│   │
│   ├── api/index.ts            # API 层（支持 Mock/真实后端双模式）
│   ├── mock/data.ts            # Mock 模拟数据
│   │
│   ├── components/             # 可复用组件
│   │   ├── Navbar.tsx          # 导航栏（含通知铃铛）
│   │   └── ServiceCard.tsx     # 服务卡片
│   │
│   └── pages/                  # 页面组件
│       ├── Login/              # 登录页
│       ├── Register/           # 注册页
│       ├── ServiceList/        # 服务列表（首页）
│       ├── ServiceDetail/      # 服务详情 + 预约
│       ├── MyAppointments/     # 我的预约
│       ├── Merchant/           # 商家后台
│       │   ├── index.tsx       #   布局 + 侧边栏
│       │   ├── Dashboard.tsx   #   数据概览
│       │   ├── Services.tsx    #   服务管理
│       │   └── Schedule.tsx    #   预约管理
│       └── NotFound.tsx        # 404 页面
│
├── backend/                    # 📦 后端源码（Spring Boot）
│   ├── pom.xml                 # Maven 依赖配置
│   └── src/
│       ├── main/
│       │   ├── java/com/booking/
│       │   │   ├── OnlineBookingApplication.java   # 启动类
│       │   │   ├── config/           # 配置（CORS/分页/自动填充）
│       │   │   ├── common/           # 公共类（响应封装/异常/状态码）
│       │   │   ├── controller/       # 控制器（接收 HTTP 请求）
│       │   │   ├── service/          # 业务逻辑层
│       │   │   ├── mapper/           # MyBatis 映射层
│       │   │   ├── entity/           # 数据库表实体类
│       │   │   ├── dto/              # 数据传输对象
│       │   │   └── util/             # 工具类（JWT/密码加密）
│       │   └── resources/
│       │       ├── application.yml   # 应用配置
│       │       └── sql/init_schema.sql  # 数据库建表脚本
│       └── test/                     # 测试代码
│
├── backend.md                  # 后端技术文档
├── 功能测试报告.md              # 功能测试报告
```

---

## 🚀 快速开始

### 环境要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| JDK | ≥ 17（推荐 21） |
| MySQL | 8.0+ |
| Maven | 项目内置 mvnw，无需全局安装 |

### 1. 克隆项目

```bash
git clone https://github.com/Mdy346/online-booking-system.git
cd online-booking-system
```

### 2. 前端启动

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

### 3. 数据库初始化

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE IF NOT EXISTS db_online_reservation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入建表脚本
USE db_online_reservation;
SOURCE backend/src/main/resources/sql/init_schema.sql;
```

### 4. 后端启动

```bash
cd backend

# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run

# 后端运行在 http://localhost:8080
# API 文档页面：http://localhost:8080/doc.html
```

### 5. 前后端联调

将 `src/api/index.ts` 中的配置改为：

```typescript
const USE_MOCK = false;
const API_BASE = "";  // 空字符串走 Vite 代理到 localhost:8080
```

然后重启前端 `npm run dev`，前端将通过 Vite 代理将 `/api` 请求转发到后端。

> **提示：** 如果只是看页面效果，将 `USE_MOCK` 设为 `true` 即可使用前端模拟数据，无需启动后端和数据库。

---

## 🔌 API 接口概览

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |

### 服务

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/services` | 服务列表（支持搜索/筛选/排序） |
| GET | `/api/services/{id}` | 服务详情 |
| POST | `/api/services` | 新增服务（商家） |
| PUT | `/api/services/{id}` | 编辑服务（商家） |
| DELETE | `/api/services/{id}` | 删除服务（商家） |

### 排班

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/schedules?serviceId=` | 排班时段查询 |
| POST | `/api/schedules` | 新增排班时段（商家） |
| DELETE | `/api/schedules/{id}` | 删除排班时段（商家） |

### 预约

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/appointments` | 提交预约 |
| GET | `/api/appointments/user/{userId}` | 用户预约列表 |
| GET | `/api/appointments/merchant/{merchantId}` | 商家预约列表 |
| PUT | `/api/appointments/{id}/cancel` | 取消预约 |
| PUT | `/api/appointments/{id}/confirm` | 商家确认预约 |
| PUT | `/api/appointments/{id}/reject` | 商家拒绝预约 |
| PUT | `/api/appointments/{id}/complete` | 商家完成预约 |

### 评价

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/comments` | 提交评价 |

### 通知

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notifications/user/{userId}` | 用户通知列表 |
| GET | `/api/notifications/user/{userId}/unread-count` | 未读通知数 |
| PUT | `/api/notifications/{notifId}/read` | 标记单条已读 |
| PUT | `/api/notifications/user/{userId}/read-all` | 全部标记已读 |

### 统计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stats/merchant/{merchantId}` | 商家数据统计 |

所有接口统一返回格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

启动后端后，可访问 `http://localhost:8080/doc.html` 在浏览器中查看 **Knife4j 交互式 API 文档**，支持在线调试。

---

## 🧪 测试

### 测试账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| `alice` | `1234` | 普通用户 | 有历史预约记录 |
| `bob_merchant` | `1234` | 商家 | 有 3 个服务项目 |

### 功能测试结果

详见 [功能测试报告.md](./功能测试报告.md)

---

## 👥 团队分工

| 成员 | 职责 |
|------|------|
| 李佳濠 | 前端：页面布局、路由配置、前后端数据交互、UI美化 |
| 马丹阳 | 后端：数据库设计、核心业务逻辑（冲突判断）、后端接口编写、接口联调 |
| 黄怡然 | 测试：Git管理、环境部署、功能测试、文档撰写、兜底辅助 |

---

## 📝 许可证

本项目仅用于学习目的。

---

## 🔗 相关文档

- [后端技术文档（完整 API 与数据库设计）](./backend.md)
- [功能测试报告](./功能测试报告.md)
