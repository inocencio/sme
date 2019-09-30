$(function() {

    var tip_options =
    {
        fixed               : false,
        hideDelay           : 0.01,
        style               : "dark"
    };

    if (!document.getElementById('logout-site')) {
        //links social media
        new Opentip('#login-facebook', 'Use a a sua conta do Facebook para acessar todo o conteúdo do Espiando e publicar eventos.', tip_options);
        new Opentip('#login-twitter', 'Use a a sua conta do Twitter para acessar todo o conteúdo do Espiando e publicar eventos.', tip_options);
        new Opentip('#login-google', 'Use a a sua conta do Google e Google+ para acessar todo o conteúdo do Espiando e publicar eventos.', tip_options);
    }

    //links SocialSite
    new Opentip('#link-novoEvento', 'Publique um novo evento e o torne mundialmente conhecido.', tip_options);
    new Opentip('#link-maisVisitados', 'Veja os eventos que são ultimamente mais visitados pelos espiandos.', tip_options);
    new Opentip('#link-maisAvaliados', 'Veja os eventos que são mais bem avaliados pelos espiandos.', tip_options);
    new Opentip('#link-FAQ', 'Tire aqui as dúvidas das perguntas mais frequentes pelos espiandos.', tip_options);

    if (!document.getElementById('event-new')) {
        new Opentip('#event-new', 'É preciso estar logado em alguma rede social para publicar eventos.', tip_options);
    }

});

//inicializa o AngularJS
var app = angular.module('espiandoApp', ['ui']);

////////////////////////
// Diretivas do Angular
////////////////////////

app.directive('remaining', function() {
    return {
        template: "({{remaining}} de {{maxLen}})",
        scope: {
            maxLen: '@max',
            model: '=ngModel'
        },
        link: function(scope, elem, attrs) {

            elem = $(elem);

            scope.$watch('model', function(val) {
                if (val == null || val == undefined) return;

                var remaining = parseInt(scope.maxLen, 10) - val.length;

                if (remaining < 0) {
                    scope.model = val.substr(0, scope.maxLen);
                } else {
                    scope.remaining = remaining;
                }
            });
        }
    };
});

app.directive('itoMaxlength', ['$compile', function($compile) {
    return {
        restrict: 'A',
        scope: { textResult: "=ngModel" },
        link: function (scope, element, attrs) {
            element = $(element);

            scope.charsRemaining = parseInt(attrs.itoMaxlength);

            scope.onEdit = function() {
                var maxLength = parseInt(attrs.itoMaxlength),
                    currentLength = parseInt(element.val().length);

                if (currentLength >= maxLength) {
                    element.val(element.val().substr(0, maxLength));
                    scope.charsRemaining = 0;
                } else {
                    scope.charsRemaining = maxLength - currentLength;
                }

                scope.$apply(scope.charsRemaining);
            };

            element.keyup(scope.onEdit)
                .keydown(scope.onEdit)
                .focus(scope.onEdit);
            element.on('ngChange', scope.onEdit);

            var counterElement = $compile(angular.element('<span>Characters remaining: {{charsRemaining}}</span>'))(scope);

            //element.parent().append(counterElement);

            $('#span-el-description').append(counterElement);

        }

    }
}]);
