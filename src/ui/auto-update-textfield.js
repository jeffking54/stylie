define(['src/utils'], function (util) {

  // Bindable event handlers:
  //   onArrowUp()
  //   onArrowDown()
  //   onEnterDown()
  //   onValReenter(val)
  return Backbone.View.extend({

    'events': {
      'keyup': 'onKeyup'
      ,'keydown': 'onKeydown'
    }

    ,'initialize': function (opts) {
      _.extend(this, opts);
    }

    ,'onKeyup': function (evt) {
      var val = this.$el.val();
      if (this.onValReenter) {
        this.onValReenter(val);
      }
    }

    ,'onKeydown': function (evt) {
      var which = +evt.which;

      if (which === 38 && this.onArrowUp) { // up
        this.onArrowUp(evt);
      } else if (which === 40 && this.onArrowDown) { // down
        this.onArrowDown(evt);
      } else if (which === 13 && this.onEnterDown) { // enter
        this.onEnterDown(evt);
      }
    }

    ,'tearDown': function () {
      this.remove();
      util.deleteAllProperties(this);
    }

  });

});
