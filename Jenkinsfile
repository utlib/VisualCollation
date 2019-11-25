#!groovy

@Library('slack-notify') _

 // Variable to store an error message in any stage
def errorMessage = ""

def getSiteName() {
  def currentBranch = "$gitlabSourceBranch".getAt(("$gitlabSourceBranch".indexOf('/')+1..-1))
  return currentBranch==PRODUCTION_BRANCH ? 'viscoll' : 'utlviscoll';
}

def isDeploymentBranch(){
  def currentBranch = "$gitlabSourceBranch".getAt(("$gitlabSourceBranch".indexOf('/')+1..-1))
  return currentBranch==PRODUCTION_BRANCH || currentBranch==USABILITY_BRANCH;
}

def isProductionBranch(){
  def currentBranch = "$gitlabSourceBranch".getAt(("$gitlabSourceBranch".indexOf('/')+1..-1))
  return currentBranch==PRODUCTION_BRANCH;
}

def isUsabilityBranch(){
  def currentBranch = "$gitlabSourceBranch".getAt(("$gitlabSourceBranch".indexOf('/')+1..-1))
  return currentBranch==USABILITY_BRANCH;
}

node('harmonic-agent2') { 
  // construct global env variables
  withEnv([
    'SITE_NAME=leme',
    'PRODUCTION_BRANCH=master',
    'USABILITY_BRANCH=usability',
    'SLACK_CHANNEL=#digital-projects',
    "HOME=${workspace}",
    "GEM_HOME=${workspace}"
  ]){
    try {
      stage ('Checkout SCM') {
        checkout scm
      }

      docker.withServer('tcp://harmonic-agent2.vmdata.utl:2376') {
        docker.build("viscoll").inside {
          stage ('Build NPM') {
            try {
              dir ('viscoll-app') {
                sh 'npm i'
                sh 'npm run build'
              }
            } catch (e) {
              if (!errorMessage) {
                errorMessage = "Failed.\n\n${e.message}"
              }
              currentBuild.currentResult = 'FAILURE'
            }
          }

          stage ('Setup Folder Stucture') {
            try {
              echo "make directories for Rails and React"
              sh 'mkdir -p RAILS'
              sh 'mkdir -p REACT'
              echo "copying rails folder structure into RAILS directory"
              sh 'cp viscoll-api/* ./RAILS/ -f -r'
              echo "copying contents of react build directory into REACT directory"
              sh 'cp viscoll-app/build/* ./REACT/ -f -r'
              echo "copying node modules folder into REACT directory"
              sh 'cp viscoll-app/node_modules ./REACT/node_modules -f -r'
              sh 'mkdir -p test_report'
              if (isProductionBranch()){
                sh 'sed -i "21 s/dummy/viscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
                sh 'sed -i "24 s/dummy/viscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
                sh 'sed -i "30 s/dummy/viscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
                sh 'sed -i "18 s/dummy@library.utoronto.ca/rachel.dicresce@utoronto.ca/" RAILS/app/mailers/mailer.rb'
                sh 'sed -i "4 s/dummy/viscoll/" RAILS/app/controllers/application_controller.rb'
              }
              if (isUsabilityBranch()){
                sh 'sed -i "21 s/dummy/utlviscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
                sh 'sed -i "24 s/dummy/utlviscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
                sh 'sed -i "30 s/dummy/utlviscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
                sh 'sed -i "18 s/dummy/utlviscoll/" RAILS/app/mailers/mailer.rb'
                sh 'sed -i "4 s/dummy/utlviscoll/" RAILS/app/controllers/application_controller.rb'
              }
            } catch (e) {
              if (!errorMessage) {
                errorMessage = "Failed.\n\n${e.message}"
              }
              currentBuild.currentResult = 'FAILURE'
            }
          }

          stage ('Test Rails') {
            try {
              echo "running rspec tests"
              dir ('viscoll-api') {
                withCredentials([usernamePassword(credentialsId: 'cViscollTest', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                  mongo_URI = "mongodb://$USERNAME:$PASSWORD@mongodb-dev1.vmdata.utl/viscoll_test?replicaSet=mongodb-dev"
                  sh "sed -i \"151 s#mongodb://localhost:27017/viscoll_test#${mongo_URI}#\" config/mongoid.yml"
                }
                sh 'bundle install'
                sh 'bundle exec rspec --format RspecJunitFormatter --out rspec_test_results.xml'    
              }
            } catch (e) {
              if (!errorMessage) {
                errorMessage = "Failed.\n\n${e.message}"
              }
              currentBuild.currentResult = 'FAILURE'
            }
            try {
              sh 'cp viscoll-api/rspec_test_results.xml test_report/'
              junit 'test_report/rspec_test_results.xml'
              publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'viscoll-api/coverage', reportFiles: 'index.html', reportName: 'Rails Coverage Report'])
            } catch (e) {
              if (!errorMessage) {
                errorMessage = "Failed.\n\n${e.message}"
              }
              currentBuild.currentResult = 'FAILURE'
            }
          }
        }
      }

      stage ('Rails Brickyard Upload') {
        try {
          if (isDeploymentBranch() && !errorMessage) {
            dir ('RAILS') {
              echo "compress RAILS folder and upload to brickyard"
              sh "tar zcf ${getSiteName()}-api.tar.gz * --transform \"s,^,${getSiteName()}-api/,S\" -X ../exclude.txt --exclude=${getSiteName()}-api.tar.gz --overwrite --warning=none"
              sh "/usr/local/maven/bin/mvn deploy:deploy-file -DgroupId=ca.utoronto.library -DartifactId=${getSiteName()}-api -Dversion=SNAPSHOT -DgeneratePom=true -Dpackaging=tgz -DrepositoryId=brickyard -Durl=https://brickyard.library.utoronto.ca/content/repositories/utl-snapshots -Dfile=${getSiteName()}-api.tar.gz"
            }
          }
          else {
            echo "Skipping: Not deployment branch or an error occurred"
          }
        } catch (e) {
          if (!errorMessage) {
            errorMessage = "Failed.\n\n${e.message}"
          }
          currentBuild.currentResult = 'FAILURE'
        }
      }

      stage ('React Brickyard Upload') {
        try {
          if (isDeploymentBranch() && !errorMessage) {
            dir ('REACT') {
              echo "compress REACT folder and upload to brickyard"
              sh "tar zcf ${getSiteName()}-app.tar.gz * --transform \"s,^,${getSiteName()}-app/,S\" -X ../exclude.txt --exclude=${getSiteName()}-app.tar.gz --overwrite --warning=none"
              sh "/usr/local/maven/bin/mvn deploy:deploy-file -DgroupId=ca.utoronto.library -DartifactId=${getSiteName()}-app -Dversion=SNAPSHOT -DgeneratePom=true -Dpackaging=tgz -DrepositoryId=brickyard -Durl=https://brickyard.library.utoronto.ca/content/repositories/utl-snapshots -Dfile=${getSiteName()}-app.tar.gz"
            }
          }
          else {
            echo "Skipping: Not deployment branch or an error occurred"
          }
        } catch (e) {
          if (!errorMessage) {
            errorMessage = "Failed.\n\n${e.message}"
          }
          currentBuild.currentResult = 'FAILURE'
        }
      }

      stage ('Rails Chef Deploy') {
        try {
          if (isDeploymentBranch() && !errorMessage) {
            build job: 'Deploy via Chef', 
              parameters: [
                string(name: 'CHEF_SEARCH', value: 'recipe:app-viscoll-api%20AND%20chef_environment:utl-production')
              ] 
          }
          else {
            echo "Skipping: Not deployment branch or an error occurred"
          }
        } catch (e) {
          if (!errorMessage) {
            errorMessage = "Failed.\n\n${e.message}"
          }
          currentBuild.currentResult = 'FAILURE'
        }
      }

      stage ('React Chef Deploy') {
        try {
          if (isDeploymentBranch() && !errorMessage) {
            build job: 'Deploy via Chef', 
              parameters: [
                string(name: 'CHEF_SEARCH', value: 'recipe:app-viscoll%20AND%20chef_environment:utl-production')
              ] 
          }
          else {
            echo "Skipping: Not deployment branch or an error occurred"
          }
        } catch (e) {
          if (!errorMessage) {
            errorMessage = "Failed.\n\n${e.message}"
          }
          currentBuild.currentResult = 'FAILURE'
        }
      }
    }
    finally {
      stage ('Cleanup') {
        echo "Sending final build status notification to slack"
        if (!errorMessage && !isDeploymentBranch()) errorMessage = "Not a deployment branch. Build skipped."
        echo "$errorMessage"
        notifySlack status: currentBuild.currentResult, message: errorMessage, channel: SLACK_CHANNEL
        deleteDir() // Recursively clean workspace
      }
    }
  }
}
