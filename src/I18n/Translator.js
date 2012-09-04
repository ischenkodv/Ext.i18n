/**
 * @class I18n.Translator
 *
 * Translator is intendent to translate texts in application.
 * Example usage:
 *
 *  // Initiate translator for finnish language - "fi".
 *  var translator = new I18n.Translator({
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
 *  I18n.setDefaultTranslator(translator);
 *
 *  translator._('abc');
 *  translator.translate('xyz');
 *  I18n._('a');
 *  I18n._('b', 'test');
 *  I18n._('soome {0} nice {1} thing {2}', ['foo','bar','baz'], 'test');
 *  I18n.translate('Abcdef');
 */

(function(){
    Ext.ns('I18n');

    Ext.require('Ext.util.HashMap', function(){

        var defaultTranslator,
            language,
            translators = new Ext.util.HashMap;


            /**
             * @class I18n
             * Convenience singleton to access global translation object.
             */
        Ext.apply(I18n, {
            /**
             * Get registered translator by its name.
             * @param {string} key
             * @return {I18n.Translator|false}
             */
            getTranslator: function(key) {
                return translators.get(key);
            },

            /**
             * Register translator.
             * @param {string} key
             * @param {I18n.Translator} translator
             * @return {boolean}
             */
            register: function(key, translator){
                if (Ext.isString(key) && translator instanceof I18n.Translator) {
                    translators.add(key, translator);
                    return true;
                }

                return false;
            },

            /**
             * Unregister translator.
             * @param {I18n.Translator} translator
             */
            unregister: function(translator) {
                if (Ext.isString(translator)) {
                    translators.removeAtKey(translator);
                } else if (translator instanceof I18n.Translator) {
                    translators.remove(translator);
                }
            },

            /**
             * Set translator.
             * @param {I18n.Translator}
             */
            setDefaultTranslator: function(translator) {
                if (Ext.isString(translator) && translators.containsKey(translator)) {
                    defaultTranslator = translators.get(translator);
                    return true;
                } else if (translator instanceof I18n.Translator) {
                    defaultTranslator = translator;
                    return true;
                } else {
                    return false;
                }
            },

            /**
             * Get default translator.
             * @return {I18n.Translator}
             */
            getDefaultTranslator: function(){
                return defaultTranslator;
            },

            /**
             * Set language for each registered translator.
             * @param {string} language
             */
            setLanguage: function(lang) {
                translators.each(function(tr){
                    tr.setLanguage(lang);
                });
                language = lang;
            },

            getLanguage: function(){
                return language;
            },

            /**
             * Alias function for "_".
             */
            translate: function() {
                return this._.apply(this, arguments);
            },

            /**
             * Translates text.
             */
            _: function() {
                return defaultTranslator ? defaultTranslator.translate.apply(defaultTranslator, arguments) : arguments[0];
            }
        });
    })

})();

/**
 * Translator.
 */
Ext.define('I18n.Translator', {
    extend: 'Ext.util.Observable',
    alias: 'i18n.translator',
    language: null,
    sections: {},
    defaultSection: {},

    constructor: function(config){
        config = config || {};

        this.buildStore(config.store);

        if (config.language) {
            this.setLanguage(config.language);
        }


        this.callParent(arguments);

        this.addEvents('load');

        this.loadTranslations(config.data, this.getLanguage());
    },

    /**
     * Build store that used to fetch translations.
     * @param {object} config
     */
    buildStore: function(config) {
        if (!Ext.isObject(config)) {
            config = {
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
            }
        }


        var store = Ext.createByAlias('store.' + config.type, config);
        store.on('load', function(){
            var me = this,
                language = me.getLanguage();

            store.each(function(rec){
                var lang = rec.get('lang') || language,
                    section = me.getSection(rec.get('section'));

                section[lang + rec.get('key')] = rec.get('value');
            });

            me.fireEvent('load', language);
        }, this);

        this.store = store;
    },

    /**
     * Add translations to the translation object.
     * @param {array} data Data to load.
     */
    loadTranslations: function(data) {
        if (!Ext.isArray(data)) {
            return false;
        }

        this.store.loadRawData(data);
    },

    /**
     * Translate specified message/key into current language.
     * @param {string} key
     * @return {string}
     */
    translate: function(key) {
        if (!this.language) return key;

        var result = key, params, section = this.defaultSection;

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
        }

        var k = this.language + key;
        if (section.hasOwnProperty(k)) {
            result = section[k];
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
     * @see {I18n.Translator.translate}
     */
    _: function(){
        this.translate.call(this, arguments);
    },

    /**
     * Get section by name. If section does not exists 
     * the new one will be created.
     * @param {string} name
     * @return {Ext.util.HashMap}
     */
    getSection: function(name){
        if (name) {
            if (!this.sections[name]) {
                this.sections[name] = {};
            }

            return this.sections[name];
        }

        return this.defaultSection;
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


