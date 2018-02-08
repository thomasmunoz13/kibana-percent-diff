import { uiModules } from 'ui/modules';
import { dashboardContextProvider } from 'plugins/kibana/dashboard/dashboard_context';
import { AggResponseTabifyProvider } from 'ui/agg_response/tabify/tabify';

const module = uiModules.get('kibana/transform_vis', ['kibana']);


module.controller('PercentDiffVisController', function ($scope, $sce, Private, timefilter, es, config, indexPatterns) {
  const tabifyAggResponse = Private(AggResponseTabifyProvider);
  const dashboardContext = Private(dashboardContextProvider);

  $scope.setDisplay = function (text) {
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

  const parseContext = function (context) {
    const matches = [];

    context.bool.must.forEach(function (elem) {
      if(elem.match !== undefined) {
        const match = { match: {} };
        match.match[Object.keys(elem.match)[0]] = elem.match[Object.keys(elem.match)[0]].query;
        matches.push(match);
      }
    });

    return matches;
  };

  const parseConfig = function (tableGroups) {
    console.log('Parse Config : ', tableGroups.tables[0].columns);
  };


  const computeDifference = function (fromResult, toResult) {
    console.log(fromResult);
    console.log(toResult);
    //const fromValue = fromResult.hits[0]._source
  };

  $scope.metric = {};
  $scope.metric.value = 10;
  $scope.metric.label = 'Difference';

  const search = function () {
    const context = dashboardContext();

    const parsedContext = parseContext(context);

    const from = parsedContext[parsedContext.length - 2].match['@timestamp'];
    const to = parsedContext[parsedContext.length - 1].match['@timestamp'];

    const fromQuery = generateBaseQuery(from, parsedContext.slice(0, -2));
    const toQuery = generateBaseQuery(to, parsedContext.slice(0, -2));

    console.log('[FROM]', fromQuery);
    console.log('[TO]', toQuery);

    let fromResult;

    let toResult;

    es.search({
      index: $scope.vis.indexPattern.title,
      body: fromQuery
    }, function (error, response) {
      if (error) {
        $scope.setDisplay('Error (See Console)');
        console.log('Elasticsearch Query Error', error);
      } else {
        fromResult = response;
        console.log('[FROM] | RESULT', fromResult);

        es.search({
          index: $scope.vis.indexPattern.title,
          body: toQuery
        }, function (error, response) {
          if (error) {
            $scope.setDisplay('Error (See Console)');
            console.log('Elasticsearch Query Error', error);
          } else {
            toResult = response;
            console.log('[TO] | RESULT', toResult);
            computeDifference(fromResult, toResult);
          }
        });
      }
    });
  };

  $scope.search = search;

  search();

  $scope.refreshConfig = function () {
    indexPatterns.get($scope.vis.params.outputs.indexpattern).then(function (indexPattern) {
      $scope.vis.indexPattern = indexPattern;
    }).then(search);
  };

  $scope.processTableGroups = function (tableGroups) {
    parseConfig(tableGroups);
    console.log('Table Groups : ', tableGroups);
  };


  $scope.$watch('esResponse', function (resp) {
    if (resp) {
      $scope.processTableGroups(tabifyAggResponse($scope.vis, resp));
    }
  });
});