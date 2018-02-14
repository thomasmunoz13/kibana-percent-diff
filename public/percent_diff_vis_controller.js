import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { AggResponseTabifyProvider } from 'ui/agg_response/tabify/tabify';

const module = uiModules.get('kibana/transform_vis', ['kibana']);


module.controller('PercentDiffVisController', function ($scope, $sce, Private, timefilter, es, config, indexPatterns) {
  const tabifyAggResponse = Private(AggResponseTabifyProvider);

  $scope.setDisplay = function (text) {
    $scope.vis.display = text;
  };

  const precisionRound = function (number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
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

  const parseConfig = function (tableGroups) {
    const columns = tableGroups.tables[0].columns;
    const filters = [];

    columns.slice(2).forEach(function (elem) {
      const elemObj = {};
      elemObj[elem.title.split(':')[0]] = elem.title.split(':')[1];

      filters.push({
        match: elemObj
      });
    });

    return {
      from: columns[0].title,
      to: columns[1].title,
      filters: filters
    };
  };


  const computeDifference = function (from, to) {
    const fromValue = from.hits.hits[0]._source.message.Value;
    const toValue = to.hits.hits[0]._source.message.Value;

    if (fromValue > 0) {
      return precisionRound((fromValue - toValue) / fromValue * 100, 2);
    } else {
      return 0;
    }
  };

  const displayDifference = function (from, to) {
    if (from.hits.hits.length > 0 && to.hits.hits.length > 0) {
      const diff = computeDifference(from, to);
      $scope.metric.value = diff + '%';
    } else {
      $scope.metric.value = 0.0;
    }
  };

  $scope.metric = {};
  $scope.metric.value = 0.0;
  $scope.metric.label = 'Difference';


  const search = function (tableGroup) {
    const parsedConfig = parseConfig(tableGroup);

    const from = parsedConfig.from;
    const to = parsedConfig.to;

    const fromQuery = generateBaseQuery(from, parsedConfig.filters);
    const toQuery = generateBaseQuery(to, parsedConfig.filters);

    let fromResult;

    let toResult;

    es.search({
      index: $scope.vis.indexPattern.title,
      body: fromQuery
    }, function (error, response) {
      if (error) {
        $scope.setDisplay('Error (See Console)');
      } else {
        fromResult = response;

        es.search({
          index: $scope.vis.indexPattern.title,
          body: toQuery
        }, function (error, response) {
          if (error) {
            console.log('Elasticsearch Query Error', error);
          } else {
            toResult = response;
            displayDifference(fromResult, toResult);
          }
        });
      }
    });
  };

  $scope.search = search;

  $scope.refreshConfig = function () {
    indexPatterns.get($scope.vis.params.outputs.indexpattern).then(function (indexPattern) {
      $scope.vis.indexPattern = indexPattern;
    }).then(search);
  };

  $scope.processTableGroups = function (tableGroups) {
    $scope.search(tableGroups);
  };


  $scope.$watch('esResponse', function (resp) {
    if (resp) {
      $scope.processTableGroups(tabifyAggResponse($scope.vis, resp));
    }
  });
});