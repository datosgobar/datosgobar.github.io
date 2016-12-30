"use strict";

window.pad = {
    actions: {
        organismSort: function (a, b) {
            if (a == window.pad.variables.presidenciaName) {
                return -1;
            }
            if (b == window.pad.variables.presidenciaName) {
                return 1;
            }
            if (a == window.pad.variables.jgmName) {
                return -1;
            }
            if (b == window.pad.variables.jgmName) {
                return 1;
            }
            return a < b ? -1 : a > b ? 1 : 0;
        }
    },
    variables: {
        jgmName: 'JGM',
        presidenciaName: 'Presidencia'
    }
};

window.pad.actions.loadCSV = function () {
    return $.get('./pad.csv', {}, function (response) {
        window.pad.variables.csv = $.csv.toObjects(response);
    })
};

window.pad.actions.searchFromTextInput = function () {
    var queryString = $('#pad-search-input').val().trim();
    if (queryString) {
        window.pad.actions.search({q: queryString});
    } else {
        window.pad.actions.search({});
    }
};

window.pad.actions.search = function (query) {
    window.location.href = '/pad/datasets.html?' + $.param(query);
};

window.pad.actions.searchOnEnter = function (e) {
    if (e.which === 13) {
        window.pad.actions.searchFromTextInput();
    }
};

window.pad.actions.parseUrlQuery = function () {
    var query = {};
    location.search.substr(1).split("&").forEach(function(item) {
        var pair = item.split("="),
            key = pair[0],
            value = pair[1] && decodeURIComponent(pair[1]);
        query[key] = query[key] || [];
        query[key].push(value);
    });
    if (query['pagina']) {
        query['pagina'] = parseInt(query['pagina']);
    }
    window.pad.variables.query = query;
    return query;
};

$(function () {
    var $body = $('body');
    $body.on('click', '.search-container button', window.pad.actions.searchFromTextInput);
    $body.on('keypress', '#pad-search-input', window.pad.actions.searchOnEnter)
});
