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

  var KEYFRAME_TEMPLATE = [
      '<li class="keyframe">'
        ,'<h3></h3>'
        ,'<label>'
          ,'<span>X:</span>'
          ,'<input class="quarter-width keyframe-attr-x" type="text" data-keyframeattr="x"></input>'
        ,'</label>'
        ,'<label>'
          ,'<span>Y:</span>'
          ,'<input class="quarter-width keyframe-attr-y" type="text" data-keyframeattr="y"></input>'
        ,'</label>'
        ,'<label>'
          ,'<span>R:</span>'
          ,'<input class="quarter-width keyframe-attr-r" type="text" data-keyframeattr="r"></input>'
        ,'</label>'
      ,'</li>'
    ].join('');

  var EASE_SELECT_TEMPLATE = [
      '<ul class="ease-select">'
        ,'<li>'
          ,'<label class="ease-label" for="x-easing">X:</label>'
          ,'<select class="x-easing" data-axis="x"></select>'
        ,'</li>'
        ,'<li>'
          ,'<label class="ease-label" for="y-easing">Y:</label>'
          ,'<select class="y-easing" data-axis="y"></select>'
        ,'</li>'
        ,'<li>'
          ,'<label class="ease-label" for="r-easing">R:</label>'
          ,'<select class="r-easing" data-axis="r"></select>'
        ,'</li>'
      ,'</ul>'
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
      if (this.model.collection.indexOf(this.model) > 0) {
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
      this.$easeSelect = $(EASE_SELECT_TEMPLATE);
      this.$el.append(this.$easeSelect);

      this.easeSelectViewX = new EaseSelectView({
        '$el': $('.x-easing', this.$el)
        ,'owner': this
      });

      this.easeSelectViewY = new EaseSelectView({
        '$el': $('.y-easing', this.$el)
        ,'owner': this
      });

      this.easeSelectViewR = new EaseSelectView({
        '$el': $('.r-easing', this.$el)
        ,'owner': this
      });
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
      var actor = this.model.owner;
      var xEasing = this.easeSelectViewX.$el.val();
      var yEasing = this.easeSelectViewY.$el.val();
      var rEasing = this.easeSelectViewR.$el.val();
      var newEasingString = [xEasing, yEasing, rEasing].join(' ');

      actor.modifyKeyframe(
          this.model.get('millisecond'), {}, { 'transform': newEasingString });

      app.view.canvas.backgroundView.update();
      app.kapi.update();
    }

  });
});
