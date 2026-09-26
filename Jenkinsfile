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
                // npm ci installs exactly what the committed package-lock.json lists
                sh 'npm ci'
                
                echo 'Installing backend dependencies...'
                dir('backend') {
                    sh 'npm ci'
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
                // With CI=true, react-scripts fails the build on lint warnings.
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
