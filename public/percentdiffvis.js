import { VisFactoryProvider } from 'ui/vis/vis_factory';
import { VisTypesRegistryProvider } from 'ui/registry/vis_types';

function PercentDiffVisProvider(Private, es, indexPatterns, $sanitize, timefilter) {
  const VisFactory = Private(VisFactoryProvider);

  return VisFactory.createBaseVisualization({
    name: 'percent-diff',
    title: 'Percent difference',
    description: 'Percent difference between two dates',
    icon: 'fa-area-chart'
  });
}

VisTypesRegistryProvider.register(PercentDiffVisProvider);