$(function () {
    function renderHome() {
        var entities = [];
        for (var i=0; i<window.pad.length; i++) {
            var entityName = window.pad[i]['nombre_tarjeta_home'].trim().toLowerCase();
            if (entities.indexOf(entityName) == -1) {
                entities.push(entityName);
            }
        }

        var cardTemplate = $('.template-card');
        function renderCard(cardText) {
            var template = cardTemplate.clone().removeClass('hidden template-card');
            template.find('.pad-card-text-cell').text(cardText);
            template.attr('href', '/pad/datasets.html?' + $.param({organismo: cardText}));
            return template;
        }

        var cardsContainer = $('.pad-ministerios-list');
        var presidenciaIndex = entities.indexOf('presidencia');
        if (presidenciaIndex != -1) {
            entities.splice(presidenciaIndex, 1);
            var template = renderCard(entities[presidenciaIndex]).addClass('main-card');
            cardsContainer.append(template);
        }

        var jgmIndex = entities.indexOf('jgm');
        if (jgmIndex != -1) {
            entities.splice(jgmIndex, 1);
            template = renderCard(entities[jgmIndex]);
            cardsContainer.append(template);
        }

        entities.sort();
        for (var j=0; j<entities.length; j++) {
            template = renderCard(entities[j]);
            cardsContainer.append(template);
        }
    }

    loadCSV().then(renderHome);
});