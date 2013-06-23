define(['src/app', 'src/ui/keyframe-form'], function (app, KeyframeForm) {
  return Backbone.View.extend({

    'events': {
      'click .add button': 'createKeyframe'
    }

    ,'initialize': function (opts) {
      _.extend(this, opts);
      this.keyframeForms = {};
    }

    ,'addKeyframeView': function (model) {
      var keyframeForm = new KeyframeForm({
        'owner': this
        ,'model': model
      });

      this.$formsList = this.$el.find('ul.controls');
      this.keyframeForms[keyframeForm.cid] = keyframeForm;
      this.$formsList.append(keyframeForm.$el);
    }

    ,'render': function () {
      _.each(this.keyframeForms, function (view) {
        view.render();
      });
    }

    ,'createKeyframe': function (evt) {
      var currentActor = app.collection.actors.getCurrent();
      var lastKeyframeIndex = currentActor.getLength() - 1;
      var lastKeyframeMillisecond =
          currentActor.getMillisecondOfKeyframe(lastKeyframeIndex);
      var lastKeyframeAttrs =
          currentActor.getAttrsForKeyframe(lastKeyframeIndex);

      currentActor.keyframe(lastKeyframeMillisecond + 1000, {
        'x': lastKeyframeAttrs.x + 200
        ,'y': lastKeyframeAttrs.y
        ,'r': 0
      }, 'linear linear linear');
    }

  });
});
