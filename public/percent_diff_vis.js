import { VisTypesRegistryProvider } from 'ui/registry/vis_types';
import { TemplateVisTypeProvider } from 'ui/template_vis_type/template_vis_type';
import percentDiffTemplate from 'plugins/kibana-percent-diff/percent_diff_vis.html';
import 'plugins/kibana-percent-diff/percent_diff_vis_controller';



VisTypesRegistryProvider.register(PercentDiffVisProvider);

function PercentDiffVisProvider(Private) {
  const PercentDiffVisType = Private(TemplateVisTypeProvider);

  return new PercentDiffVisType({
    name: 'percent-diff',
    title: 'Percent difference',
    description: 'Percent difference between two dates',
    icon: 'fa-area-chart',
    requiresIndexPatternSelection: true,
    template: percentDiffTemplate
  });
}
