pipeline {
    agent any

    environment {
        // Your Docker Hub Repositories
        DOCKER_BACKEND_IMAGE = "supun14022/hotel_booking_web-backend"
        DOCKER_FRONTEND_IMAGE = "supun14022/hotel_booking_web-frontend"
        
        // Your AWS EC2 Public IP
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
                    // Create a unique tag using the Git Commit Hash (e.g., a1b2c3d)
                    env.SHORT_COMMIT = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()
                    echo "✅ Version Tag: ${env.SHORT_COMMIT}"
                }
            }
        }

        // --- STAGE 2: Build & Push Images ---
        stage('Build & Push to Docker Hub') {
            parallel {
                stage('Backend') {
                    steps {
                        dir('backend') {
                            script {
                                // Build
                                sh "docker build -t ${DOCKER_BACKEND_IMAGE}:${env.SHORT_COMMIT} ."
                                
                                // Login & Push
                                withCredentials([usernamePassword(credentialsId: 'dockercredentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                                    sh "echo $PASS | docker login -u $USER --password-stdin"
                                    sh "docker push ${DOCKER_BACKEND_IMAGE}:${env.SHORT_COMMIT}"
                                    
                                    // Also update 'latest' tag
                                    sh "docker tag ${DOCKER_BACKEND_IMAGE}:${env.SHORT_COMMIT} ${DOCKER_BACKEND_IMAGE}:latest"
                                    sh "docker push ${DOCKER_BACKEND_IMAGE}:latest"
                                }
                            }
                        }
                    }
                }
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            script {
                                // Build (using network host for better dependency fetching)
                                sh "docker build --network=host -t ${DOCKER_FRONTEND_IMAGE}:${env.SHORT_COMMIT} ."
                                
                                // Login & Push
                                withCredentials([usernamePassword(credentialsId: 'dockercredentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                                    sh "echo $PASS | docker login -u $USER --password-stdin"
                                    sh "docker push ${DOCKER_FRONTEND_IMAGE}:${env.SHORT_COMMIT}"
                                    
                                    // Also update 'latest' tag
                                    sh "docker tag ${DOCKER_FRONTEND_IMAGE}:${env.SHORT_COMMIT} ${DOCKER_FRONTEND_IMAGE}:latest"
                                    sh "docker push ${DOCKER_FRONTEND_IMAGE}:latest"
                                }
                            }
                        }
                    }
                }
            }
        }

        // --- STAGE 3: Deploy to AWS EC2 ---
        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh-key']) {
                    script {
                        def remoteCommand = """
                            # Stop if any command fails
                            set -e
                            
                            echo '🚀 Starting Deployment on EC2...'
                            
                            # 1. Navigate to project folder
                            cd ~/Hotel_Booking_Web
                            
                            # 2. Update the docker-compose.prod.yml file from GitHub
                            git pull origin main
                            
                            # 3. Define the Version Tag we just built
                            export TAG=${env.SHORT_COMMIT}
                            
                            # 4. Pull the NEW images from Docker Hub (Fast download)
                            docker compose -f docker-compose.prod.yml pull
                            
                            # 5. Restart containers with the new version
                            docker compose -f docker-compose.prod.yml up -d
                            
                            # 6. Cleanup old Docker images to save disk space
                            docker image prune -f
                            
                            echo '✅ Deployment Complete!'
                        """
                        
                        sh "ssh -o StrictHostKeyChecking=no ubuntu@${EC2_IP} '${remoteCommand}'"
                    }
                }
            }
        }
    }

    // --- CLEANUP ---
    post {
        always {
            echo "🧹 Cleaning up Jenkins workspace..."
            // Remove the images from the Jenkins server to keep it clean
            sh "docker rmi ${DOCKER_BACKEND_IMAGE}:${env.SHORT_COMMIT} || true"
            sh "docker rmi ${DOCKER_FRONTEND_IMAGE}:${env.SHORT_COMMIT} || true"
            sh "docker rmi ${DOCKER_BACKEND_IMAGE}:latest || true"
            sh "docker rmi ${DOCKER_FRONTEND_IMAGE}:latest || true"
        }
    }
}