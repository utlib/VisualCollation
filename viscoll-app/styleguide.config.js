module.exports = {
  assetsDir: "docs/assets",
  sections: [
    {
      name: 'Introduction',
      content: 'docs/introduction.md'
    },
    {
      name: 'Containers',
      components: 'src/containers/*.js'
    },
    {
      name: 'Components',
      components: 'src/components/*.js',
      sections: [
        {
          name: 'Authentication',
          components: 'src/components/authentication/*.js'
        },
        {
          name: 'Dashboard',
          components: 'src/components/dashboard/*.js'
        },
        {
          name: 'Topbar',
          components: 'src/components/topbar/*.js'
        },
        {
          name: 'Project',
          components: 'src/components/project/*.js'
        },
        {
          name: 'Info Box',
          components: 'src/components/infoBox/*.js',
          sections: [
            {
              name: 'Dialog',
              components: 'src/components/infoBox/dialog/*.js'
            },
          ]
        },
        {
          name: 'Tabular Mode',
          components: 'src/components/tabularMode/*.js'
        },
        {
          name: 'Custom',
          components: 'src/components/custom/*.js'
        },
      ]
    },
    
  ]
}