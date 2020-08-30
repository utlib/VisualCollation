# Penn Libraries TODO list

### Idrovora integration and deployment tasks

- [ ] TODO: Create job for collation formulas; will return zip file
- [ ] TODO: Have `Export.js` -- `downloadZip()` return zip with file name on disk
- [ ] TODO: Add image list creation; note that we can't simply return URLs to the images
- [ ] TODO: Cleanup `export_controller.rb` SVG generation
- [ ] TODO: Revisit filenames in `public/xproc/zip`; perhaps use 
            `<PROJECT_ID>-<FORMAT>.zip`; like `987654321-svg2.zip` 
- [ ] TODO: Create job to cleanup zip files in `public/xproc/zip`
- [ ] TODO: Review URL/HOST constants and their uses: `APPLICATION_HOST`, `PROJECT_URL`
- [ ] TOOD: Add environment variable for Idrovora URL
- [ ] TODO: Address hacky implementation of `ApplicationController#set_base_api_url`
- [ ] TODO: configure Idrovora cleanup
- [ ] TODO: Test VisColl to HTML visualization
- [ ] TODO: Update VisColl Logo, b/c of course
- [ ] TODO: Rename app to VCEditor, wherever that makes sense
- [ ] TODO: Update application README for VCEditor
- [ ] TODO: Document configuration and deployment; dev docker setup
- [X] TODO: Change Idrovora XPL/XSL config to pass job-dir to XSL
- [ ] TODO: Look at license text; esp. `Copyright 2020 University of Toronto Libraries`
- [ ] TODO: Test Idrovora and Idrovora integration
