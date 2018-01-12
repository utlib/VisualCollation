#!groovy

import groovy.json.JsonOutput
import hudson.tasks.test.AbstractTestResultAction
import hudson.model.Actionable
import hudson.tasks.junit.CaseResult

def isUsabilityBranch(){
  return "${gitlabSourceBranch}"=="usability"
}

def isProductionBranch(){
  return "${gitlabSourceBranch}"=="master"
}

def isPublishingBranch(){
  return isUsabilityBranch() || isProductionBranch()
}

def isResultGoodForPublishing(){
  return currentBuild.result == null || currentBuild.result == 'SUCCESS'
}

def siteName = "utlviscoll"
def slackNotificationChannel = "#mellon"
def author = ""
def commitMessage = ""
def testSummary = ""
def total = 0
def failed = 0
def skipped = 0
def errorOccurred = false


if (isProductionBranch()) {
  siteName = "viscoll"
}

def notifySlack(text, channel, attachments) {
  def slackURL = 'https://hooks.slack.com/services/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'
  def jenkinsIcon = 'https://wiki.jenkins-ci.org/download/attachments/2916393/logo.png'
  def payload = JsonOutput.toJson([text: text,
    channel: channel,
    username: "Jenkins",
    icon_url: jenkinsIcon,
    attachments: attachments
  ])
  sh "curl -X POST --data-urlencode \'payload=${payload}\' ${slackURL}"
}

def getGitAuthor = {
  def commit = sh(returnStdout: true, script: 'git rev-parse HEAD')
  author = sh(returnStdout: true, script: "git --no-pager show -s --format='%an' ${commit}").trim()
}

def getLastCommitMessage = {
  commitMessage = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
}

@NonCPS
def getTestSummary = { ->
  def testResultAction = currentBuild.rawBuild.getAction(AbstractTestResultAction.class)
  def summary = ""

  if (testResultAction != null) {
    total = testResultAction.getTotalCount()
    failed = testResultAction.getFailCount()
    skipped = testResultAction.getSkipCount()

    summary = "Passed: " + (total - failed - skipped)
    summary = summary + (", Failed: " + failed)
    summary = summary + (", Skipped: " + skipped)
  } 
  else {
    summary = "No tests found"
  }
  testSummary = summary
}

@NonCPS
def getFailedTests = { ->
    def testResultAction = currentBuild.rawBuild.getAction(AbstractTestResultAction.class)
    def failedTestsString = "```"

    if (testResultAction != null) {
      def failedTests = testResultAction.getFailedTests()
      
      if (failedTests.size() > 9) {
        failedTests = failedTests.subList(0, 8)
      }

      for(CaseResult cr : failedTests) {
        failedTestsString = failedTestsString + "${cr.getFullDisplayName()}:\n${cr.getErrorDetails()}\n\n"
      }
      failedTestsString = failedTestsString + "```"
    }
    return failedTestsString
}

def populateGlobalVariables = {
    getLastCommitMessage()
    getGitAuthor()
    getTestSummary()
}


