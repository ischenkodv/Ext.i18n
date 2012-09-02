Ext.define('Ext.i18n.TranslationManager', {
    extend: 'Ext.util.HashMap',
    alternateClassName: ['Ext.TranslationMgr', 'Ext.TranslationManager'],
    singleton: true,

    defaultTranslator: null,

    register: function(key, translator){
        this.add(key, translator);
    },

    unregister: function(tr){
        if (Ext.isString(tr)) {
            this.removeAtKey(key);
        } else if (tr instanceof Ext.i18n.Translator) {
            this.remove(tr);
        }
    },

    setDefaultTranslator: function(tr){
        if (Ext.isString(tr) && this.containsKey(tr)) {
            this.defaultTranslator = this.get(tr);
        } else if (tr instanceof Ext.i18n.Translator) {
            this.defaultTranslator = tr;
        }
    },

    getDefaultTranslator: function(){
        return this.defaultTranslator;
    }

});
