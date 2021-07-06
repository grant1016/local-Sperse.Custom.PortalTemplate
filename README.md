### How To Fork Project?

* Create your own empty repository with some name (for ex. ``company.portal``) or use existing on any git server.
* Clone portal template into ``sperse.custom.portaltemplate`` folder

    git clone https://{User}@bitbucket.org/sperse-team/sperse.custom.portaltemplate.git

* Go to ``company.portal`` repository root folder and add cloned remote to your repository (use correct path to sperse.custom.portaltemplate repository folder if ``company.portal`` repository folder not on the same level)

    git remote add sperse.custom.portaltemplate ../sperse.custom.portaltemplate
    
* Update all of your branches set to track remote ones

    git remote update

* Merge ``sperse.custom.portaltemplate`` into ``company.portal`` (it's possible to use any branch version instead of ``master``)

    git merge -S --allow-unrelated-histories sperse.custom.portaltemplate/master

* Push changes to ``company.portal`` repository (depending which branch was used)

    git push origin master


### How To Run?

* Go to root folder of the Angular2 project (the folder contains package.json file) and run ``yarn`` from command line one time to restore all packages (or RestorePackages.cmd).
* Run ``npm start`` from command line to run angular-cli server. Wait webpack to finish it's work. 
    There are allowed follwing environments for development:
        ``npm start`` or ``npm run start-staging`` - staging development mode
        ``npm run start-beta`` - beta development mode

    Also allowed following build modes:
        ``npm run build-devstaging`` - staging development mode
        ``npm run build-devbeta`` - beta development mode
        ``npm run build-staging`` - staging mode
        ``npm run build-beta`` - beta mode
        ``npm run build-prod`` - prod mode

    More options for all modes available in package.json and angular.json configuration files. 
    (see ./src/environments folder for corresponding environment settings) 
* Visit ``http://localhost:4200`` in your browser.

  
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