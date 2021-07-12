### Prerequirements

* nodejs + npm
https://nodejs.org

* Yarn
https://yarnpkg.com/en/docs/install#windows-stable

* angular-cli v8.3.24 (tested in this version, but may work in later versions too).

* typescript 3.5.2


### IDE

Project is IDE and OS independent. 
That means you can develop in Windows/Linux/Mac with any editor like Visual Studio Code, Angular IDE or Webstorm.


### How To Fork Portal Template repository (skip these steps if the template has already been forked into your custom portal repository)

* Add template repository as remote in your portal repository

    git remote add sperse.custom.portaltemplate https://bitbucket.org/sperse-team/sperse.custom.portaltemplate.git
    
* Process merge as described below


### Merge template to your portal repository

* Update all of your branches set to track remote ones

    git remote update

* Merge template into your portal (it's possible to use any branch version instead of ``master``)

    git merge -S --allow-unrelated-histories sperse.custom.portaltemplate/master

* Push changes to your repository (depending which branch was used)

    git push origin master


### How To Run?

* Go to root folder of portal project (the folder contains package.json file) and run ``yarn`` from command line one time to restore all packages (or RestorePackages.cmd).
* Run ``npm run start-staging`` from command line to run angular-cli server. Wait webpack to finish its work. There are follwing environments for development:

    - local API server access (don't useful for external development):

        npm start 

    - start UI server in staging mode:

        npm run start-staging

    - start UI server in beta mode:

        npm run start-beta

* Visit ``http://localhost:4200`` in your browser.


### Run build for deployment

* There are following build environments allowed:

    - build staging development mode (means no optimizations enabled):

        npm run build-devstaging

    - build beta development mode (means no optimizations enabled):

        npm run build-devbeta

    - build staging mode:

        npm run build-staging

     - build beta mode:

        npm run build-beta

    - build prod mode:

        npm run build-prod
    
* More options for all modes available in package.json and angular.json configuration files. 
(see ./src/environments folder for corresponding environment settings) 

  
### How To Run with SSL?

* Update/add options into angular.json
```
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "browserTarget": "abp-zero-template:build",
    "ssl": true,
    "sslKey": "ssl/server.key",
    "sslCert": "ssl/server.crt"
  },
```
* Run ``npm start`` or any other mode.
* Visit ``https://localhost:4200`` in your browser.
* Accept certificate as trusted.