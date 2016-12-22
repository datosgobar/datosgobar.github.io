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
        for (var i=0; i<window.pad.length; i++) {
            var sercheable = $.extend({}, window.pad[i], {id: i});
            window.searcher.add(sercheable);
        }
    }

    function searchByText(query) {
        var results;
        if (query.q && query.q.length > 0 && query.q[0]) {
            var lunrResults = window.searcher.search(query.q[0]);
            results = [];
            for (var i=0; i<lunrResults.length; i++) {
                var lunrResult = lunrResults[i];
                var resultWithScore = $.extend({}, window.pad[lunrResult.ref], lunrResult);
                results.push(resultWithScore)
            }
        } else {
            results = window.pad;
        }

        console.log(results);
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
        var searchingText = query.q && query.q.length > 0 && query.q[0];
        var titleEl = $('.pad-title-container h2');

        if (searchingText) {
            $('#pad-search-input').val(query.q[0]);
        }
        if (results.length == 0) {
            var noResultsTitle = 'Oh, no hay información sobre “' + query.q[0] + '”. Intentá con otra palabra.';
            titleEl.text(noResultsTitle);
        } else {
            if (query.organismo) {
                var titleText = 'Este es el plan de apertura de <span class="organism">{}</span>.'.replace('{}', query.organismo);
                titleEl.html(titleText);
            } else if (searchingText) {
                var resultCount = results.length;
                var title = 'Hay ' + resultCount.toString();
                title += resultCount > 1 ? ' resultado' : ' resultados';
                title += ' sobre “{}”.'.replace('{}', query.q[0]);
                titleEl.text(title);
            } else {
                titleEl.remove();
            }
        }

    }

    function renderResults(results, query) {
        var resultsContainer = $('.pad-results');
        $('.pad-results-container').removeClass('hidden');
        var exampleTemplate = $('.example-result');
        for (var i=0; i<results.length; i++) {
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

    }

    loadCSV().then(function() {
        initializeLunr();

        var query = parseUrlQuery();
        var unfilteredResults = searchByText(query);
        var results = filterResults(unfilteredResults, query);
        renderTitle(results, query);

        if (results.length > 0) {
            renderFilters(results, query);
            renderResults(results, query);
        } else {
            $('.pad-no-results-container').removeClass('hidden');
        }
    });
});