# 汇率系统云端部署指南

本文档详细介绍如何将汇率系统部署到各大云平台，并实现远程代码修改和自动部署。

## 📋 目录

- [系统架构](#系统架构)
- [前置要求](#前置要求)
- [Docker容器化](#docker容器化)
- [云平台部署](#云平台部署)
  - [AWS部署](#aws部署)
  - [阿里云部署](#阿里云部署)
  - [腾讯云部署](#腾讯云部署)
- [CI/CD自动部署](#cicd自动部署)
- [远程代码修改](#远程代码修改)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │    │  后端 (Flask)   │
│   Port: 80      │────│   Port: 5001    │
│   Nginx         │    │   SQLite DB     │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
            ┌─────────────┐
            │  负载均衡器  │
            │   (云平台)   │
            └─────────────┘
```

## 🔧 前置要求

### 本地环境
- Docker >= 20.10
- Docker Compose >= 2.0
- Git
- 云平台CLI工具（根据选择的平台）

### 云平台账号
- AWS账号（使用ECS）
- 阿里云账号（使用容器服务ACK）
- 腾讯云账号（使用TKE）

## 🐳 Docker容器化

### 1. 构建镜像

```bash
# 构建后端镜像
cd backend
docker build -t currency-exchange-backend .

# 构建前端镜像
cd ../frontend
docker build -t currency-exchange-frontend .
```

### 2. 本地测试

```bash
# 在项目根目录运行
docker-compose up -d

# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 访问应用
# 前端: http://localhost:80
# 后端API: http://localhost:5001/api
```

## ☁️ 云平台部署

### AWS部署

#### 1. 准备工作

```bash
# 安装AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 配置AWS凭证
aws configure
```

#### 2. 创建ECR仓库

```bash
# 创建后端镜像仓库
aws ecr create-repository --repository-name currency-exchange-backend --region us-west-2

# 创建前端镜像仓库
aws ecr create-repository --repository-name currency-exchange-frontend --region us-west-2
```

#### 3. 创建ECS集群

```bash
# 创建集群
aws ecs create-cluster --cluster-name currency-exchange-cluster --region us-west-2

# 注册任务定义
aws ecs register-task-definition --cli-input-json file://deploy/aws/task-definition.json --region us-west-2

# 创建服务
aws ecs create-service \
  --cluster currency-exchange-cluster \
  --service-name currency-exchange-service \
  --task-definition currency-exchange-task \
  --desired-count 2 \
  --region us-west-2
```

#### 4. 部署应用

```bash
cd deploy/aws
chmod +x deploy.sh
./deploy.sh production us-west-2
```

### 阿里云部署

#### 1. 准备工作

```bash
# 安装阿里云CLI
wget https://aliyuncli.alicdn.com/aliyun-cli-linux-latest-amd64.tgz
tar -xzf aliyun-cli-linux-latest-amd64.tgz
sudo mv aliyun /usr/local/bin/

# 配置阿里云凭证
aliyun configure
```

#### 2. 创建ACK集群

通过阿里云控制台创建Kubernetes集群，或使用CLI：

```bash
# 创建集群（需要根据实际情况调整参数）
aliyun cs POST /clusters --body '{
  "name": "currency-exchange-cluster",
  "cluster_type": "Kubernetes",
  "region_id": "cn-hangzhou",
  "kubernetes_version": "1.24.6-aliyun.1"
}'
```

#### 3. 部署应用

```bash
cd deploy/aliyun
chmod +x deploy.sh
./deploy.sh production cn-hangzhou
```

### 腾讯云部署

#### 1. 准备工作

```bash
# 安装腾讯云CLI
pip install tccli

# 配置腾讯云凭证
tccli configure
```

#### 2. 部署应用

```bash
cd deploy/tencent
chmod +x deploy.sh
./deploy.sh production ap-guangzhou
```

## 🔄 CI/CD自动部署

### GitHub Actions

1. **设置Secrets**
   
   在GitHub仓库设置中添加以下Secrets：
   
   ```
   # Docker Hub
   DOCKER_USERNAME
   DOCKER_PASSWORD
   
   # AWS
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   AWS_REGION
   
   # 阿里云
   ALIYUN_ACCESS_KEY_ID
   ALIYUN_ACCESS_KEY_SECRET
   ALIYUN_REGION
   
   # 通知
   SLACK_WEBHOOK
   ```

2. **触发部署**
   
   ```bash
   # 推送到main分支自动触发部署
   git push origin main
   ```

### GitLab CI/CD

1. **设置Variables**
   
   在GitLab项目设置中添加环境变量：
   
   ```
   AWS_REGION
   ALIYUN_REGION
   ALIYUN_ACCESS_KEY_ID
   ALIYUN_ACCESS_KEY_SECRET
   SLACK_WEBHOOK_URL
   ```

2. **手动部署到生产环境**
   
   在GitLab Pipeline页面点击手动部署按钮。

## 💻 远程代码修改

### 1. 使用云端IDE

#### GitHub Codespaces

```bash
# 在GitHub仓库页面点击 "Code" -> "Codespaces" -> "Create codespace"
# 或使用GitHub CLI
gh codespace create
```

#### GitLab Web IDE

```bash
# 在GitLab项目页面点击 "Web IDE" 按钮
```

### 2. 使用VS Code Remote

```bash
# 安装Remote-SSH扩展
# 连接到云服务器
ssh user@your-cloud-server

# 在服务器上克隆代码
git clone https://github.com/your-username/currency-exchange-system.git
cd currency-exchange-system

# 使用VS Code连接
code .
```

### 3. 开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/new-feature

# 2. 进行代码修改
# ...

# 3. 提交更改
git add .
git commit -m "Add new feature"

# 4. 推送到远程仓库
git push origin feature/new-feature

# 5. 创建Pull Request/Merge Request

# 6. 合并到main分支后自动部署
```

## 📊 监控和维护

### 1. 健康检查

```bash
# 检查服务状态
curl -f http://your-domain.com/api/health

# 检查容器状态
docker ps
docker-compose ps
```

### 2. 日志查看

```bash
# Docker Compose日志
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes日志
kubectl logs -f deployment/currency-backend -n currency-exchange
kubectl logs -f deployment/currency-frontend -n currency-exchange
```

### 3. 性能监控

推荐使用以下监控工具：
- **Prometheus + Grafana**：指标监控
- **ELK Stack**：日志分析
- **云平台监控**：AWS CloudWatch、阿里云监控、腾讯云监控

## 🔧 故障排除

### 常见问题

#### 1. 容器启动失败

```bash
# 查看容器日志
docker logs container-name

# 检查端口占用
netstat -tulpn | grep :5001

# 检查磁盘空间
df -h
```

#### 2. 数据库连接问题

```bash
# 检查数据库文件权限
ls -la backend/instance/

# 重新初始化数据库
cd backend
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

#### 3. 网络连接问题

```bash
# 检查网络连通性
ping backend-service
telnet backend-service 5001

# 检查DNS解析
nslookup backend-service
```

#### 4. 部署失败

```bash
# 检查镜像是否存在
docker images | grep currency-exchange

# 检查集群状态
kubectl get nodes
kubectl get pods -n currency-exchange

# 查看部署事件
kubectl describe deployment currency-backend -n currency-exchange
```

### 回滚操作

```bash
# Docker Compose回滚
git checkout previous-commit
docker-compose down
docker-compose up -d

# Kubernetes回滚
kubectl rollout undo deployment/currency-backend -n currency-exchange
kubectl rollout undo deployment/currency-frontend -n currency-exchange
```

## 📞 技术支持

如遇到问题，请按以下顺序排查：

1. 查看本文档的故障排除部分
2. 检查应用日志和系统日志
3. 查看云平台监控指标
4. 联系技术支持团队

---

**注意**：请根据实际情况修改配置文件中的占位符（如账号ID、域名等）。