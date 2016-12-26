function loadCSV() {
    return $.get('./plan_de_apertura_2016-2017.csv', {}, function (response) {
        window.pad = $.csv.toObjects(response);
    })
}

function searchFromTextInput() {
    var queryString = $('#pad-search-input').val().trim();
    if (queryString) {
        search({q: queryString});
    } else {
        search({});
    }
}

function search(query) {
    window.location.href = '/pad/datasets.html?' + $.param(query);
}
function searchOnEnter(e) {
    if (e.which === 13) {
        searchFromTextInput();
    }
}

function parseUrlQuery() {
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
    return query;
}

$(function () {
    var $body = $('body');
    $body.on('click', '.search-container button', searchFromTextInput);
    $body.on('keypress', '#pad-search-input', searchOnEnter)
});
