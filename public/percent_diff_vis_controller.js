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


  const computeDifference = function (fromResult, toResult) {
    console.log(fromResult);
    console.log(toResult);
    //const fromValue = fromResult.hits[0]._source
  };

  const search = function () {
    const context = dashboardContext();

    console.log('Context : ', context);
    console.log('Parse context : ', parseContext(context));

    const parsedContext = parseContext(context);

    /*if ($scope.vis.indexPattern && $scope.vis.indexPattern.timeFieldName) {
      const timefilterdsl = { range: {} };
      timefilterdsl.range[$scope.vis.indexPattern.timeFieldName] = { gte: timefilter.time.from, lte: timefilter.time.to };
      context.bool.must.push(timefilterdsl);
    }*/


    const from = parsedContext[parsedContext.length - 2].match['@timestamp'];
    const to = parsedContext[parsedContext.length - 1].match['@timestamp'];

    const fromQuery = generateBaseQuery(from, parsedContext.slice(0, -2));
    const toQuery = generateBaseQuery(to, parsedContext.slice(0, -2));

    console.log('[FROM]', fromQuery);
    console.log('[TO]', toQuery);

    console.log('Searching ...');

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


  search();

  $scope.$watch('esResponse', function (resp) {
    console.log('esResponse');
    console.log(resp);
  });
});