"use strict";

window.pad.variables.perPage = 10;

window.pad.actions.initializeLunr = function () {
    window.pad.variables.searcher = lunr(function () {
        this.field('denominacion_ascii', {boost: 10});
        this.field('descripcion_ascii', {boost: 8});
        this.field('jurisdiccion_ascii', {boost: 5});
        this.field('fecha_ascii');
        this.field('actualizacion_ascii');
        this.field('nombre_tarjeta_home_ascii', {boost: 5});
        this.ref('id')
    });
    for (var i = 0; i < window.pad.variables.csv.length; i++) {
        var sercheable = $.extend({}, window.pad.variables.csv[i], {id: i});
        sercheable['denominacion_ascii'] = replaceDiacritics(sercheable['denominacion']);
        sercheable['descripcion_ascii'] = replaceDiacritics(sercheable['descripcion']);
        sercheable['jurisdiccion_ascii'] = replaceDiacritics(sercheable['jurisdiccion']);
        sercheable['fecha_ascii'] = replaceDiacritics(sercheable['fecha']);
        sercheable['actualizacion_ascii'] = replaceDiacritics(sercheable['actualizacion']);
        sercheable['nombre_tarjeta_home_ascii'] = replaceDiacritics(sercheable['nombre_tarjeta_home']);
        window.pad.variables.searcher.add(sercheable);
    }
};

window.pad.actions.searchByText = function (query) {
    query = query || window.pad.variables.query;
    var results;
    if (query.q && query.q.length > 0 && query.q[0]) {
        var lunrResults = window.pad.variables.searcher.search(replaceDiacritics(query.q[0]));
        results = [];
        for (var i = 0; i < lunrResults.length; i++) {
            var lunrResult = lunrResults[i];
            var resultWithScore = $.extend({}, window.pad.variables.csv[lunrResult.ref], lunrResult);
            results.push(resultWithScore)
        }
    } else {
        results = $.extend(true, [], window.pad.variables.csv);
        results.sort(function (a, b) {
            var aOrganism = a['nombre_tarjeta_home'];
            var bOrganism = b['nombre_tarjeta_home'];
            return window.pad.actions.organismSort(aOrganism, bOrganism);
        });
    }

    return results;
};

window.pad.actions.filterResults = function (results, query) {
    results = results || window.pad.variables.results;
    query = query || window.pad.variables.query;
    if (query['organismo']) {
        results = results.filter(function (dataset) {
            return dataset['nombre_tarjeta_home'].toLowerCase() == query['organismo'][0].toLowerCase()
        })
    }
    if (query['estado'] && query['estado'].indexOf('Publicado') > -1)  {
        results = results.filter(function (dataset) {
            return dataset['distribuciones'].length > 0;
        })
    }
    if (query['estado'] && query['estado'].indexOf('En formato abierto') > -1) {
        results = results.filter(function (dataset) {
            return dataset['distribuciones'].length > 0 &&
            window.pad.actions.isOpenFormat(dataset['distribuciones']);
        })
    }
    if (query['publicacion']) {
        results = results.filter(function (dataset) {
            return query['publicacion'].indexOf(dataset['fecha']) != -1
        })
    }
    if (query['actualizacion']) {
        results = results.filter(function (dataset) {
            return query['actualizacion'].indexOf(dataset['actualizacion']) != -1
        })
    }
    return results;
};

window.pad.actions.renderTitle = function () {
    var query = window.pad.variables.query;
    var searchingText = query.q && query.q.length > 0 && query.q[0];
    var titleEl = $('.pad-title-container h2');

    if (searchingText) {
        $('#pad-search-input').val(query.q[0]);
    }
    if (window.pad.variables.results.length == 0 && query.q) {
        var noResultsTitle = 'Oh, no hay información sobre “' + query.q[0] + '”. Intentá con otra palabra.';
        titleEl.text(noResultsTitle);
    } else if (window.pad.variables.results.length > 0 && query.organismo) {
        var titleText = 'Este es el plan de apertura de <span class="organism">{}</span>.'.replace('{}', query.organismo);
        titleEl.html(titleText);
    } else if (window.pad.variables.results.length > 0 && searchingText) {
        var resultCount = window.pad.variables.results.length;
        var title = 'Hay ' + resultCount.toString();
        title += resultCount > 1 ? ' resultados' : ' resultado';
        title += ' sobre “{}”.'.replace('{}', query.q[0]);
        titleEl.text(title);
    } else {
        titleEl.remove();
    }


};

window.pad.actions.renderPaginationLink = function (pageNumber, char) {
    window.pad.variables.paginationTemplate = window.pad.variables.paginationTemplate || $('.results-pagination .pagination-example').clone().removeClass('pagination-example hidden');
    var link = window.pad.variables.paginationTemplate.clone();
    var href = $.extend(true, {}, window.pad.variables.query);
    href['pagina'] = pageNumber;
    link.attr('href', '?' + $.param(href, true));
    link.find('span').text(char);
    $('.results-pagination').append(link);
    return link;
};

