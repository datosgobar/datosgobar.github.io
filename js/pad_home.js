$(function () {
    function loadCSV() {
        return $.get('./plan_de_apertura_2016-2017.csv', {}, function (response) {
            window.pad = $.csv.toObjects(response);
        })
    }

    function renderHome() {
        var entities = [];
        var cardTemplate = '<a href="/pad" class="col-xs-12 col-sm-6 col-md-4 col-lg-3 pad-card">' +
            '<div class="pad-card-text-table">' +
                '<div class="pad-card-text-cell"></div>' +
            '</div>' +
        '</a>';
        var cardsContainer = $('.pad-ministerios-list');
        for (var i=0; i<window.pad.length; i++) {
            var entityName = window.pad[i]['nombre_tarjeta_home'].trim();
            if (entities.indexOf(entityName) == -1) {
                entities.push(entityName);
                var template = $(cardTemplate);
                template.find('.pad-card-text-cell').text(entityName);
                cardsContainer.append(template);
            }
        }
    }

    loadCSV().then(renderHome);
});