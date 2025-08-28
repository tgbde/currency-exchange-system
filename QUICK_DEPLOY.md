# 🚀 汇率系统快速部署指南

## 一键本地部署

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd currency-exchange-system

# 2. 启动服务
docker-compose up -d

# 3. 访问应用
# 前端: http://localhost:80
# 后端: http://localhost:5001
```

## 云端部署选择

### 🔥 推荐方案：GitHub + 自动部署

1. **Fork项目到你的GitHub**
2. **设置GitHub Secrets**：
   ```
   DOCKER_USERNAME=你的Docker Hub用户名
   DOCKER_PASSWORD=你的Docker Hub密码
   AWS_ACCESS_KEY_ID=你的AWS访问密钥
   AWS_SECRET_ACCESS_KEY=你的AWS秘密密钥
   AWS_REGION=us-west-2
   ```
3. **推送代码自动部署**：
   ```bash
   git push origin main
   ```

### ⚡ 快速云端部署

#### AWS (推荐)
```bash
# 1. 配置AWS CLI
aws configure

# 2. 运行部署脚本
cd deploy/aws
chmod +x deploy.sh
./deploy.sh production us-west-2
```

#### 阿里云
```bash
# 1. 配置阿里云CLI
aliyun configure

# 2. 运行部署脚本
cd deploy/aliyun
chmod +x deploy.sh
./deploy.sh production cn-hangzhou
```

## 远程代码修改

### 方式1：GitHub Codespaces (推荐)
1. 在GitHub项目页面点击 `Code` → `Codespaces` → `Create codespace`
2. 等待环境启动完成
3. 直接在浏览器中编辑代码
4. 提交后自动部署

### 方式2：本地VS Code + 远程服务器
1. 安装VS Code Remote-SSH扩展
2. 连接到云服务器：`ssh user@your-server`
3. 在服务器上编辑代码
4. 推送到GitHub自动部署

## 🔧 必要配置修改

部署前请修改以下文件中的占位符：

1. **deploy/aws/deploy.sh**
   ```bash
   REPOSITORY_URI="your-account-id.dkr.ecr.us-west-2.amazonaws.com/currency-exchange"
   ```

2. **deploy/aws/task-definition.json**
   ```json
   "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole"
   ```

3. **deploy/aliyun/deploy.sh**
   ```bash
   REPOSITORY="your-namespace/currency-exchange"
   ```

## 📊 部署验证

```bash
# 检查服务状态
curl -f http://your-domain.com/api/health

# 查看容器日志
docker-compose logs -f

# 检查数据库
curl http://your-domain.com/api/rates
```

## 🆘 快速故障排除

| 问题 | 解决方案 |
|------|----------|
| 容器启动失败 | `docker-compose logs` 查看错误日志 |
| 端口被占用 | `netstat -tulpn \| grep :5001` 检查端口 |
| 数据库错误 | 删除 `backend/instance/` 重新启动 |
| 前端无法访问后端 | 检查 `nginx.conf` 中的代理配置 |

## 📞 获取帮助

- 详细文档：查看 `DEPLOYMENT.md`
- 常见问题：查看项目 Issues
- 技术支持：联系开发团队

---

**提示**：首次部署建议先在本地测试，确认无误后再部署到云端。