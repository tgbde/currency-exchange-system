#!/bin/bash

# AWS ECS部署脚本
# 使用方法: ./deploy.sh [环境] [区域]
# 例如: ./deploy.sh production us-west-2

set -e

# 默认参数
ENVIRONMENT=${1:-production}
REGION=${2:-us-west-2}
CLUSTER_NAME="currency-exchange-cluster"
SERVICE_NAME="currency-exchange-service"
TASK_FAMILY="currency-exchange-task"
REPOSITORY_URI="your-account-id.dkr.ecr.${REGION}.amazonaws.com/currency-exchange"

echo "🚀 开始部署到AWS ECS..."
echo "环境: $ENVIRONMENT"
echo "区域: $REGION"

# 检查AWS CLI是否已安装
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI未安装，请先安装AWS CLI"
    exit 1
fi

# 检查Docker是否已安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 构建Docker镜像
echo "📦 构建Docker镜像..."
cd ../../
docker build -t currency-exchange:latest .

# 登录到ECR
echo "🔐 登录到Amazon ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REPOSITORY_URI

# 标记镜像
echo "🏷️  标记镜像..."
docker tag currency-exchange:latest $REPOSITORY_URI:latest
docker tag currency-exchange:latest $REPOSITORY_URI:$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)

# 推送镜像到ECR
echo "⬆️  推送镜像到ECR..."
docker push $REPOSITORY_URI:latest
docker push $REPOSITORY_URI:$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)

# 更新ECS服务
echo "🔄 更新ECS服务..."
aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --force-new-deployment \
    --region $REGION

# 等待部署完成
echo "⏳ 等待部署完成..."
aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $REGION

echo "✅ 部署完成！"
echo "🌐 应用URL: https://your-domain.com"

# 显示服务状态
echo "📊 服务状态:"
aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $REGION \
    --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}' \
    --output table