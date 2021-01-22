# Penn Libraries TODO list

### Idrovora integration and deployment tasks

- [ ] TODO: Idrovora integration work
  - [X] TODO: VisColl XML to SVG
  - [ ] TODO: VisColl XML to formulas
  - [ ] TODO: VisColl XML to HTML 
    - [ ] TODO: Add image list creation; note that we can't simply return URLs to the images
  - [ ] TODO: Configure Idrovora clean up
  - [ ] TODO: Test Idrovora integration

- [ ] TODO: Refactor Idrovora interface components
  - [X] TODO: Revisit filenames in `public/xproc/zip`; perhaps use 
              `<PROJECT_ID>-<FORMAT>.zip`; like `987654321-svg2.zip`
  - [X] TODO: Have `Export.js` -- `downloadZip()` return zip with file name on disk
  - [X] TODO: Refactor `export_controller.rb` SVG generation
  - [ ] TODO: Create job to cleanup zip files in `public/xproc/zip`
  - [X] TODO: Change Idrovora XPL/XSL config to pass job-dir to XSL
 
- [ ] TODO: Clean up configuration and use of environment variables
  - [ ] TODO: Review URL/HOST constants and their uses: `APPLICATION_HOST`, `PROJECT_URL`
  - [ ] TODO: Add environment variable for Idrovora URL
  - [ ] TODO: Address hacky implementation of `ApplicationController#set_base_api_url`

- [ ] TODO: Other tasks
  - [X] TODO: Update VisColl Logo, b/c of course
  - [ ] TODO: Use S3 interface for image storage
  - [ ] TODO: Rename app to VCEditor, wherever that makes sense
  - [ ] TODO: Update application README for VCEditor
  - [ ] TODO: Document configuration and deployment; dev docker setup
  - [ ] TODO: Look at license text; esp. `Copyright 2020 University of Toronto Libraries`
