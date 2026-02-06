pipeline {
    agent any
    options { 
        skipDefaultCheckout(true)                // 跳过默认的 checkout 步骤
        // 构建历史保留策略
        buildDiscarder(logRotator(
            numToKeepStr: '10',                // 保留最近10次构建
            daysToKeepStr: '7',               // 保留7天内的构建
            artifactNumToKeepStr: '5'        // 保留最近5次构建的工件
        ))
        timeout(time: 30, unit: 'MINUTES')  // 构建超时时间30分钟
    }

    environment {
        IMAGE = 'printer-server'        // Docker 镜像名
        APP_NAME = 'printer-server'    // 容器名称
        PORT = '8001'                    // 服务端口

        CONFIG_CREDENTIAL_ID = 'printer-server-env'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                script {
                    def nodeHome = tool 'NodeJS-22'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }

        stage('Node Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker rmi ${IMAGE}:latest || true"
                sh "docker build -t ${IMAGE}:latest -f Dockerfile ."
            }
        }

        stage('Deploy') {
            steps {
                script {
                    withCredentials([file(credentialsId: CONFIG_CREDENTIAL_ID, variable: 'ENV_FILE')]) {
                        sh 'cp -f $ENV_FILE .env'
                        sh 'chmod 600 .env'
                    }
                    sh "IMAGE=${IMAGE} APP_NAME=${APP_NAME} docker compose -f docker-compose.yml up -d --force-recreate"
                    // 轮询直到容器可 exec 且 /app/uploads 已挂载，再设置命名卷权限
                    for (int i = 0; i < 15; i++) {
                        def rc = sh(script: "docker exec ${APP_NAME} test -d /app/uploads", returnStatus: true)
                        if (rc == 0) break
                        sleep(time: 1, unit: 'SECONDS')
                    }
                    sh "docker exec -u root ${APP_NAME} sh -c 'chmod -R 777 /app/uploads && chown -R 1001:1001 /app/uploads' || true"
                }
            }
        }

        stage('Health') {
            steps {
                script {
                    def healthStatus = sh(
                        script: "docker inspect --format='{{.State.Health.Status}}' ${APP_NAME} 2>/dev/null || echo 'starting'",
                        returnStdout: true
                    ).trim()
                    echo "容器健康状态: ${healthStatus}"
                }
            }
        }
    }

    post {
        success {
            echo '✅ 构建成功'
        }

        failure {
            echo '❌ 构建失败'
        }

        cleanup {
            cleanWs()
        }
    }
}
