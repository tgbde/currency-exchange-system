#!/bin/bash

# 阿里云容器服务部署脚本
# 使用方法: ./deploy.sh [环境] [区域]
# 例如: ./deploy.sh production cn-hangzhou

set -e

# 默认参数
ENVIRONMENT=${1:-production}
REGION=${2:-cn-hangzhou}
CLUSTER_ID="your-cluster-id"
NAMESPACE="currency-exchange"
REGISTRY="registry.${REGION}.aliyuncs.com"
REPOSITORY="your-namespace/currency-exchange"

echo "🚀 开始部署到阿里云容器服务..."
echo "环境: $ENVIRONMENT"
echo "区域: $REGION"

# 检查阿里云CLI是否已安装
if ! command -v aliyun &> /dev/null; then
    echo "❌ 阿里云CLI未安装，请先安装阿里云CLI"
    exit 1
fi

# 检查Docker是否已安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查kubectl是否已安装
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl未安装，请先安装kubectl"
    exit 1
fi

# 构建Docker镜像
echo "📦 构建Docker镜像..."
cd ../../
docker build -t currency-exchange:latest .

# 登录到阿里云容器镜像服务
echo "🔐 登录到阿里云容器镜像服务..."
docker login --username=your-username $REGISTRY

# 标记镜像
echo "🏷️  标记镜像..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
docker tag currency-exchange:latest $REGISTRY/$REPOSITORY:latest
docker tag currency-exchange:latest $REGISTRY/$REPOSITORY:$ENVIRONMENT-$TIMESTAMP

# 推送镜像
echo "⬆️  推送镜像到阿里云..."
docker push $REGISTRY/$REPOSITORY:latest
docker push $REGISTRY/$REPOSITORY:$ENVIRONMENT-$TIMESTAMP

# 获取集群凭证
echo "🔑 获取集群凭证..."
aliyun cs GET /k8s/$CLUSTER_ID/user_config | jq -r '.config' > ~/.kube/config-aliyun
export KUBECONFIG=~/.kube/config-aliyun

# 应用Kubernetes配置
echo "🔄 应用Kubernetes配置..."
kubectl apply -f k8s/

# 更新镜像
echo "🔄 更新应用镜像..."
kubectl set image deployment/currency-backend currency-backend=$REGISTRY/$REPOSITORY:$ENVIRONMENT-$TIMESTAMP -n $NAMESPACE
kubectl set image deployment/currency-frontend currency-frontend=$REGISTRY/$REPOSITORY:$ENVIRONMENT-$TIMESTAMP -n $NAMESPACE

# 等待部署完成
echo "⏳ 等待部署完成..."
kubectl rollout status deployment/currency-backend -n $NAMESPACE
kubectl rollout status deployment/currency-frontend -n $NAMESPACE

echo "✅ 部署完成！"

# 获取服务访问地址
echo "🌐 获取服务访问地址:"
kubectl get svc -n $NAMESPACE

# 显示Pod状态
echo "📊 Pod状态:"
kubectl get pods -n $NAMESPACE