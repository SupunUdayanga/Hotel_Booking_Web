pipeline {
    agent any

    environment {
        // Change these to your actual Docker Hub repository names
        DOCKER_BACKEND_IMAGE = "supun14022/hotel_booking_web-backend"
        DOCKER_FRONTEND_IMAGE = "supun14022/hotel_booking_web-frontend"
        
        // Your EC2 IP Address
        EC2_IP = "16.16.211.50" 
    }

    stages {
        // --- STAGE 1: Get Code ---
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'main', url: 'https://github.com/SupunUdayanga/Hotel_Booking_Web.git'
                }
                script {
                    // Generate a short commit hash (e.g., a1b2c3d) to tag images
                    env.SHORT_COMMIT = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()
                    echo "✅ Target Commit: ${env.SHORT_COMMIT}"
                }
            }
        }

        // --- STAGE 2: Build Images (Parallel) ---
        stage('Build Docker Images') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            script {
                                sh "docker build -t ${DOCKER_BACKEND_IMAGE}:${env.SHORT_COMMIT} ."
                            }
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            script {
                                // Network host often needed for frontend builds fetching dependencies
                                sh "docker build --network=host -t ${DOCKER_FRONTEND_IMAGE}:${env.SHORT_COMMIT} ."
                            }
                        }
                    }
                }
            }
        }

        // --- STAGE 3: Push to Registry ---
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockercredentials', 
                    usernameVariable: 'DOCKER_USER', 
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    script {
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"

                        // Push specific version
                        sh "docker push ${DOCKER_BACKEND_IMAGE}:${env.SHORT_COMMIT}"
                        sh "docker push ${DOCKER_FRONTEND_IMAGE}:${env.SHORT_COMMIT}"

                        // Update 'latest' tag as well
                        sh "docker tag ${DOCKER_BACKEND_IMAGE}:${env.SHORT_COMMIT} ${DOCKER_BACKEND_IMAGE}:latest"
                        sh "docker push ${DOCKER_BACKEND_IMAGE}:latest"

                        sh "docker tag ${DOCKER_FRONTEND_IMAGE}:${env.SHORT_COMMIT} ${DOCKER_FRONTEND_IMAGE}:latest"
                        sh "docker push ${DOCKER_FRONTEND_IMAGE}:latest"
                        
                        sh "docker logout"
                    }
                }
            }
        }

        // --- STAGE 4: Deploy to AWS EC2 ---
        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    script {
                        def remoteCommand = """
                            # Stop immediately if any command fails
                            set -e
                            
                            echo '🚀 Starting Deployment on EC2...'
                            
                            # 1. Navigate to folder
                            cd ~/Hotel_Booking_Web
                            
                            # 2. Update the docker-compose file itself (in case you changed configs)
                            git pull origin main
                            
                            # 3. Pull the EXACT version we just built
                            # We pass the TAG variable so it knows which version to get
                            export TAG=${env.SHORT_COMMIT}
                            docker compose -f docker-compose.prod.yml pull
                            
                            # 4. Restart containers
                            docker compose -f docker-compose.prod.yml up -d
                            
                            # 5. Cleanup space
                            docker image prune -f
                            
                            echo '✅ Deployment Complete!'
                        """
                        
                        sh "ssh -o StrictHostKeyChecking=no ubuntu@${EC2_IP} '${remoteCommand}'"
                    }
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up Jenkins workspace..."
            // Remove the images from the Jenkins server to save space
            sh "docker rmi ${DOCKER_BACKEND_IMAGE}:${env.SHORT_COMMIT} || true"
            sh "docker rmi ${DOCKER_FRONTEND_IMAGE}:${env.SHORT_COMMIT} || true"
        }
    }
}