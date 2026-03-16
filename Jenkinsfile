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
        IMAGE = 'printer'              // 需与服务器 docker-compose 中 image 名一致
        REGISTRY = 'docker.io'         // docker.io=从凭据读用户名；或填私有仓库如 registry.example.com
        REGISTRY_CREDENTIAL_ID = 'docker-registry'

        REMOTE_HOST = '47.238.243.254'        // 部署目标 IP 或 hostname
        REMOTE_PATH = '/www/printer-server'
        SSH_CREDENTIAL_ID = 'ssh'             // SSH 凭据 (Username with password)
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker rmi ${IMAGE}:latest || true"
                sh "docker build -t ${IMAGE}:latest -f Dockerfile ."
            }
        }

        stage('Push Image') {
            when { expression { return env.REGISTRY?.trim() } }
            steps {
                script {
                    def tag = env.BUILD_NUMBER ?: 'latest'
                    withCredentials([usernamePassword(credentialsId: REGISTRY_CREDENTIAL_ID, usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
                        def prefix = (REGISTRY == 'docker.io') ? "docker.io/${REG_USER}" : REGISTRY
                        def fullImage = "${prefix}/${IMAGE}:${tag}"
                        def loginHost = (REGISTRY == 'docker.io') ? 'docker.io' : REGISTRY
                        sh "echo \$REG_PASS | docker login -u \$REG_USER --password-stdin ${loginHost}"
                        sh "docker tag ${IMAGE}:latest ${fullImage}"
                        sh "docker tag ${IMAGE}:latest ${prefix}/${IMAGE}:latest"
                        sh "docker push ${fullImage}"
                        sh "docker push ${prefix}/${IMAGE}:latest"
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                allOf {
                    expression { env.REMOTE_HOST?.trim() }
                    expression { env.REGISTRY?.trim() }
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: SSH_CREDENTIAL_ID, usernameVariable: 'SSH_USER', passwordVariable: 'SSH_PASS')]) {
                    sh "export SSHPASS=\$SSH_PASS && sshpass -e ssh -o StrictHostKeyChecking=no \${SSH_USER}@${env.REMOTE_HOST} 'cd ${env.REMOTE_PATH} && ./deploy.sh'"
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
