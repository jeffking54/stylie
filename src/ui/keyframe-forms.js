define(['src/app', 'src/constants', 'src/ui/keyframe-form'],
    function (app, constant, KeyframeFormView) {

  return Backbone.View.extend({

    'events': {
      'click .add button': 'createKeyframe'
    }

    ,'initialize': function (opts) {
      _.extend(this, opts);
      this.keyframeForms = {};
    }

    ,'render': function () {
      _.each(this.keyframeForms, function (view) {
        view.render();
      });
    }

    ,'addKeyframeView': function (model) {
      var keyframeFormView = new KeyframeFormView({
        'owner': this
        ,'model': model
      });

      this.$formsList = this.$el.find('ul.controls');
      this.keyframeForms[keyframeFormView.cid] = keyframeFormView;
      this.$formsList.append(keyframeFormView.$el);
    }

    ,'createKeyframe': function (evt) {
      var model = this.model;
      var lastKeyframeIndex = model.getLength() - 1;
      var lastKeyframeMillisecond =
          model.getMillisecondOfKeyframe(lastKeyframeIndex);
      var lastKeyframeAttrs =
          model.getAttrsForKeyframe(lastKeyframeIndex);
      var newKeyframeMillisecond =
          lastKeyframeMillisecond + constant.NEW_KEYFRAME_MILLISECOND_OFFSET;

      model.keyframe(newKeyframeMillisecond, {
        'x': lastKeyframeAttrs.x + constant.NEW_KEYFRAME_X_OFFSET
        ,'y': lastKeyframeAttrs.y
        ,'r': 0
      }, 'linear linear linear');

      app.view.canvas.backgroundView.update();
    }

    ,'reorderKeyframeFormViews': function () {
      this.$formsList.children().detach();
      var keyframeFormViews = this.model.getKeyframeFormViews();
      _.each(keyframeFormViews, function (keyframeFormView) {
        this.$formsList.append(keyframeFormView.$el);
      }, this);
    }

  });
});
