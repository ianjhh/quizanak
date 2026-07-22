pipeline {
    agent any

    environment {
        // Setting CI=true prevents react-scripts test from running in interactive watch mode
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the repository
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing frontend dependencies...'
                // Using npm ci if package-lock.json is committed, otherwise npm install
                sh 'npm install'
                
                echo 'Installing backend dependencies...'
                dir('backend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Test Frontend') {
            steps {
                echo 'Running frontend tests...'
                sh 'npm test'
            }
        }
        
        stage('Test Backend') {
            steps {
                echo 'Running backend tests...'
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo 'Building production build for frontend...'
                sh 'npm run build'
            }
        }
        
        // Add deployment stage here if needed
        // stage('Deploy') {
        //     steps {
        //         echo 'Deploying application...'
        //     }
        // }
    }
    
    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Build and tests successful!'
        }
        failure {
            echo 'Pipeline failed. Check logs for errors.'
        }
    }
}
