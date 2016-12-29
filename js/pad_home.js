"use strict";

window.pad.actions.renderCard = function (cardText) {
    var template = window.pad.variables.cardTemplate.clone();
    template.find('.pad-card-text-cell').text(cardText);
    template.attr('href', '/pad/datasets.html?' + $.param({organismo: cardText}));
    return template;
};

window.pad.actions.collectOrganisms = function () {
    var entities = [];
    for (var i = 0; i < window.pad.variables.csv.length; i++) {
        var entityName = window.pad.variables.csv[i]['nombre_tarjeta_home'].trim();
        if (entities.indexOf(entityName) == -1) {
            entities.push(entityName);
        }
    }
    entities.sort(window.pad.actions.organismSort);
    window.pad.variables.organisms = entities;
};

window.pad.actions.renderHome = function () {
    window.pad.actions.collectOrganisms();
    window.pad.variables.cardTemplate = $('.template-card').clone().removeClass('hidden template-card');
    var cardsContainer = $('.pad-ministerios-list');

    for (var j = 0; j < window.pad.variables.organisms.length; j++) {
        var organism = window.pad.variables.organisms[j];
        var template = window.pad.actions.renderCard(organism);
        if (organism == 'Presidencia') {
            template.addClass('main-card');
        }
        cardsContainer.append(template);
    }
};

$(function () {
    window.pad.actions.loadCSV().then(window.pad.actions.renderHome);
});

