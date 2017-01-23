import Ember from 'ember';

export default Ember.Component.extend({
    init() {
        this._super();
        alert(`x-bar has foo=${this.get('foo')}`);
    }
});