node('harmonic-st-patrick') {
  try {
    
    stage ('Prepare') {
      try {
        deleteDir()
        git branch: '${gitlabSourceBranch}', credentialsId: '5f7103af-b0cf-499a-ba32-321a942e77db', url: '${gitlabSourceRepoURL}'
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
    }

    stage ('Build NPM') {
      try {
        nodejs('node8.2.1') {
          dir ('viscoll-app') {
            sh 'rm package-lock.json'
            sh 'npm install --only=prod'
            sh 'npm run build'
            // sh 'npm run styleguide:build'
          }
        }
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
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
        // echo "copying react documentation folder into REACT /docs directory"
        // sh 'mkdir -p REACT/docs'
        // sh 'cp viscoll-app/styleguide/* REACT/docs/ -f -r'
        echo "copying node modules folder into REACT directory"
        sh 'cp viscoll-app/node_modules ./REACT/node_modules -f -r'
        sh 'mkdir -p test_report'
        if (isProductionBranch()){
          sh 'sed -i "21 s/dummy/viscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
          sh 'sed -i "24 s/dummy/viscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
          sh 'sed -i "30 s/dummy/viscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
          sh 'sed -i "18 s/dummy/viscoll/" RAILS/app/mailers/mailer.rb'
          sh 'sed -i "4 s/dummy/viscoll/" RAILS/app/controllers/application_controller.rb'
        }
        if (isUsabilityBranch()){
          sh 'sed -i "21 s/dummy/utlviscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
          sh 'sed -i "24 s/dummy/utlviscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
          sh 'sed -i "30 s/dummy/utlviscoll/" RAILS/config/initializers/rails_jwt_auth.rb'
          sh 'sed -i "18 s/dummy/utlviscoll/" RAILS/app/mailers/mailer.rb'
          sh 'sed -i "4 s/dummy/utlviscoll/" RAILS/app/controllers/application_controller.rb'
        }
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
    }

    stage ('Test Rails') {
      try {
        echo "running rspec tests"
        dir ('viscoll-api') {
          withEnv([
            "PATH=$HOME/.rbenv/bin:$HOME/.rbenv/shims:$PATH",
            "RBENV_SHELL=sh"
          ]) 
          {
            withCredentials([usernamePassword(credentialsId: 'cViscollTest', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
              mongo_URI = "mongodb://$USERNAME:$PASSWORD@mongodb-dev1.vmdata.utl/viscoll_test?replicaSet=mongodb-dev"
              sh "sed -i \"151 s#mongodb://localhost:27017/viscoll_test#${mongo_URI}#\" config/mongoid.yml"
            }
            sh 'bundle i'
            sh 'rspec --format RspecJunitFormatter --out rspec_test_results.xml'    
          }
        }
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
      try {
        sh 'cp viscoll-api/rspec_test_results.xml test_report/'
        junit 'test_report/rspec_test_results.xml'
        publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'viscoll-api/coverage', reportFiles: 'index.html', reportName: 'Rails Coverage Report'])
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
    }

    stage ('Test React') {
      try {
        nodejs('node8.2.1') {
          dir ('viscoll-app') {
            echo "running jest tests"
            sh 'npm test -- --coverage'
          }
        }
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
      try {
        sh 'cp viscoll-app/test-report.xml test_report/npm_test_results.xml'     
        junit 'test_report/npm_test_results.xml'
        publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'viscoll-app/coverage/lcov-report', reportFiles: 'index.html', reportName: 'React Coverage Report'])
      }
      catch (e) { errorOccurred = e }
    }

    stage ('Rails Brickyard Upload') {
      try {
        if (isPublishingBranch() && !errorOccurred) {
          dir ('RAILS') {
            echo "compress RAILS folder and upload to brickyard"
            sh "tar zcf ${siteName}-api.tar.gz * --transform \"s,^,${siteName}-api/,S\" -X ../exclude.txt --exclude=${siteName}-api.tar.gz --overwrite --warning=none"
            sh "/usr/local/maven/bin/mvn deploy:deploy-file -DgroupId=ca.utoronto.library -DartifactId=${siteName}-api -Dversion=SNAPSHOT -DgeneratePom=true -Dpackaging=tgz -DrepositoryId=brickyard -Durl=https://brickyard.library.utoronto.ca/content/repositories/utl-snapshots -Dfile=${siteName}-api.tar.gz"
          }
        }
        else {
          echo "Skipping: Not deployment branch or an error occurred"
        }
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
    }

    stage ('React Brickyard Upload') {
      try {
        if (isPublishingBranch() && !errorOccurred) {
          dir ('REACT') {
            echo "compress REACT folder and upload to brickyard"
            sh "tar zcf ${siteName}-app.tar.gz * --transform \"s,^,${siteName}-app/,S\" -X ../exclude.txt --exclude=${siteName}-app.tar.gz --overwrite --warning=none"
            sh "/usr/local/maven/bin/mvn deploy:deploy-file -DgroupId=ca.utoronto.library -DartifactId=${siteName}-app -Dversion=SNAPSHOT -DgeneratePom=true -Dpackaging=tgz -DrepositoryId=brickyard -Durl=https://brickyard.library.utoronto.ca/content/repositories/utl-snapshots -Dfile=${siteName}-app.tar.gz"
          }
        }
        else {
          echo "Skipping: Not deployment branch or an error occurred"
        }
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
    }

    stage ('Rails Chef Deploy') {
      try {
        if (isPublishingBranch() && !errorOccurred) {
          build job: 'Deploy via Chef', 
            parameters: [
              string(name: 'CHEF_SEARCH', value: 'recipe:app-viscoll-api%20AND%20chef_environment:utl-production')
            ] 
        }
        else {
          echo "Skipping: Not deployment branch or an error occurred"
        }
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
    }

    stage ('React Chef Deploy') {
      try {
        if (isPublishingBranch() && !errorOccurred) {
          build job: 'Deploy via Chef', 
            parameters: [
              string(name: 'CHEF_SEARCH', value: 'recipe:app-viscoll%20AND%20chef_environment:utl-production')
            ] 
        }
        else {
          echo "Skipping: Not deployment branch or an error occurred"
        }
      }
      catch (e) { if (!errorOccurred) {errorOccurred = e} }
    }
   
    // Finished building. Notify slack with relevant messages.
    populateGlobalVariables()
    
    def buildColor = currentBuild.result == null ? "good" : "warning"
    def buildStatus = currentBuild.result == null ? "Success" : currentBuild.result
    def jobName = "${env.JOB_NAME}"
    // Strip the branch name out of the job name (ex: "Job Name/branch1" -> "Job Name")
    jobName = jobName.getAt(0..(jobName.indexOf('/') - 1))
    
    if (failed>0) {
      buildStatus = "Failed"
      if (isPublishingBranch()) {
        if (isUsabilityBranch()) {
          buildStatus = "Usability Branch Failed !"
        }
        else {
          buildStatus = "Production Branch Failed !"
        }
      }
      buildColor = "warning"
      def failedTestsString = getFailedTests()
      notifySlack("", slackNotificationChannel, [
        [
          title: "${jobName}, build #${env.BUILD_NUMBER} :sob: :-1: :slam: :facepalm: :sad_panda: :rip: :dontpanic: :rage4:",
          title_link: "${env.BUILD_URL}",
          color: "${buildColor}",
          text: "${buildStatus}\n${author}",
          "mrkdwn_in": ["fields"],
          fields: [
            [
              title: "Branch",
              value: "${gitlabSourceBranch}",
              short: true
            ],
            [
              title: "Test Results",
              value: "${testSummary}",
              short: true
            ],
            [
              title: "Last Commit",
              value: "${commitMessage}",
              short: false
            ]
          ]
        ],
        [
          title: "Failed Tests",
          color: "${buildColor}",
          text: "${failedTestsString}",
          "mrkdwn_in": ["text"],
        ]
      ]) 
    } 
    else if (errorOccurred != false) {
      throw errorOccurred
    }
    else {
      if (isPublishingBranch()) {
        if (isUsabilityBranch()) {
          buildStatus = "Usability Branch Success !"
        }
        else {
          buildStatus = "Production Branch Success !"
        }
      }
      notifySlack("", slackNotificationChannel, [
        [
          title: "${jobName}, build #${env.BUILD_NUMBER} :yay: :yay2: :thumbsup_all: :coolbeans: :success: :snoopy: :mario:",
          title_link: "${env.BUILD_URL}",
          color: "${buildColor}",
          text: "${buildStatus}\n${author}",
          fields: [
            [
              title: "Branch",
              value: "${gitlabSourceBranch}",
              short: true
            ],
            [
              title: "Test Results",
              value: "${testSummary}",
              short: true
            ],
            [
              title: "Last Commit",
              value: "${commitMessage}",
              short: false
            ],
            [
              title: "Rails Test Coverage",
              value: "<https://harmonic.library.utoronto.ca/job/viscoll-pipeline/Rails_Coverage_Report|View Report>",
              short: true
            ],
            [
              title: "React Test Coverage",
              value: "<https://harmonic.library.utoronto.ca/job/viscoll-pipeline/React_Coverage_Report|View Report>",
              short: true
            ]
          ]
        ]
      ])
    }

  } 
  catch (e) {
    // If there was an exception thrown, the build failed
    def buildStatus = "Failed"
    buildColor = "danger"
    populateGlobalVariables()
    if (isPublishingBranch()) {
      if (isUsabilityBranch()) {
        buildStatus = "Usability Branch Failed !"
      }
      else {
        buildStatus = "Production Branch Failed !"
      }
    }
    notifySlack("", slackNotificationChannel, [
      [
        title: "${env.JOB_NAME}, build #${env.BUILD_NUMBER} :sob: :-1: :slam: :facepalm: :sad_panda: :rip: :dontpanic: :rage4:",
        title_link: "${env.BUILD_URL}",
        color: "${buildColor}",
        text: "${buildStatus}\n${author}",
        "mrkdwn_in": ["fields"],
        fields: [
          [
            title: "Branch",
            value: "${gitlabSourceBranch}",
            short: true
          ],
          [
            title: "Last Commit",
            value: "${commitMessage}",
            short: true
          ],
          [
            title: "Error",
            value: "${e.message}",
            short: false
          ]
        ]
      ]
    ])
    throw e
  } 
  finally {
    // Success or failure, always clean the build
    stage ('Clean') {
        deleteDir()
    }
  }
}