window.pad.actions.renderPagination = function () {
    var maxPages = Math.ceil(window.pad.variables.results.length / window.pad.variables.perPage);
    var currentPage = window.pad.variables.query['pagina'] || 1;
    if (maxPages <= 1) {
        return;
    }
    if (currentPage > 5) {
        window.pad.actions.renderPaginationLink(1, '«');
    }
    if (currentPage > 1) {
        window.pad.actions.renderPaginationLink(currentPage - 1, '‹');
    }
    for (var p = currentPage - 4; p < currentPage; p++) {
        if (p > 0) {
            window.pad.actions.renderPaginationLink(p, p);
        }
    }
    window.pad.actions.renderPaginationLink(currentPage, currentPage).removeAttr('href').find('span').addClass('current');
    for (var p2 = currentPage + 1; p2 < currentPage + 5; p2++) {
        if (p2 <= maxPages) {
            window.pad.actions.renderPaginationLink(p2, p2);
        }
    }
    if (currentPage + 1 <= maxPages) {
        window.pad.actions.renderPaginationLink(currentPage + 1, '›');
    }
    if (currentPage + 5 <= maxPages) {
        window.pad.actions.renderPaginationLink(maxPages, '»');
    }
};


window.pad.actions.paginateResults = function () {
    var query = window.pad.variables.query;
    var page = query['pagina'] ? query['pagina'] - 1 : 0;
    window.pad.variables.paginatedResults = window.pad.variables.results.slice(page * window.pad.variables.perPage, (page + 1) * window.pad.variables.perPage);
};

window.pad.actions.collectEntities = function (datasets) {
    datasets = datasets || window.pad.variables.csv;
    var entities = {organism: [], status: [], publication: [], update: []};
    entities.status.push('Publicado');
    entities.status.push('En formato abierto');
    for (var i = 0; i < datasets.length; i++) {
        var result = datasets[i];
        if (entities.organism.indexOf(result['nombre_tarjeta_home']) == -1) {
            entities.organism.push(result['nombre_tarjeta_home'])
        }
        if (entities.publication.indexOf(result['fecha']) == -1) {
            entities.publication.push(result['fecha'])
        }
        if (entities.update.indexOf(result['actualizacion']) == -1) {
            entities.update.push(result['actualizacion'])
        }
    }
    entities.organism.sort(window.pad.actions.organismSort);
    var yearRegex = /(20\d\d)/;
    entities.publication.sort(function (a, b) {
        var aYear = yearRegex.exec(a)[1];
        var bYear = yearRegex.exec(b)[1];
        a = aYear + a;
        b = bYear + b;
        return a < b ? -1 : a > b ? 1 : 0;
    });
    var originalFrequencies = ['Diaria', 'Semanal', 'Mensual', 'Trimestral', 'Semestral', 'Anual', 'Eventual', 'Tiempo real'];
    entities.update.sort(function (a, b) {
        return originalFrequencies.indexOf(a) - originalFrequencies.indexOf(b);
    });
    return entities;
};

window.pad.actions.renderFilter = function (options) {
    var filterName = options.filterName;
    var urlName = options.urlName;
    var baseTemplate = $('.' + filterName + '-filters .filter-example').clone().removeClass('filter-example hidden');

    var resultsFromOtherFilters = undefined;
    var entitiesFromOtherFilters = undefined;

    function canSwitchTo(anotherEntitiy) {
        var baseQuery = $.extend(true, {}, window.pad.variables.query);
        if (baseQuery[urlName]) {
            delete baseQuery[urlName];
        }
        resultsFromOtherFilters = resultsFromOtherFilters || window.pad.actions.filterResults(window.pad.actions.searchByText(baseQuery), baseQuery);
        entitiesFromOtherFilters = entitiesFromOtherFilters || window.pad.actions.collectEntities(resultsFromOtherFilters)[filterName];
        return entitiesFromOtherFilters.indexOf(anotherEntitiy) != -1;
    }

    var container = $('.' + filterName + '-filters .filter-list');
    for (var i = 0; i < window.pad.variables.entities[filterName].length; i++) {
        var template = baseTemplate.clone();
        var entity = window.pad.variables.entities[filterName][i];
        template.find('span.text').text(entity);
        var href = $.extend(true, {}, window.pad.variables.query);
        href['pagina'] = undefined;
        var selected = href[urlName] && (href[urlName].indexOf(entity) > -1 || href[urlName].indexOf(entity.toLowerCase()) > -1);
        if (selected) {
            if (href[urlName].length == 1) {
                delete href[urlName];
            } else {
                var index = href[urlName].indexOf(entity);
                href[urlName].splice(index, 1);
            }
            template.attr('href', '?' + $.param(href, true));
            template.find('.filter-text').addClass('selected');
        } else if (options.cumulative && canSwitchTo(entity)) {
            href[urlName] = href[urlName] || [];
            href[urlName].push(entity);
            template.attr('href', '?' + $.param(href, true));
        } else if (canSwitchTo(entity)) {
            href[urlName] = [entity];
            template.attr('href', '?' + $.param(href, true));
        } else {
            template.find('.filter-text').removeAttr('href').addClass('disabled');
        }
        if (selected && options.prependSelected) {
            container.prepend(template);
        } else {
            container.append(template);
        }
    }
};

