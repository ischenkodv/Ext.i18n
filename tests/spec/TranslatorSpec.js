Ext.syncRequire([
    'Ext.i18n.Translator'
    //'Ext.i18n.TranslationManager'
]);

describe('Translator', function(){

    var data,
        translator,
        language;

    beforeEach(function(){
        data = [
            {key: 'a', lang: 'fi', value: 'a fi'},
            {key: 'b', lang: 'fi', value: 'b fi'},
            {key: 'b', lang: 'de', value: 'b de'},
            {key: 'b', section: 'test', lang: 'fi', value: 'b test fi'},
            {key: 'foo {0} bar {1} baz {2}', lang: 'fi', value: 'aaa {0} bbb {1} ccc {2}'},
            {key: 'foo {0} bar {1} baz {2}', section: 'test', lang: 'fi', value: 'xxx {0} yyy {1} zzz {2}'}
        ];
        language = 'fi';

        translator = new Ext.i18n.Translator({
            data: data,
            language: language
        });
    });

    it('can translate simple string', function(){
        expect(translator.translate('a')).toEqual('a fi');
    });

    it('can translate string from specified section', function(){
        expect(translator.translate('b', 'test')).toEqual('b test fi');
    });

    it('can translate and replace placeholders in translated string', function(){
        expect(translator.translate('foo {0} bar {1} baz {2}', ['A','B','C'])).toEqual('aaa A bbb B ccc C');
    });

    it('can translate and replace placeholders when section is specified', function(){
        expect(translator.translate('foo {0} bar {1} baz {2}', ['X','Y','Z'], 'test')).toEqual('xxx X yyy Y zzz Z');
    });

    it('translates according to specified language', function(){
        translator.setLanguage('de');
        expect(translator.translate('b')).toEqual('b de');
    });

    it('returns input string if language not defined', function(){
        translator.setLanguage(null);
        expect(translator.translate('b')).toEqual('b');
    });

    it('returns input string if translation not found', function(){
        expect(translator.translate('not exists')).toEqual('not exists');
    });

});
