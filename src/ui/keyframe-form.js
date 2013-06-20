define([
    'src/app'
    ,'src/constants'
    ,'src/ui/incrementer-field'
    ,'src/ui/ease-select'

  ], function (

    app
    ,constant
    ,IncrementerFieldView
    ,EaseSelectView

  ) {

  function incrementerGeneratorHelper ($el) {
    return new IncrementerFieldView({
      '$el': $el

      ,'onValReenter': _.bind(function (val) {
        this.model.set($el.data('keyframeattr'), +val);
        publish(constant.PATH_CHANGED);
        app.collection.actors.getCurrent(0).updateKeyframeCrosshairViews();
        app.kapi.update();
      }, this)
    });
  }

  // TODO: This shouldn't be an LI, it assumes too much about the calling code.
  var KEYFRAME_TEMPLATE = [
      '<li class="keyframe">'
        ,'<h3></h3>'
        ,'<div>'
          ,'<label>'
            ,'<span>X:</span>'
            ,'<input class="quarter-width keyframe-attr-x" type="text" data-keyframeattr="x"></input>'
          ,'</label>'
        ,'</div>'
        ,'<div>'
          ,'<label>'
            ,'<span>Y:</span>'
            ,'<input class="quarter-width keyframe-attr-y" type="text" data-keyframeattr="y"></input>'
          ,'</label>'
        ,'</div>'
        ,'<div>'
          ,'<label>'
            ,'<span>R:</span>'
            ,'<input class="quarter-width keyframe-attr-r" type="text" data-keyframeattr="r"></input>'
          ,'</label>'
        ,'</div>'
      ,'</li>'
    ].join('');

  var EASE_SELECT_TEMPLATE = [
      '<select class="{{property}}-easing" data-axis="{{property}}"></select>'
    ].join('');

  return Backbone.View.extend({

    'events': {}

    ,'initialize': function (opts) {
      _.extend(this, opts);
      this.$el = $(KEYFRAME_TEMPLATE);
      this.model.keyframeForm = this;
      this.model.on('change', _.bind(this.render, this));
      this.initDOMReferences();
      this.initIncrementers();
      this.render();

      // If this is not the first keyframe, add ease select controls.
      if (!this.isFirstKeyfame()) {
        this.initEaseSelects();
      }
    }

    ,'initDOMReferences': function () {
      this.header = this.$el.find('h3');
      this.inputX = this.$el.find('.keyframe-attr-x');
      this.inputY = this.$el.find('.keyframe-attr-y');
      this.inputR = this.$el.find('.keyframe-attr-r');
    }

    ,'initIncrementers': function () {
      this.incrementerViews = {};
      _.each([this.inputX, this.inputY, this.inputR], function ($el) {
        this.incrementerViews[$el.data('keyframeattr')] =
            incrementerGeneratorHelper.call(this, $el);
      }, this);
    }

    ,'initEaseSelects': function () {
      this.easeSelectViewX = new EaseSelectView({
        '$el': $(Mustache.render(EASE_SELECT_TEMPLATE, { 'property': 'x' }))
        ,'owner': this
      });
      this.easeSelectViewX.$el.insertAfter(this.inputX.parent());

      this.easeSelectViewY = new EaseSelectView({
        '$el': $(Mustache.render(EASE_SELECT_TEMPLATE, { 'property': 'y' }))
        ,'owner': this
      });
      this.easeSelectViewY.$el.insertAfter(this.inputY.parent());

      this.easeSelectViewR = new EaseSelectView({
        '$el': $(Mustache.render(EASE_SELECT_TEMPLATE, { 'property': 'r' }))
        ,'owner': this
      });
      this.easeSelectViewR.$el.insertAfter(this.inputR.parent());
    }

    ,'isFirstKeyfame': function () {
      return this.model.collection.indexOf(this.model) === 0;
    }

    ,'render': function () {
      this.header.text(this.model.get('millisecond'));
      if (this.model.get('x') !== parseFloat(this.inputX.val())) {
        this.inputX.val(this.model.get('x'));
      }
      if (this.model.get('y') !== parseFloat(this.inputY.val())) {
        this.inputY.val(this.model.get('y'));
      }
      if (this.model.get('r') !== parseFloat(this.inputR.val())) {
        this.inputR.val(this.model.get('r'));
      }
    }

    ,'updateEasingString': function () {
      var xEasing = this.easeSelectViewX.$el.val();
      var yEasing = this.easeSelectViewY.$el.val();
      var rEasing = this.easeSelectViewR.$el.val();
      var newEasingString = [xEasing, yEasing, rEasing].join(' ');

      this.model.setEasingString(newEasingString);

      // TODO: These function calls are too specific and assume that there will
      // only ever be one actor.
      app.view.canvas.backgroundView.update();
      app.kapi.update();
    }

  });
});
