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
        if (query.q && query.q.length > 0 && query.q[0]) {
            var lunrResults = window.searcher.search(query.q[0]);
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

    function firstPassFilterResults(unfilteredResults, query) {
        var filteredResults = unfilteredResults;
        if (query['organismo']) {
            filteredResults = filteredResults.filter(function (dataset) {
                return dataset['nombre_tarjeta_home'] == query['organismo']
            })
        }

        return filteredResults
    }

    function secondPassFilterResults(results, query) {
        var filteredResults = results;
        if (query['publicacion']) {
            filteredResults = filteredResults.filter(function (dataset) {
                return query['publicacion'].indexOf(dataset['fecha']) != -1
            })
        }
        if (query['actualizacion']) {
            filteredResults = filteredResults.filter(function (dataset) {
                return query['actualizacion'].indexOf(dataset['actualizacion']) != -1
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

    function renderResults(results) {
        var resultsContainer = $('.pad-results');
        $('.pad-results-container').removeClass('hidden');
        var exampleTemplate = $('.example-result').clone().removeClass('hidden example-result');
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var template = exampleTemplate.clone();
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
            entities.organismo.sort();
            var year = /(20\d\d)/;
            entities.publicacion.sort(function (a, b) {
                var aYear = year.exec(a)[1];
                var bYear = year.exec(b)[1];
                a = aYear + a;
                b = bYear + b;
                return a < b  ? -1 : a > b ? 1 : 0;
            });
            var originalFrequencies = ['Diaria','Semanal', 'Mensual', 'Trimestral','Semestral', 'Anual', 'Eventual', 'Tiempo real'];
            entities.actualizacion.sort(function (a, b) {
                return originalFrequencies.indexOf(a) - originalFrequencies.indexOf(b);
            });
            return entities
        }

        var allEntities = collectUniqueEntities(window.pad);
        var resultsEntities = collectUniqueEntities(results);

        function renderOrganisms() {
            var organismsTemplate = $('.organism-filters .filter-example').clone().removeClass('filter-example hidden');

            var jgmIndex = allEntities.organismo.indexOf('JGM');
            if (jgmIndex != -1) {
                allEntities.organismo.splice(jgmIndex, 1);
                allEntities.organismo.unshift('JGM');
            }

            var presidenciaIndex = allEntities.organismo.indexOf('Presidencia');
            if (presidenciaIndex != -1) {
                allEntities.organismo.splice(presidenciaIndex, 1);
                allEntities.organismo.unshift('Presidencia');
            }

            for (var i = 0; i < allEntities.organismo.length; i++) {
                var template = organismsTemplate.clone();
                var organism = allEntities.organismo[i];
                template.find('span').text(organism);
                var href;
                if (organism == query.organismo) {
                    href = $.extend(true, {}, query);
                    delete href['organismo'];
                    template.attr('href', '?' + $.param(href, true));
                    template.find('.filter-text').addClass('selected');
                    $('.organism-filters .filter-list').prepend(template);
                } else {
                    href = $.extend(true, {}, query, {organismo: organism});
                    template.attr('href', '?' + $.param(href, true));
                    $('.organism-filters .filter-list').append(template);
                }
            }
        }

        function renderPublications() {
            var publicationTemplate = $('.publication-filters .filter-example').clone().removeClass('filter-example hidden');
            for (var i = 0; i < allEntities.publicacion.length; i++) {
                var template = publicationTemplate.clone();
                var publication = allEntities.publicacion[i];
                template.find('span.text').text(publication);
                if (resultsEntities.publicacion.indexOf(publication) == -1) {
                    template.find('.filter-text').addClass('disabled');
                } else {
                    var href = $.extend(true, {}, query);
                    if (href.publicacion && href.publicacion.indexOf(publication) != -1) {
                        href.publicacion.splice(href.publicacion.indexOf(publication), 1);
                        template.attr('href', '?' + $.param(href, true));
                        template.find('.filter-text').addClass('selected');
                    } else {
                        href.publicacion = href.publicacion || [];
                        href.publicacion.push(publication);
                        template.attr('href', '?' + $.param(href, true));
                    }
                }
                $('.publication-filters .filter-list').append(template);
            }
        }

        function renderUpdates() {
            var updateTemplate = $('.update-filters .filter-example').clone().removeClass('filter-example hidden');
            for (var i = 0; i < allEntities.actualizacion.length; i++) {
                var template = updateTemplate.clone();
                var update = allEntities.actualizacion[i];
                template.find('span.text').text(update);
                if (resultsEntities.actualizacion.indexOf(update) == -1) {
                    template.find('.filter-text').addClass('disabled');
                } else {
                    var href = $.extend(true, {}, query);
                    if (href.actualizacion && href.actualizacion.indexOf(update) != -1) {
                        href.actualizacion.splice(href.actualizacion.indexOf(update), 1);
                        template.attr('href', '?' + $.param(href, true));
                        template.find('.filter-text').addClass('selected');
                    } else {
                        href.actualizacion = href.actualizacion || [];
                        href.actualizacion.push(update);
                        template.attr('href', '?' + $.param(href, true));
                    }
                }
                $('.update-filters .filter-list').append(template);
            }
        }

        renderOrganisms();
        renderPublications();
        renderUpdates();
    }

    loadCSV().then(function () {
        initializeLunr();

        var query = parseUrlQuery();
        var unfilteredResults = searchByText(query);
        var results = firstPassFilterResults(unfilteredResults, query);
        renderTitle(results, query);

        if (results.length > 0) {
            renderFilters(results, query);
            results = secondPassFilterResults(results, query);
            renderResults(results);
        } else {
            $('.pad-no-results-container').removeClass('hidden');
        }
    });
});