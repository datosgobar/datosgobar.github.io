$(function () {
    function loadCSV() {
        return $.get('./plan_de_apertura_2016-2017.csv', {}, function (response) {
            window.pad = $.csv.toObjects(response);
        })
    }

    function renderHome() {
        var entities = [];
        for (var i=0; i<window.pad.length; i++) {
            var entityName = window.pad[i]['nombre_tarjeta_home'].trim().toLowerCase();
            if (entities.indexOf(entityName) == -1) {
                entities.push(entityName);
            }
        }

        var cardTemplate = '<a href="/pad" class="col-xs-12 col-sm-6 col-md-4 col-lg-3 pad-card">' +
            '<div class="pad-card-text-table">' +
            '<div class="pad-card-text-cell"></div>' +
            '</div>' +
            '</a>';
        var cardsContainer = $('.pad-ministerios-list');
        var template;

        var presidenciaIndex = entities.indexOf('presidencia');
        if (presidenciaIndex != -1) {
            entityName = entities[presidenciaIndex];
            entities.splice(presidenciaIndex, 1);
            template = $(cardTemplate).addClass('main-card');
            template.find('.pad-card-text-cell').text(entityName);
            cardsContainer.append(template);
        }

        var jgmIndex = entities.indexOf('jgm');
        if (jgmIndex != -1) {
            entityName = entities[jgmIndex];
            entities.splice(jgmIndex, 1);
            template = $(cardTemplate);
            template.find('.pad-card-text-cell').text(entityName);
            cardsContainer.append(template);
        }

        entities.sort();

        for (var j=0; j<entities.length; j++) {
            entityName = entities[j];
            template = $(cardTemplate);
            template.find('.pad-card-text-cell').text(entityName);
            cardsContainer.append(template);
        }
    }

    loadCSV().then(renderHome);
});