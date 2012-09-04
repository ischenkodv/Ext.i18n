Ext.define('Ext.i18n.TranslationManager', {
    extend: 'Ext.util.HashMap',
    alternateClassName: ['Ext.TranslationMgr', 'Ext.TranslationManager'],
    requires: ['Ext.i18n.Translator'],
    singleton: true,

    defaultTranslator: null,
    language: null,

    /**
     * Register translator.
     * @param {string} key
     * @param {Ext.i18n.Translator} translator
     */
    register: function(key, translator){
        if (translator instanceof Ext.i18n.Translator) {
            this.add(key, translator);
        }
    },

    /**
     * Unregister translator.
     * @param {Ext.i18n.Translator} translator
     */
    unregister: function(translator) {
        if (Ext.isString(translator)) {
            this.removeAtKey(translator);
        } else if (translator instanceof Ext.i18n.Translator) {
            this.remove(translator);
        }
    },

    setDefaultTranslator: function(translator) {
        if (Ext.isString(translator) && this.containsKey(translator)) {
            this.defaultTranslator = this.get(translator);
        } else if (translator instanceof Ext.i18n.Translator) {
            this.defaultTranslator = translator;
        }
    },

    getDefaultTranslator: function() {
        return this.defaultTranslator;
    },

    /**
     * Set language for each registered translator.
     * @param {string} language
     */
    setLanguage: function(lang) {
        this.each(function(tr){
            tr.setLanguage(lang);
        });
        this.language = lang;
    }

});
