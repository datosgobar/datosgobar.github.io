$(function () {
    function initializeLunr() {
        window.searcher = lunr(function () {
            this.field('denominacion', {boost: 10});
            this.field('descripcion', {boost: 8});
            this.field('jurisdiccion', {boost: 5});
            this.field('fecha');
            this.field('actualizacion');
            this.ref('id')
        });
        for (var i = 0; i < window.pad.length; i++) {
            var sercheable = $.extend({}, window.pad[i], {id: i});
            window.searcher.add(sercheable);
        }
    }

    function searchByText(query) {
        var results;
        if (query.q && query.q.length > 0) {
            var lunrResults = window.searcher.search(query.q);
            results = [];
            for (var i = 0; i < lunrResults.length; i++) {
                var lunrResult = lunrResults[i];
                var resultWithScore = $.extend({}, window.pad[lunrResult.ref], lunrResult);
                results.push(resultWithScore)
            }
        } else {
            results = window.pad;
        }

        return results
    }

    function filterResults(unfilteredResults, query) {
        var filteredResults = unfilteredResults;
        if (query['organismo']) {
            filteredResults = filteredResults.filter(function (dataset) {
                return dataset['nombre_tarjeta_home'] == query['organismo']
            })
        }
        return filteredResults
    }

    function renderTitle(results, query) {
        var searchingText = query.q && query.q.length > 0;
        var titleEl = $('.pad-title-container h2');

        if (searchingText) {
            $('#pad-search-input').val(query.q);
        }
        if (results.length == 0) {
            var noResultsTitle = 'Oh, no hay información sobre “' + query.q + '”. Intentá con otra palabra.';
            titleEl.text(noResultsTitle);
        } else {
            if (query.organismo) {
                var titleText = 'Este es el plan de apertura de <span class="organism">{}</span>.'.replace('{}', query.organismo);
                titleEl.html(titleText);
            } else if (searchingText) {
                var resultCount = results.length;
                var title = 'Hay ' + resultCount.toString();
                title += resultCount > 1 ? ' resultado' : ' resultados';
                title += ' sobre “{}”.'.replace('{}', query.q);
                titleEl.text(title);
            } else {
                titleEl.remove();
            }
        }

    }

    function renderResults(results) {
        var resultsContainer = $('.pad-results');
        $('.pad-results-container').removeClass('hidden');
        var exampleTemplate = $('.example-result');
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var template = exampleTemplate.clone().removeClass('hidden');
            template.find('.dataset-name').text(result['denominacion']);
            template.find('.dataset-description').text(result['descripcion']);
            template.find('.publication').text(result['fecha']);
            template.find('.update').text(result['actualizacion']);
            template.find('.organism').text(result['nombre_tarjeta_home']);
            resultsContainer.append(template);
        }
    }

    function renderFilters(results, query) {
        function collectUniqueEntities(datasetList) {
            var entities = {
                organismo: [],
                publicacion: [],
                actualizacion: []
            };
            for (var i = 0; i < datasetList.length; i++) {
                var result = datasetList[i];
                if (entities.organismo.indexOf(result['nombre_tarjeta_home']) == -1) {
                    entities.organismo.push(result['nombre_tarjeta_home'])
                }
                if (entities.publicacion.indexOf(result['fecha']) == -1) {
                    entities.publicacion.push(result['fecha'])
                }
                if (entities.actualizacion.indexOf(result['actualizacion']) == -1) {
                    entities.actualizacion.push(result['actualizacion'])
                }
            }
            return entities
        }

        var allEntities = collectUniqueEntities(window.pad);
        var resultsEntities = collectUniqueEntities(results);

        var organismsTemplate = $('.organism-filters .filter-example').clone().removeClass('hidden');
        for (var i=0; i<allEntities.organismo.length; i++) {
            var template = organismsTemplate.clone();
            var organism = allEntities.organismo[i];
            template.find('span').text(organism);
            var href;
            if (organism == query.organismo) {
                href = $.extend({}, query);
                delete href['organismo'];
                template.attr('href', '?' + $.param(href));
                template.find('.filter-text').addClass('selected');
                $('.organism-filters .filter-list').prepend(template);
            } else {
                href = $.extend({}, query, {organismo: organism});
                template.attr('href', '?' + $.param(href));
                $('.organism-filters .filter-list').append(template);
            }
        }


    }

    loadCSV().then(function () {
        initializeLunr();

        var query = parseUrlQuery();
        var unfilteredResults = searchByText(query);
        var results = filterResults(unfilteredResults, query);
        renderTitle(results, query);

        if (results.length > 0) {
            renderFilters(results, query);
            renderResults(results);
        } else {
            $('.pad-no-results-container').removeClass('hidden');
        }
    });
});