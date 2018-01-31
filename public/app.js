import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'ui/autoload/styles';
import './less/main.less';
import template from './templates/index.html';

uiRoutes.enable();
uiRoutes
  .when('/', {
    template,
    resolve: {
      currentTime($http) {
        return $http.get('../api/kibana-percent-diff/example').then(function (resp) {
          return resp.data.time;
        });
      }
    }
  });

uiModules
  .get('app/kibana-percent-diff', [])
  .controller('kibanaPercentDiffHelloWorld', function ($scope, $route, $interval) {
    $scope.title = 'Kibana Percent Diff';
    $scope.description = 'Kibana percentage difference plugin';

    const currentTime = moment($route.current.locals.currentTime);
    $scope.currentTime = currentTime.format('HH:mm:ss');
    const unsubscribe = $interval(function () {
      $scope.currentTime = currentTime.add(1, 'second').format('HH:mm:ss');
    }, 1000);
    $scope.$watch('$destroy', unsubscribe);
  });
