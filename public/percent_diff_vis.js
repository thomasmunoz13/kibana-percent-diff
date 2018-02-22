define(function (require) {
  require('plugins/kibana-percent-diff/percent_diff_vis.css');
  require('plugins/kibana-percent-diff/percent_diff_vis_controller');

  require('ui/registry/vis_types').register(PercentDiffVisProvider);

  function PercentDiffVisProvider(Private) {
    const PercentDiffVisType = Private(require('ui/template_vis_type/template_vis_type'));
    const Schemas = Private(require('ui/vis/schemas'));


    return new PercentDiffVisType({
      name: 'percent-diff',
      title: 'Percent difference',
      description: 'Percent difference between two dates',
      icon: 'fa-area-chart',
      requiresIndexPatternSelection: true,
      template: require('plugins/kibana-percent-diff/percent_diff_vis.html'),
      params: {
        defaults: {
          handleNoResults: true,
          fontSizePercent: 60,
          fontSizeCount: 40,
          displayCount: false
        },
        editor: require('plugins/kibana-percent-diff/percent_diff_vis_params.html')
      },
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Filter',
          min: 1,
          aggFilter: ['count'],
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        }
      ])
    });
  }
  return PercentDiffVisProvider;
});

