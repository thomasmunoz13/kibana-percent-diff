import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';


const module = uiModules.get('kibana/transform_vis', ['kibana']);


module.controller('PercentDiffVisController', function ($scope, $sce, Private, timefilter, es, config, indexPatterns) {
  const dashboardContext = Private(dashboardContextProvider);

  $scope.refreshConfig = function () {
    indexPatterns.get($scope.vis.params.outputs.indexpattern).then(function (indexPattern) {
      $scope.vis.indexPattern = indexPattern;
      console.log('Index pattern : ', indexPattern);
    }).then($scope.search);
  };

  $scope.setDisplay = function (text) {
    $scope.vis.display = text;
  };

  const generateBaseQuery = function (from, filters) {
    const base = {
      query: {
        filter: [
          { range: { 'from': from } }
        ]
      }
    };

    if (filters !== undefined) {
      base.query.filter.concat(filters);
    }

    return base;
  };

  $scope.search = function () {

    const context = dashboardContext();

    if ($scope.vis.indexPattern && $scope.vis.indexPattern.timeFieldName) {
      const timefilterdsl = { range: {} };
      timefilterdsl.range[$scope.vis.indexPattern.timeFieldName] = { gte: timefilter.time.from, lte: timefilter.time.to };
      context.bool.must.push(timefilterdsl);
    }

    console.log('Searching ...');
    es.search({
      index: $scope.vis.indexPattern.title,
      body: generateBaseQuery('now-7d/d', [
        { term: { 'message.Source': 'ga' } },
        { term: { 'message.Type': 'daily' } }
      ])
    }, function (error, response) {
      if (error) {
        $scope.setDisplay('Error (See Console)');
        console.log('Elasticsearch Query Error', error);
      } else {
        console.log('Response', response);
      }
    });
  };
});