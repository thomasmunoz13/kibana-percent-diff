import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';


const module = uiModules.get('kibana/transform_vis', ['kibana']);


module.controller('PercentDiffVisController', function ($scope, $sce, Private, timefilter, es, config, indexPatterns) {
  const dashboardContext = Private(dashboardContextProvider);
  console.log('Entering controller');

  $scope.refreshConfig = function () {
    console.log('refreshConfig ...');
    indexPatterns.get($scope.vis.params.outputs.indexpattern).then(function (indexPattern) {
      $scope.vis.indexPattern = indexPattern;
      console.log('Index pattern : ', indexPattern);
    }).then($scope.search);
  };

  $scope.setDisplay = function (text) {
    console.log('setDisplay ...');
    $scope.vis.display = text;
  };

  const generateBaseQuery = function (from, filters) {
    const base = {
      query: {
        bool: {
          must: [
            {
              range: {
                '@timestamp': {
                  gte: from,
                  lte: from
                }
              }
            }
          ]
        }
      }
    };

    if (filters !== undefined) {
      base.query.bool.must = base.query.bool.must.concat(filters);
    }

    return base;
  };

  const search = function () {
    const context = dashboardContext();
    console.log('Context : ', context);
    /*if ($scope.vis.indexPattern && $scope.vis.indexPattern.timeFieldName) {
      const timefilterdsl = { range: {} };
      timefilterdsl.range[$scope.vis.indexPattern.timeFieldName] = { gte: timefilter.time.from, lte: timefilter.time.to };
      context.bool.must.push(timefilterdsl);
    }*/

    console.log('Searching ...');
    console.log('querydsl', $scope.vis.params);
    console.log('generatedQuery', generateBaseQuery('now-7d/d', [
      { match: { 'message.Source': 'ga' } },
      { match: { 'message.Type': 'daily' } }
    ]));

    es.search({
      index: $scope.vis.indexPattern.title,
      body: generateBaseQuery('now-7d/d', [
        { match: { 'message.Source': 'ga' } },
        { match: { 'message.Type': 'daily' } }
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

  search();

  $scope.$watch('esResponse', function (resp) {
    console.log('esResponse');
    console.log(resp);
  });
});