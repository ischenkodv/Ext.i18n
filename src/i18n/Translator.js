/**
 * @class Ext.i18n.Translator
 *
 * Translator is intendent to translate texts in application.
 * Example usage:
 *
 *  // Initiate translator for finnish language - "fi".
 *  var translator = new Ext.i18n.Translator({
 *      data: [
 *          {key: 'a', lang: 'fi', value: 'a fi'},
 *          {key: 'b', lang: 'fi', value: 'b fi'},
 *          {key: 'b', lang: 'de', value: 'b de'},
 *          {key: 'b', section: 'test', lang: 'fi', value: 'b test fi'},
 *          {key: 'soome {0} nice {1} thing {2}', section: 'test', lang: 'fi', value: 'sofi {0} nias {1} bual {2}'},
 *      ],
 *      language: 'fi'
 *  });
 *
 *  // Assign it to global object for later usage.
 *  Ext.i18n.setDefaultTranslator(translator);
 *
 *  translator._('abc');
 *  translator.translate('xyz');
 *  Ext.i18n._('a');
 *  Ext.i18n._('b', 'test');
 *  Ext.i18n._('soome {0} nice {1} thing {2}', ['foo','bar','baz'], 'test');
 *  Ext.i18n.translate('Abcdef');
 */


/**
 * @class Ext.i18n
 * Convenience singleton to access global translation object.
 */
Ext.define('Ext.i18n', {
    statics: (function(){

        /**
         * @type {Ext.i18n.Translator}
         * @private
         */
        var tr = null;

        return {
            /**
             * Set translator.
             * @param {Ext.i18n.Translator}
             */
            setDefaultTranslator: function(translator) {
                if (translator instanceof Ext.i18n.Translator) {
                    tr = translator;
                }
            },

            /**
             * Get translator.
             * @return {Ext.i18n.Translator}
             */
            getDefaultTranslator: function(){
                return tr;
            },

            /**
             * Translates text.
             */
            translate: function() {
                return tr ? tr.translate.apply(tr, arguments) : arguments[0];
            },

            /**
             * Alias function for "translate".
             */
            _: function() {
                return tr ? tr.translate.apply(tr, arguments) : arguments[0];
            }
        };
    })()
});

/**
 * Translator.
 */
Ext.define('Ext.i18n.Translator', {
    extend: 'Ext.util.Observable',
    alias: 'i18n.translator',

    language: null,

    defaultSection: new Ext.util.HashMap(),
    sections: {},

    constructor: function(config){

        config = config || {};

        if (config.language) {
            this.setLanguage(config.language);
        }


        this.callParent(arguments);

        this.addEvents('load');

        var store;

        if (Ext.isObject(config.store)) {
            store = config.store;
        } else {
            store = {
                type: 'json',
                autoLoad: true,
                fields: ['key','section','lang','value'],
                data: [],
                proxy: {
                    type: 'memory',
                    reader: {
                        type: 'json',
                    }
                }
            };
        }

        this.store = Ext.createByAlias('store.' + store.type, store);

        this.addTranslations(config.data);
    },

    /**
     * Add translations to the translation object.
     * @param {array} data - data to load.
     * @return {boolean}
     */
    addTranslations: function(data){
        if (!Ext.isArray(data)) {
            return false;
        }

        this.store.loadData(data);

        var records = this.store.getRange(),
            currLang = this.language;

        for (var i = records.length; --i >= 0;) {
            var rec = records[i],
                lang = rec.get('lang') || currLang,
                section = this.getSection(rec.get('section'));

            section.add(lang + rec.get('key'), rec.get('value'));
        }

        this.fireEvent('load', this.language);

        return true;
    },

    /**
     * Translate specified message/key into current language.
     * @param {string} key
     * @return {string}
     */
    translate: function(key) {
        if (!this.language) return key;

        var result = key, params, section = null;

        switch (arguments.length) {
            case 2:
                if (Ext.isArray(arguments[1])) {
                    params = arguments[1];
                } else {
                    section = this.getSection(arguments[1]);
                }
                break;
            case 3:
                if (Ext.isArray(arguments[1])) {
                    params = arguments[1];
                }

                if (Ext.isString(arguments[2])) {
                    section = this.getSection(arguments[2]);
                }

                break;
            default:
                section = this.defaultSection;
        }

        var k = this.language + key;
        if (section.containsKey(k)) {
            result = section.get(k);
        }

        // Format values.
        if (params) {
            params.unshift(result);
            result = Ext.String.format.apply(null, params);
        }

        return result;
    },

    /**
     * Alias for "translate" function.
     * @see {Ext.i18n.Translator.translate}
     */
    _: function(){
        this.translate.call(this, arguments);
    },

    /**
     * Get section by name. If section does not exists 
     * the new one will be created.
     * @param {string} name
     */
    getSection: function(name){
        if (name) {
            if (!this.sections[name]) {
                this.sections[name] = new Ext.util.HashMap();
            }

            return this.sections[name];
        } else {
            return this.defaultSection;
        }
    },

    /**
     * Set current language.
     * @param {string} lang - language name.
     */
    setLanguage: function(lang){
        this.language = lang;
    },

    /**
     * Get current language.
     * @return {string}
     */
    getLanguage: function(){
        return this.language;
    }

});


