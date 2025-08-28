# Vercel 部署指南

本指南将帮助您将货币兑换系统部署到 Vercel 平台。

## 前置条件

1. GitHub 账户
2. Vercel 账户（可使用 GitHub 登录）
3. 项目已推送到 GitHub 仓库

## 部署步骤

### 1. 准备 Vercel 配置

项目已包含 `vercel.json` 配置文件，该文件配置了：
- 前端 React 应用构建
- 后端 Python Flask API
- 路由规则
- 环境变量

### 2. 连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择您的 GitHub 仓库：`tgbde/currency-exchange-system`
4. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
FLASK_ENV=production
DATABASE_URI=sqlite:///currency_exchange.db
API_KEY=your_exchange_rate_api_key
SECRET_KEY=your_secret_key_here
```

### 4. 部署设置

Vercel 会自动检测到配置并：
- 构建前端 React 应用
- 部署后端 Python Flask API
- 配置路由和代理

### 5. 自定义域名（可选）

1. 在项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 按照 DNS 配置说明设置域名解析

## 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `FLASK_ENV` | Flask 运行环境 | `production` |
| `DATABASE_URI` | 数据库连接字符串 | `sqlite:///currency_exchange.db` |
| `API_KEY` | 汇率 API 密钥 | `your_api_key` |
| `SECRET_KEY` | Flask 密钥 | `your_secret_key` |

## 常见问题

### 1. 构建失败

**问题**：前端构建失败
**解决**：检查 `frontend/package.json` 中的依赖版本

### 2. API 请求失败

**问题**：前端无法访问后端 API
**解决**：确保 `vercel.json` 中的路由配置正确

### 3. 数据库问题

**问题**：SQLite 数据库在 Vercel 上的限制
**解决**：考虑使用 PostgreSQL 或 MySQL 等云数据库

### 4. 环境变量未生效

**问题**：环境变量配置后未生效
**解决**：重新部署项目以应用新的环境变量

## 生产环境优化

### 1. 数据库升级

```bash
# 推荐使用 PostgreSQL
DATABASE_URI=postgresql://user:password@host:port/dbname
```

### 2. 缓存配置

在 `vercel.json` 中添加缓存头：

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### 3. 性能监控

- 使用 Vercel Analytics 监控性能
- 配置错误日志收集
- 设置健康检查端点

## 部署后验证

1. 访问部署的 URL
2. 测试前端页面加载
3. 验证 API 端点响应
4. 检查汇率数据更新

## 支持

如果遇到部署问题，请检查：
1. Vercel 部署日志
2. 浏览器开发者工具
3. 网络请求状态
4. 环境变量配置

---

**注意**：首次部署可能需要几分钟时间，请耐心等待构建完成。