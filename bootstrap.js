Category.find({}, function(err, docs) {
    if (!err) {
        if (!docs || docs == null || docs.length == 0) {
            //create new categories if they not exist
            console.log('Creating categories...');
            var cat;

            cat = new Category({id: 1, description: 'Música', locale: 'pt-BR'});
            cat.save();
            cat = new Category({id: 2, description: 'Teatro', locale: 'pt-BR'});
            cat.save();
            cat = new Category({id: 3, description: 'Cinema', locale: 'pt-BR'});
            cat.save();
            cat = new Category({id: 4, description: 'Artes e Exposições', locale: 'pt-BR'});
            cat.save();
            cat = new Category({id: 5, description: 'Gastronomia', locale: 'pt-BR'});
            cat.save();
            cat = new Category({id: 6, description: 'Moda', locale: 'pt-BR'});
            cat.save();
            cat = new Category({id: 7, description: 'Executivo', locale: 'pt-BR'});
            cat.save();
            cat = new Category({id: 8, description: 'Infantil', locale: 'pt-BR'});
            cat.save();
            cat = new Category({id: 9, description: 'Passeios e Lazer', locale: 'pt-BR'});
            cat.save();
            cat = new Category({id: 10, description: 'Esportes', locale: 'pt-BR'});
            cat.save();
        }
    }

    //stores all categories for a quick access.
    GLOBAL.allCats = [];

    Category.find({}, function(err, docs) {
        if (!err) {
            docs.forEach(function(cat) {
                allCats.push(cat);
            });
        }
    });

});