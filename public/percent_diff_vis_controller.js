const module = require('ui/modules').get('kibana/percent_diff_vis', ['kibana']);


module.controller('PercentDiffVisController', function ($scope, $sce, Private, timefilter, es, config, indexPatterns) {
  const tabifyAggResponse = Private(require('ui/agg_response/tabify/tabify'));

  $scope.metric = {};
  $scope.metric.realValue = 0.0;
  $scope.metric.value = 0.0;
  $scope.metric.label = 'Difference';


  $scope.setDisplay = function (text) {
    $scope.vis.display = text;
  };

  const precisionRound = function (number, precision) {
    const factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  };

  const generateBaseQuery = function (from, filters) {
    const f = from.split(' ').join('').split('to');

    const base = {
      query: {
        bool: {
          must: [
            {
              range: {
                '@timestamp': {
                  gte: f[0],
                  lte: f[f.length - 1]
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
    let prop = 'Value';

    if($scope.vis.params.prop !== '' && $scope.vis.params.prop !== null && $scope.vis.params.prop !== undefined) {
      prop = $scope.vis.params.prop;
    }

    let fromValue = 0;
    let toValue = 0;

    for (let i = 0; i < from.hits.hits.length; ++i) {
      if (from.hits.hits[i]._source.message[prop] !== undefined) {
        fromValue = from.hits.hits[i]._source.message[prop];
        break;
      }
    }

    for (let i = 0; i < to.hits.hits.length; ++i) {
      if (to.hits.hits[i]._source.message[prop] !== undefined) {
        toValue = to.hits.hits[i]._source.message[prop];
        break;
      }
    }

    if (fromValue === 0 && toValue !== 0) {
      return toValue > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }

    return precisionRound((toValue - fromValue) / fromValue * 100, 2);
  };

  const displayDifference = function (from, to) {
    if (from.hits.hits.length > 0 && to.hits.hits.length > 0) {
      const diff = computeDifference(from, to);
      $scope.metric.realValue = diff;
      $scope.metric.value = diff + '%';
    } else {
      $scope.metric.value = 0.0;
    }
  };

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
        console.error(error);
      } else {
        fromResult = response;

        es.search({
          index: $scope.vis.indexPattern.title,
          body: toQuery
        }, function (error, response) {
          if (error) {
            $scope.setDisplay('Error (See Console)');
            console.error(error);
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