window.pad.actions.renderFilters = function () {
    window.pad.variables.entities = window.pad.actions.collectEntities();
    window.pad.actions.renderFilter({filterName: 'organism', urlName: 'organismo', prependSelected: true});
    window.pad.actions.renderFilter({filterName: 'status', urlName: 'estado', cumulative: true});
    window.pad.actions.renderFilter({filterName: 'publication', urlName: 'publicacion', cumulative: true});
    window.pad.actions.renderFilter({filterName: 'update', urlName: 'actualizacion', cumulative: true});
    $('.reset-filters').toggleClass('hidden', !location.search.length > 0)
};

window.pad.actions.renderResults = function () {
    var resultsContainer = $('.pad-results .results-list');
    $('.pad-results-container').removeClass('hidden');
    var exampleTemplate = $('.example-result').clone().removeClass('hidden example-result');
    for (var i = 0; i < window.pad.variables.paginatedResults.length; i++) {
        var result = window.pad.variables.paginatedResults[i];
        var template = exampleTemplate.clone();
        template.find('.dataset-name').text(result['denominacion']);
        template.find('.dataset-description').text(result['descripcion']);
        template.find('.publication').text(result['fecha']);
        template.find('.update').text(result['actualizacion']);
        template.find('.organism').text(result['nombre_tarjeta_home']);
        var distributions = result['distribuciones'];
        if (distributions.length > 0) {
            template.find('.dataset-name').wrap('<a href="#" class="dataset-link" target="_blank"></a>');
            template.find('.tag-published').removeClass('hidden');
            var isOpenFormat = window.pad.actions.isOpenFormat(distributions);
            if (isOpenFormat) { template.find('.tag-open').removeClass('hidden'); }
            if (distributions.length == 1) {
                var accessURL = distributions[0]['distribution_accessURL'] || distributions[0]['dataset_landingPage'];
                template.find('.dataset-link').attr('href', accessURL);
            } else {
                template.find('.dataset-link').click(function(e) {
                    e.preventDefault();
                    var card = $(e.currentTarget).parents('.result');
                    card.find('.links-tree').toggleClass('fade');
                    card.find('.dataset-description').css('margin-bottom', '15px');
                });
                $(distributions).each(function() {
                    var title = '<h4>' + this['distribution_title'] + '</h4>';
                    var href = this['distribution_accessURL'] || this['dataset_landingPage'];
                    var link = $('<a target="_blank"></a>').html(title).attr('href', href);
                    var div = $('<div class="links-branch"></div>').html(link);
                    template.find('.links-tree').append(div);
                });
            }
        }
        resultsContainer.append(template);
    }
};

window.pad.actions.isOpenFormat = function(distributions) {
    return distributions.some(function (dist) {
        return ['csv', 'json', 'kml', 'xml'].indexOf(dist['distribution_format']) > -1;
    });
};

window.pad.actions.collectDistributions = function() {
    var commitments = {};
    for (var i = 0; i < window.pad.variables.dist.length; i++) {
        var distribution = window.pad.variables.dist[i];
        if (!commitments[distribution['compromiso_id']]) {
            commitments[distribution['compromiso_id']] = [];
        }
        commitments[distribution['compromiso_id']].push(distribution);
    }
    for (var n=0; n < window.pad.variables.csv.length; n++) {
        var commitmentId = window.pad.variables.csv[n]['compromiso_id'];
        if (commitments[commitmentId]) {
            window.pad.variables.csv[n]['distribuciones'] = commitments[commitmentId];
        } else {
            window.pad.variables.csv[n]['distribuciones'] = [];
        }
    }
};

$(function () {
    window.pad.actions.loadCSV().then(function () {
        window.pad.actions.initializeLunr();
        window.pad.actions.parseUrlQuery();
        window.pad.actions.collectDistributions();
        window.pad.variables.results = window.pad.actions.searchByText();
        window.pad.variables.results = window.pad.actions.filterResults();
        window.pad.actions.renderTitle();

        if (window.pad.variables.results.length > 0) {
            window.pad.actions.renderFilters();
            window.pad.actions.renderPagination();
            window.pad.actions.paginateResults();
            window.pad.actions.renderResults();
        } else {
            $('.pad-no-results-container').removeClass('hidden');
        }
    });
});