import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { TemplateVisTypeProvider } from 'ui/template_vis_type/template_vis_type';
import { VisSchemasProvider } from 'ui/vis/schemas';
import percentDiffTemplate from 'plugins/kibana-percent-diff/percent_diff_vis.html';

define(function (require) {
  require('plugins/kibana-percent-diff/percent_diff_vis_controller');

  VisTypesRegistryProvider.register(PercentDiffVisProvider);

  function PercentDiffVisProvider(Private) {
    const PercentDiffVisType = Private(TemplateVisTypeProvider);
    const Schemas = Private(VisSchemasProvider);


    return new PercentDiffVisType({
      name: 'percent-diff',
      title: 'Percent difference',
      description: 'Percent difference between two dates',
      icon: 'fa-area-chart',
      requiresIndexPatternSelection: true,
      template: percentDiffTemplate,
      params: {
        defaults: {
          handleNoResults: true,
          fontSizePercent: 60,
          fontSizeCount: 40,
          displayCount: false
        }
      },
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Element to compare',
          min: 1,
          max: 10,
          aggFilter: ['count'],
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        },
        {
          group: 'metrics',
          name: 'metric',
          title: 'To',
          min: 1,
          max: 1,
          aggFilter: ['count'],
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        },
        {
          group: 'metrics',
          name: 'metric',
          title: 'From',
          min: 1,
          max: 1,
          aggFilter: ['count'],
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        }
      ])
    });
  }

});

