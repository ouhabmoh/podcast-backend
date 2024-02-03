pipeline {
    agent any
    tools {nodejs "nodejs"}
    stages {
        stage('Build and Test') {
            steps {
                script {
                    // Run npm commands for testing
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    sh 'docker-compose build'
                }
            }
        }

        stage('Run Docker Compose') {
            steps {
                script {
                    // Run Docker Compose to start your application
                    sh 'docker-compose up -d'
                }
            }
        }
    }

    post {
        always {
            // Cleanup: Stop and remove containers after the pipeline finishes
            script {
                sh 'docker-compose down'
            }
        }
    }
}
